-- Additional MCQs to reach 10 per level for DS, Cloud, DL courses
-- This adds 5 more MCQs to each level that had 5

-- ============================================
-- DATA SCIENCE LEVEL 0 - Additional MCQs (6-10)
-- ============================================
INSERT INTO questions (id, level_id, question_type, title, description, difficulty, explanation, concepts) VALUES
    ('aa0e8400-e29b-41d4-a716-446655440006', '660e8400-e29b-41d4-a716-446655440100', 'mcq', 'Data Cleaning', 'What is data cleaning?', 'easy', 'Data cleaning is the process of fixing or removing incorrect, corrupted, or missing data.', '["cleaning", "preprocessing"]'),
    ('aa0e8400-e29b-41d4-a716-446655440007', '660e8400-e29b-41d4-a716-446655440100', 'mcq', 'Structured Data', 'Which is an example of structured data?', 'easy', 'Spreadsheets and databases contain structured data with defined schemas.', '["structured", "data"]'),
    ('aa0e8400-e29b-41d4-a716-446655440008', '660e8400-e29b-41d4-a716-446655440100', 'mcq', 'Unstructured Data', 'Which is an example of unstructured data?', 'easy', 'Images, videos, and text documents are unstructured data.', '["unstructured", "data"]'),
    ('aa0e8400-e29b-41d4-a716-446655440009', '660e8400-e29b-41d4-a716-446655440100', 'mcq', 'Data Visualization Purpose', 'The main purpose of data visualization is:', 'easy', 'Visualization helps communicate insights and patterns in data clearly.', '["visualization", "purpose"]'),
    ('aa0e8400-e29b-41d4-a716-446655440100', '660e8400-e29b-41d4-a716-446655440100', 'mcq', 'Statistical Analysis', 'What does statistical analysis help determine?', 'easy', 'Statistics help identify patterns, relationships, and trends in data.', '["statistics", "analysis"]')
ON DUPLICATE KEY UPDATE title=VALUES(title);

INSERT INTO mcq_options (id, question_id, option_text, is_correct, option_letter) VALUES
    (UUID(), 'aa0e8400-e29b-41d4-a716-446655440006', 'Adding more data', FALSE, 'A'),
    (UUID(), 'aa0e8400-e29b-41d4-a716-446655440006', 'Fixing or removing incorrect data', TRUE, 'B'),
    (UUID(), 'aa0e8400-e29b-41d4-a716-446655440006', 'Encrypting data', FALSE, 'C'),
    (UUID(), 'aa0e8400-e29b-41d4-a716-446655440006', 'Deleting all data', FALSE, 'D'),
    
    (UUID(), 'aa0e8400-e29b-41d4-a716-446655440007', 'Images', FALSE, 'A'),
    (UUID(), 'aa0e8400-e29b-41d4-a716-446655440007', 'Spreadsheet with columns', TRUE, 'B'),
    (UUID(), 'aa0e8400-e29b-41d4-a716-446655440007', 'Video files', FALSE, 'C'),
    (UUID(), 'aa0e8400-e29b-41d4-a716-446655440007', 'Audio recordings', FALSE, 'D'),
    
    (UUID(), 'aa0e8400-e29b-41d4-a716-446655440008', 'SQL Database', FALSE, 'A'),
    (UUID(), 'aa0e8400-e29b-41d4-a716-446655440008', 'Excel spreadsheet', FALSE, 'B'),
    (UUID(), 'aa0e8400-e29b-41d4-a716-446655440008', 'Social media posts', TRUE, 'C'),
    (UUID(), 'aa0e8400-e29b-41d4-a716-446655440008', 'CSV file', FALSE, 'D'),
    
    (UUID(), 'aa0e8400-e29b-41d4-a716-446655440009', 'To hide data', FALSE, 'A'),
    (UUID(), 'aa0e8400-e29b-41d4-a716-446655440009', 'To communicate insights clearly', TRUE, 'B'),
    (UUID(), 'aa0e8400-e29b-41d4-a716-446655440009', 'To delete data', FALSE, 'C'),
    (UUID(), 'aa0e8400-e29b-41d4-a716-446655440009', 'To encrypt data', FALSE, 'D'),
    
    (UUID(), 'aa0e8400-e29b-41d4-a716-446655440100', 'Random guessing', FALSE, 'A'),
    (UUID(), 'aa0e8400-e29b-41d4-a716-446655440100', 'Patterns and trends', TRUE, 'B'),
    (UUID(), 'aa0e8400-e29b-41d4-a716-446655440100', 'Data deletion', FALSE, 'C'),
    (UUID(), 'aa0e8400-e29b-41d4-a716-446655440100', 'File compression', FALSE, 'D')
