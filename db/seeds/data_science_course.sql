-- ============================================================================
-- Data Science Course - Complete Seed Data
-- Created: 2026-01-09
-- Description: Full Data Science curriculum with skills, prerequisites, and questions
-- ============================================================================

-- Use consistent UUIDs for relationships
SET @course_id = UUID();
SET @skill_python = UUID();
SET @skill_stats = UUID();
SET @skill_pandas = UUID();
SET @skill_viz_basic = UUID();
SET @skill_eda = UUID();
SET @skill_feature_eng = UUID();
SET @skill_stats_int = UUID();
SET @skill_ml_intro = UUID();
SET @skill_ml_adv = UUID();
SET @skill_viz_adv = UUID();
SET @skill_capstone = UUID();

-- ============================================================================
-- COURSE
-- ============================================================================
INSERT INTO courses (id, title, description, created_at) VALUES
(@course_id, 'Data Science Fundamentals', 
 'Master data science from basics to advanced ML. Covers Python, statistics, pandas, visualization, and machine learning with hands-on coding exercises.',
 NOW());

-- ============================================================================
-- SKILLS (11 total)
-- ============================================================================
INSERT INTO skills (id, name, description, category, difficulty_tier, created_at, updated_at) VALUES
-- Level 1 Skills
(@skill_python, 'Python Basics', 'Variables, loops, functions, lists, and dictionaries', 'Programming', 'beginner', NOW(), NOW()),
(@skill_stats, 'Statistics Fundamentals', 'Mean, median, mode, standard deviation', 'Mathematics', 'beginner', NOW(), NOW()),
(@skill_pandas, 'Pandas Basics', 'Reading CSV, filtering, aggregating data', 'Data Manipulation', 'beginner', NOW(), NOW()),
(@skill_viz_basic, 'Data Visualization Basics', 'Matplotlib and Seaborn charts', 'Visualization', 'beginner', NOW(), NOW()),

-- Level 2 Skills
(@skill_eda, 'Exploratory Data Analysis', 'Handling missing values, outliers, correlation', 'Analysis', 'intermediate', NOW(), NOW()),
(@skill_feature_eng, 'Feature Engineering', 'Encoding, scaling, transformations', 'Data Manipulation', 'intermediate', NOW(), NOW()),
(@skill_stats_int, 'Intermediate Statistics', 'Probability distributions, confidence intervals', 'Mathematics', 'intermediate', NOW(), NOW()),
(@skill_ml_intro, 'Introduction to ML', 'Supervised vs unsupervised, train/test split', 'Machine Learning', 'intermediate', NOW(), NOW()),

-- Level 3 Skills
(@skill_ml_adv, 'Advanced Machine Learning', 'Regression, classification, evaluation metrics', 'Machine Learning', 'advanced', NOW(), NOW()),
(@skill_viz_adv, 'Advanced Data Visualization', 'Multi-dimensional plots, dashboards', 'Visualization', 'advanced', NOW(), NOW()),
(@skill_capstone, 'Capstone Projects', 'End-to-end DS project: cleaning → EDA → modeling → viz', 'Projects', 'advanced', NOW(), NOW());

-- ============================================================================
-- SKILL PREREQUISITES
-- ============================================================================
INSERT INTO skill_prerequisites (id, skill_id, prerequisite_skill_id, relationship_type, created_at) VALUES
-- Python is prerequisite for Pandas and Viz
(UUID(), @skill_pandas, @skill_python, 'required', NOW()),
(UUID(), @skill_viz_basic, @skill_python, 'required', NOW()),

-- Stats and Pandas are prerequisites for EDA
(UUID(), @skill_eda, @skill_stats, 'required', NOW()),
(UUID(), @skill_eda, @skill_pandas, 'required', NOW()),

-- EDA is prerequisite for Feature Eng and ML
(UUID(), @skill_feature_eng, @skill_eda, 'required', NOW()),
(UUID(), @skill_ml_intro, @skill_eda, 'required', NOW()),

-- Stats is prerequisite for Intermediate Stats
(UUID(), @skill_stats_int, @skill_stats, 'required', NOW()),

-- Intermediate Stats is prerequisite for ML
(UUID(), @skill_ml_intro, @skill_stats_int, 'recommended', NOW()),

-- Feature Eng and ML Intro are prerequisites for Advanced ML
(UUID(), @skill_ml_adv, @skill_feature_eng, 'required', NOW()),
(UUID(), @skill_ml_adv, @skill_ml_intro, 'required', NOW()),

-- Viz Basic is prerequisite for Advanced Viz
(UUID(), @skill_viz_adv, @skill_viz_basic, 'required', NOW()),

-- Advanced ML is prerequisite for Capstone
(UUID(), @skill_capstone, @skill_ml_adv, 'required', NOW());

