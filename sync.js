import {syncConfig} from './sync-config.js';
import {validateState,writeState} from './state.js';
const AUTH_KEY='interview-prep-hub:auth:v1';
const configured=()=>/^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(syncConfig.supabaseUrl)&&syncConfig.supabaseAnonKey.length>20;
const headers=token=>({'apikey':syncConfig.supabaseAnonKey,'Content-Type':'application/json',...(token?{'Authorization':'Bearer '+token}:{})});
const readAuth=()=>{try{return JSON.parse(localStorage.getItem(AUTH_KEY))}catch{return null}};
const saveAuth=v=>v?localStorage.setItem(AUTH_KEY,JSON.stringify(v)):localStorage.removeItem(AUTH_KEY);
async function responseJson(response){
 const body=await response.json().catch(()=>({}));
 if(!response.ok)throw Error(body.msg||body.message||body.error_description||body.error||'Synchronization request failed.');
 return body;
}
async function refresh(auth){
 if(!auth?.refresh_token)throw Error('Sign in again.');
 const r=await fetch(syncConfig.supabaseUrl+'/auth/v1/token?grant_type=refresh_token',{method:'POST',headers:headers(),body:JSON.stringify({refresh_token:auth.refresh_token})});
 const next=await responseJson(r);saveAuth(next);return next;
}
async function validAuth(){
 let auth=readAuth();if(!auth)return null;
 if(auth.expires_at&&auth.expires_at*1000>Date.now()+60000)return auth;
 try{return await refresh(auth)}catch{saveAuth(null);return null}
}
async function consumeAuthCallback(){
 const params=new URLSearchParams(location.hash.slice(1));
 const access_token=params.get('access_token'),refresh_token=params.get('refresh_token');
 if(!access_token||!refresh_token)return null;
 const userResponse=await fetch(syncConfig.supabaseUrl+'/auth/v1/user',{headers:headers(access_token)});
 const user=await responseJson(userResponse);
 const expiresIn=Number(params.get('expires_in'))||3600;
 const auth={access_token,refresh_token,token_type:params.get('token_type')||'bearer',expires_in:expiresIn,expires_at:Math.floor(Date.now()/1000)+expiresIn,user};
 saveAuth(auth);
 history.replaceState(null,'',location.pathname+location.search+'#/sync');
 window.dispatchEvent(new Event('hashchange'));
 return auth;
}
export function createSync({getState,replaceState,onStatus}){
 let timer=null,busy=false;
 const status=(state,message='',email='')=>onStatus({state,message,email,configured:configured()});
 async function request(path,options={},retry=true){
  const auth=await validAuth();if(!auth)throw Error('Sign in to synchronize.');
  const r=await fetch(syncConfig.supabaseUrl+path,{...options,headers:{...headers(auth.access_token),...(options.headers||{})}});
  if(r.status===401&&retry){const next=await refresh(auth);return fetch(syncConfig.supabaseUrl+path,{...options,headers:{...headers(next.access_token),...(options.headers||{})}});}
  return r;
 }
 async function pullAndMerge(){
  const auth=await validAuth();if(!auth){status(configured()?'signed-out':'disabled');return;}
  status('syncing','Checking cloud progress…',auth.user?.email||'');
  const r=await request('/rest/v1/user_progress?select=state,client_updated_at&user_id=eq.'+encodeURIComponent(auth.user.id));
  const rows=await responseJson(r),local=getState(),remote=rows[0];
  if(remote){
   const remoteTime=Date.parse(remote.client_updated_at)||0,localTime=local.meta?.updatedAt||0;
   if(remoteTime>localTime){const clean=validateState(remote.state);clean.meta.updatedAt=remoteTime;replaceState(clean);}
   else if(localTime>remoteTime)await push();
  } else await push();
  status('synced','Progress is synchronized.',auth.user?.email||'');
 }
 async function push(){
  if(busy)return;busy=true;
  try{
   const auth=await validAuth();if(!auth){status(configured()?'signed-out':'disabled');return;}
   status('syncing','Saving progress…',auth.user?.email||'');
   const state=getState(),stamp=new Date(state.meta?.updatedAt||Date.now()).toISOString();
   const r=await request('/rest/v1/user_progress?on_conflict=user_id',{method:'POST',headers:{'Prefer':'resolution=merge-duplicates,return=minimal'},body:JSON.stringify({user_id:auth.user.id,state,client_updated_at:stamp})});
   if(!r.ok)await responseJson(r);
   status('synced','Saved to the cloud.',auth.user?.email||'');
  }finally{busy=false}
 }
 function schedule(){clearTimeout(timer);timer=setTimeout(()=>push().catch(e=>status('error',e.message,readAuth()?.user?.email||'')),1200);}
 async function signIn(email,password,mode){
  if(!configured())throw Error('Supabase configuration has not been added yet.');
  status('syncing',mode==='signup'?'Creating account…':'Signing in…',email);
  const returnUrl=location.origin+location.pathname;
  const endpoint=mode==='signup'?'/auth/v1/signup?redirect_to='+encodeURIComponent(returnUrl):'/auth/v1/token?grant_type=password';
  const r=await fetch(syncConfig.supabaseUrl+endpoint,{method:'POST',headers:headers(),body:JSON.stringify({email,password})});
  const auth=await responseJson(r);
  if(!auth.access_token){status('signed-out','Check your email to confirm the account, then sign in.',email);return false;}
  saveAuth(auth);await pullAndMerge();return true;
 }
 async function signOut(){
  const auth=await validAuth();
  if(auth)await fetch(syncConfig.supabaseUrl+'/auth/v1/logout',{method:'POST',headers:headers(auth.access_token)}).catch(()=>{});
  saveAuth(null);status('signed-out','Signed out. Local progress remains on this device.');
 }
 async function start(){if(!configured()){status('disabled','Cloud sync needs one-time setup.');return;}let auth;try{auth=await consumeAuthCallback();}catch(e){status('error','Email was confirmed, but the session could not be opened: '+e.message);return;}auth=auth||await validAuth();if(auth)await pullAndMerge().catch(e=>status('error',e.message,auth.user?.email||''));else status('signed-out','Sign in to synchronize.');}
 return {start,schedule,push:()=>push(),signIn,signOut,configured};
}
