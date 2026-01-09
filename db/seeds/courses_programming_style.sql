-- ============================================================================
-- EVOLUTION 11: Programming-Style Levelled Courses
-- Created: 2026-01-09
-- 4 Courses: Data Science, Machine Learning, Deep Learning, Cloud
-- 5 Levels per course: Primitives → Control → Structures → Abstractions → Systems
-- ============================================================================

-- ============================================================================
-- COURSE IDs
-- ============================================================================
SET @ds_course = UUID();
SET @ml_course = UUID();
SET @dl_course = UUID();
SET @cloud_course = UUID();

-- ============================================================================
-- COURSES
-- ============================================================================
INSERT INTO courses (id, title, description, created_at) VALUES
(@ds_course, 'Data Science', 
 'Master data science from primitives to systems. Learn data manipulation, analysis, visualization, and end-to-end projects.',
 NOW()),
(@ml_course, 'Machine Learning',
 'Build ML intuition from features to production systems. Cover models, pipelines, and real-world applications.',
 NOW()),
(@dl_course, 'Deep Learning',
 'Understand neural networks from neurons to large-scale models. Master CNNs, RNNs, and modern architectures.',
 NOW()),
(@cloud_course, 'Cloud Computing',
 'Learn cloud from compute primitives to production-ready architectures. Cover AWS/GCP/Azure fundamentals.',
 NOW());

-- ============================================================================
-- DATA SCIENCE SKILLS (5 levels)
-- ============================================================================
SET @ds_s0 = UUID(); SET @ds_s1 = UUID(); SET @ds_s2 = UUID(); SET @ds_s3 = UUID(); SET @ds_s4 = UUID();

INSERT INTO skills (id, name, description, category, difficulty_tier, created_at, updated_at) VALUES
(@ds_s0, 'DS: Data Primitives', 'Numbers, categories, rows/columns, dataset basics', 'Data Science', 'beginner', NOW(), NOW()),
(@ds_s1, 'DS: Control & Filtering', 'Filtering, conditions, boolean masking, basic stats', 'Data Science', 'beginner', NOW(), NOW()),
(@ds_s2, 'DS: Data Structures', 'DataFrames, GroupBy, joins, merges, reshaping', 'Data Science', 'intermediate', NOW(), NOW()),
(@ds_s3, 'DS: Abstractions', 'Feature engineering, pipelines, visualization functions', 'Data Science', 'intermediate', NOW(), NOW()),
(@ds_s4, 'DS: Systems', 'End-to-end projects, messy data, decision-making', 'Data Science', 'advanced', NOW(), NOW());

-- DS Prerequisites
INSERT INTO skill_prerequisites (id, skill_id, prerequisite_skill_id, relationship_type, created_at) VALUES
(UUID(), @ds_s1, @ds_s0, 'required', NOW()),
(UUID(), @ds_s2, @ds_s1, 'required', NOW()),
(UUID(), @ds_s3, @ds_s2, 'required', NOW()),
(UUID(), @ds_s4, @ds_s3, 'required', NOW());

-- ============================================================================
-- DATA SCIENCE LEVELS
-- ============================================================================
SET @ds_l0 = UUID(); SET @ds_l1 = UUID(); SET @ds_l2 = UUID(); SET @ds_l3 = UUID(); SET @ds_l4 = UUID();

INSERT INTO levels (id, course_id, level_number, title, description, topic_description, created_at) VALUES
(@ds_l0, @ds_course, 0, 'Level 0: Data Primitives', 'The building blocks of data',
 'Learn what data is: numbers, categories, text. Understand rows vs columns, scalars vs vectors, and what makes a dataset.', NOW()),
(@ds_l1, @ds_course, 1, 'Level 1: Control & Filtering', 'Control flow for data',
 'Filter data with conditions, use boolean masking, make decisions with simple statistics.', NOW()),
(@ds_l2, @ds_course, 2, 'Level 2: Data Structures', 'Organizing collections of data',
 'Master DataFrames, GroupBy operations, joins, merges, and data reshaping techniques.', NOW()),
(@ds_l3, @ds_course, 3, 'Level 3: Abstractions', 'Reusable data logic',
 'Create feature engineering pipelines, build reusable analysis templates, craft visualization functions.', NOW()),
(@ds_l4, @ds_course, 4, 'Level 4: Systems', 'Real-world data science',
 'Build end-to-end projects from data to insights. Handle messy datasets and drive decision-making.', NOW());

