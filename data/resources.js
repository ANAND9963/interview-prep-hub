export const roadmaps = {
 java: {
  title:'Java: beginner to advanced',
  stages:[
   ['1 · Foundations',['JDK, JVM and running programs','Variables, types and operators','Conditions, loops and methods','Arrays and strings','Debugging and command-line input']],
   ['2 · Object-oriented Java',['Classes, objects and constructors','Encapsulation and immutability','Inheritance and composition','Interfaces and polymorphism','Packages, access control and exceptions']],
   ['3 · Core Java',['Collections and complexity','Generics and type erasure','equals, hashCode and ordering','Lambdas, streams and Optional','Files, NIO and date/time']],
   ['4 · Advanced Java',['Threads and the Java memory model','Executors and CompletableFuture','JVM memory and garbage collection','Reflection, annotations and records','Networking, JDBC and transactions']],
   ['5 · Spring Framework',['IoC and dependency injection','Bean lifecycle and scopes','Java configuration and profiles','Validation and data access','Scheduling and web MVC']],
   ['6 · Spring Boot production',['Starters and auto-configuration','REST APIs and exception handling','Spring Data and transaction boundaries','Security, testing and observability','Kafka, caching and resilient services']]
  ],
  resources:[
   ['Oracle Java Tutorials','Official legacy tutorials; useful for language foundations, but written for JDK 8. Cross-check newer APIs in current Java documentation.','https://docs.oracle.com/javase/tutorial/java/index.html','Official'],
   ['GeeksforGeeks Java','Broad path from basics through collections, concurrency, JDBC and interview practice.','https://www.geeksforgeeks.org/java/','External'],
   ['W3Schools Java','Short beginner lessons and interactive examples.','https://www.w3schools.com/java/default.asp','External'],
   ['TPointTech Java','Detailed topic-by-topic Java reference.','https://www.tpointtech.com/java-tutorial','External'],
   ['W3Resource Java Exercises','Practice sets for syntax, collections, streams, data structures and more.','https://www.w3resource.com/java-exercises/','Practice'],
   ['The Java Programming Language, 4th ed.','Third-party GitHub-hosted scan. Copyright or redistribution status is not verified; use the external link only. It targets an older Java generation.','https://github.com/Rafiquzzaman420/Free-Programming-Books/blob/master/Java/Basic%20to%20advance%20concepts/The%20Java%20Programming%20Language%20-%204%20th%20edition.pdf','External book'],
   ['Spring Framework Notes for Professionals','Your uploaded 2018 reference informed the Spring checkpoints. It covers IoC, beans, scopes, validation, profiles, JDBC, scheduling and classic Spring MVC. Cross-check modern configuration.','', 'Uploaded notes'],
   ['Spring Boot PDF Notes','Your uploaded reference informed the Boot checkpoints. It covers setup, configuration, REST, data access, security, messaging, caching, tests and deployment. Some examples may use older Boot conventions.','', 'Uploaded notes']
  ]
 },
 python:{
  title:'Python: beginner to production',
  stages:[
   ['1 · Foundations',['Interpreter, virtual environments and scripts','Types, control flow and functions','Lists, tuples, sets and dictionaries','Strings, files and exceptions','Modules and package imports']],
   ['2 · Python design',['Classes and data classes','Iterators and generators','Decorators and context managers','Typing and protocols','Testing with pytest concepts']],
   ['3 · Data work',['NumPy arrays and broadcasting','Pandas cleaning, joins and groupby','Visualization and exploratory analysis','SQL integration and validation','Reproducible notebooks and pipelines']],
   ['4 · Backend Python',['HTTP and REST fundamentals','FastAPI request models','Async I/O and task queues','Authentication and validation','Logging, testing and deployment']],
   ['5 · Advanced Python',['Descriptors and data model','Concurrency versus parallelism','Memory profiling and performance','Packaging and dependency locking','Secure configuration and observability']]
  ],
  resources:[
   ['Python Tutorial','Official language tutorial and standard-library starting point.','https://docs.python.org/3/tutorial/','Official'],
   ['Python Standard Library','Authoritative API reference for built-in modules.','https://docs.python.org/3/library/','Official'],
   ['NumPy user guide','Official array, broadcasting and performance concepts.','https://numpy.org/doc/stable/user/','Official'],
   ['Pandas user guide','Official guide for tabular data workflows.','https://pandas.pydata.org/docs/user_guide/','Official'],
   ['FastAPI tutorial','Official path for typed Python APIs.','https://fastapi.tiangolo.com/tutorial/','Official']
  ]
 },
 ai:{
  title:'AI and machine learning: foundations to production',
  stages:[
   ['1 · Mathematical and data foundations',['Linear algebra and matrix shapes','Probability and conditional probability','Statistics and uncertainty','Calculus and gradient intuition','Data quality and leakage']],
   ['2 · Classical machine learning',['Linear and logistic regression','Trees, ensembles and boosting','SVM, kNN and Naive Bayes','Feature engineering and pipelines','Metrics, calibration and thresholds']],
   ['3 · Deep learning',['Computation graphs and backpropagation','Initialization and optimization','CNNs and transfer learning','Sequence modeling','Regularization and experiment design']],
   ['4 · Transformers and LLMs',['Tokenization and embeddings','Self-attention and transformer blocks','Pretraining and fine-tuning','Inference cost and quantization','Prompting and structured outputs']],
   ['5 · Retrieval and agents',['Chunking and metadata','Vector search and reranking','RAG evaluation and citations','Tool contracts and permissions','Agent reliability and human review']],
   ['6 · Production ML',['Data and feature pipelines','Model registry and CI/CD','Serving, batching and caching','Drift, quality and cost monitoring','Safety, privacy and incident response']]
  ],
  resources:[
   ['scikit-learn User Guide','Official reference for classical ML algorithms, preprocessing, evaluation and common pitfalls.','https://scikit-learn.org/stable/user_guide.html','Official'],
   ['PyTorch Tutorials','Official deep-learning tutorials.','https://docs.pytorch.org/tutorials/','Official'],
   ['Hugging Face Course','Transformers, tokenization, fine-tuning and ecosystem practice.','https://huggingface.co/learn/llm-course/chapter1/1','External'],
   ['Google Machine Learning Crash Course','Practical ML concepts and exercises.','https://developers.google.com/machine-learning/crash-course','External']
  ]
 },
 react:{
  title:'React: foundations to architecture',
  stages:[
   ['1 · Foundations',['Components and JSX','Props and event handlers','State as a snapshot','Lists and stable keys','Forms and accessibility']],
   ['2 · Hooks',['useState and immutable updates','useReducer for transitions','Effects and cleanup','Refs and DOM integration','Custom hooks']],
   ['3 · Application design',['Routing and layouts','Server state and request cancellation','Error, loading and empty states','Authentication boundaries','Testing user behavior']],
   ['4 · Performance and production',['Profiling before memoization','Code splitting and bundles','Rendering and hydration','Security and observability','Deployment and web vitals']]
  ],
  resources:[['React Learn','Official, modern React learning path.','https://react.dev/learn','Official'],['React API reference','Official hooks and component APIs.','https://react.dev/reference/react','Official']]
 },
 angular:{
  title:'Angular: foundations to architecture',
  stages:[
   ['1 · Foundations',['Components and templates','Inputs, outputs and control flow','Services and dependency injection','Routing and layouts','Reactive forms']],
   ['2 · Reactivity',['Signals and computed values','Effects and cleanup','Observable streams','RxJS flattening choices','HTTP cancellation and errors']],
   ['3 · Application design',['Standalone components','Guards and authorization','State ownership','Testing components and services','Accessibility and localization']],
   ['4 · Production',['Build configuration','Lazy loading','Performance profiling','Security and observability','Deployment and update strategy']]
  ],
  resources:[['Angular tutorials','Official interactive learning path.','https://angular.dev/tutorials','Official'],['Angular guide','Official framework concepts and APIs.','https://angular.dev/overview','Official'],['RxJS guide','Official reactive-programming concepts.','https://rxjs.dev/guide/overview','Official']]
 }
};