-- ============================================================================
-- LEVELS
-- ============================================================================
SET @level1_python = UUID();
SET @level1_stats = UUID();
SET @level1_pandas = UUID();
SET @level1_viz = UUID();
SET @level2_eda = UUID();
SET @level2_feature = UUID();
SET @level2_stats = UUID();
SET @level2_ml = UUID();
SET @level3_ml = UUID();
SET @level3_viz = UUID();
SET @level3_capstone = UUID();

INSERT INTO levels (id, course_id, level_number, title, description, topic_description, created_at) VALUES
-- Level 1
(@level1_python, @course_id, 1, 'Python Basics', 'Master Python fundamentals for data science',
 'Learn variables, data types, loops, functions, lists, and dictionaries - the building blocks for all data science work.', NOW()),
(@level1_stats, @course_id, 2, 'Statistics Fundamentals', 'Core statistical concepts',
 'Understand mean, median, mode, variance, and standard deviation - essential for data analysis.', NOW()),
(@level1_pandas, @course_id, 3, 'Pandas Basics', 'Data manipulation with Pandas',
 'Learn to read CSVs, filter data, and perform aggregations using the Pandas library.', NOW()),
(@level1_viz, @course_id, 4, 'Data Visualization Basics', 'Create charts with Matplotlib & Seaborn',
 'Build bar charts, line plots, histograms, and scatter plots to visualize data effectively.', NOW()),

-- Level 2
(@level2_eda, @course_id, 5, 'Exploratory Data Analysis', 'Deep dive into data exploration',
 'Handle missing values, detect outliers, and analyze correlations in real datasets.', NOW()),
(@level2_feature, @course_id, 6, 'Feature Engineering', 'Prepare data for machine learning',
 'Learn encoding categorical variables, scaling features, and creating transformations.', NOW()),
(@level2_stats, @course_id, 7, 'Intermediate Statistics', 'Probability and inference',
 'Study probability distributions, hypothesis testing, and confidence intervals.', NOW()),
(@level2_ml, @course_id, 8, 'Introduction to Machine Learning', 'ML fundamentals',
 'Understand supervised vs unsupervised learning, train/test splits, and basic model concepts.', NOW()),

-- Level 3
(@level3_ml, @course_id, 9, 'Advanced Machine Learning', 'Implement ML models',
 'Build regression and classification models, evaluate with metrics like accuracy, precision, recall.', NOW()),
(@level3_viz, @course_id, 10, 'Advanced Data Visualization', 'Complex visualizations',
 'Create multi-dimensional plots, interactive dashboards, and publication-ready figures.', NOW()),
(@level3_capstone, @course_id, 11, 'Capstone Project', 'End-to-end data science project',
 'Apply all skills: data cleaning, EDA, feature engineering, modeling, and visualization.', NOW());

-- ============================================================================
-- LEVEL-SKILL MAPPINGS
-- ============================================================================
INSERT INTO level_skills (id, level_id, skill_id, contribution_type, weight, created_at) VALUES
(UUID(), @level1_python, @skill_python, 'teaches', 10, NOW()),
(UUID(), @level1_stats, @skill_stats, 'teaches', 10, NOW()),
(UUID(), @level1_pandas, @skill_pandas, 'teaches', 10, NOW()),
(UUID(), @level1_viz, @skill_viz_basic, 'teaches', 10, NOW()),
(UUID(), @level2_eda, @skill_eda, 'teaches', 10, NOW()),
(UUID(), @level2_feature, @skill_feature_eng, 'teaches', 10, NOW()),
(UUID(), @level2_stats, @skill_stats_int, 'teaches', 10, NOW()),
(UUID(), @level2_ml, @skill_ml_intro, 'teaches', 10, NOW()),
(UUID(), @level3_ml, @skill_ml_adv, 'teaches', 10, NOW()),
(UUID(), @level3_viz, @skill_viz_adv, 'teaches', 10, NOW()),
(UUID(), @level3_capstone, @skill_capstone, 'assesses', 10, NOW());

-- ============================================================================
-- QUESTIONS - LEVEL 1: Python Basics
-- ============================================================================
SET @q1 = UUID(); SET @q2 = UUID(); SET @q3 = UUID(); SET @q4 = UUID(); SET @q5 = UUID();
SET @q6 = UUID(); SET @q7 = UUID(); SET @q8 = UUID();

INSERT INTO questions (id, level_id, question_type, title, description, difficulty, created_at) VALUES
-- MCQs
(@q1, @level1_python, 'mcq', 'Variable Types', 'What is the output of type(3.14)?', 'easy', NOW()),
(@q2, @level1_python, 'mcq', 'List Operations', 'Which method adds an element to the end of a list?', 'easy', NOW()),
(@q3, @level1_python, 'mcq', 'Dictionary Access', 'How do you access a value in a dictionary?', 'easy', NOW()),
(@q4, @level1_python, 'mcq', 'Loop Types', 'Which loop is best for iterating over a list?', 'easy', NOW()),
(@q5, @level1_python, 'mcq', 'Function Definition', 'What keyword is used to define a function?', 'easy', NOW()),
-- Coding
(@q6, @level1_python, 'coding', 'Sum of List', 'Write a function that returns the sum of all numbers in a list.', 'easy', NOW()),
(@q7, @level1_python, 'coding', 'Find Maximum', 'Write a function that finds the maximum value in a list without using max().', 'medium', NOW()),
(@q8, @level1_python, 'coding', 'Word Counter', 'Write a function that counts word frequencies in a string using a dictionary.', 'medium', NOW());