ON DUPLICATE KEY UPDATE id=id;

-- ============================================
-- DATA SCIENCE LEVEL 1 - Additional MCQs (6-10)
-- ============================================
INSERT INTO questions (id, level_id, question_type, title, description, difficulty, explanation, concepts) VALUES
    ('aa0e8400-e29b-41d4-a716-446655440027', '660e8400-e29b-41d4-a716-446655440101', 'mcq', 'NumPy vs Lists', 'Why use NumPy arrays over Python lists?', 'easy', 'NumPy arrays are faster and more memory efficient for numerical operations.', '["numpy", "performance"]'),
    ('aa0e8400-e29b-41d4-a716-446655440028', '660e8400-e29b-41d4-a716-446655440101', 'mcq', 'DataFrame Index', 'What is the index in a Pandas DataFrame?', 'easy', 'The index is the row label that identifies each row.', '["pandas", "index"]'),
    ('aa0e8400-e29b-41d4-a716-446655440029', '660e8400-e29b-41d4-a716-446655440101', 'mcq', 'Missing Values', 'How do you check for missing values in Pandas?', 'easy', 'Use df.isnull() or df.isna() to check for missing values.', '["pandas", "null"]'),
    ('aa0e8400-e29b-41d4-a716-446655440030', '660e8400-e29b-41d4-a716-446655440101', 'mcq', 'Groupby Operation', 'What does df.groupby() do?', 'medium', 'groupby() groups data by column values for aggregation.', '["pandas", "groupby"]'),
    ('aa0e8400-e29b-41d4-a716-446655440031', '660e8400-e29b-41d4-a716-446655440101', 'mcq', 'Array Dimension', 'What is a 2D NumPy array?', 'easy', 'A 2D array has rows and columns, like a matrix.', '["numpy", "dimensions"]')
ON DUPLICATE KEY UPDATE title=VALUES(title);

INSERT INTO mcq_options (id, question_id, option_text, is_correct, option_letter) VALUES
    (UUID(), 'aa0e8400-e29b-41d4-a716-446655440027', 'Lists are faster', FALSE, 'A'),
    (UUID(), 'aa0e8400-e29b-41d4-a716-446655440027', 'NumPy is faster for numerical ops', TRUE, 'B'),
    (UUID(), 'aa0e8400-e29b-41d4-a716-446655440027', 'No difference', FALSE, 'C'),
    (UUID(), 'aa0e8400-e29b-41d4-a716-446655440027', 'Lists use less memory', FALSE, 'D'),
    
    (UUID(), 'aa0e8400-e29b-41d4-a716-446655440028', 'Column names', FALSE, 'A'),
    (UUID(), 'aa0e8400-e29b-41d4-a716-446655440028', 'Row labels', TRUE, 'B'),
    (UUID(), 'aa0e8400-e29b-41d4-a716-446655440028', 'Data types', FALSE, 'C'),
    (UUID(), 'aa0e8400-e29b-41d4-a716-446655440028', 'File name', FALSE, 'D'),
    
    (UUID(), 'aa0e8400-e29b-41d4-a716-446655440029', 'df.missing()', FALSE, 'A'),
    (UUID(), 'aa0e8400-e29b-41d4-a716-446655440029', 'df.isnull()', TRUE, 'B'),
    (UUID(), 'aa0e8400-e29b-41d4-a716-446655440029', 'df.empty()', FALSE, 'C'),
    (UUID(), 'aa0e8400-e29b-41d4-a716-446655440029', 'df.blank()', FALSE, 'D'),
    
    (UUID(), 'aa0e8400-e29b-41d4-a716-446655440030', 'Sorts data', FALSE, 'A'),
    (UUID(), 'aa0e8400-e29b-41d4-a716-446655440030', 'Groups data for aggregation', TRUE, 'B'),
    (UUID(), 'aa0e8400-e29b-41d4-a716-446655440030', 'Deletes rows', FALSE, 'C'),
    (UUID(), 'aa0e8400-e29b-41d4-a716-446655440030', 'Renames columns', FALSE, 'D'),
    
    (UUID(), 'aa0e8400-e29b-41d4-a716-446655440031', 'Single row of data', FALSE, 'A'),
    (UUID(), 'aa0e8400-e29b-41d4-a716-446655440031', 'Matrix with rows and columns', TRUE, 'B'),
    (UUID(), 'aa0e8400-e29b-41d4-a716-446655440031', 'A string', FALSE, 'C'),
    (UUID(), 'aa0e8400-e29b-41d4-a716-446655440031', 'A single value', FALSE, 'D')