-- DS Level-Skill mappings
INSERT INTO level_skills (id, level_id, skill_id, contribution_type, weight, created_at) VALUES
(UUID(), @ds_l0, @ds_s0, 'teaches', 10, NOW()),
(UUID(), @ds_l1, @ds_s1, 'teaches', 10, NOW()),
(UUID(), @ds_l2, @ds_s2, 'teaches', 10, NOW()),
(UUID(), @ds_l3, @ds_s3, 'teaches', 10, NOW()),
(UUID(), @ds_l4, @ds_s4, 'assesses', 10, NOW());

-- ============================================================================
-- MACHINE LEARNING SKILLS (5 levels)
-- ============================================================================
SET @ml_s0 = UUID(); SET @ml_s1 = UUID(); SET @ml_s2 = UUID(); SET @ml_s3 = UUID(); SET @ml_s4 = UUID();

INSERT INTO skills (id, name, description, category, difficulty_tier, created_at, updated_at) VALUES
(@ml_s0, 'ML: Primitives', 'Features, labels, train/test split, loss intuition', 'Machine Learning', 'beginner', NOW(), NOW()),
(@ml_s1, 'ML: Control Logic', 'Thresholds, decision boundaries, classification logic', 'Machine Learning', 'beginner', NOW(), NOW()),
(@ml_s2, 'ML: Model Structures', 'Linear models, trees, KNN, model parameters', 'Machine Learning', 'intermediate', NOW(), NOW()),
(@ml_s3, 'ML: Abstractions', 'Pipelines, cross-validation, hyperparameter tuning', 'Machine Learning', 'intermediate', NOW(), NOW()),
(@ml_s4, 'ML: Systems', 'End-to-end ML, bias/drift, real datasets', 'Machine Learning', 'advanced', NOW(), NOW());

-- ML Prerequisites
INSERT INTO skill_prerequisites (id, skill_id, prerequisite_skill_id, relationship_type, created_at) VALUES
(UUID(), @ml_s0, @ds_s2, 'required', NOW()),  -- DS Structures required for ML
(UUID(), @ml_s1, @ml_s0, 'required', NOW()),
(UUID(), @ml_s2, @ml_s1, 'required', NOW()),
(UUID(), @ml_s3, @ml_s2, 'required', NOW()),
(UUID(), @ml_s4, @ml_s3, 'required', NOW());

-- ============================================================================
-- MACHINE LEARNING LEVELS
-- ============================================================================
SET @ml_l0 = UUID(); SET @ml_l1 = UUID(); SET @ml_l2 = UUID(); SET @ml_l3 = UUID(); SET @ml_l4 = UUID();

INSERT INTO levels (id, course_id, level_number, title, description, topic_description, created_at) VALUES
(@ml_l0, @ml_course, 0, 'Level 0: ML Primitives', 'The building blocks of ML',
 'Understand features and labels, training vs test data, and the intuition behind loss and error.', NOW()),
(@ml_l1, @ml_course, 1, 'Level 1: Control Logic', 'Decision-making in ML',
 'Learn thresholds, decision boundaries, classification logic, and evaluation conditions.', NOW()),
(@ml_l2, @ml_course, 2, 'Level 2: Model Structures', 'ML model architectures',
 'Master linear models, decision trees, KNN, and understand model parameters.', NOW()),
(@ml_l3, @ml_course, 3, 'Level 3: Abstractions', 'Reusable ML patterns',
 'Build pipelines, implement cross-validation, perform feature selection and hyperparameter tuning.', NOW()),
(@ml_l4, @ml_course, 4, 'Level 4: Systems', 'Production ML',
 'Create end-to-end ML systems, handle bias and drift, work with real-world datasets.', NOW());

-- ML Level-Skill mappings
INSERT INTO level_skills (id, level_id, skill_id, contribution_type, weight, created_at) VALUES
(UUID(), @ml_l0, @ml_s0, 'teaches', 10, NOW()),
(UUID(), @ml_l1, @ml_s1, 'teaches', 10, NOW()),
(UUID(), @ml_l2, @ml_s2, 'teaches', 10, NOW()),
(UUID(), @ml_l3, @ml_s3, 'teaches', 10, NOW()),
(UUID(), @ml_l4, @ml_s4, 'assesses', 10, NOW());