-- MCQ Options for Python
INSERT INTO mcq_options (id, question_id, option_letter, option_text, is_correct) VALUES
(UUID(), @q1, 'A', '<class ''int''>', FALSE),
(UUID(), @q1, 'B', '<class ''float''>', TRUE),
(UUID(), @q1, 'C', '<class ''str''>', FALSE),
(UUID(), @q1, 'D', '<class ''bool''>', FALSE),

(UUID(), @q2, 'A', 'add()', FALSE),
(UUID(), @q2, 'B', 'append()', TRUE),
(UUID(), @q2, 'C', 'insert()', FALSE),
(UUID(), @q2, 'D', 'extend()', FALSE),

(UUID(), @q3, 'A', 'dict.key', FALSE),
(UUID(), @q3, 'B', 'dict[key]', TRUE),
(UUID(), @q3, 'C', 'dict(key)', FALSE),
(UUID(), @q3, 'D', 'dict->key', FALSE),

(UUID(), @q4, 'A', 'while loop', FALSE),
(UUID(), @q4, 'B', 'for loop', TRUE),
(UUID(), @q4, 'C', 'do-while loop', FALSE),
(UUID(), @q4, 'D', 'repeat loop', FALSE),

(UUID(), @q5, 'A', 'function', FALSE),
(UUID(), @q5, 'B', 'def', TRUE),
(UUID(), @q5, 'C', 'func', FALSE),
(UUID(), @q5, 'D', 'define', FALSE);

-- ============================================================================
-- QUESTIONS - LEVEL 1: Statistics
-- ============================================================================
SET @qs1 = UUID(); SET @qs2 = UUID(); SET @qs3 = UUID(); SET @qs4 = UUID(); SET @qs5 = UUID();
SET @qs6 = UUID(); SET @qs7 = UUID();

INSERT INTO questions (id, level_id, question_type, title, description, difficulty, created_at) VALUES
(@qs1, @level1_stats, 'mcq', 'Mean Calculation', 'What is the mean of [2, 4, 6, 8, 10]?', 'easy', NOW()),
(@qs2, @level1_stats, 'mcq', 'Median Definition', 'What does the median represent?', 'easy', NOW()),
(@qs3, @level1_stats, 'mcq', 'Mode Concept', 'What is the mode of [1, 2, 2, 3, 4]?', 'easy', NOW()),
(@qs4, @level1_stats, 'mcq', 'Standard Deviation', 'What does standard deviation measure?', 'easy', NOW()),
(@qs5, @level1_stats, 'mcq', 'Variance vs SD', 'How is variance related to standard deviation?', 'medium', NOW()),
(@qs6, @level1_stats, 'coding', 'Calculate Mean', 'Write a function to calculate the mean of a list of numbers.', 'easy', NOW()),
(@qs7, @level1_stats, 'coding', 'Calculate Std Dev', 'Write a function to calculate the standard deviation of a list.', 'medium', NOW());

INSERT INTO mcq_options (id, question_id, option_letter, option_text, is_correct) VALUES
(UUID(), @qs1, 'A', '5', FALSE),
(UUID(), @qs1, 'B', '6', TRUE),
(UUID(), @qs1, 'C', '7', FALSE),
(UUID(), @qs1, 'D', '8', FALSE),

(UUID(), @qs2, 'A', 'The most frequent value', FALSE),
(UUID(), @qs2, 'B', 'The middle value when sorted', TRUE),
(UUID(), @qs2, 'C', 'The average of all values', FALSE),
(UUID(), @qs2, 'D', 'The range of values', FALSE),

(UUID(), @qs3, 'A', '1', FALSE),
(UUID(), @qs3, 'B', '2', TRUE),
(UUID(), @qs3, 'C', '3', FALSE),
(UUID(), @qs3, 'D', '2.4', FALSE),

(UUID(), @qs4, 'A', 'The average value', FALSE),
(UUID(), @qs4, 'B', 'The spread of data from the mean', TRUE),
(UUID(), @qs4, 'C', 'The most common value', FALSE),
(UUID(), @qs4, 'D', 'The difference between max and min', FALSE),

(UUID(), @qs5, 'A', 'Variance is the square root of SD', FALSE),
(UUID(), @qs5, 'B', 'SD is the square root of variance', TRUE),
(UUID(), @qs5, 'C', 'They are the same', FALSE),
(UUID(), @qs5, 'D', 'Variance is double the SD', FALSE);