ON DUPLICATE KEY UPDATE id=id;

-- ============================================
-- CLOUD COMPUTING LEVEL 0 - Additional MCQs (6-10)
-- ============================================
INSERT INTO questions (id, level_id, question_type, title, description, difficulty, explanation, concepts) VALUES
    ('bb0e8400-e29b-41d4-a716-446655440006', '660e8400-e29b-41d4-a716-446655440110', 'mcq', 'Cloud Deployment', 'What are cloud deployment models?', 'easy', 'Public, Private, Hybrid, and Community are the main deployment models.', '["deployment", "models"]'),
    ('bb0e8400-e29b-41d4-a716-446655440007', '660e8400-e29b-41d4-a716-446655440110', 'mcq', 'PaaS Definition', 'What does PaaS stand for?', 'easy', 'PaaS = Platform as a Service.', '["paas", "definition"]'),
    ('bb0e8400-e29b-41d4-a716-446655440008', '660e8400-e29b-41d4-a716-446655440110', 'mcq', 'Scalability', 'Cloud scalability means:', 'easy', 'Scalability is the ability to increase resources as demand grows.', '["scalability", "benefits"]'),
    ('bb0e8400-e29b-41d4-a716-446655440009', '660e8400-e29b-41d4-a716-446655440110', 'mcq', 'AWS Service', 'Which is an AWS compute service?', 'easy', 'EC2 (Elastic Compute Cloud) is AWS compute service.', '["aws", "ec2"]'),
    ('bb0e8400-e29b-41d4-a716-446655440100', '660e8400-e29b-41d4-a716-446655440110', 'mcq', 'Cloud Storage', 'Which is a cloud storage service?', 'easy', 'Amazon S3 is a popular cloud storage service.', '["storage", "s3"]')
ON DUPLICATE KEY UPDATE title=VALUES(title);

INSERT INTO mcq_options (id, question_id, option_text, is_correct, option_letter) VALUES
    (UUID(), 'bb0e8400-e29b-41d4-a716-446655440006', 'Only public cloud', FALSE, 'A'),
    (UUID(), 'bb0e8400-e29b-41d4-a716-446655440006', 'Public, Private, Hybrid', TRUE, 'B'),
    (UUID(), 'bb0e8400-e29b-41d4-a716-446655440006', 'Only private cloud', FALSE, 'C'),
    (UUID(), 'bb0e8400-e29b-41d4-a716-446655440006', 'Local servers only', FALSE, 'D'),
    
    (UUID(), 'bb0e8400-e29b-41d4-a716-446655440007', 'Programming as a Service', FALSE, 'A'),
    (UUID(), 'bb0e8400-e29b-41d4-a716-446655440007', 'Platform as a Service', TRUE, 'B'),
    (UUID(), 'bb0e8400-e29b-41d4-a716-446655440007', 'Process as a Service', FALSE, 'C'),
    (UUID(), 'bb0e8400-e29b-41d4-a716-446655440007', 'Product as a Service', FALSE, 'D'),
    
    (UUID(), 'bb0e8400-e29b-41d4-a716-446655440008', 'Fixed resources only', FALSE, 'A'),
    (UUID(), 'bb0e8400-e29b-41d4-a716-446655440008', 'Increasing resources as demand grows', TRUE, 'B'),
    (UUID(), 'bb0e8400-e29b-41d4-a716-446655440008', 'Decreasing performance', FALSE, 'C'),
    (UUID(), 'bb0e8400-e29b-41d4-a716-446655440008', 'Manual hardware setup', FALSE, 'D'),
    
    (UUID(), 'bb0e8400-e29b-41d4-a716-446655440009', 'Microsoft Word', FALSE, 'A'),
    (UUID(), 'bb0e8400-e29b-41d4-a716-446655440009', 'Amazon EC2', TRUE, 'B'),
    (UUID(), 'bb0e8400-e29b-41d4-a716-446655440009', 'Google Docs', FALSE, 'C'),
    (UUID(), 'bb0e8400-e29b-41d4-a716-446655440009', 'Notepad', FALSE, 'D'),
    
    (UUID(), 'bb0e8400-e29b-41d4-a716-446655440100', 'Local hard drive', FALSE, 'A'),
    (UUID(), 'bb0e8400-e29b-41d4-a716-446655440100', 'Amazon S3', TRUE, 'B'),
    (UUID(), 'bb0e8400-e29b-41d4-a716-446655440100', 'USB drive', FALSE, 'C'),
    (UUID(), 'bb0e8400-e29b-41d4-a716-446655440100', 'DVD', FALSE, 'D')
