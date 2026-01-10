-- Data Science, Cloud Computing, Deep Learning Course Content
-- Creates courses, levels, MCQs with correct answers, and coding questions with test cases

-- ============================================
-- CREATE NEW COURSES
-- ============================================
INSERT INTO courses (id, title, description, total_levels) VALUES
    ('550e8400-e29b-41d4-a716-446655440004', 'Data Science', 'Learn data analysis, visualization, and statistical modeling with Python', 5),
    ('550e8400-e29b-41d4-a716-446655440005', 'Cloud Computing', 'Master cloud platforms, deployment, and scalable infrastructure', 5),
    ('550e8400-e29b-41d4-a716-446655440006', 'Deep Learning', 'Explore neural networks, CNNs, RNNs, and advanced AI architectures', 5)
ON DUPLICATE KEY UPDATE title=VALUES(title), description=VALUES(description);

-- ============================================
-- DATA SCIENCE LEVELS
-- ============================================
INSERT INTO levels (id, course_id, level_number, title, description, learning_materials, code_snippet) VALUES
    ('660e8400-e29b-41d4-a716-446655440100', '550e8400-e29b-41d4-a716-446655440004', 0, 'What is Data Science?', 'Introduction to data science concepts and workflow',
     '{"introduction": "Data Science combines statistics, programming, and domain knowledge to extract insights from data.", "concepts": [{"title": "Data Science Lifecycle", "explanation": "Collection, cleaning, analysis, visualization, interpretation."}, {"title": "Tools", "explanation": "Python, Pandas, NumPy, Matplotlib."}], "key_terms": ["Data", "Analysis", "Visualization"], "resources": [{"title": "Data Science Introduction", "url": "https://www.w3schools.com/datascience/"}]}',
     '# Data Science is about extracting insights from data\nimport pandas as pd\ndata = pd.read_csv("data.csv")'),
    ('660e8400-e29b-41d4-a716-446655440101', '550e8400-e29b-41d4-a716-446655440004', 1, 'Python for Data Science', 'NumPy and Pandas basics',
     '{"introduction": "Master NumPy arrays and Pandas DataFrames for data manipulation.", "concepts": [{"title": "NumPy Arrays", "explanation": "Efficient numerical computing."}, {"title": "Pandas DataFrame", "explanation": "Tabular data structure."}], "key_terms": ["NumPy", "Pandas", "DataFrame", "Array"], "resources": [{"title": "NumPy Tutorial", "url": "https://www.w3schools.com/python/numpy/"}]}',
     'import numpy as np\nimport pandas as pd\narr = np.array([1, 2, 3])\ndf = pd.DataFrame({"A": [1, 2], "B": [3, 4]})'),
    ('660e8400-e29b-41d4-a716-446655440102', '550e8400-e29b-41d4-a716-446655440004', 2, 'Data Visualization', 'Matplotlib and Seaborn for charts and graphs',
     '{"introduction": "Create compelling visualizations to communicate data insights.", "concepts": [{"title": "Matplotlib", "explanation": "Basic plotting library."}, {"title": "Seaborn", "explanation": "Statistical data visualization."}], "key_terms": ["Plot", "Chart", "Visualization"], "resources": [{"title": "Matplotlib Tutorial", "url": "https://www.w3schools.com/python/matplotlib_intro.asp"}]}',
     'import matplotlib.pyplot as plt\nplt.plot([1, 2, 3], [4, 5, 6])\nplt.show()')
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- ============================================
-- CLOUD COMPUTING LEVELS
-- ============================================
INSERT INTO levels (id, course_id, level_number, title, description, learning_materials, code_snippet) VALUES
    ('660e8400-e29b-41d4-a716-446655440110', '550e8400-e29b-41d4-a716-446655440005', 0, 'Introduction to Cloud', 'Cloud computing fundamentals',
     '{"introduction": "Cloud computing delivers computing services over the internet.", "concepts": [{"title": "IaaS, PaaS, SaaS", "explanation": "Infrastructure, Platform, Software as a Service."}, {"title": "Benefits", "explanation": "Scalability, cost-efficiency, flexibility."}], "key_terms": ["Cloud", "AWS", "Azure", "GCP"], "resources": [{"title": "Cloud Intro", "url": "https://aws.amazon.com/what-is-cloud-computing/"}]}',
     '# Cloud computing example\n# Deploy applications without managing hardware'),
    ('660e8400-e29b-41d4-a716-446655440111', '550e8400-e29b-41d4-a716-446655440005', 1, 'Cloud Services & Models', 'Understanding IaaS, PaaS, SaaS',
     '{"introduction": "Learn different cloud service models and when to use them.", "concepts": [{"title": "IaaS", "explanation": "Virtual machines and infrastructure."}, {"title": "PaaS", "explanation": "Application platforms."}, {"title": "SaaS", "explanation": "Ready-to-use software."}], "key_terms": ["IaaS", "PaaS", "SaaS", "Deployment"], "resources": []}',
     '# IaaS: EC2, Azure VMs\n# PaaS: Heroku, App Engine\n# SaaS: Gmail, Salesforce'),
    ('660e8400-e29b-41d4-a716-446655440112', '550e8400-e29b-41d4-a716-446655440005', 2, 'Containerization & Docker', 'Containers for application deployment',
     '{"introduction": "Containers package applications with dependencies for portability.", "concepts": [{"title": "Docker", "explanation": "Container platform."}, {"title": "Images & Containers", "explanation": "Templates and running instances."}], "key_terms": ["Docker", "Container", "Image"], "resources": []}',
     '# Docker commands\n# docker build -t myapp .\n# docker run myapp')
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- ============================================
-- DEEP LEARNING LEVELS
-- ============================================
INSERT INTO levels (id, course_id, level_number, title, description, learning_materials, code_snippet) VALUES
    ('660e8400-e29b-41d4-a716-446655440120', '550e8400-e29b-41d4-a716-446655440006', 0, 'Introduction to Deep Learning', 'Neural networks basics',
     '{"introduction": "Deep Learning uses neural networks with many layers.", "concepts": [{"title": "Neurons", "explanation": "Basic computational units."}, {"title": "Layers", "explanation": "Input, hidden, and output layers."}], "key_terms": ["Neural Network", "Deep Learning", "AI"], "resources": []}',
     '# Deep Learning with TensorFlow/Keras\nimport tensorflow as tf\nmodel = tf.keras.Sequential()'),
    ('660e8400-e29b-41d4-a716-446655440121', '550e8400-e29b-41d4-a716-446655440006', 1, 'Neural Network Fundamentals', 'Perceptrons, activation functions, backpropagation',
     '{"introduction": "Understand how neural networks learn through forward and backward passes.", "concepts": [{"title": "Activation Functions", "explanation": "ReLU, Sigmoid, Tanh."}, {"title": "Backpropagation", "explanation": "Gradient-based learning."}], "key_terms": ["Activation", "Gradient", "Backprop"], "resources": []}',
     'import numpy as np\ndef sigmoid(x): return 1 / (1 + np.exp(-x))'),
    ('660e8400-e29b-41d4-a716-446655440122', '550e8400-e29b-41d4-a716-446655440006', 2, 'Convolutional Neural Networks', 'CNNs for image processing',
     '{"introduction": "CNNs are specialized for processing grid-like data such as images.", "concepts": [{"title": "Convolution", "explanation": "Sliding filter over input."}, {"title": "Pooling", "explanation": "Downsampling feature maps."}], "key_terms": ["CNN", "Convolution", "Pooling"], "resources": []}',
     'from tensorflow.keras.layers import Conv2D, MaxPooling2D\nmodel.add(Conv2D(32, (3, 3), activation="relu"))')
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- ============================================
-- DATA SCIENCE LEVEL 0 CONTENT
-- ============================================
INSERT INTO questions (id, level_id, question_type, title, description, difficulty, explanation, concepts) VALUES
    ('aa0e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440100', 'mcq', 'What is Data Science?', 'Data Science is the field of:', 'easy', 'Data Science extracts insights and knowledge from data.', '["data science", "definition"]'),
    ('aa0e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440100', 'mcq', 'DS Tools', 'Which is a popular tool for Data Science?', 'easy', 'Python with Pandas is widely used for data manipulation.', '["tools", "python"]'),
    ('aa0e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440100', 'mcq', 'DS Lifecycle', 'What is the first step in the data science lifecycle?', 'easy', 'Data Collection is typically the first step.', '["lifecycle", "process"]'),
    ('aa0e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440100', 'mcq', 'Data Types', 'Which is NOT a type of data?', 'easy', 'Computational is not a standard data type category.', '["data types"]'),
    ('aa0e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440100', 'mcq', 'DS vs ML', 'What is the relationship between Data Science and Machine Learning?', 'easy', 'ML is a subset/technique used within Data Science.', '["ml", "relationship"]')