-- ============================================================================
-- QUESTIONS - LEVEL 1: Pandas
-- ============================================================================
SET @qp1 = UUID(); SET @qp2 = UUID(); SET @qp3 = UUID();
SET @qp4 = UUID(); SET @qp5 = UUID(); SET @qp6 = UUID(); SET @qp7 = UUID(); SET @qp8 = UUID();

INSERT INTO questions (id, level_id, question_type, title, description, difficulty, created_at) VALUES
(@qp1, @level1_pandas, 'mcq', 'Read CSV', 'Which function reads a CSV file into a DataFrame?', 'easy', NOW()),
(@qp2, @level1_pandas, 'mcq', 'DataFrame Filtering', 'How do you filter rows where column "age" > 18?', 'easy', NOW()),
(@qp3, @level1_pandas, 'mcq', 'Group By', 'What does groupby() return?', 'medium', NOW()),
(@qp4, @level1_pandas, 'coding', 'Load and Filter', 'Load a CSV and filter rows where "price" > 100.', 'easy', NOW()),
(@qp5, @level1_pandas, 'coding', 'Calculate Mean Column', 'Calculate the mean of a specific column in a DataFrame.', 'easy', NOW()),
(@qp6, @level1_pandas, 'coding', 'Group and Aggregate', 'Group by "category" and calculate sum of "sales".', 'medium', NOW()),
(@qp7, @level1_pandas, 'coding', 'Add New Column', 'Add a new column that is the product of two existing columns.', 'easy', NOW()),
(@qp8, @level1_pandas, 'coding', 'Sort DataFrame', 'Sort a DataFrame by a column in descending order.', 'easy', NOW());

INSERT INTO mcq_options (id, question_id, option_letter, option_text, is_correct) VALUES
(UUID(), @qp1, 'A', 'pd.load_csv()', FALSE),
(UUID(), @qp1, 'B', 'pd.read_csv()', TRUE),
(UUID(), @qp1, 'C', 'pd.open_csv()', FALSE),
(UUID(), @qp1, 'D', 'pd.import_csv()', FALSE),

(UUID(), @qp2, 'A', 'df.filter(age > 18)', FALSE),
(UUID(), @qp2, 'B', 'df[df["age"] > 18]', TRUE),
(UUID(), @qp2, 'C', 'df.where(age > 18)', FALSE),
(UUID(), @qp2, 'D', 'df.select(age > 18)', FALSE),

(UUID(), @qp3, 'A', 'A single value', FALSE),
(UUID(), @qp3, 'B', 'A GroupBy object', TRUE),
(UUID(), @qp3, 'C', 'A new DataFrame', FALSE),
(UUID(), @qp3, 'D', 'A dictionary', FALSE);

-- ============================================================================
-- QUESTIONS - LEVEL 1: Data Visualization
-- ============================================================================
SET @qv1 = UUID(); SET @qv2 = UUID(); SET @qv3 = UUID();
SET @qv4 = UUID(); SET @qv5 = UUID(); SET @qv6 = UUID(); SET @qv7 = UUID();

INSERT INTO questions (id, level_id, question_type, title, description, difficulty, created_at) VALUES
(@qv1, @level1_viz, 'mcq', 'Plot Types', 'Which plot is best for showing distribution of a single variable?', 'easy', NOW()),
(@qv2, @level1_viz, 'mcq', 'Scatter Plot Use', 'When should you use a scatter plot?', 'easy', NOW()),
(@qv3, @level1_viz, 'mcq', 'Seaborn vs Matplotlib', 'What is the main advantage of Seaborn over Matplotlib?', 'medium', NOW()),
(@qv4, @level1_viz, 'coding', 'Create Bar Chart', 'Create a bar chart showing sales by category.', 'easy', NOW()),
(@qv5, @level1_viz, 'coding', 'Create Histogram', 'Create a histogram of a numerical column.', 'easy', NOW()),
(@qv6, @level1_viz, 'coding', 'Scatter with Colors', 'Create a scatter plot with different colors for categories.', 'medium', NOW()),
(@qv7, @level1_viz, 'coding', 'Add Labels and Title', 'Create a line plot with axis labels and a title.', 'easy', NOW());

INSERT INTO mcq_options (id, question_id, option_letter, option_text, is_correct) VALUES
(UUID(), @qv1, 'A', 'Bar chart', FALSE),
(UUID(), @qv1, 'B', 'Histogram', TRUE),
(UUID(), @qv1, 'C', 'Scatter plot', FALSE),
(UUID(), @qv1, 'D', 'Pie chart', FALSE),

(UUID(), @qv2, 'A', 'To show categories', FALSE),
(UUID(), @qv2, 'B', 'To show relationship between two numeric variables', TRUE),
(UUID(), @qv2, 'C', 'To show time series', FALSE),
(UUID(), @qv2, 'D', 'To show percentages', FALSE),