ON DUPLICATE KEY UPDATE id=id;

-- ============================================
-- CLOUD COMPUTING LEVEL 1 - Full 10 MCQs + 2 Coding
-- ============================================
INSERT INTO questions (id, level_id, question_type, title, description, difficulty, explanation, concepts) VALUES
    ('bb0e8400-e29b-41d4-a716-446655440020', '660e8400-e29b-41d4-a716-446655440111', 'mcq', 'IaaS Examples', 'Which is an example of IaaS?', 'easy', 'AWS EC2, Azure VMs are IaaS examples.', '["iaas", "examples"]'),
    ('bb0e8400-e29b-41d4-a716-446655440021', '660e8400-e29b-41d4-a716-446655440111', 'mcq', 'PaaS Examples', 'Which is an example of PaaS?', 'easy', 'Heroku, Google App Engine are PaaS examples.', '["paas", "examples"]'),
    ('bb0e8400-e29b-41d4-a716-446655440022', '660e8400-e29b-41d4-a716-446655440111', 'mcq', 'SaaS Characteristics', 'What is true about SaaS?', 'easy', 'SaaS applications are accessed via browser.', '["saas", "characteristics"]'),
    ('bb0e8400-e29b-41d4-a716-446655440023', '660e8400-e29b-41d4-a716-446655440111', 'mcq', 'Serverless Computing', 'What is serverless computing?', 'medium', 'Serverless means the cloud provider manages servers.', '["serverless", "faas"]'),
    ('bb0e8400-e29b-41d4-a716-446655440024', '660e8400-e29b-41d4-a716-446655440111', 'mcq', 'Virtual Machine', 'What is a virtual machine?', 'easy', 'A VM is software that emulates a physical computer.', '["vm", "virtualization"]'),
    ('bb0e8400-e29b-41d4-a716-446655440025', '660e8400-e29b-41d4-a716-446655440111', 'mcq', 'Cloud Regions', 'What is a cloud region?', 'easy', 'A region is a geographic location with data centers.', '["regions", "geography"]'),
    ('bb0e8400-e29b-41d4-a716-446655440026', '660e8400-e29b-41d4-a716-446655440111', 'mcq', 'Load Balancing', 'What does a load balancer do?', 'medium', 'Load balancer distributes traffic across servers.', '["load balancer", "traffic"]'),
    ('bb0e8400-e29b-41d4-a716-446655440027', '660e8400-e29b-41d4-a716-446655440111', 'mcq', 'Auto Scaling', 'What is auto scaling?', 'medium', 'Auto scaling adjusts resources based on demand.', '["autoscaling", "elasticity"]'),
    ('bb0e8400-e29b-41d4-a716-446655440028', '660e8400-e29b-41d4-a716-446655440111', 'mcq', 'CDN Purpose', 'What is a CDN used for?', 'easy', 'CDN delivers content from servers close to users.', '["cdn", "delivery"]'),
    ('bb0e8400-e29b-41d4-a716-446655440029', '660e8400-e29b-41d4-a716-446655440111', 'mcq', 'Cloud Security', 'Which is a cloud security concern?', 'easy', 'Data breaches are a major security concern.', '["security", "concerns"]')
ON DUPLICATE KEY UPDATE title=VALUES(title);

