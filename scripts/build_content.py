"""Maintain the original solution pack as structured content; run with Python 3."""
import json
from pathlib import Path
solutions={}
def approach(name,time,space,explanation,tradeoff,code):
    return dict(name=name,time=time,space=space,explanation=explanation,tradeoff=tradeoff,code=code)
def add(slug,level,statement,example,hints,approaches,followup,test):
    solutions[slug]=dict(level=level,statement=statement,example=example,hints=hints,approaches=approaches,followup=followup,test=test)
a=approach

add('min-stack','Easy','Support push, pop, top, and getMin. Assume pop, top, and getMin receive a nonempty stack.','push(3), push(1), push(1), pop() → minimum remains 1.',
['Store minimum information alongside ordinary values.','Duplicate minima must survive until their final occurrence is removed.'],[
a('Scan on demand','push/pop/top O(1); getMin O(n)','O(n)','Keep values in an ArrayList. Scan all current values when asked for the minimum.','Simple storage, but repeated minimum queries are expensive.',
'''class MinStack {
 private final java.util.List<Integer> s=new java.util.ArrayList<>();
 public void push(int x){s.add(x);}
 public void pop(){s.remove(s.size()-1);}
 public int top(){return s.get(s.size()-1);}
 public int getMin(){return java.util.Collections.min(s);}
}'''),
a('Minimum at every depth','O(1) per operation','O(n)','Each entry stores its value and the minimum at its depth. Popping automatically restores the previous minimum.','One extra integer per entry buys constant-time minimum queries.',
'''class MinStack {
 private final java.util.Deque<int[]> s=new java.util.ArrayDeque<>();
 public void push(int x){s.push(new int[]{x,s.isEmpty()?x:Math.min(x,s.peek()[1])});}
 public void pop(){s.pop();}
 public int top(){return s.peek()[0];}
 public int getMin(){return s.peek()[1];}
}''')],
'How would you add getMax? Why does one global minimum fail after a pop?',
'MinStack s=new MinStack();s.push(3);s.push(1);s.push(1);s.pop();check(s.getMin()==1);s.pop();check(s.getMin()==3);')

add('implement-queue-using-stacks','Easy','Implement FIFO push, pop, peek, and empty using stacks. Pop and peek receive a nonempty queue.','push(1), push(2), pop() → 1; peek() → 2.',
['One stack reverses order. Two reversals restore FIFO order.','Transfer input elements only when the output stack is empty.'],[
a('Lazy two-stack queue','O(1) amortized; O(n) worst-case pop/peek','O(n)','Push into the input stack. If output is empty, transfer all input values to output. Every value moves at most once.','Efficient total throughput, but transferring creates a latency spike for a single operation. An eager version can instead make push O(n) and pop O(1).',
'''class MyQueue {
 private final java.util.Deque<Integer> in=new java.util.ArrayDeque<>(),out=new java.util.ArrayDeque<>();
 public void push(int x){in.push(x);}
 private void shift(){if(out.isEmpty())while(!in.isEmpty())out.push(in.pop());}
 public int pop(){shift();return out.pop();}
 public int peek(){shift();return out.peek();}
 public boolean empty(){return in.isEmpty()&&out.isEmpty();}
}''')],
'Explain amortized versus worst-case complexity. Why must transfer wait until output is empty?',
'MyQueue q=new MyQueue();q.push(1);q.push(2);check(q.pop()==1);q.push(3);check(q.pop()==2);check(q.peek()==3);')