export const mlAlgorithms = [
 ['Linear regression','Predict a continuous value from additive feature effects.','Fast, interpretable baseline; coefficients are meaningful only under the model and data assumptions.','Outliers, nonlinear relationships, correlated features and leakage.','MAE or RMSE, residual analysis and time/group-safe validation.'],
 ['Logistic regression','Estimate class probability from a linear decision boundary.','Fast and often well calibrated after suitable preprocessing; limited nonlinear capacity.','Class imbalance, feature scale, interactions and threshold selection.','Log loss, PR-AUC for rare positives, calibration and business cost at a threshold.'],
 ['Decision tree','Learn nonlinear rules through recursive feature splits.','Easy to inspect and handles mixed nonlinear effects; a deep tree can overfit sharply.','Depth, minimum leaf size, unstable splits and leakage-prone identifiers.','Cross-validation plus per-class metrics; compare train and validation performance.'],
 ['Random forest','Average many randomized decision trees.','Robust tabular baseline with lower variance than one tree; larger and less directly interpretable.','Latency, memory, correlated trees and misleading impurity importance.','Task metric plus permutation importance on held-out data.'],
 ['Gradient-boosted trees','Build trees sequentially to correct previous errors.','Often excellent for structured/tabular data; tuning and leakage can produce deceptively strong results.','Learning rate, tree depth, number of rounds, missing-value behavior and early stopping.','Validation curve, task metric, calibration when probabilities drive decisions.'],
 ['k-nearest neighbors','Predict from nearby labeled examples.','Minimal training and flexible boundaries; inference and memory grow with dataset size.','Feature scaling, distance choice, high dimensions and class density.','Cross-validated k and metric; latency under realistic index size.'],
 ['Support vector machine','Find a large-margin boundary, optionally through kernels.','Strong on some medium-sized high-dimensional datasets; kernel models scale poorly to large training sets.','Feature scale, C/gamma, probability calibration and multiclass strategy.','Cross-validation using the deployment metric, plus calibration if scores become probabilities.'],
 ['Naive Bayes','Combine feature likelihoods using a conditional-independence assumption.','Very fast and effective for sparse text baselines; probability estimates can be overconfident.','Feature distribution choice, smoothing and violated independence assumptions.','Log loss and calibration as well as accuracy/F1.'],
 ['k-means clustering','Partition numeric points around k centroids.','Simple and scalable; assumes distance to a mean represents cluster quality.','Feature scale, outliers, initialization, non-spherical clusters and choosing k.','Stability across seeds, silhouette as supporting evidence, and domain usefulness.'],
 ['Neural network','Learn layered nonlinear representations with gradient optimization.','Flexible and effective with enough suitable data; expensive and harder to debug or explain.','Initialization, optimization, overfitting, distribution shift, latency and reproducibility.','Held-out task metrics, learning curves, ablations, robustness and serving performance.']
];