INSERT INTO mcq_options (id, question_id, option_text, is_correct, option_letter) VALUES
    (UUID(), 'bb0e8400-e29b-41d4-a716-446655440020', 'Gmail', FALSE, 'A'),
    (UUID(), 'bb0e8400-e29b-41d4-a716-446655440020', 'AWS EC2', TRUE, 'B'),
    (UUID(), 'bb0e8400-e29b-41d4-a716-446655440020', 'Salesforce', FALSE, 'C'),
    (UUID(), 'bb0e8400-e29b-41d4-a716-446655440020', 'Heroku', FALSE, 'D'),
    
    (UUID(), 'bb0e8400-e29b-41d4-a716-446655440021', 'AWS EC2', FALSE, 'A'),
    (UUID(), 'bb0e8400-e29b-41d4-a716-446655440021', 'Heroku', TRUE, 'B'),
    (UUID(), 'bb0e8400-e29b-41d4-a716-446655440021', 'Gmail', FALSE, 'C'),
    (UUID(), 'bb0e8400-e29b-41d4-a716-446655440021', 'Azure VMs', FALSE, 'D'),
    
    (UUID(), 'bb0e8400-e29b-41d4-a716-446655440022', 'Requires installation', FALSE, 'A'),
    (UUID(), 'bb0e8400-e29b-41d4-a716-446655440022', 'Accessed via browser', TRUE, 'B'),
    (UUID(), 'bb0e8400-e29b-41d4-a716-446655440022', 'Runs on local hardware', FALSE, 'C'),
    (UUID(), 'bb0e8400-e29b-41d4-a716-446655440022', 'User manages servers', FALSE, 'D'),
    
    (UUID(), 'bb0e8400-e29b-41d4-a716-446655440023', 'No servers exist', FALSE, 'A'),
    (UUID(), 'bb0e8400-e29b-41d4-a716-446655440023', 'Provider manages servers', TRUE, 'B'),
    (UUID(), 'bb0e8400-e29b-41d4-a716-446655440023', 'User buys servers', FALSE, 'C'),
    (UUID(), 'bb0e8400-e29b-41d4-a716-446655440023', 'Only local servers', FALSE, 'D'),
    
    (UUID(), 'bb0e8400-e29b-41d4-a716-446655440024', 'Physical computer', FALSE, 'A'),
    (UUID(), 'bb0e8400-e29b-41d4-a716-446655440024', 'Software emulating a computer', TRUE, 'B'),
    (UUID(), 'bb0e8400-e29b-41d4-a716-446655440024', 'A type of database', FALSE, 'C'),
    (UUID(), 'bb0e8400-e29b-41d4-a716-446655440024', 'Network cable', FALSE, 'D'),
    
    (UUID(), 'bb0e8400-e29b-41d4-a716-446655440025', 'A programming language', FALSE, 'A'),
    (UUID(), 'bb0e8400-e29b-41d4-a716-446655440025', 'Geographic location with data centers', TRUE, 'B'),
    (UUID(), 'bb0e8400-e29b-41d4-a716-446655440025', 'A type of server', FALSE, 'C'),
    (UUID(), 'bb0e8400-e29b-41d4-a716-446655440025', 'A database', FALSE, 'D'),
    
    (UUID(), 'bb0e8400-e29b-41d4-a716-446655440026', 'Stores data', FALSE, 'A'),
    (UUID(), 'bb0e8400-e29b-41d4-a716-446655440026', 'Distributes traffic across servers', TRUE, 'B'),
    (UUID(), 'bb0e8400-e29b-41d4-a716-446655440026', 'Encrypts data', FALSE, 'C'),
    (UUID(), 'bb0e8400-e29b-41d4-a716-446655440026', 'Compresses files', FALSE, 'D'),
    
    (UUID(), 'bb0e8400-e29b-41d4-a716-446655440027', 'Manual resource adjustment', FALSE, 'A'),
    (UUID(), 'bb0e8400-e29b-41d4-a716-446655440027', 'Automatic resource adjustment based on demand', TRUE, 'B'),
    (UUID(), 'bb0e8400-e29b-41d4-a716-446655440027', 'Fixed resources always', FALSE, 'C'),
    (UUID(), 'bb0e8400-e29b-41d4-a716-446655440027', 'Deleting unused servers', FALSE, 'D'),
    
    (UUID(), 'bb0e8400-e29b-41d4-a716-446655440028', 'Database storage', FALSE, 'A'),
    (UUID(), 'bb0e8400-e29b-41d4-a716-446655440028', 'Delivering content from nearby servers', TRUE, 'B'),
    (UUID(), 'bb0e8400-e29b-41d4-a716-446655440028', 'Code compilation', FALSE, 'C'),
    (UUID(), 'bb0e8400-e29b-41d4-a716-446655440028', 'Email sending', FALSE, 'D'),
    
    (UUID(), 'bb0e8400-e29b-41d4-a716-446655440029', 'Faster downloads', FALSE, 'A'),
    (UUID(), 'bb0e8400-e29b-41d4-a716-446655440029', 'Data breaches', TRUE, 'B'),
    (UUID(), 'bb0e8400-e29b-41d4-a716-446655440029', 'Better graphics', FALSE, 'C'),
    (UUID(), 'bb0e8400-e29b-41d4-a716-446655440029', 'Free storage', FALSE, 'D')