add('search-in-rotated-sorted-array','Medium','Return the target index in a rotated ascending array of distinct integers, or -1.','[4,5,6,7,0,1,2], target 0 → 4.',
['At least one side of the midpoint is sorted.','Check whether the target lies within that sorted half before discarding it.'],[
a('Linear scan','O(n)','O(1)','Compare the target against each element.','Works with duplicates too, but ignores the ordering.',
'''class Solution {public int search(int[] a,int t){for(int i=0;i<a.length;i++)if(a[i]==t)return i;return -1;}}'''),
a('Modified binary search','O(log n)','O(1)','Keep an inclusive candidate interval. Identify the sorted half and retain it only if its value range contains the target.','The logarithmic guarantee assumes distinct values. Duplicate values can make the sorted half ambiguous.',
'''class Solution {
 public int search(int[] a,int t){
  int l=0,r=a.length-1;
  while(l<=r){
   int m=l+(r-l)/2;if(a[m]==t)return m;
   if(a[l]<=a[m]){if(a[l]<=t&&t<a[m])r=m-1;else l=m+1;}
   else{if(a[m]<t&&t<=a[r])l=m+1;else r=m-1;}
  }return -1;
 }
}''')],
'Trace an unrotated array and a one-element array. How would duplicates change the algorithm?',
'Solution s=new Solution();check(s.search(new int[]{4,5,6,7,0,1,2},0)==4);check(s.search(new int[]{1},0)==-1);check(s.search(new int[]{},3)==-1);')

add('search-a-2d-matrix','Medium','Search a rectangular matrix ordered globally when read row by row. Each row begins after the previous row ends.','[[1,3,5],[7,9,11]], target 9 → true.',
['Treat the matrix as a virtual sorted array.','Index k maps to row k / columns and column k % columns.'],[
a('Scan every cell','O(rows × columns)','O(1)','Compare every cell with the target.','No ordering assumption is needed, but the work is linear in cell count.',
'''class Solution {public boolean searchMatrix(int[][] a,int t){for(int[] row:a)for(int x:row)if(x==t)return true;return false;}}'''),
a('Virtual binary search','O(log(rows × columns))','O(1)','Binary-search flattened indices without copying cells. Long index arithmetic avoids multiplication overflow.','Requires global row-major ordering, not merely sorted rows and sorted columns.',
'''class Solution {
 public boolean searchMatrix(int[][] a,int t){
  if(a.length==0||a[0].length==0)return false;
  int n=a[0].length;long l=0,r=(long)a.length*n-1;
  while(l<=r){long m=l+(r-l)/2;int v=a[(int)(m/n)][(int)(m%n)];
   if(v==t)return true;if(v<t)l=m+1;else r=m-1;
  }return false;
 }
}''')],
'How would you search when only rows and columns are individually sorted?',
'Solution s=new Solution();check(s.searchMatrix(new int[][]{{1,3,5},{7,9,11}},9));check(!s.searchMatrix(new int[][]{{1}},2));')

add('group-anagrams','Medium','Group words with identical character multiplicities. Group order is arbitrary. The frequency approach assumes lowercase English letters.','eat, tea, tan, ate, nat, bat → {eat,tea,ate}, {tan,nat}, {bat}.',
['Anagrams share a canonical signature.','Sort the characters or count each letter.'],[
a('Sorted signature','O(n × k log k)','O(n × k) including output and keys','Sort a copy of each word to construct its map key. Anagrams produce the same key.','Supports more characters than a fixed 26-letter signature, but sorts every word.',
'''class Solution {
 public java.util.List<java.util.List<String>> groupAnagrams(String[] words){
  java.util.Map<String,java.util.List<String>> m=new java.util.HashMap<>();
  for(String w:words){char[] c=w.toCharArray();java.util.Arrays.sort(c);
   m.computeIfAbsent(new String(c),k->new java.util.ArrayList<>()).add(w);}
  return new java.util.ArrayList<>(m.values());
 }
}'''),
a('Frequency signature','O(n × (k + 26))','O(n × k + n × 26) including output','Count letter frequencies and serialize the vector with separators. Identical vectors identify anagrams.','Fast for long lowercase words. Unicode needs a normalization and counting policy.',
'''class Solution {
 public java.util.List<java.util.List<String>> groupAnagrams(String[] words){
  java.util.Map<String,java.util.List<String>> m=new java.util.HashMap<>();
  for(String w:words){int[] c=new int[26];for(char ch:w.toCharArray())c[ch-'a']++;
   m.computeIfAbsent(java.util.Arrays.toString(c),k->new java.util.ArrayList<>()).add(w);}
  return new java.util.ArrayList<>(m.values());
 }
}''')],
'Why are separators needed in frequency keys? How would Unicode normalization affect grouping?',
'Solution s=new Solution();check(s.groupAnagrams(new String[]{"eat","tea","tan","ate","nat","bat"}).size()==3);check(s.groupAnagrams(new String[]{"",""}).get(0).size()==2);')