(UUID(), @qv3, 'A', 'Faster rendering', FALSE),
(UUID(), @qv3, 'B', 'Better default aesthetics and statistical plotting', TRUE),
(UUID(), @qv3, 'C', 'More plot types', FALSE),
(UUID(), @qv3, 'D', 'Smaller file size', FALSE);

-- ============================================================================
-- QUESTIONS - LEVEL 2: EDA
-- ============================================================================
SET @qe1 = UUID(); SET @qe2 = UUID(); SET @qe3 = UUID(); SET @qe4 = UUID();
SET @qe5 = UUID(); SET @qe6 = UUID(); SET @qe7 = UUID(); SET @qe8 = UUID(); SET @qe9 = UUID();

INSERT INTO questions (id, level_id, question_type, title, description, difficulty, created_at) VALUES
(@qe1, @level2_eda, 'mcq', 'Missing Values', 'Which method checks for missing values in pandas?', 'easy', NOW()),
(@qe2, @level2_eda, 'mcq', 'Handling Nulls', 'What does fillna() do?', 'easy', NOW()),
(@qe3, @level2_eda, 'mcq', 'Outlier Detection', 'Which method is commonly used to detect outliers?', 'medium', NOW()),
(@qe4, @level2_eda, 'mcq', 'Correlation', 'What does a correlation of -1 indicate?', 'medium', NOW()),
(@qe5, @level2_eda, 'coding', 'Find Missing', 'Write code to find and count missing values per column.', 'easy', NOW()),
(@qe6, @level2_eda, 'coding', 'Fill Missing', 'Fill missing values in a column with the median.', 'easy', NOW()),
(@qe7, @level2_eda, 'coding', 'Detect Outliers', 'Use IQR method to detect outliers in a column.', 'medium', NOW()),
(@qe8, @level2_eda, 'coding', 'Correlation Matrix', 'Create a correlation matrix heatmap.', 'medium', NOW()),
(@qe9, @level2_eda, 'coding', 'Data Summary', 'Generate a comprehensive summary of a dataset.', 'easy', NOW());

INSERT INTO mcq_options (id, question_id, option_letter, option_text, is_correct) VALUES
(UUID(), @qe1, 'A', 'df.null()', FALSE),
(UUID(), @qe1, 'B', 'df.isnull()', TRUE),
(UUID(), @qe1, 'C', 'df.missing()', FALSE),
(UUID(), @qe1, 'D', 'df.na()', FALSE),

(UUID(), @qe2, 'A', 'Removes rows with null values', FALSE),
(UUID(), @qe2, 'B', 'Replaces null values with a specified value', TRUE),
(UUID(), @qe2, 'C', 'Counts null values', FALSE),
(UUID(), @qe2, 'D', 'Creates a new column for nulls', FALSE),

(UUID(), @qe3, 'A', 'Mean comparison', FALSE),
(UUID(), @qe3, 'B', 'IQR (Interquartile Range) method', TRUE),
(UUID(), @qe3, 'C', 'Mode analysis', FALSE),
(UUID(), @qe3, 'D', 'Variance check', FALSE),

(UUID(), @qe4, 'A', 'No relationship', FALSE),
(UUID(), @qe4, 'B', 'Perfect negative linear relationship', TRUE),
(UUID(), @qe4, 'C', 'Perfect positive relationship', FALSE),
(UUID(), @qe4, 'D', 'Weak relationship', FALSE);

-- ============================================================================
-- QUESTIONS - LEVEL 2: Feature Engineering
-- ============================================================================
SET @qf1 = UUID(); SET @qf2 = UUID(); SET @qf3 = UUID(); SET @qf4 = UUID();
SET @qf5 = UUID(); SET @qf6 = UUID(); SET @qf7 = UUID(); SET @qf8 = UUID();

INSERT INTO questions (id, level_id, question_type, title, description, difficulty, created_at) VALUES
(@qf1, @level2_feature, 'mcq', 'One-Hot Encoding', 'What does one-hot encoding do?', 'easy', NOW()),
(@qf2, @level2_feature, 'mcq', 'Scaling Methods', 'What is the difference between StandardScaler and MinMaxScaler?', 'medium', NOW()),
(@qf3, @level2_feature, 'mcq', 'Label Encoding', 'When should you use label encoding vs one-hot?', 'medium', NOW()),
(@qf4, @level2_feature, 'mcq', 'Log Transform', 'Why apply log transformation to skewed data?', 'medium', NOW()),
(@qf5, @level2_feature, 'coding', 'One-Hot Encode', 'Apply one-hot encoding to a categorical column.', 'easy', NOW()),
(@qf6, @level2_feature, 'coding', 'Standard Scaling', 'Apply StandardScaler to numerical features.', 'easy', NOW()),
(@qf7, @level2_feature, 'coding', 'Create Features', 'Create a new feature by combining existing columns.', 'medium', NOW()),
(@qf8, @level2_feature, 'coding', 'Binning', 'Convert a continuous variable into categorical bins.', 'medium', NOW());