ON DUPLICATE KEY UPDATE id=id;

-- Cloud Level 1 Coding
INSERT INTO questions (id, level_id, question_type, title, description, difficulty, input_format, output_format, constraints, reference_solution, explanation, concepts) VALUES
    ('bb0e8400-e29b-41d4-a716-446655440030', '660e8400-e29b-41d4-a716-446655440111', 'coding', 'Calculate Cloud Cost',
     'Given hours of usage and rate per hour, calculate total cost. Print with 2 decimal places.',
     'easy', '10\n0.5', '5.00', 'hours >= 0, rate >= 0',
     'hours = float(input())\nrate = float(input())\ncost = hours * rate\nprint(f"{cost:.2f}")',
     'Simple multiplication for cost calculation.', '["cost", "calculation"]'),
    ('bb0e8400-e29b-41d4-a716-446655440031', '660e8400-e29b-41d4-a716-446655440111', 'coding', 'Resource Scaling',
     'Given current instances and scaling factor, calculate new instance count (round up).',
     'easy', '5\n2.5', '13', 'instances >= 1, factor >= 1',
     'import math\ninstances = int(input())\nfactor = float(input())\nresult = math.ceil(instances * factor)\nprint(result)',
     'Use math.ceil to round up for resource scaling.', '["scaling", "math"]')
ON DUPLICATE KEY UPDATE title=VALUES(title);

INSERT INTO test_cases (id, question_id, input_data, expected_output, is_hidden, test_case_number) VALUES
    (UUID(), 'bb0e8400-e29b-41d4-a716-446655440030', '10\n0.5', '5.00', FALSE, 1),
    (UUID(), 'bb0e8400-e29b-41d4-a716-446655440030', '24\n0.12', '2.88', FALSE, 2),
    (UUID(), 'bb0e8400-e29b-41d4-a716-446655440030', '0\n10', '0.00', TRUE, 3),
    (UUID(), 'bb0e8400-e29b-41d4-a716-446655440030', '100\n1.5', '150.00', TRUE, 4),
    
    (UUID(), 'bb0e8400-e29b-41d4-a716-446655440031', '5\n2.5', '13', FALSE, 1),
    (UUID(), 'bb0e8400-e29b-41d4-a716-446655440031', '3\n2', '6', FALSE, 2),
    (UUID(), 'bb0e8400-e29b-41d4-a716-446655440031', '1\n1.1', '2', TRUE, 3),
    (UUID(), 'bb0e8400-e29b-41d4-a716-446655440031', '10\n1.5', '15', TRUE, 4)
ON DUPLICATE KEY UPDATE id=id;