add('subarray-sum-equals-k','Medium','Count nonempty contiguous subarrays summing to k. Values may be negative. Assume sums and the count fit in int for the given constraints.','[1,1,1], k=2 → 2; [0,0], k=0 → 3.',
['A subarray sum is the difference of two prefix sums.','Count earlier prefixes equal to currentPrefix-k.'],[
a('Extend from each start','O(n²)','O(1)','For each start, extend the end and maintain a running sum. Count every match.','Simple reference implementation. Negative numbers prevent safe early stopping.',
'''class Solution {public int subarraySum(int[] a,int k){int count=0;for(int i=0;i<a.length;i++){int sum=0;for(int j=i;j<a.length;j++){sum+=a[j];if(sum==k)count++;}}return count;}}'''),
a('Prefix frequencies','Expected O(n)','O(n)','Seed prefix 0 with one occurrence. For each current prefix, count earlier prefixes with difference k before recording this prefix.','Extra space buys linear expected time. Sliding windows do not solve arbitrary negative-valued inputs.',
'''class Solution {
 public int subarraySum(int[] a,int k){
  java.util.Map<Integer,Integer> f=new java.util.HashMap<>();f.put(0,1);
  int p=0,count=0;for(int x:a){p+=x;count+=f.getOrDefault(p-k,0);f.merge(p,1,Integer::sum);}return count;
 }
}''')],
'Why use frequencies rather than a set? Why record the current prefix after counting?',
'Solution s=new Solution();check(s.subarraySum(new int[]{1,1,1},2)==2);check(s.subarraySum(new int[]{0,0},0)==3);check(s.subarraySum(new int[]{1,-1,0},0)==3);')

add('coin-change','Medium','Find the fewest positive-denomination coins totaling a nonnegative amount. Coins can be reused. Return -1 if impossible.','[1,3,4], amount 6 → 2 with 3+3; greedy 4+1+1 takes 3.',
['Let dp[x] mean the fewest coins for amount x.','Try every possible last coin.'],[
a('Bottom-up dynamic programming','O(amount × coin count)','O(amount)','Set dp[0]=0 and all other entries to an unreachable sentinel. For every amount x, minimize 1+dp[x-coin] over coins that fit.','Pseudo-polynomial in the numeric amount. Memoized recursion has the same state bound but can overflow the call stack. Greedy is not generally correct.',
'''class Solution {
 public int coinChange(int[] coins,int amount){
  int[] dp=new int[amount+1];java.util.Arrays.fill(dp,amount+1);dp[0]=0;
  for(int x=1;x<=amount;x++)for(int c:coins)if(c<=x)dp[x]=Math.min(dp[x],1+dp[x-c]);
  return dp[amount]>amount?-1:dp[amount];
 }
}''')],
'How would you reconstruct chosen coins? Why must denominations be positive?',
'Solution s=new Solution();check(s.coinChange(new int[]{1,3,4},6)==2);check(s.coinChange(new int[]{2},3)==-1);check(s.coinChange(new int[]{2},0)==0);')