ON DUPLICATE KEY UPDATE title=VALUES(title);

INSERT INTO mcq_options (id, question_id, option_text, is_correct, option_letter) VALUES
    (UUID(), 'aa0e8400-e29b-41d4-a716-446655440001', 'Building websites', FALSE, 'A'),
    (UUID(), 'aa0e8400-e29b-41d4-a716-446655440001', 'Extracting insights from data', TRUE, 'B'),
    (UUID(), 'aa0e8400-e29b-41d4-a716-446655440001', 'Hardware design', FALSE, 'C'),
    (UUID(), 'aa0e8400-e29b-41d4-a716-446655440001', 'Network security', FALSE, 'D'),
    
    (UUID(), 'aa0e8400-e29b-41d4-a716-446655440002', 'Microsoft Word', FALSE, 'A'),
    (UUID(), 'aa0e8400-e29b-41d4-a716-446655440002', 'Python with Pandas', TRUE, 'B'),
    (UUID(), 'aa0e8400-e29b-41d4-a716-446655440002', 'Adobe Photoshop', FALSE, 'C'),
    (UUID(), 'aa0e8400-e29b-41d4-a716-446655440002', 'Notepad', FALSE, 'D'),
    
    (UUID(), 'aa0e8400-e29b-41d4-a716-446655440003', 'Data Collection', TRUE, 'A'),
    (UUID(), 'aa0e8400-e29b-41d4-a716-446655440003', 'Model Deployment', FALSE, 'B'),
    (UUID(), 'aa0e8400-e29b-41d4-a716-446655440003', 'Visualization', FALSE, 'C'),
    (UUID(), 'aa0e8400-e29b-41d4-a716-446655440003', 'Interpretation', FALSE, 'D'),
    
    (UUID(), 'aa0e8400-e29b-41d4-a716-446655440004', 'Numerical', FALSE, 'A'),
    (UUID(), 'aa0e8400-e29b-41d4-a716-446655440004', 'Categorical', FALSE, 'B'),
    (UUID(), 'aa0e8400-e29b-41d4-a716-446655440004', 'Computational', TRUE, 'C'),
    (UUID(), 'aa0e8400-e29b-41d4-a716-446655440004', 'Text', FALSE, 'D'),
    
    (UUID(), 'aa0e8400-e29b-41d4-a716-446655440005', 'They are the same', FALSE, 'A'),
    (UUID(), 'aa0e8400-e29b-41d4-a716-446655440005', 'ML is a technique within DS', TRUE, 'B'),
    (UUID(), 'aa0e8400-e29b-41d4-a716-446655440005', 'DS is a part of ML', FALSE, 'C'),
    (UUID(), 'aa0e8400-e29b-41d4-a716-446655440005', 'They are unrelated', FALSE, 'D')