-- ============================================================================
-- DEEP LEARNING SKILLS (5 levels)
-- ============================================================================
SET @dl_s0 = UUID(); SET @dl_s1 = UUID(); SET @dl_s2 = UUID(); SET @dl_s3 = UUID(); SET @dl_s4 = UUID();

INSERT INTO skills (id, name, description, category, difficulty_tier, created_at, updated_at) VALUES
(@dl_s0, 'DL: Neural Primitives', 'Neurons, weights, activations', 'Deep Learning', 'beginner', NOW(), NOW()),
(@dl_s1, 'DL: Control Flow', 'Forward pass, loss flow, gradient intuition', 'Deep Learning', 'intermediate', NOW(), NOW()),
(@dl_s2, 'DL: Network Structures', 'Layers, CNNs, RNNs, architectures', 'Deep Learning', 'intermediate', NOW(), NOW()),
(@dl_s3, 'DL: Abstractions', 'Training loops, optimizers, transfer learning', 'Deep Learning', 'advanced', NOW(), NOW()),
(@dl_s4, 'DL: Systems', 'Large models, performance tuning, real-world DL', 'Deep Learning', 'advanced', NOW(), NOW());

-- DL Prerequisites
INSERT INTO skill_prerequisites (id, skill_id, prerequisite_skill_id, relationship_type, created_at) VALUES
(UUID(), @dl_s0, @ml_s2, 'required', NOW()),  -- ML Structures required for DL
(UUID(), @dl_s1, @dl_s0, 'required', NOW()),
(UUID(), @dl_s2, @dl_s1, 'required', NOW()),
(UUID(), @dl_s3, @dl_s2, 'required', NOW()),
(UUID(), @dl_s4, @dl_s3, 'required', NOW());

-- ============================================================================
-- DEEP LEARNING LEVELS
-- ============================================================================
SET @dl_l0 = UUID(); SET @dl_l1 = UUID(); SET @dl_l2 = UUID(); SET @dl_l3 = UUID(); SET @dl_l4 = UUID();

INSERT INTO levels (id, course_id, level_number, title, description, topic_description, created_at) VALUES
(@dl_l0, @dl_course, 0, 'Level 0: Neural Primitives', 'Building blocks of neural networks',
 'Understand neurons, weights, biases, and activation functions at an intuitive level.', NOW()),
(@dl_l1, @dl_course, 1, 'Level 1: Control Flow', 'How neural networks learn',
 'Master forward propagation, loss computation, and gradient descent intuition.', NOW()),
(@dl_l2, @dl_course, 2, 'Level 2: Network Structures', 'Neural architectures',
 'Build dense layers, CNNs for images, RNNs for sequences, and understand architectures.', NOW()),
(@dl_l3, @dl_course, 3, 'Level 3: Abstractions', 'Reusable DL patterns',
 'Create training loops, choose optimizers, implement transfer learning techniques.', NOW()),
(@dl_l4, @dl_course, 4, 'Level 4: Systems', 'Production DL',
 'Work with large models, tune performance, deploy real-world deep learning applications.', NOW());

-- DL Level-Skill mappings
INSERT INTO level_skills (id, level_id, skill_id, contribution_type, weight, created_at) VALUES
(UUID(), @dl_l0, @dl_s0, 'teaches', 10, NOW()),
(UUID(), @dl_l1, @dl_s1, 'teaches', 10, NOW()),
(UUID(), @dl_l2, @dl_s2, 'teaches', 10, NOW()),
(UUID(), @dl_l3, @dl_s3, 'teaches', 10, NOW()),
(UUID(), @dl_l4, @dl_s4, 'assesses', 10, NOW());

-- ============================================================================
-- CLOUD SKILLS (5 levels)
-- ============================================================================
SET @cloud_s0 = UUID(); SET @cloud_s1 = UUID(); SET @cloud_s2 = UUID(); SET @cloud_s3 = UUID(); SET @cloud_s4 = UUID();

INSERT INTO skills (id, name, description, category, difficulty_tier, created_at, updated_at) VALUES
(@cloud_s0, 'Cloud: Primitives', 'Compute, storage, network basics', 'Cloud Computing', 'beginner', NOW(), NOW()),
(@cloud_s1, 'Cloud: Control', 'IAM, security policies, routing logic', 'Cloud Computing', 'beginner', NOW(), NOW()),
(@cloud_s2, 'Cloud: Structures', 'Service composition, containers, databases', 'Cloud Computing', 'intermediate', NOW(), NOW()),
(@cloud_s3, 'Cloud: Abstractions', 'IaC, CI/CD, orchestration', 'Cloud Computing', 'intermediate', NOW(), NOW()),
(@cloud_s4, 'Cloud: Systems', 'Scalable architectures, monitoring, production', 'Cloud Computing', 'advanced', NOW(), NOW());