INSERT INTO mcq_options (id, question_id, option_letter, option_text, is_correct) VALUES
(UUID(), @qf1, 'A', 'Converts numbers to categories', FALSE),
(UUID(), @qf1, 'B', 'Creates binary columns for each category', TRUE),
(UUID(), @qf1, 'C', 'Removes categorical columns', FALSE),
(UUID(), @qf1, 'D', 'Scales categorical values', FALSE),

(UUID(), @qf2, 'A', 'StandardScaler uses 0-1 range, MinMax uses z-scores', FALSE),
(UUID(), @qf2, 'B', 'StandardScaler uses z-scores, MinMax scales to 0-1 range', TRUE),
(UUID(), @qf2, 'C', 'They are identical', FALSE),
(UUID(), @qf2, 'D', 'StandardScaler is for text, MinMax for numbers', FALSE),

(UUID(), @qf3, 'A', 'Label for high cardinality, one-hot for low cardinality', FALSE),
(UUID(), @qf3, 'B', 'Label for ordinal data, one-hot for nominal data', TRUE),
(UUID(), @qf3, 'C', 'Always use one-hot', FALSE),
(UUID(), @qf3, 'D', 'Always use label encoding', FALSE),

(UUID(), @qf4, 'A', 'To increase skewness', FALSE),
(UUID(), @qf4, 'B', 'To reduce skewness and make data more normal', TRUE),
(UUID(), @qf4, 'C', 'To remove outliers', FALSE),
(UUID(), @qf4, 'D', 'To increase variance', FALSE);

-- ============================================================================
-- QUESTIONS - LEVEL 2: Intermediate Statistics
-- ============================================================================
SET @qi1 = UUID(); SET @qi2 = UUID(); SET @qi3 = UUID(); SET @qi4 = UUID(); SET @qi5 = UUID();
SET @qi6 = UUID(); SET @qi7 = UUID(); SET @qi8 = UUID();

INSERT INTO questions (id, level_id, question_type, title, description, difficulty, created_at) VALUES
(@qi1, @level2_stats, 'mcq', 'Normal Distribution', 'What percentage of data falls within 1 standard deviation of the mean in a normal distribution?', 'easy', NOW()),
(@qi2, @level2_stats, 'mcq', 'Confidence Interval', 'What does a 95% confidence interval mean?', 'medium', NOW()),
(@qi3, @level2_stats, 'mcq', 'P-Value', 'What is the p-value in hypothesis testing?', 'medium', NOW()),
(@qi4, @level2_stats, 'mcq', 'Type I Error', 'What is a Type I error?', 'medium', NOW()),
(@qi5, @level2_stats, 'mcq', 'Central Limit Theorem', 'What does the Central Limit Theorem state?', 'hard', NOW()),
(@qi6, @level2_stats, 'coding', 'Calculate CI', 'Calculate a 95% confidence interval for a sample mean.', 'medium', NOW()),
(@qi7, @level2_stats, 'coding', 'T-Test', 'Perform a t-test to compare two sample means.', 'medium', NOW()),
(@qi8, @level2_stats, 'coding', 'Distribution Plot', 'Plot a normal distribution with given mean and std.', 'easy', NOW());

INSERT INTO mcq_options (id, question_id, option_letter, option_text, is_correct) VALUES
(UUID(), @qi1, 'A', '50%', FALSE),
(UUID(), @qi1, 'B', '68%', TRUE),
(UUID(), @qi1, 'C', '95%', FALSE),
(UUID(), @qi1, 'D', '99%', FALSE),

(UUID(), @qi2, 'A', '95% of data falls in the interval', FALSE),
(UUID(), @qi2, 'B', 'If we repeated sampling, 95% of intervals would contain true parameter', TRUE),
(UUID(), @qi2, 'C', 'We are 95% sure the sample is correct', FALSE),
(UUID(), @qi2, 'D', '5% chance of error', FALSE),

(UUID(), @qi3, 'A', 'Probability that the null hypothesis is true', FALSE),
(UUID(), @qi3, 'B', 'Probability of observing data at least as extreme, given null is true', TRUE),
(UUID(), @qi3, 'C', 'The significance level', FALSE),
(UUID(), @qi3, 'D', 'The power of the test', FALSE),

(UUID(), @qi4, 'A', 'Failing to reject a false null hypothesis', FALSE),
(UUID(), @qi4, 'B', 'Rejecting a true null hypothesis', TRUE),
(UUID(), @qi4, 'C', 'Accepting the alternative hypothesis', FALSE),
(UUID(), @qi4, 'D', 'Making a calculation error', FALSE),

(UUID(), @qi5, 'A', 'All data is normally distributed', FALSE),
(UUID(), @qi5, 'B', 'Sample means approach normal distribution as sample size increases', TRUE),
(UUID(), @qi5, 'C', 'Large samples have no outliers', FALSE),
(UUID(), @qi5, 'D', 'Mean equals median in all cases', FALSE);