add('house-robber','Medium','Maximize the sum of nonadjacent houses with nonnegative values. Return 0 for an empty street.','[2,7,9,3,1] → 12 from 2+9+1.',
['Either skip the current house, or take it and skip the previous one.','Only two previous best totals are needed.'],[
a('DP table','O(n)','O(n)','For every prefix, compare skipping its last house against taking that house plus the best total two houses earlier.','Retaining the table helps reconstruct chosen indices.',
'''class Solution {public int rob(int[] a){int[] d=new int[a.length+2];for(int i=0;i<a.length;i++)d[i+2]=Math.max(d[i+1],d[i]+a[i]);return d[a.length+1];}}'''),
a('Rolling state','O(n)','O(1)','Store just the two previous totals. Compute next before shifting the previous values.','Best when only the total is needed. Reconstructing selections requires more information.',
'''class Solution {public int rob(int[] a){int p2=0,p1=0;for(int x:a){int next=Math.max(p1,p2+x);p2=p1;p1=next;}return p1;}}''')],
'How does a circular street change the solution?',
'Solution s=new Solution();check(s.rob(new int[]{2,7,9,3,1})==12);check(s.rob(new int[]{})==0);check(s.rob(new int[]{5})==5);')

add('product-of-array-except-itself','Medium','Return the product of all other elements for every index without division. Assume prefix and suffix products fit in int.','[1,2,3,4] → [24,12,8,6]; [0,2,0] → [0,0,0].',
['Split each product into values on the left and right.','Store left products in output; carry the right product in one variable.'],[
a('Recompute products','O(n²)','O(1) extra, excluding output','For each index, multiply every other element.','Easy correctness baseline, but repeats multiplication.',
'''class Solution {public int[] productExceptSelf(int[] a){int[] out=new int[a.length];for(int i=0;i<a.length;i++){out[i]=1;for(int j=0;j<a.length;j++)if(i!=j)out[i]*=a[j];}return out;}}'''),
a('Prefix and suffix','O(n)','O(1) extra, excluding output','The forward pass stores the product strictly before each index. The reverse pass multiplies by the product strictly after it.','Handles zeros automatically and needs no division.',
'''class Solution {public int[] productExceptSelf(int[] a){int[] out=new int[a.length];int p=1;for(int i=0;i<a.length;i++){out[i]=p;p*=a[i];}int s=1;for(int i=a.length-1;i>=0;i--){out[i]*=s;s*=a[i];}return out;}}''')],
'Why do two zeros work naturally? What if products exceed 64-bit range?',
'Solution s=new Solution();check(java.util.Arrays.equals(s.productExceptSelf(new int[]{1,2,3,4}),new int[]{24,12,8,6}));check(java.util.Arrays.equals(s.productExceptSelf(new int[]{0,2,0}),new int[]{0,0,0}));')

add('sort-colors','Medium','Sort an array containing only 0, 1 and 2 in place.','[2,0,2,1,1,0] → [0,0,1,1,2,2].',
['Count each of the three values for a simple two-pass method.','For one pass, maintain zero, one, unknown and two regions.'],[
a('Count and rewrite','O(n)','O(1)','Count each value and then overwrite the array in ascending order.','Two passes but a very simple implementation.',
'''class Solution {public void sortColors(int[] a){int[] c=new int[3];for(int x:a)c[x]++;int p=0;for(int x=0;x<3;x++)for(int k=0;k<c[x];k++)a[p++]=x;}}'''),
a('Dutch national flag','O(n)','O(1)','Move zeroes left and twos right. After swapping with the right edge, inspect the incoming unknown value before advancing.','One pass with more delicate pointer invariants.',
'''class Solution {public void sortColors(int[] a){int l=0,m=0,h=a.length-1;while(m<=h){if(a[m]==0){int t=a[l];a[l++]=a[m];a[m++]=t;}else if(a[m]==2){int t=a[h];a[h--]=a[m];a[m]=t;}else m++;}}}''')],
'Why should mid not advance after swapping with high?',
'int[] a={2,0,2,1,1,0};new Solution().sortColors(a);check(java.util.Arrays.equals(a,new int[]{0,0,1,1,2,2}));')