ON DUPLICATE KEY UPDATE id=id;

-- DS Level 0 Coding
INSERT INTO questions (id, level_id, question_type, title, description, difficulty, input_format, output_format, constraints, reference_solution, explanation, concepts) VALUES
    ('aa0e8400-e29b-41d4-a716-446655440010', '660e8400-e29b-41d4-a716-446655440100', 'coding', 'Calculate Mean',
     'Given N numbers, calculate their arithmetic mean. Print the result rounded to 2 decimal places.',
     'easy', '4\n10 20 30 40', '25.00', '1 <= N <= 100',
     'n = int(input())\nnums = list(map(int, input().split()))\nmean = sum(nums) / len(nums)\nprint(f"{mean:.2f}")',
     'Sum all numbers and divide by count.', '["mean", "statistics"]'),
    ('aa0e8400-e29b-41d4-a716-446655440011', '660e8400-e29b-41d4-a716-446655440100', 'coding', 'Find Minimum and Maximum',
     'Given N numbers, print the minimum and maximum values separated by space.',
     'easy', '5\n3 7 2 9 4', '2 9', '1 <= N <= 100',
     'n = int(input())\nnums = list(map(int, input().split()))\nprint(min(nums), max(nums))',
     'Use min() and max() built-in functions.', '["min", "max", "statistics"]')
ON DUPLICATE KEY UPDATE title=VALUES(title);

INSERT INTO test_cases (id, question_id, input_data, expected_output, is_hidden, test_case_number) VALUES
    (UUID(), 'aa0e8400-e29b-41d4-a716-446655440010', '4\n10 20 30 40', '25.00', FALSE, 1),
    (UUID(), 'aa0e8400-e29b-41d4-a716-446655440010', '3\n5 10 15', '10.00', FALSE, 2),
    (UUID(), 'aa0e8400-e29b-41d4-a716-446655440010', '1\n100', '100.00', TRUE, 3),
    (UUID(), 'aa0e8400-e29b-41d4-a716-446655440010', '2\n7 3', '5.00', TRUE, 4),
    
    (UUID(), 'aa0e8400-e29b-41d4-a716-446655440011', '5\n3 7 2 9 4', '2 9', FALSE, 1),
    (UUID(), 'aa0e8400-e29b-41d4-a716-446655440011', '3\n1 2 3', '1 3', FALSE, 2),
    (UUID(), 'aa0e8400-e29b-41d4-a716-446655440011', '1\n42', '42 42', TRUE, 3),
    (UUID(), 'aa0e8400-e29b-41d4-a716-446655440011', '4\n-5 -2 -10 -1', '-10 -1', TRUE, 4)
ON DUPLICATE KEY UPDATE id=id;

-- ============================================
-- DATA SCIENCE LEVEL 1: NumPy & Pandas
-- ============================================
INSERT INTO questions (id, level_id, question_type, title, description, difficulty, explanation, concepts) VALUES
    ('aa0e8400-e29b-41d4-a716-446655440020', '660e8400-e29b-41d4-a716-446655440101', 'mcq', 'NumPy Array', 'What is a NumPy array?', 'easy', 'NumPy array is a grid of values, all of the same type.', '["numpy", "array"]'),
    ('aa0e8400-e29b-41d4-a716-446655440021', '660e8400-e29b-41d4-a716-446655440101', 'mcq', 'Pandas DataFrame', 'What is a Pandas DataFrame?', 'easy', 'A DataFrame is a 2D labeled data structure with columns.', '["pandas", "dataframe"]'),
    ('aa0e8400-e29b-41d4-a716-446655440022', '660e8400-e29b-41d4-a716-446655440101', 'mcq', 'Reading CSV', 'Which function reads a CSV file in Pandas?', 'easy', 'pd.read_csv() reads CSV files into a DataFrame.', '["pandas", "csv"]'),
    ('aa0e8400-e29b-41d4-a716-446655440023', '660e8400-e29b-41d4-a716-446655440101', 'mcq', 'Array Shape', 'How do you get the shape of a NumPy array?', 'easy', 'Use array.shape to get dimensions.', '["numpy", "shape"]'),
    ('aa0e8400-e29b-41d4-a716-446655440024', '660e8400-e29b-41d4-a716-446655440101', 'mcq', 'DataFrame Column', 'How do you access column "A" in DataFrame df?', 'easy', 'Use df["A"] or df.A to access a column.', '["pandas", "column"]')