-- ============================================================================
-- QUESTIONS - LEVEL 2: Intro to ML
-- ============================================================================
SET @qm1 = UUID(); SET @qm2 = UUID(); SET @qm3 = UUID(); SET @qm4 = UUID(); SET @qm5 = UUID();
SET @qm6 = UUID(); SET @qm7 = UUID(); SET @qm8 = UUID();

INSERT INTO questions (id, level_id, question_type, title, description, difficulty, created_at) VALUES
(@qm1, @level2_ml, 'mcq', 'Supervised Learning', 'Which is an example of supervised learning?', 'easy', NOW()),
(@qm2, @level2_ml, 'mcq', 'Train/Test Split', 'Why do we split data into training and testing sets?', 'easy', NOW()),
(@qm3, @level2_ml, 'mcq', 'Overfitting', 'What is overfitting?', 'medium', NOW()),
(@qm4, @level2_ml, 'mcq', 'Classification vs Regression', 'What is the key difference between classification and regression?', 'easy', NOW()),
(@qm5, @level2_ml, 'mcq', 'Cross Validation', 'What is the purpose of cross-validation?', 'medium', NOW()),
(@qm6, @level2_ml, 'coding', 'Train Test Split', 'Split a dataset into 80% training and 20% testing.', 'easy', NOW()),
(@qm7, @level2_ml, 'coding', 'Simple Linear Regression', 'Train a simple linear regression model.', 'medium', NOW()),
(@qm8, @level2_ml, 'coding', 'Model Prediction', 'Make predictions using a trained model.', 'easy', NOW());

INSERT INTO mcq_options (id, question_id, option_letter, option_text, is_correct) VALUES
(UUID(), @qm1, 'A', 'Clustering customers', FALSE),
(UUID(), @qm1, 'B', 'Predicting house prices with labeled data', TRUE),
(UUID(), @qm1, 'C', 'Reducing dimensions', FALSE),
(UUID(), @qm1, 'D', 'Finding associations', FALSE),

(UUID(), @qm2, 'A', 'To speed up training', FALSE),
(UUID(), @qm2, 'B', 'To evaluate model on unseen data', TRUE),
(UUID(), @qm2, 'C', 'To reduce data size', FALSE),
(UUID(), @qm2, 'D', 'To balance classes', FALSE),

(UUID(), @qm3, 'A', 'Model performs well on training but poorly on new data', TRUE),
(UUID(), @qm3, 'B', 'Model performs poorly on all data', FALSE),
(UUID(), @qm3, 'C', 'Model is too simple', FALSE),
(UUID(), @qm3, 'D', 'Training takes too long', FALSE),

(UUID(), @qm4, 'A', 'Classification uses more features', FALSE),
(UUID(), @qm4, 'B', 'Classification predicts categories, regression predicts continuous values', TRUE),
(UUID(), @qm4, 'C', 'Regression is faster', FALSE),
(UUID(), @qm4, 'D', 'There is no difference', FALSE),

(UUID(), @qm5, 'A', 'To increase training speed', FALSE),
(UUID(), @qm5, 'B', 'To get a more robust estimate of model performance', TRUE),
(UUID(), @qm5, 'C', 'To reduce overfitting only', FALSE),
(UUID(), @qm5, 'D', 'To visualize data', FALSE);

-- ============================================================================
-- QUESTIONS - LEVEL 3: Advanced ML
-- ============================================================================
SET @qa1 = UUID(); SET @qa2 = UUID(); SET @qa3 = UUID();
SET @qa4 = UUID(); SET @qa5 = UUID(); SET @qa6 = UUID(); SET @qa7 = UUID(); SET @qa8 = UUID();

INSERT INTO questions (id, level_id, question_type, title, description, difficulty, created_at) VALUES
(@qa1, @level3_ml, 'mcq', 'Precision vs Recall', 'When is precision more important than recall?', 'medium', NOW()),
(@qa2, @level3_ml, 'mcq', 'ROC AUC', 'What does ROC AUC measure?', 'medium', NOW()),
(@qa3, @level3_ml, 'mcq', 'Regularization', 'What is the purpose of L2 regularization?', 'hard', NOW()),
(@qa4, @level3_ml, 'coding', 'Random Forest', 'Train a Random Forest classifier and evaluate accuracy.', 'medium', NOW()),
(@qa5, @level3_ml, 'coding', 'Confusion Matrix', 'Create and visualize a confusion matrix.', 'medium', NOW()),
(@qa6, @level3_ml, 'coding', 'Hyperparameter Tuning', 'Use GridSearchCV to tune model hyperparameters.', 'hard', NOW()),
(@qa7, @level3_ml, 'coding', 'Feature Importance', 'Extract and plot feature importances from a tree model.', 'medium', NOW()),
(@qa8, @level3_ml, 'coding', 'Multi-class Metrics', 'Calculate precision, recall, F1 for multi-class problem.', 'hard', NOW());