-- Cloud Prerequisites
INSERT INTO skill_prerequisites (id, skill_id, prerequisite_skill_id, relationship_type, created_at) VALUES
(UUID(), @cloud_s1, @cloud_s0, 'required', NOW()),
(UUID(), @cloud_s2, @cloud_s1, 'required', NOW()),
(UUID(), @cloud_s3, @cloud_s2, 'required', NOW()),
(UUID(), @cloud_s4, @cloud_s3, 'required', NOW());

-- ============================================================================
-- CLOUD LEVELS
-- ============================================================================
SET @cloud_l0 = UUID(); SET @cloud_l1 = UUID(); SET @cloud_l2 = UUID(); SET @cloud_l3 = UUID(); SET @cloud_l4 = UUID();

INSERT INTO levels (id, course_id, level_number, title, description, topic_description, created_at) VALUES
(@cloud_l0, @cloud_course, 0, 'Level 0: Cloud Primitives', 'Building blocks of cloud',
 'Understand compute instances, storage types, and network fundamentals.', NOW()),
(@cloud_l1, @cloud_course, 1, 'Level 1: Control', 'Access and security',
 'Master IAM policies, security groups, routing rules, and access control.', NOW()),
(@cloud_l2, @cloud_course, 2, 'Level 2: Structures', 'Cloud service composition',
 'Compose services, deploy containers, configure managed databases.', NOW()),
(@cloud_l3, @cloud_course, 3, 'Level 3: Abstractions', 'Infrastructure as Code',
 'Write Terraform/CloudFormation, set up CI/CD, orchestrate with Kubernetes.', NOW()),
(@cloud_l4, @cloud_course, 4, 'Level 4: Systems', 'Production cloud',
 'Design scalable architectures, implement monitoring, achieve production readiness.', NOW());

-- Cloud Level-Skill mappings
INSERT INTO level_skills (id, level_id, skill_id, contribution_type, weight, created_at) VALUES
(UUID(), @cloud_l0, @cloud_s0, 'teaches', 10, NOW()),
(UUID(), @cloud_l1, @cloud_s1, 'teaches', 10, NOW()),
(UUID(), @cloud_l2, @cloud_s2, 'teaches', 10, NOW()),
(UUID(), @cloud_l3, @cloud_s3, 'teaches', 10, NOW()),
(UUID(), @cloud_l4, @cloud_s4, 'assesses', 10, NOW());

-- ============================================================================
-- DATA SCIENCE QUESTIONS
-- ============================================================================

-- DS Level 0: Primitives
INSERT INTO questions (id, level_id, question_type, title, description, difficulty, created_at) VALUES
(UUID(), @ds_l0, 'mcq', 'Data Types', 'Which is NOT a common data type in datasets?', 'easy', NOW()),
(UUID(), @ds_l0, 'mcq', 'Rows vs Columns', 'In a dataset, what does each row typically represent?', 'easy', NOW()),
(UUID(), @ds_l0, 'mcq', 'Scalar vs Vector', 'What is a scalar value?', 'easy', NOW()),
(UUID(), @ds_l0, 'coding', 'Create List', 'Create a Python list with 5 different data types.', 'easy', NOW()),
(UUID(), @ds_l0, 'coding', 'Access Elements', 'Access the third element from a list.', 'easy', NOW());

-- DS Level 1: Control & Filtering
INSERT INTO questions (id, level_id, question_type, title, description, difficulty, created_at) VALUES
(UUID(), @ds_l1, 'mcq', 'Boolean Mask', 'What does df[df["age"] > 18] return?', 'easy', NOW()),
(UUID(), @ds_l1, 'mcq', 'Filter Multiple', 'How do you filter with multiple conditions in pandas?', 'medium', NOW()),
(UUID(), @ds_l1, 'coding', 'Filter Data', 'Filter a DataFrame where price > 100.', 'easy', NOW()),
(UUID(), @ds_l1, 'coding', 'Conditional Stats', 'Calculate mean of column where category is "A".', 'medium', NOW()),
(UUID(), @ds_l1, 'coding', 'Boolean Column', 'Create a boolean column based on a condition.', 'medium', NOW());