-- ============================================
-- DEEP LEARNING LEVEL 0 - Additional MCQs (6-10)
-- ============================================
INSERT INTO questions (id, level_id, question_type, title, description, difficulty, explanation, concepts) VALUES
    ('cc0e8400-e29b-41d4-a716-446655440006', '660e8400-e29b-41d4-a716-446655440120', 'mcq', 'GPU for DL', 'Why are GPUs used in Deep Learning?', 'easy', 'GPUs excel at parallel matrix operations needed for DL.', '["gpu", "hardware"]'),
    ('cc0e8400-e29b-41d4-a716-446655440007', '660e8400-e29b-41d4-a716-446655440120', 'mcq', 'Training Data', 'What is training data?', 'easy', 'Data used to teach the model patterns.', '["training", "data"]'),
    ('cc0e8400-e29b-41d4-a716-446655440008', '660e8400-e29b-41d4-a716-446655440120', 'mcq', 'Test Data', 'What is test data used for?', 'easy', 'Test data evaluates model performance on unseen data.', '["testing", "data"]'),
    ('cc0e8400-e29b-41d4-a716-446655440009', '660e8400-e29b-41d4-a716-446655440120', 'mcq', 'Epoch', 'What is an epoch?', 'easy', 'One complete pass through the training dataset.', '["epoch", "training"]'),
    ('cc0e8400-e29b-41d4-a716-446655440100', '660e8400-e29b-41d4-a716-446655440120', 'mcq', 'Batch Size', 'What is batch size?', 'easy', 'Number of samples processed before updating weights.', '["batch", "training"]')
ON DUPLICATE KEY UPDATE title=VALUES(title);

INSERT INTO mcq_options (id, question_id, option_text, is_correct, option_letter) VALUES
    (UUID(), 'cc0e8400-e29b-41d4-a716-446655440006', 'Better graphics display', FALSE, 'A'),
    (UUID(), 'cc0e8400-e29b-41d4-a716-446655440006', 'Parallel matrix operations', TRUE, 'B'),
    (UUID(), 'cc0e8400-e29b-41d4-a716-446655440006', 'Lower cost', FALSE, 'C'),
    (UUID(), 'cc0e8400-e29b-41d4-a716-446655440006', 'Storage capacity', FALSE, 'D'),
    
    (UUID(), 'cc0e8400-e29b-41d4-a716-446655440007', 'Data for deleting', FALSE, 'A'),
    (UUID(), 'cc0e8400-e29b-41d4-a716-446655440007', 'Data to teach the model', TRUE, 'B'),
    (UUID(), 'cc0e8400-e29b-41d4-a716-446655440007', 'Data for storage', FALSE, 'C'),
    (UUID(), 'cc0e8400-e29b-41d4-a716-446655440007', 'Encrypted data', FALSE, 'D'),
    
    (UUID(), 'cc0e8400-e29b-41d4-a716-446655440008', 'Training the model', FALSE, 'A'),
    (UUID(), 'cc0e8400-e29b-41d4-a716-446655440008', 'Evaluating on unseen data', TRUE, 'B'),
    (UUID(), 'cc0e8400-e29b-41d4-a716-446655440008', 'Storing results', FALSE, 'C'),
    (UUID(), 'cc0e8400-e29b-41d4-a716-446655440008', 'Cleaning data', FALSE, 'D'),
    
    (UUID(), 'cc0e8400-e29b-41d4-a716-446655440009', 'A type of layer', FALSE, 'A'),
    (UUID(), 'cc0e8400-e29b-41d4-a716-446655440009', 'One pass through training data', TRUE, 'B'),
    (UUID(), 'cc0e8400-e29b-41d4-a716-446655440009', 'A learning rate', FALSE, 'C'),
    (UUID(), 'cc0e8400-e29b-41d4-a716-446655440009', 'A framework', FALSE, 'D'),
    
    (UUID(), 'cc0e8400-e29b-41d4-a716-446655440100', 'Total dataset size', FALSE, 'A'),
    (UUID(), 'cc0e8400-e29b-41d4-a716-446655440100', 'Samples per weight update', TRUE, 'B'),
    (UUID(), 'cc0e8400-e29b-41d4-a716-446655440100', 'Number of layers', FALSE, 'C'),
    (UUID(), 'cc0e8400-e29b-41d4-a716-446655440100', 'Learning rate', FALSE, 'D')
ON DUPLICATE KEY UPDATE id=id;