ON DUPLICATE KEY UPDATE title=VALUES(title);

INSERT INTO mcq_options (id, question_id, option_text, is_correct, option_letter) VALUES
    (UUID(), 'aa0e8400-e29b-41d4-a716-446655440020', 'A Python list', FALSE, 'A'),
    (UUID(), 'aa0e8400-e29b-41d4-a716-446655440020', 'A grid of values of the same type', TRUE, 'B'),
    (UUID(), 'aa0e8400-e29b-41d4-a716-446655440020', 'A dictionary', FALSE, 'C'),
    (UUID(), 'aa0e8400-e29b-41d4-a716-446655440020', 'A string', FALSE, 'D'),
    
    (UUID(), 'aa0e8400-e29b-41d4-a716-446655440021', 'A 1D array', FALSE, 'A'),
    (UUID(), 'aa0e8400-e29b-41d4-a716-446655440021', 'A 2D labeled data structure', TRUE, 'B'),
    (UUID(), 'aa0e8400-e29b-41d4-a716-446655440021', 'A graph', FALSE, 'C'),
    (UUID(), 'aa0e8400-e29b-41d4-a716-446655440021', 'A database', FALSE, 'D'),
    
    (UUID(), 'aa0e8400-e29b-41d4-a716-446655440022', 'pd.load_csv()', FALSE, 'A'),
    (UUID(), 'aa0e8400-e29b-41d4-a716-446655440022', 'pd.read_csv()', TRUE, 'B'),
    (UUID(), 'aa0e8400-e29b-41d4-a716-446655440022', 'pd.open_csv()', FALSE, 'C'),
    (UUID(), 'aa0e8400-e29b-41d4-a716-446655440022', 'pd.import_csv()', FALSE, 'D'),
    
    (UUID(), 'aa0e8400-e29b-41d4-a716-446655440023', 'array.size()', FALSE, 'A'),
    (UUID(), 'aa0e8400-e29b-41d4-a716-446655440023', 'array.shape', TRUE, 'B'),
    (UUID(), 'aa0e8400-e29b-41d4-a716-446655440023', 'len(array)', FALSE, 'C'),
    (UUID(), 'aa0e8400-e29b-41d4-a716-446655440023', 'array.dimensions', FALSE, 'D'),
    
    (UUID(), 'aa0e8400-e29b-41d4-a716-446655440024', 'df.column("A")', FALSE, 'A'),
    (UUID(), 'aa0e8400-e29b-41d4-a716-446655440024', 'df["A"]', TRUE, 'B'),
    (UUID(), 'aa0e8400-e29b-41d4-a716-446655440024', 'df.get("A")', FALSE, 'C'),
    (UUID(), 'aa0e8400-e29b-41d4-a716-446655440024', 'df[0]', FALSE, 'D')
ON DUPLICATE KEY UPDATE id=id;

-- DS Level 1 Coding
INSERT INTO questions (id, level_id, question_type, title, description, difficulty, input_format, output_format, constraints, reference_solution, explanation, concepts) VALUES
    ('aa0e8400-e29b-41d4-a716-446655440025', '660e8400-e29b-41d4-a716-446655440101', 'coding', 'Array Sum',
     'Given N numbers, calculate their sum using array operations.',
     'easy', '5\n1 2 3 4 5', '15', '1 <= N <= 100',
     'n = int(input())\nnums = list(map(int, input().split()))\nprint(sum(nums))',
     'Use sum() or numpy.sum() to add all elements.', '["sum", "array"]'),
    ('aa0e8400-e29b-41d4-a716-446655440026', '660e8400-e29b-41d4-a716-446655440101', 'coding', 'Standard Deviation',
     'Calculate the population standard deviation of N numbers. Round to 2 decimal places.',
     'medium', '5\n2 4 4 4 5', '1.10', '2 <= N <= 100',
     'import statistics\nn = int(input())\nnums = list(map(int, input().split()))\nstd = statistics.pstdev(nums)\nprint(f"{std:.2f}")',
     'Use statistics.pstdev() for population standard deviation.', '["statistics", "std"]')
ON DUPLICATE KEY UPDATE title=VALUES(title);

INSERT INTO test_cases (id, question_id, input_data, expected_output, is_hidden, test_case_number) VALUES
    (UUID(), 'aa0e8400-e29b-41d4-a716-446655440025', '5\n1 2 3 4 5', '15', FALSE, 1),
    (UUID(), 'aa0e8400-e29b-41d4-a716-446655440025', '3\n10 20 30', '60', FALSE, 2),
    (UUID(), 'aa0e8400-e29b-41d4-a716-446655440025', '1\n100', '100', TRUE, 3),
    (UUID(), 'aa0e8400-e29b-41d4-a716-446655440025', '4\n-5 5 -5 5', '0', TRUE, 4),
    
    (UUID(), 'aa0e8400-e29b-41d4-a716-446655440026', '5\n2 4 4 4 5', '1.10', FALSE, 1),
    (UUID(), 'aa0e8400-e29b-41d4-a716-446655440026', '4\n1 2 3 4', '1.12', FALSE, 2),
    (UUID(), 'aa0e8400-e29b-41d4-a716-446655440026', '3\n5 5 5', '0.00', TRUE, 3),
    (UUID(), 'aa0e8400-e29b-41d4-a716-446655440026', '2\n0 10', '5.00', TRUE, 4)