-- DS Level 2: Data Structures
INSERT INTO questions (id, level_id, question_type, title, description, difficulty, created_at) VALUES
(UUID(), @ds_l2, 'mcq', 'GroupBy', 'What does groupby() return?', 'medium', NOW()),
(UUID(), @ds_l2, 'mcq', 'Join Types', 'What is the difference between inner and left join?', 'medium', NOW()),
(UUID(), @ds_l2, 'coding', 'GroupBy Aggregate', 'Group by category and sum sales.', 'medium', NOW()),
(UUID(), @ds_l2, 'coding', 'Merge DataFrames', 'Merge two DataFrames on a common key.', 'medium', NOW()),
(UUID(), @ds_l2, 'coding', 'Pivot Table', 'Create a pivot table from raw data.', 'hard', NOW()),
(UUID(), @ds_l2, 'coding', 'Reshape Data', 'Use melt() to reshape wide to long format.', 'hard', NOW());

-- DS Level 3: Abstractions
INSERT INTO questions (id, level_id, question_type, title, description, difficulty, created_at) VALUES
(UUID(), @ds_l3, 'mcq', 'Feature Engineering', 'What is feature engineering?', 'medium', NOW()),
(UUID(), @ds_l3, 'coding', 'Reusable Function', 'Write a reusable data cleaning function.', 'medium', NOW()),
(UUID(), @ds_l3, 'coding', 'Visualization Function', 'Create a function that generates standard plots.', 'medium', NOW()),
(UUID(), @ds_l3, 'coding', 'Pipeline', 'Build a data transformation pipeline.', 'hard', NOW()),
(UUID(), @ds_l3, 'coding', 'EDA Template', 'Create a reusable EDA template function.', 'hard', NOW());

-- DS Level 4: Systems
INSERT INTO questions (id, level_id, question_type, title, description, difficulty, created_at) VALUES
(UUID(), @ds_l4, 'mcq', 'Project Workflow', 'What is the correct order of a DS project?', 'medium', NOW()),
(UUID(), @ds_l4, 'coding', 'End-to-End Analysis', 'Complete analysis from loading to insights.', 'hard', NOW()),
(UUID(), @ds_l4, 'coding', 'Handle Messy Data', 'Clean a dataset with missing values and outliers.', 'hard', NOW()),
(UUID(), @ds_l4, 'coding', 'Generate Report', 'Create a summary report with key findings.', 'hard', NOW());

-- ============================================================================
-- MACHINE LEARNING QUESTIONS
-- ============================================================================

-- ML Level 0: Primitives
INSERT INTO questions (id, level_id, question_type, title, description, difficulty, created_at) VALUES
(UUID(), @ml_l0, 'mcq', 'Features vs Labels', 'What is a feature in ML?', 'easy', NOW()),
(UUID(), @ml_l0, 'mcq', 'Train vs Test', 'Why split data into train and test?', 'easy', NOW()),
(UUID(), @ml_l0, 'mcq', 'Loss Function', 'What does a loss function measure?', 'easy', NOW()),
(UUID(), @ml_l0, 'coding', 'Split Data', 'Split data into 80/20 train/test.', 'easy', NOW()),
(UUID(), @ml_l0, 'coding', 'Identify Features', 'Select feature columns from a DataFrame.', 'easy', NOW());

-- ML Level 1: Control Logic
INSERT INTO questions (id, level_id, question_type, title, description, difficulty, created_at) VALUES
(UUID(), @ml_l1, 'mcq', 'Threshold', 'What is a classification threshold?', 'medium', NOW()),
(UUID(), @ml_l1, 'mcq', 'Decision Boundary', 'What defines a decision boundary?', 'medium', NOW()),
(UUID(), @ml_l1, 'mcq', 'Precision Recall', 'When is precision more important than recall?', 'medium', NOW()),
(UUID(), @ml_l1, 'coding', 'Apply Threshold', 'Convert probabilities to classes using threshold.', 'medium', NOW()),
(UUID(), @ml_l1, 'coding', 'Confusion Matrix', 'Create and interpret a confusion matrix.', 'medium', NOW());