add('container-with-most-water','Medium','Choose two nonnegative vertical heights to maximize their distance times the shorter height.','[1,8,6,2,5,4,8,3,7] → 49.',
['The shorter edge limits the area.','A narrower pair retaining that shorter edge cannot improve on the current pair.'],[
a('Every pair','O(n²)','O(1)','Evaluate all left and right boundary pairs.','Useful reference for testing.',
'''class Solution {public int maxArea(int[] a){int best=0;for(int i=0;i<a.length;i++)for(int j=i+1;j<a.length;j++)best=Math.max(best,Math.min(a[i],a[j])*(j-i));return best;}}'''),
a('Two pointers','O(n)','O(1)','Start at maximum width. Record area and move a pointer at the shorter edge. This eliminates only pairs dominated by one already examined.','Requires explaining the dominance proof, not merely memorizing the pointer rule.',
'''class Solution {public int maxArea(int[] a){int l=0,r=a.length-1,best=0;while(l<r){best=Math.max(best,Math.min(a[l],a[r])*(r-l));if(a[l]<=a[r])l++;else r--;}return best;}}''')],
'Prove why moving the shorter side is safe. When should area be long?',
'check(new Solution().maxArea(new int[]{1,8,6,2,5,4,8,3,7})==49);check(new Solution().maxArea(new int[]{1,1})==1);')

add('reverse-linked-list','Easy','Reverse a singly linked list. Nodes have int val and ListNode next. Return the new head.','1 → 2 → 3 becomes 3 → 2 → 1.',
['Save the next node before overwriting its pointer.','Maintain a reversed prefix and untouched suffix.'],[
a('Iterative reversal','O(n)','O(1)','Save next, point the current node backward, then advance prev and current.','Avoids recursion depth limits and reuses nodes.',
'''class Solution {public ListNode reverseList(ListNode head){ListNode prev=null;while(head!=null){ListNode next=head.next;head.next=prev;prev=head;head=next;}return prev;}}'''),
a('Recursive reversal','O(n)','O(n) call stack','Reverse the suffix, point the successor back to this node, and clear this node’s forward pointer.','Compact, but long lists risk StackOverflowError in Java.',
'''class Solution {public ListNode reverseList(ListNode h){if(h==null||h.next==null)return h;ListNode first=reverseList(h.next);h.next.next=h;h.next=null;return first;}}''')],
'Why must h.next be cleared? How would you reverse only a subrange?',
'ListNode h=new ListNode(1);h.next=new ListNode(2);h.next.next=new ListNode(3);ListNode r=new Solution().reverseList(h);check(r.val==3&&r.next.val==2&&r.next.next.val==1&&r.next.next.next==null);check(new Solution().reverseList(null)==null);')

add('validate-binary-search-tree','Medium','Check strict BST ordering across all descendants. Duplicate keys are invalid.','Root 5, right child 7, and 7’s left child 4 is invalid.',
['Checking immediate children misses ancestor violations.','Carry an exclusive lower and upper bound.'],[
a('Recursive bounds','O(n)','O(h) call stack','Propagate allowable ranges from ancestors. Use long limits so all int node values can be represented.','Clear invariant, but a skewed tree can exhaust the call stack.',
'''class Solution {public boolean isValidBST(TreeNode root){return valid(root,Long.MIN_VALUE,Long.MAX_VALUE);}private boolean valid(TreeNode n,long lo,long hi){return n==null||(lo<n.val&&n.val<hi&&valid(n.left,lo,n.val)&&valid(n.right,n.val,hi));}}'''),
a('Iterative inorder','O(n)','O(h) explicit stack','Inorder traversal of a strict BST must increase at every step. Reject any value no greater than the previous one.','Avoids recursive call-stack overflow.',
'''class Solution {public boolean isValidBST(TreeNode n){java.util.Deque<TreeNode> s=new java.util.ArrayDeque<>();long prev=Long.MIN_VALUE;while(n!=null||!s.isEmpty()){while(n!=null){s.push(n);n=n.left;}n=s.pop();if(n.val<=prev)return false;prev=n.val;n=n.right;}return true;}}''')],
'What changes if duplicates are allowed only in right subtrees?',
'TreeNode r=new TreeNode(5);r.left=new TreeNode(3);r.right=new TreeNode(7);check(new Solution().isValidBST(r));r.right.left=new TreeNode(4);check(!new Solution().isValidBST(r));check(new Solution().isValidBST(new TreeNode(Integer.MIN_VALUE)));')