ON DUPLICATE KEY UPDATE id=id;

-- ============================================
-- CLOUD COMPUTING LEVEL 0
-- ============================================
INSERT INTO questions (id, level_id, question_type, title, description, difficulty, explanation, concepts) VALUES
    ('bb0e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440110', 'mcq', 'What is Cloud?', 'Cloud computing is:', 'easy', 'Cloud delivers computing services over the internet.', '["cloud", "definition"]'),
    ('bb0e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440110', 'mcq', 'Cloud Providers', 'Which is a major cloud provider?', 'easy', 'AWS, Azure, and GCP are the top 3 cloud providers.', '["providers", "aws"]'),
    ('bb0e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440110', 'mcq', 'Cloud Benefits', 'Which is NOT a benefit of cloud computing?', 'easy', 'Hardware maintenance is handled by the provider, not you.', '["benefits"]'),
    ('bb0e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440110', 'mcq', 'IaaS Meaning', 'What does IaaS stand for?', 'easy', 'IaaS = Infrastructure as a Service.', '["iaas", "service"]'),
    ('bb0e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440110', 'mcq', 'SaaS Example', 'Which is an example of SaaS?', 'easy', 'Gmail is a Software as a Service application.', '["saas", "example"]')
ON DUPLICATE KEY UPDATE title=VALUES(title);

INSERT INTO mcq_options (id, question_id, option_text, is_correct, option_letter) VALUES
    (UUID(), 'bb0e8400-e29b-41d4-a716-446655440001', 'Weather phenomenon', FALSE, 'A'),
    (UUID(), 'bb0e8400-e29b-41d4-a716-446655440001', 'Computing services over internet', TRUE, 'B'),
    (UUID(), 'bb0e8400-e29b-41d4-a716-446655440001', 'Local storage only', FALSE, 'C'),
    (UUID(), 'bb0e8400-e29b-41d4-a716-446655440001', 'Personal computer', FALSE, 'D'),
    
    (UUID(), 'bb0e8400-e29b-41d4-a716-446655440002', 'Facebook', FALSE, 'A'),
    (UUID(), 'bb0e8400-e29b-41d4-a716-446655440002', 'Amazon Web Services (AWS)', TRUE, 'B'),
    (UUID(), 'bb0e8400-e29b-41d4-a716-446655440002', 'Netflix', FALSE, 'C'),
    (UUID(), 'bb0e8400-e29b-41d4-a716-446655440002', 'Twitter', FALSE, 'D'),
    
    (UUID(), 'bb0e8400-e29b-41d4-a716-446655440003', 'Scalability', FALSE, 'A'),
    (UUID(), 'bb0e8400-e29b-41d4-a716-446655440003', 'Cost efficiency', FALSE, 'B'),
    (UUID(), 'bb0e8400-e29b-41d4-a716-446655440003', 'Hardware maintenance by you', TRUE, 'C'),
    (UUID(), 'bb0e8400-e29b-41d4-a716-446655440003', 'Flexibility', FALSE, 'D'),
    
    (UUID(), 'bb0e8400-e29b-41d4-a716-446655440004', 'Internet as a Service', FALSE, 'A'),
    (UUID(), 'bb0e8400-e29b-41d4-a716-446655440004', 'Infrastructure as a Service', TRUE, 'B'),
    (UUID(), 'bb0e8400-e29b-41d4-a716-446655440004', 'Integration as a Service', FALSE, 'C'),
    (UUID(), 'bb0e8400-e29b-41d4-a716-446655440004', 'Information as a Service', FALSE, 'D'),
    
    (UUID(), 'bb0e8400-e29b-41d4-a716-446655440005', 'AWS EC2', FALSE, 'A'),
    (UUID(), 'bb0e8400-e29b-41d4-a716-446655440005', 'Gmail', TRUE, 'B'),
    (UUID(), 'bb0e8400-e29b-41d4-a716-446655440005', 'Linux', FALSE, 'C'),
    (UUID(), 'bb0e8400-e29b-41d4-a716-446655440005', 'Python', FALSE, 'D')
ON DUPLICATE KEY UPDATE id=id;