INSERT INTO mcq_options (id, question_id, option_letter, option_text, is_correct) VALUES
(UUID(), @qa1, 'A', 'When false negatives are costly', FALSE),
(UUID(), @qa1, 'B', 'When false positives are costly', TRUE),
(UUID(), @qa1, 'C', 'When data is imbalanced', FALSE),
(UUID(), @qa1, 'D', 'Always', FALSE),

(UUID(), @qa2, 'A', 'Training speed', FALSE),
(UUID(), @qa2, 'B', 'Model ability to distinguish between classes', TRUE),
(UUID(), @qa2, 'C', 'Data size', FALSE),
(UUID(), @qa2, 'D', 'Feature importance', FALSE),

(UUID(), @qa3, 'A', 'To increase model complexity', FALSE),
(UUID(), @qa3, 'B', 'To prevent overfitting by penalizing large coefficients', TRUE),
(UUID(), @qa3, 'C', 'To speed up training', FALSE),
(UUID(), @qa3, 'D', 'To handle missing values', FALSE);

-- ============================================================================
-- QUESTIONS - LEVEL 3: Advanced Visualization
-- ============================================================================
SET @qav1 = UUID(); SET @qav2 = UUID();
SET @qav3 = UUID(); SET @qav4 = UUID(); SET @qav5 = UUID(); SET @qav6 = UUID();

INSERT INTO questions (id, level_id, question_type, title, description, difficulty, created_at) VALUES
(@qav1, @level3_viz, 'mcq', 'Multi-dimensional Viz', 'Which technique helps visualize high-dimensional data?', 'medium', NOW()),
(@qav2, @level3_viz, 'mcq', 'Interactive Plots', 'Which library creates interactive web-based visualizations?', 'easy', NOW()),
(@qav3, @level3_viz, 'coding', 'Pair Plot', 'Create a pair plot for multiple numerical features.', 'medium', NOW()),
(@qav4, @level3_viz, 'coding', 'Facet Grid', 'Create a faceted visualization by category.', 'medium', NOW()),
(@qav5, @level3_viz, 'coding', 'Interactive Dashboard', 'Create a basic interactive plot with Plotly.', 'hard', NOW()),
(@qav6, @level3_viz, 'coding', 'Subplot Layout', 'Create a figure with multiple subplots.', 'medium', NOW());

INSERT INTO mcq_options (id, question_id, option_letter, option_text, is_correct) VALUES
(UUID(), @qav1, 'A', 'Bar charts', FALSE),
(UUID(), @qav1, 'B', 'PCA or t-SNE', TRUE),
(UUID(), @qav1, 'C', 'Pie charts', FALSE),
(UUID(), @qav1, 'D', 'Line plots', FALSE),

(UUID(), @qav2, 'A', 'Matplotlib', FALSE),
(UUID(), @qav2, 'B', 'Plotly', TRUE),
(UUID(), @qav2, 'C', 'Seaborn', FALSE),
(UUID(), @qav2, 'D', 'NumPy', FALSE);

-- ============================================================================
-- QUESTIONS - LEVEL 3: Capstone
-- ============================================================================
SET @qc1 = UUID(); SET @qc2 = UUID();
SET @qc3 = UUID(); SET @qc4 = UUID(); SET @qc5 = UUID();

INSERT INTO questions (id, level_id, question_type, title, description, difficulty, created_at) VALUES
(@qc1, @level3_capstone, 'mcq', 'Project Workflow', 'What is the typical order of a data science project?', 'medium', NOW()),
(@qc2, @level3_capstone, 'mcq', 'Model Selection', 'How do you choose between multiple models?', 'medium', NOW()),
(@qc3, @level3_capstone, 'coding', 'End-to-End Pipeline', 'Build a complete pipeline: load data, preprocess, train, evaluate.', 'hard', NOW()),
(@qc4, @level3_capstone, 'coding', 'Report Generation', 'Generate a summary report with key metrics and visualizations.', 'hard', NOW()),
(@qc5, @level3_capstone, 'coding', 'Model Comparison', 'Compare multiple models and select the best one.', 'hard', NOW());

INSERT INTO mcq_options (id, question_id, option_letter, option_text, is_correct) VALUES
(UUID(), @qc1, 'A', 'Model → EDA → Clean → Deploy', FALSE),
(UUID(), @qc1, 'B', 'Clean → EDA → Feature Eng → Model → Evaluate', TRUE),
(UUID(), @qc1, 'C', 'Deploy → Model → EDA → Clean', FALSE),
(UUID(), @qc1, 'D', 'EDA → Deploy → Model → Clean', FALSE),

(UUID(), @qc2, 'A', 'Always use the most complex', FALSE),
(UUID(), @qc2, 'B', 'Compare performance on validation set', TRUE),
(UUID(), @qc2, 'C', 'Use the fastest model', FALSE),
(UUID(), @qc2, 'D', 'Random selection', FALSE);

-- ============================================================================
-- END OF SEED DATA
-- ============================================================================
SELECT 'Data Science Course seed data inserted successfully!' AS status;