-- ML Level 2: Model Structures
INSERT INTO questions (id, level_id, question_type, title, description, difficulty, created_at) VALUES
(UUID(), @ml_l2, 'mcq', 'Linear vs Tree', 'Difference between linear models and trees?', 'medium', NOW()),
(UUID(), @ml_l2, 'mcq', 'KNN', 'How does KNN make predictions?', 'medium', NOW()),
(UUID(), @ml_l2, 'coding', 'Train Linear Model', 'Train a linear regression model.', 'medium', NOW()),
(UUID(), @ml_l2, 'coding', 'Train Decision Tree', 'Train and visualize a decision tree.', 'medium', NOW()),
(UUID(), @ml_l2, 'coding', 'Compare Models', 'Compare accuracy of different models.', 'hard', NOW());

-- ML Level 3: Abstractions
INSERT INTO questions (id, level_id, question_type, title, description, difficulty, created_at) VALUES
(UUID(), @ml_l3, 'mcq', 'Cross Validation', 'What is k-fold cross-validation?', 'medium', NOW()),
(UUID(), @ml_l3, 'mcq', 'Hyperparameters', 'What are hyperparameters?', 'medium', NOW()),
(UUID(), @ml_l3, 'coding', 'Build Pipeline', 'Create sklearn pipeline with preprocessing.', 'hard', NOW()),
(UUID(), @ml_l3, 'coding', 'Grid Search', 'Perform hyperparameter tuning with GridSearchCV.', 'hard', NOW()),
(UUID(), @ml_l3, 'coding', 'Cross Validate', 'Implement cross-validation scoring.', 'medium', NOW());

-- ML Level 4: Systems
INSERT INTO questions (id, level_id, question_type, title, description, difficulty, created_at) VALUES
(UUID(), @ml_l4, 'mcq', 'Model Drift', 'What is model drift?', 'hard', NOW()),
(UUID(), @ml_l4, 'coding', 'End-to-End ML', 'Build complete ML pipeline from data to prediction.', 'hard', NOW()),
(UUID(), @ml_l4, 'coding', 'Handle Bias', 'Detect and mitigate bias in model.', 'hard', NOW()),
(UUID(), @ml_l4, 'coding', 'Model Monitoring', 'Set up basic model performance monitoring.', 'hard', NOW());

-- ============================================================================
-- DEEP LEARNING QUESTIONS
-- ============================================================================

-- DL Level 0: Neural Primitives
INSERT INTO questions (id, level_id, question_type, title, description, difficulty, created_at) VALUES
(UUID(), @dl_l0, 'mcq', 'Neuron', 'What does a neuron compute?', 'easy', NOW()),
(UUID(), @dl_l0, 'mcq', 'Activation', 'What is an activation function?', 'easy', NOW()),
(UUID(), @dl_l0, 'mcq', 'Weights', 'What do weights represent?', 'easy', NOW()),
(UUID(), @dl_l0, 'coding', 'Implement Neuron', 'Implement a single neuron in NumPy.', 'medium', NOW());

-- DL Level 1: Control Flow
INSERT INTO questions (id, level_id, question_type, title, description, difficulty, created_at) VALUES
(UUID(), @dl_l1, 'mcq', 'Forward Pass', 'What happens in forward propagation?', 'medium', NOW()),
(UUID(), @dl_l1, 'mcq', 'Gradient Descent', 'What is gradient descent?', 'medium', NOW()),
(UUID(), @dl_l1, 'coding', 'Forward Pass', 'Implement forward pass for a layer.', 'medium', NOW()),
(UUID(), @dl_l1, 'coding', 'Loss Calculation', 'Calculate MSE loss manually.', 'medium', NOW());

-- DL Level 2: Network Structures
INSERT INTO questions (id, level_id, question_type, title, description, difficulty, created_at) VALUES
(UUID(), @dl_l2, 'mcq', 'CNN', 'What are CNNs best suited for?', 'medium', NOW()),
(UUID(), @dl_l2, 'mcq', 'RNN', 'When should you use an RNN?', 'medium', NOW()),
(UUID(), @dl_l2, 'coding', 'Build CNN', 'Create a simple CNN in PyTorch/Keras.', 'hard', NOW()),
(UUID(), @dl_l2, 'coding', 'Build Dense Network', 'Build a multi-layer dense network.', 'medium', NOW());

-- DL Level 3: Abstractions
INSERT INTO questions (id, level_id, question_type, title, description, difficulty, created_at) VALUES
(UUID(), @dl_l3, 'mcq', 'Transfer Learning', 'What is transfer learning?', 'medium', NOW()),
(UUID(), @dl_l3, 'coding', 'Training Loop', 'Implement a custom training loop.', 'hard', NOW()),
(UUID(), @dl_l3, 'coding', 'Transfer Learning', 'Fine-tune a pretrained model.', 'hard', NOW()),
(UUID(), @dl_l3, 'coding', 'Custom Optimizer', 'Configure Adam with custom learning rate.', 'medium', NOW());