-- Cloud Level 0 Coding (Python-based cloud concepts)
INSERT INTO questions (id, level_id, question_type, title, description, difficulty, input_format, output_format, constraints, reference_solution, explanation, concepts) VALUES
    ('bb0e8400-e29b-41d4-a716-446655440010', '660e8400-e29b-41d4-a716-446655440110', 'coding', 'Parse JSON Config',
     'Given a JSON string with "service" and "region" keys, print the values separated by space.',
     'easy', '{"service": "EC2", "region": "us-east-1"}', 'EC2 us-east-1', 'Valid JSON',
     'import json\ndata = json.loads(input())\nprint(data["service"], data["region"])',
     'Use json.loads() to parse JSON and access keys.', '["json", "parsing"]'),
    ('bb0e8400-e29b-41d4-a716-446655440011', '660e8400-e29b-41d4-a716-446655440110', 'coding', 'Environment Variables',
     'Read two lines: variable name and value. Print them in KEY=VALUE format.',
     'easy', 'DATABASE_URL\npostgres://localhost', 'DATABASE_URL=postgres://localhost', 'Valid strings',
     'key = input()\nvalue = input()\nprint(f"{key}={value}")',
     'Format environment variable assignment.', '["env", "config"]')
ON DUPLICATE KEY UPDATE title=VALUES(title);

INSERT INTO test_cases (id, question_id, input_data, expected_output, is_hidden, test_case_number) VALUES
    (UUID(), 'bb0e8400-e29b-41d4-a716-446655440010', '{"service": "EC2", "region": "us-east-1"}', 'EC2 us-east-1', FALSE, 1),
    (UUID(), 'bb0e8400-e29b-41d4-a716-446655440010', '{"service": "S3", "region": "eu-west-1"}', 'S3 eu-west-1', FALSE, 2),
    (UUID(), 'bb0e8400-e29b-41d4-a716-446655440010', '{"service": "Lambda", "region": "ap-south-1"}', 'Lambda ap-south-1', TRUE, 3),
    
    (UUID(), 'bb0e8400-e29b-41d4-a716-446655440011', 'DATABASE_URL\npostgres://localhost', 'DATABASE_URL=postgres://localhost', FALSE, 1),
    (UUID(), 'bb0e8400-e29b-41d4-a716-446655440011', 'API_KEY\nabc123', 'API_KEY=abc123', FALSE, 2),
    (UUID(), 'bb0e8400-e29b-41d4-a716-446655440011', 'PORT\n3000', 'PORT=3000', TRUE, 3)
ON DUPLICATE KEY UPDATE id=id;

-- ============================================
-- DEEP LEARNING LEVEL 0
-- ============================================
INSERT INTO questions (id, level_id, question_type, title, description, difficulty, explanation, concepts) VALUES
    ('cc0e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440120', 'mcq', 'What is DL?', 'Deep Learning is:', 'easy', 'Deep Learning uses neural networks with many layers.', '["dl", "definition"]'),
    ('cc0e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440120', 'mcq', 'DL Frameworks', 'Which is a Deep Learning framework?', 'easy', 'TensorFlow and PyTorch are popular DL frameworks.', '["frameworks", "tensorflow"]'),
    ('cc0e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440120', 'mcq', 'Neural Network', 'A neural network consists of:', 'easy', 'Neural networks have layers of interconnected neurons.', '["neural", "network"]'),
    ('cc0e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440120', 'mcq', 'Deep in DL', 'What makes a neural network "deep"?', 'easy', 'Many hidden layers make a network deep.', '["deep", "layers"]'),
    ('cc0e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440120', 'mcq', 'DL Applications', 'Which is NOT a common DL application?', 'easy', 'Sorting algorithms are not DL applications.', '["applications"]')
ON DUPLICATE KEY UPDATE title=VALUES(title);

INSERT INTO mcq_options (id, question_id, option_text, is_correct, option_letter) VALUES
    (UUID(), 'cc0e8400-e29b-41d4-a716-446655440001', 'A type of database', FALSE, 'A'),
    (UUID(), 'cc0e8400-e29b-41d4-a716-446655440001', 'Neural networks with many layers', TRUE, 'B'),
    (UUID(), 'cc0e8400-e29b-41d4-a716-446655440001', 'A programming language', FALSE, 'C'),
    (UUID(), 'cc0e8400-e29b-41d4-a716-446655440001', 'A web framework', FALSE, 'D'),
    
    (UUID(), 'cc0e8400-e29b-41d4-a716-446655440002', 'React', FALSE, 'A'),
    (UUID(), 'cc0e8400-e29b-41d4-a716-446655440002', 'TensorFlow', TRUE, 'B'),
    (UUID(), 'cc0e8400-e29b-41d4-a716-446655440002', 'Django', FALSE, 'C'),
    (UUID(), 'cc0e8400-e29b-41d4-a716-446655440002', 'Flask', FALSE, 'D'),
    
    (UUID(), 'cc0e8400-e29b-41d4-a716-446655440003', 'Only input layer', FALSE, 'A'),
    (UUID(), 'cc0e8400-e29b-41d4-a716-446655440003', 'Layers of interconnected neurons', TRUE, 'B'),
    (UUID(), 'cc0e8400-e29b-41d4-a716-446655440003', 'Database tables', FALSE, 'C'),
    (UUID(), 'cc0e8400-e29b-41d4-a716-446655440003', 'Web pages', FALSE, 'D'),
    
    (UUID(), 'cc0e8400-e29b-41d4-a716-446655440004', 'Large dataset', FALSE, 'A'),
    (UUID(), 'cc0e8400-e29b-41d4-a716-446655440004', 'Many hidden layers', TRUE, 'B'),
    (UUID(), 'cc0e8400-e29b-41d4-a716-446655440004', 'Fast training', FALSE, 'C'),
    (UUID(), 'cc0e8400-e29b-41d4-a716-446655440004', 'Single neuron', FALSE, 'D'),
    
    (UUID(), 'cc0e8400-e29b-41d4-a716-446655440005', 'Image recognition', FALSE, 'A'),
    (UUID(), 'cc0e8400-e29b-41d4-a716-446655440005', 'Speech recognition', FALSE, 'B'),
    (UUID(), 'cc0e8400-e29b-41d4-a716-446655440005', 'Sorting algorithms', TRUE, 'C'),
    (UUID(), 'cc0e8400-e29b-41d4-a716-446655440005', 'Natural language processing', FALSE, 'D')