add('number-of-islands','Medium','Count groups of land (character 1) in a rectangular grid using horizontal and vertical connectivity.','[[1,1,0],[0,1,0],[0,0,1]] → 2.',
['Every unvisited land cell starts a new island.','Mark cells when enqueueing, not when dequeueing.'],[
a('Iterative flood fill','O(rows × columns)','O(rows × columns) worst-case queue','Scan for land, count a new component, then erase every connected land cell using a queue. Mark before enqueueing so cells are visited once.','Mutates the grid. Preserve input using a copy or visited matrix. Recursive DFS has the same worst-case space but risks stack overflow.',
'''class Solution {
 public int numIslands(char[][] g){
  if(g.length==0)return 0;int rows=g.length,cols=g[0].length,count=0;
  int[][] dirs={{1,0},{-1,0},{0,1},{0,-1}};
  for(int r=0;r<rows;r++)for(int c=0;c<cols;c++)if(g[r][c]=='1'){
   count++;java.util.Queue<int[]> q=new java.util.ArrayDeque<>();q.add(new int[]{r,c});g[r][c]='0';
   while(!q.isEmpty()){int[] p=q.remove();for(int[] d:dirs){int x=p[0]+d[0],y=p[1]+d[1];
    if(x>=0&&x<rows&&y>=0&&y<cols&&g[x][y]=='1'){g[x][y]='0';q.add(new int[]{x,y});}
   }}
  }return count;
 }
}''')],
'Why might union-find be preferable when land is added incrementally?',
'check(new Solution().numIslands(new char[][]{{\'1\',\'1\',\'0\'},{\'0\',\'1\',\'0\'},{\'0\',\'0\',\'1\'}})==2);check(new Solution().numIslands(new char[][]{})==0);')

add('longest-substring-without-repeating-characters','Medium','Find the longest contiguous substring without repeated characters. These versions treat Java UTF-16 char units as characters.','abcabcbb → 3; abba → 2; empty → 0.',
['Maintain a window containing unique characters.','Jump the left edge past the previous occurrence, but never move it backward.'],[
a('Expand every start','O(n²)','O(min(n, alphabet))','Start a fresh set at each index and extend until encountering a duplicate.','Simple, but repeats work between overlapping windows.',
'''class Solution {public int lengthOfLongestSubstring(String s){int best=0;for(int i=0;i<s.length();i++){java.util.Set<Character> seen=new java.util.HashSet<>();for(int j=i;j<s.length()&&seen.add(s.charAt(j));j++)best=Math.max(best,j-i+1);}return best;}}'''),
a('Last-seen window','Expected O(n)','O(min(n, alphabet))','For each right edge, update left to max(left,lastSeen+1). Record the new position and current window length.','Full Unicode code points or graphemes require a different segmentation policy.',
'''class Solution {public int lengthOfLongestSubstring(String s){java.util.Map<Character,Integer> last=new java.util.HashMap<>();int l=0,best=0;for(int r=0;r<s.length();r++){char c=s.charAt(r);l=Math.max(l,last.getOrDefault(c,-1)+1);last.put(c,r);best=Math.max(best,r-l+1);}return best;}}''')],
'Trace abba to explain why max is necessary. How would you return the actual substring?',
'Solution s=new Solution();check(s.lengthOfLongestSubstring("abcabcbb")==3);check(s.lengthOfLongestSubstring("abba")==2);check(s.lengthOfLongestSubstring("")==0);')