-- ============================================
-- DEEP LEARNING LEVEL 1 - Additional MCQs (6-10)
-- ============================================
INSERT INTO questions (id, level_id, question_type, title, description, difficulty, explanation, concepts) VALUES
    ('cc0e8400-e29b-41d4-a716-446655440027', '660e8400-e29b-41d4-a716-446655440121', 'mcq', 'Gradient Descent', 'What is gradient descent?', 'medium', 'Optimization algorithm to minimize the loss function.', '["gradient", "optimization"]'),
    ('cc0e8400-e29b-41d4-a716-446655440028', '660e8400-e29b-41d4-a716-446655440121', 'mcq', 'Vanishing Gradient', 'What is the vanishing gradient problem?', 'medium', 'Gradients become too small for effective learning in deep networks.', '["vanishing", "gradient"]'),
    ('cc0e8400-e29b-41d4-a716-446655440029', '660e8400-e29b-41d4-a716-446655440121', 'mcq', 'Dropout', 'What is dropout in neural networks?', 'medium', 'Randomly disabling neurons during training to prevent overfitting.', '["dropout", "regularization"]'),
    ('cc0e8400-e29b-41d4-a716-446655440030', '660e8400-e29b-41d4-a716-446655440121', 'mcq', 'Softmax Function', 'When is softmax activation used?', 'medium', 'Softmax is used in the output layer for multi-class classification.', '["softmax", "classification"]'),
    ('cc0e8400-e29b-41d4-a716-446655440031', '660e8400-e29b-41d4-a716-446655440121', 'mcq', 'Overfitting', 'What causes overfitting?', 'medium', 'Model memorizes training data instead of learning patterns.', '["overfitting", "generalization"]')
ON DUPLICATE KEY UPDATE title=VALUES(title);

INSERT INTO mcq_options (id, question_id, option_text, is_correct, option_letter) VALUES
    (UUID(), 'cc0e8400-e29b-41d4-a716-446655440027', 'Data cleaning method', FALSE, 'A'),
    (UUID(), 'cc0e8400-e29b-41d4-a716-446655440027', 'Optimization to minimize loss', TRUE, 'B'),
    (UUID(), 'cc0e8400-e29b-41d4-a716-446655440027', 'Activation function', FALSE, 'C'),
    (UUID(), 'cc0e8400-e29b-41d4-a716-446655440027', 'Layer type', FALSE, 'D'),
    
    (UUID(), 'cc0e8400-e29b-41d4-a716-446655440028', 'Gradients become too large', FALSE, 'A'),
    (UUID(), 'cc0e8400-e29b-41d4-a716-446655440028', 'Gradients become too small', TRUE, 'B'),
    (UUID(), 'cc0e8400-e29b-41d4-a716-446655440028', 'Weights become negative', FALSE, 'C'),
    (UUID(), 'cc0e8400-e29b-41d4-a716-446655440028', 'Training speeds up', FALSE, 'D'),
    
    (UUID(), 'cc0e8400-e29b-41d4-a716-446655440029', 'Adding more layers', FALSE, 'A'),
    (UUID(), 'cc0e8400-e29b-41d4-a716-446655440029', 'Randomly disabling neurons', TRUE, 'B'),
    (UUID(), 'cc0e8400-e29b-41d4-a716-446655440029', 'Increasing learning rate', FALSE, 'C'),
    (UUID(), 'cc0e8400-e29b-41d4-a716-446655440029', 'Using more data', FALSE, 'D'),
    
    (UUID(), 'cc0e8400-e29b-41d4-a716-446655440030', 'Binary classification only', FALSE, 'A'),
    (UUID(), 'cc0e8400-e29b-41d4-a716-446655440030', 'Multi-class classification output', TRUE, 'B'),
    (UUID(), 'cc0e8400-e29b-41d4-a716-446655440030', 'Regression problems', FALSE, 'C'),
    (UUID(), 'cc0e8400-e29b-41d4-a716-446655440030', 'Image input', FALSE, 'D'),
    
    (UUID(), 'cc0e8400-e29b-41d4-a716-446655440031', 'Too little training data', FALSE, 'A'),
    (UUID(), 'cc0e8400-e29b-41d4-a716-446655440031', 'Memorizing training data', TRUE, 'B'),
    (UUID(), 'cc0e8400-e29b-41d4-a716-446655440031', 'High learning rate', FALSE, 'C'),
    (UUID(), 'cc0e8400-e29b-41d4-a716-446655440031', 'Simple model', FALSE, 'D')
ON DUPLICATE KEY UPDATE id=id;

SELECT 'Additional MCQs added successfully! Now 10 per level.' AS status;