ON DUPLICATE KEY UPDATE id=id;

-- DL Level 0 Coding
INSERT INTO questions (id, level_id, question_type, title, description, difficulty, input_format, output_format, constraints, reference_solution, explanation, concepts) VALUES
    ('cc0e8400-e29b-41d4-a716-446655440010', '660e8400-e29b-41d4-a716-446655440120', 'coding', 'Sigmoid Function',
     'Implement the sigmoid function: σ(x) = 1 / (1 + e^(-x)). Given x, print sigmoid(x) rounded to 4 decimal places.',
     'easy', '0', '0.5000', '-100 <= x <= 100',
     'import math\nx = float(input())\nresult = 1 / (1 + math.exp(-x))\nprint(f"{result:.4f}")',
     'Sigmoid squashes values between 0 and 1.', '["sigmoid", "activation"]'),
    ('cc0e8400-e29b-41d4-a716-446655440011', '660e8400-e29b-41d4-a716-446655440120', 'coding', 'ReLU Function',
     'Implement ReLU: max(0, x). Given x, print ReLU(x).',
     'easy', '-5', '0', '-1000 <= x <= 1000',
     'x = float(input())\nprint(int(max(0, x)) if x == int(x) else max(0, x))',
     'ReLU returns 0 for negative values, x for positive.', '["relu", "activation"]')
ON DUPLICATE KEY UPDATE title=VALUES(title);

INSERT INTO test_cases (id, question_id, input_data, expected_output, is_hidden, test_case_number) VALUES
    (UUID(), 'cc0e8400-e29b-41d4-a716-446655440010', '0', '0.5000', FALSE, 1),
    (UUID(), 'cc0e8400-e29b-41d4-a716-446655440010', '1', '0.7311', FALSE, 2),
    (UUID(), 'cc0e8400-e29b-41d4-a716-446655440010', '-1', '0.2689', TRUE, 3),
    (UUID(), 'cc0e8400-e29b-41d4-a716-446655440010', '10', '1.0000', TRUE, 4),
    
    (UUID(), 'cc0e8400-e29b-41d4-a716-446655440011', '-5', '0', FALSE, 1),
    (UUID(), 'cc0e8400-e29b-41d4-a716-446655440011', '5', '5', FALSE, 2),
    (UUID(), 'cc0e8400-e29b-41d4-a716-446655440011', '0', '0', TRUE, 3),
    (UUID(), 'cc0e8400-e29b-41d4-a716-446655440011', '-100', '0', TRUE, 4)
ON DUPLICATE KEY UPDATE id=id;

-- ============================================
-- DEEP LEARNING LEVEL 1: Neural Network Fundamentals
-- ============================================
INSERT INTO questions (id, level_id, question_type, title, description, difficulty, explanation, concepts) VALUES
    ('cc0e8400-e29b-41d4-a716-446655440020', '660e8400-e29b-41d4-a716-446655440121', 'mcq', 'Activation Functions', 'Why are activation functions needed?', 'easy', 'They introduce non-linearity allowing networks to learn complex patterns.', '["activation", "nonlinearity"]'),
    ('cc0e8400-e29b-41d4-a716-446655440021', '660e8400-e29b-41d4-a716-446655440121', 'mcq', 'Common Activations', 'Which is NOT an activation function?', 'easy', 'Gradient is not an activation function.', '["activation", "functions"]'),
    ('cc0e8400-e29b-41d4-a716-446655440022', '660e8400-e29b-41d4-a716-446655440121', 'mcq', 'Backpropagation', 'What does backpropagation calculate?', 'medium', 'Backpropagation calculates gradients of the loss w.r.t weights.', '["backprop", "gradients"]'),
    ('cc0e8400-e29b-41d4-a716-446655440023', '660e8400-e29b-41d4-a716-446655440121', 'mcq', 'Learning Rate', 'What is the learning rate?', 'easy', 'Learning rate controls the step size in gradient descent.', '["learning", "hyperparameter"]'),
    ('cc0e8400-e29b-41d4-a716-446655440024', '660e8400-e29b-41d4-a716-446655440121', 'mcq', 'Loss Function', 'What is a loss function?', 'easy', 'Loss function measures error between predictions and actual values.', '["loss", "error"]')
ON DUPLICATE KEY UPDATE title=VALUES(title);