add('daily-temperatures','Medium','For every temperature return days until a strictly warmer day, or 0 if none follows.','[73,74,75,71,69,72,76,73] → [1,1,4,2,1,1,0,0].',
['A warm day can resolve many prior days.','Store unresolved indices in nonincreasing temperature order.'],[
a('Forward search','O(n²)','O(1) extra, excluding output','Search forward from each day and stop at the first greater value.','Decreasing inputs trigger quadratic work.',
'''class Solution {public int[] dailyTemperatures(int[] t){int[] a=new int[t.length];for(int i=0;i<t.length;i++)for(int j=i+1;j<t.length;j++)if(t[j]>t[i]){a[i]=j-i;break;}return a;}}'''),
a('Monotonic stack','O(n)','O(n) extra','Pop every unresolved day colder than today and assign its distance. Every index is pushed and popped at most once.','Requires extra memory. Equal temperatures must remain unresolved.',
'''class Solution {public int[] dailyTemperatures(int[] t){int[] out=new int[t.length];java.util.Deque<Integer> s=new java.util.ArrayDeque<>();for(int i=0;i<t.length;i++){while(!s.isEmpty()&&t[i]>t[s.peek()]){int j=s.pop();out[j]=i-j;}s.push(i);}return out;}}''')],
'Why is the comparison strict? How would a circular sequence change the traversal?',
'check(java.util.Arrays.equals(new Solution().dailyTemperatures(new int[]{73,74,75,71,69,72,76,73}),new int[]{1,1,4,2,1,1,0,0}));check(java.util.Arrays.equals(new Solution().dailyTemperatures(new int[]{70,70}),new int[]{0,0}));')

add('best-time-to-buy-and-sell-stock','Easy','Maximize profit with at most one buy followed by one sell. Return zero if no profitable trade exists.','[7,1,5,3,6,4] → 5.',
['For each sell day, only the cheapest earlier buy matters.','Track a running minimum and best profit.'],[
a('All buy/sell pairs','O(n²)','O(1)','Enumerate every legal pair of buy before sell.','Useful as a test reference but repeats comparisons.',
'''class Solution {public int maxProfit(int[] p){int best=0;for(int i=0;i<p.length;i++)for(int j=i+1;j<p.length;j++)best=Math.max(best,p[j]-p[i]);return best;}}'''),
a('Running minimum','O(n)','O(1)','Update the lowest price seen and compare each price with it. Starting the best profit at zero naturally allows no trade.','Only handles a single transaction; cooldown and multi-transaction variants need more states.',
'''class Solution {public int maxProfit(int[] p){int min=Integer.MAX_VALUE,best=0;for(int x:p){min=Math.min(min,x);best=Math.max(best,x-min);}return best;}}''')],
'What changes with multiple transactions or a cooldown after selling?',
'Solution s=new Solution();check(s.maxProfit(new int[]{7,1,5,3,6,4})==5);check(s.maxProfit(new int[]{7,6,4,3,1})==0);check(s.maxProfit(new int[]{})==0);')

add('valid-parenthesis','Easy','Validate nesting of (), [], and {} brackets. Input contains only these bracket characters.','([]{}) → true; ([)] → false.',
['The most recent unmatched opener must close first.','Push the expected closing bracket.'],[
a('Expected closing stack','O(n)','O(n)','Opening brackets push their expected closer. A closing bracket must match the stack top. The stack must be empty at the end.','A single counter can handle one bracket kind but cannot enforce mixed nesting.',
'''class Solution {public boolean isValid(String s){java.util.Deque<Character> st=new java.util.ArrayDeque<>();for(char c:s.toCharArray()){if(c=='(')st.push(')');else if(c=='[')st.push(']');else if(c=='{')st.push('}');else if(st.isEmpty()||st.pop()!=c)return false;}return st.isEmpty();}}''')],
'Why are equal counts not enough? How would quoted strings complicate parsing?',
'Solution s=new Solution();check(s.isValid("([]{})"));check(!s.isValid("([)]"));check(!s.isValid("("));check(s.isValid(""));')