-- DL Level 4: Systems
INSERT INTO questions (id, level_id, question_type, title, description, difficulty, created_at) VALUES
(UUID(), @dl_l4, 'mcq', 'Large Models', 'Challenges of training large models?', 'hard', NOW()),
(UUID(), @dl_l4, 'coding', 'Model Optimization', 'Optimize model for inference speed.', 'hard', NOW()),
(UUID(), @dl_l4, 'coding', 'Deploy Model', 'Export and deploy a trained model.', 'hard', NOW());

-- ============================================================================
-- CLOUD QUESTIONS
-- ============================================================================

-- Cloud Level 0: Primitives
INSERT INTO questions (id, level_id, question_type, title, description, difficulty, created_at) VALUES
(UUID(), @cloud_l0, 'mcq', 'Compute', 'What is a compute instance?', 'easy', NOW()),
(UUID(), @cloud_l0, 'mcq', 'Storage Types', 'Difference between object and block storage?', 'easy', NOW()),
(UUID(), @cloud_l0, 'mcq', 'VPC', 'What is a VPC?', 'easy', NOW()),
(UUID(), @cloud_l0, 'coding', 'List Services', 'Use CLI to list running instances.', 'easy', NOW());

-- Cloud Level 1: Control
INSERT INTO questions (id, level_id, question_type, title, description, difficulty, created_at) VALUES
(UUID(), @cloud_l1, 'mcq', 'IAM', 'What does IAM manage?', 'easy', NOW()),
(UUID(), @cloud_l1, 'mcq', 'Security Groups', 'What is a security group?', 'medium', NOW()),
(UUID(), @cloud_l1, 'coding', 'Create IAM Policy', 'Write an IAM policy JSON.', 'medium', NOW()),
(UUID(), @cloud_l1, 'coding', 'Configure SG', 'Configure inbound/outbound rules.', 'medium', NOW());

-- Cloud Level 2: Structures
INSERT INTO questions (id, level_id, question_type, title, description, difficulty, created_at) VALUES
(UUID(), @cloud_l2, 'mcq', 'Containers', 'Container vs VM differences?', 'medium', NOW()),
(UUID(), @cloud_l2, 'mcq', 'Managed DB', 'Benefits of managed databases?', 'medium', NOW()),
(UUID(), @cloud_l2, 'coding', 'Deploy Container', 'Deploy a Docker container to cloud.', 'medium', NOW()),
(UUID(), @cloud_l2, 'coding', 'Connect Services', 'Connect app to managed database.', 'medium', NOW());

-- Cloud Level 3: Abstractions
INSERT INTO questions (id, level_id, question_type, title, description, difficulty, created_at) VALUES
(UUID(), @cloud_l3, 'mcq', 'IaC', 'What is Infrastructure as Code?', 'medium', NOW()),
(UUID(), @cloud_l3, 'mcq', 'Kubernetes', 'What does Kubernetes orchestrate?', 'medium', NOW()),
(UUID(), @cloud_l3, 'coding', 'Terraform', 'Write Terraform config for an instance.', 'hard', NOW()),
(UUID(), @cloud_l3, 'coding', 'CI/CD Pipeline', 'Set up a basic CI/CD pipeline.', 'hard', NOW());

-- Cloud Level 4: Systems
INSERT INTO questions (id, level_id, question_type, title, description, difficulty, created_at) VALUES
(UUID(), @cloud_l4, 'mcq', 'Scalability', 'Horizontal vs vertical scaling?', 'medium', NOW()),
(UUID(), @cloud_l4, 'coding', 'Auto Scaling', 'Configure auto-scaling group.', 'hard', NOW()),
(UUID(), @cloud_l4, 'coding', 'Monitoring', 'Set up CloudWatch/Stackdriver alerts.', 'hard', NOW()),
(UUID(), @cloud_l4, 'coding', 'Architecture', 'Design a highly available architecture.', 'hard', NOW());

-- ============================================================================
-- END
-- ============================================================================
SELECT 'All 4 courses created successfully!' AS status,
       '4 courses, 20 levels, 20 skills, 80+ questions' AS summary;