INSERT INTO mcq_options (id, question_id, option_text, is_correct, option_letter) VALUES
    (UUID(), 'cc0e8400-e29b-41d4-a716-446655440020', 'For faster training', FALSE, 'A'),
    (UUID(), 'cc0e8400-e29b-41d4-a716-446655440020', 'To introduce non-linearity', TRUE, 'B'),
    (UUID(), 'cc0e8400-e29b-41d4-a716-446655440020', 'To reduce parameters', FALSE, 'C'),
    (UUID(), 'cc0e8400-e29b-41d4-a716-446655440020', 'For data storage', FALSE, 'D'),
    
    (UUID(), 'cc0e8400-e29b-41d4-a716-446655440021', 'ReLU', FALSE, 'A'),
    (UUID(), 'cc0e8400-e29b-41d4-a716-446655440021', 'Sigmoid', FALSE, 'B'),
    (UUID(), 'cc0e8400-e29b-41d4-a716-446655440021', 'Gradient', TRUE, 'C'),
    (UUID(), 'cc0e8400-e29b-41d4-a716-446655440021', 'Tanh', FALSE, 'D'),
    
    (UUID(), 'cc0e8400-e29b-41d4-a716-446655440022', 'Forward pass outputs', FALSE, 'A'),
    (UUID(), 'cc0e8400-e29b-41d4-a716-446655440022', 'Gradients for weight updates', TRUE, 'B'),
    (UUID(), 'cc0e8400-e29b-41d4-a716-446655440022', 'Input data', FALSE, 'C'),
    (UUID(), 'cc0e8400-e29b-41d4-a716-446655440022', 'Network architecture', FALSE, 'D'),
    
    (UUID(), 'cc0e8400-e29b-41d4-a716-446655440023', 'Number of layers', FALSE, 'A'),
    (UUID(), 'cc0e8400-e29b-41d4-a716-446655440023', 'Step size in optimization', TRUE, 'B'),
    (UUID(), 'cc0e8400-e29b-41d4-a716-446655440023', 'Batch size', FALSE, 'C'),
    (UUID(), 'cc0e8400-e29b-41d4-a716-446655440023', 'Dataset size', FALSE, 'D'),
    
    (UUID(), 'cc0e8400-e29b-41d4-a716-446655440024', 'A layer type', FALSE, 'A'),
    (UUID(), 'cc0e8400-e29b-41d4-a716-446655440024', 'Error measurement', TRUE, 'B'),
    (UUID(), 'cc0e8400-e29b-41d4-a716-446655440024', 'Activation function', FALSE, 'C'),
    (UUID(), 'cc0e8400-e29b-41d4-a716-446655440024', 'Data augmentation', FALSE, 'D')
ON DUPLICATE KEY UPDATE id=id;

-- DL Level 1 Coding
INSERT INTO questions (id, level_id, question_type, title, description, difficulty, input_format, output_format, constraints, reference_solution, explanation, concepts) VALUES
    ('cc0e8400-e29b-41d4-a716-446655440025', '660e8400-e29b-41d4-a716-446655440121', 'coding', 'Weighted Sum',
     'Given weights [w1, w2, w3] and inputs [x1, x2, x3], calculate the weighted sum (dot product). Print rounded to 2 decimal places.',
     'easy', '1 2 3\n4 5 6', '32.00', '3 weights and inputs',
     'weights = list(map(float, input().split()))\ninputs = list(map(float, input().split()))\nresult = sum(w * x for w, x in zip(weights, inputs))\nprint(f"{result:.2f}")',
     'Weighted sum is the foundation of neural network computations.', '["weighted sum", "neuron"]'),
    ('cc0e8400-e29b-41d4-a716-446655440026', '660e8400-e29b-41d4-a716-446655440121', 'coding', 'MSE Loss',
     'Calculate Mean Squared Error between predictions and actual values. Print rounded to 4 decimal places.',
     'medium', '3\n1 2 3\n1.5 2.5 2.5', '0.1667', 'n >= 1',
     'n = int(input())\npred = list(map(float, input().split()))\nactual = list(map(float, input().split()))\nmse = sum((p - a) ** 2 for p, a in zip(pred, actual)) / n\nprint(f"{mse:.4f}")',
     'MSE = mean of squared differences between predicted and actual.', '["mse", "loss"]')
ON DUPLICATE KEY UPDATE title=VALUES(title);

INSERT INTO test_cases (id, question_id, input_data, expected_output, is_hidden, test_case_number) VALUES
    (UUID(), 'cc0e8400-e29b-41d4-a716-446655440025', '1 2 3\n4 5 6', '32.00', FALSE, 1),
    (UUID(), 'cc0e8400-e29b-41d4-a716-446655440025', '0.5 0.5 0.5\n2 2 2', '3.00', FALSE, 2),
    (UUID(), 'cc0e8400-e29b-41d4-a716-446655440025', '1 0 0\n5 10 15', '5.00', TRUE, 3),
    
    (UUID(), 'cc0e8400-e29b-41d4-a716-446655440026', '3\n1 2 3\n1.5 2.5 2.5', '0.1667', FALSE, 1),
    (UUID(), 'cc0e8400-e29b-41d4-a716-446655440026', '2\n1 2\n1 2', '0.0000', FALSE, 2),
    (UUID(), 'cc0e8400-e29b-41d4-a716-446655440026', '3\n0 0 0\n1 1 1', '1.0000', TRUE, 3)
ON DUPLICATE KEY UPDATE id=id;

SELECT 'DS, Cloud, DL course content seeded successfully!' AS status;