add('longest-increasing-subsequence','Medium','Return the length of the longest strictly increasing subsequence; elements need not be adjacent.','[10,9,2,5,3,7,101,18] → 4.',
['DP can compare a value to all earlier smaller values.','Retain the smallest possible tail for every subsequence length.'],[
a('DP over endpoints','O(n²)','O(n)','dp[i] is the best subsequence ending at i. Extend any earlier smaller value and retain the best length.','Easy to augment with predecessor pointers for reconstruction.',
'''class Solution {public int lengthOfLIS(int[] a){int[] d=new int[a.length];int best=0;for(int i=0;i<a.length;i++){d[i]=1;for(int j=0;j<i;j++)if(a[j]<a[i])d[i]=Math.max(d[i],d[j]+1);best=Math.max(best,d[i]);}return best;}}'''),
a('Minimum tails','O(n log n)','O(n)','Binary-search the first tail greater than or equal to the current value. Replace it, or append when every tail is smaller.','The tails array itself is not necessarily one valid subsequence. Reconstruction needs indices and predecessor links.',
'''class Solution {public int lengthOfLIS(int[] a){int[] tails=new int[a.length];int size=0;for(int x:a){int l=0,r=size;while(l<r){int m=l+(r-l)/2;if(tails[m]<x)l=m+1;else r=m;}tails[l]=x;if(l==size)size++;}return size;}}''')],
'Why replace the first greater-or-equal tail? How does a nondecreasing subsequence differ?',
'Solution s=new Solution();check(s.lengthOfLIS(new int[]{10,9,2,5,3,7,101,18})==4);check(s.lengthOfLIS(new int[]{2,2,2})==1);check(s.lengthOfLIS(new int[]{})==0);')

add('course-schedule','Medium','Given courses and [course, prerequisite] pairs, determine whether all courses can be completed.','2 courses, [[1,0]] → true; [[1,0],[0,1]] → false.',
['A directed cycle makes the ordering impossible.','Repeatedly complete courses with no remaining prerequisites.'],[
a('Topological processing','O(V + E)','O(V + E)','Build prerequisite-to-course edges and indegree counts. Completing a zero-indegree course decrements dependent indegrees. All courses are possible exactly when all are processed.','Iterative and can return an order. DFS with color states is another O(V+E) method but needs a traversal stack.',
'''class Solution {
 public boolean canFinish(int n,int[][] edges){
  java.util.List<java.util.List<Integer>> g=new java.util.ArrayList<>();for(int i=0;i<n;i++)g.add(new java.util.ArrayList<>());
  int[] degree=new int[n];for(int[] e:edges){g.get(e[1]).add(e[0]);degree[e[0]]++;}
  java.util.Queue<Integer> q=new java.util.ArrayDeque<>();for(int i=0;i<n;i++)if(degree[i]==0)q.add(i);
  int done=0;while(!q.isEmpty()){int u=q.remove();done++;for(int v:g.get(u))if(--degree[v]==0)q.add(v);}
  return done==n;
 }
}''')],
'How would you return a valid order or show the user an actual cycle?',
'Solution s=new Solution();check(s.canFinish(2,new int[][]{{1,0}}));check(!s.canFinish(2,new int[][]{{1,0},{0,1}}));check(s.canFinish(3,new int[][]{}));')

Path(__file__).resolve().parents[1].joinpath('data/solutions.json').write_text(json.dumps(solutions,indent=2,ensure_ascii=False)+'\n')
print(f'{len(solutions)} solution articles; {sum(len(s["approaches"]) for s in solutions.values())} Java implementations')
