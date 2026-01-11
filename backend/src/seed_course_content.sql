-- Seed Additional Course Content for Level 0 and Enhanced Level 1
-- Run this script to add MCQs with correct choices and coding questions with test cases

-- ============================================
-- PYTHON COURSE - Level 0 (Introduction)
-- ============================================

-- First, create Level 0 for Python if not exists
INSERT INTO levels (id, course_id, level_number, title, description, learning_materials, code_snippet) VALUES
    ('660e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001', 0, 'Getting Started with Python', 'Setup, first program, and basic concepts',
     '{"introduction": "Welcome to Python! Let''s write your first program.", "concepts": [{"title": "Print Statement", "explanation": "Display output using print()."}, {"title": "Comments", "explanation": "Add notes using # symbol."}], "key_terms": ["print", "comment", "syntax"], "resources": [{"title": "Python Getting Started", "url": "https://www.w3schools.com/python/python_getstarted.asp"}]}',
     'print("Hello, World!")')
ON DUPLICATE KEY UPDATE title=VALUES(title), description=VALUES(description);

-- Python Level 0 - MCQ Questions (5 questions)
INSERT INTO questions (id, level_id, question_type, title, description, difficulty, explanation, concepts) VALUES
    ('880e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440000', 'mcq', 'Python Creator', 'Who created the Python programming language?', 'easy', 'Python was created by Guido van Rossum in 1991.', '["history", "python"]'),
    ('880e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440000', 'mcq', 'File Extension', 'What is the file extension for Python files?', 'easy', 'Python source files use the .py extension.', '["files", "syntax"]'),
    ('880e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440000', 'mcq', 'Print Function', 'How do you output "Hello" in Python?', 'easy', 'The print() function is used to output text in Python.', '["print", "output"]'),
    ('880e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440000', 'mcq', 'Python Type', 'Python is which type of language?', 'easy', 'Python is an interpreted, high-level programming language.', '["language", "interpreted"]'),
    ('880e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440000', 'mcq', 'Case Sensitivity', 'Is Python case-sensitive?', 'easy', 'Python is case-sensitive. "Name" and "name" are different variables.', '["syntax", "variables"]')
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- MCQ Options for Python Level 0
INSERT INTO mcq_options (id, question_id, option_text, is_correct, option_letter) VALUES
    (UUID(), '880e8400-e29b-41d4-a716-446655440001', 'Guido van Rossum', TRUE, 'A'),
    (UUID(), '880e8400-e29b-41d4-a716-446655440001', 'Dennis Ritchie', FALSE, 'B'),
    (UUID(), '880e8400-e29b-41d4-a716-446655440001', 'James Gosling', FALSE, 'C'),
    (UUID(), '880e8400-e29b-41d4-a716-446655440001', 'Bjarne Stroustrup', FALSE, 'D'),
    
    (UUID(), '880e8400-e29b-41d4-a716-446655440002', '.python', FALSE, 'A'),
    (UUID(), '880e8400-e29b-41d4-a716-446655440002', '.py', TRUE, 'B'),
    (UUID(), '880e8400-e29b-41d4-a716-446655440002', '.pyt', FALSE, 'C'),
    (UUID(), '880e8400-e29b-41d4-a716-446655440002', '.pt', FALSE, 'D'),
    
    (UUID(), '880e8400-e29b-41d4-a716-446655440003', 'echo("Hello")', FALSE, 'A'),
    (UUID(), '880e8400-e29b-41d4-a716-446655440003', 'print("Hello")', TRUE, 'B'),
    (UUID(), '880e8400-e29b-41d4-a716-446655440003', 'printf("Hello")', FALSE, 'C'),
    (UUID(), '880e8400-e29b-41d4-a716-446655440003', 'console.log("Hello")', FALSE, 'D'),
    
    (UUID(), '880e8400-e29b-41d4-a716-446655440004', 'Compiled', FALSE, 'A'),
    (UUID(), '880e8400-e29b-41d4-a716-446655440004', 'Interpreted', TRUE, 'B'),
    (UUID(), '880e8400-e29b-41d4-a716-446655440004', 'Assembly', FALSE, 'C'),
    (UUID(), '880e8400-e29b-41d4-a716-446655440004', 'Machine', FALSE, 'D'),
    
    (UUID(), '880e8400-e29b-41d4-a716-446655440005', 'Yes', TRUE, 'A'),
    (UUID(), '880e8400-e29b-41d4-a716-446655440005', 'No', FALSE, 'B'),
    (UUID(), '880e8400-e29b-41d4-a716-446655440005', 'Only for functions', FALSE, 'C'),
    (UUID(), '880e8400-e29b-41d4-a716-446655440005', 'Only for classes', FALSE, 'D')
ON DUPLICATE KEY UPDATE id=id;

-- Python Level 0 - Coding Questions (2 questions)
INSERT INTO questions (id, level_id, question_type, title, description, difficulty, input_format, output_format, constraints, reference_solution, explanation, concepts) VALUES
    ('880e8400-e29b-41d4-a716-446655440010', '660e8400-e29b-41d4-a716-446655440000', 'coding', 'Say Hello', 
     'Write a program that prints "Hello, Python!" to the console.',
     'easy', 'No input required', 'Hello, Python!', 'Just print the exact string.', 
     'print("Hello, Python!")', 
     'Use the print() function with a string argument.', '["print", "strings"]'),
    ('880e8400-e29b-41d4-a716-446655440011', '660e8400-e29b-41d4-a716-446655440000', 'coding', 'Add Two Numbers',
     'Read two integers from input and print their sum.',
     'easy', '5\n3', '8', '1 <= a, b <= 1000',
     'a = int(input())\nb = int(input())\nprint(a + b)',
     'Use input() to read values, convert to int, add them, and print.', '["input", "arithmetic", "print"]')
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- Test Cases for Python Level 0 Coding
INSERT INTO test_cases (id, question_id, input_data, expected_output, is_hidden, test_case_number) VALUES
    (UUID(), '880e8400-e29b-41d4-a716-446655440010', '', 'Hello, Python!', FALSE, 1),
    (UUID(), '880e8400-e29b-41d4-a716-446655440010', '', 'Hello, Python!', TRUE, 2),
    
    (UUID(), '880e8400-e29b-41d4-a716-446655440011', '5\n3', '8', FALSE, 1),
    (UUID(), '880e8400-e29b-41d4-a716-446655440011', '10\n20', '30', FALSE, 2),
    (UUID(), '880e8400-e29b-41d4-a716-446655440011', '0\n0', '0', TRUE, 3),
    (UUID(), '880e8400-e29b-41d4-a716-446655440011', '100\n200', '300', TRUE, 4),
    (UUID(), '880e8400-e29b-41d4-a716-446655440011', '999\n1', '1000', TRUE, 5)
ON DUPLICATE KEY UPDATE id=id;

-- ============================================
-- C PROGRAMMING COURSE - Level 0 (Introduction)
-- ============================================

INSERT INTO levels (id, course_id, level_number, title, description, learning_materials, code_snippet) VALUES
    ('660e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440002', 0, 'Getting Started with C', 'Setup, compilation, and first program',
     '{"introduction": "Welcome to C Programming! Learn the basics.", "concepts": [{"title": "main function", "explanation": "Every C program starts with main()."}, {"title": "printf", "explanation": "Print output to console."}], "key_terms": ["main", "printf", "return"], "resources": [{"title": "C Introduction", "url": "https://www.w3schools.com/c/c_intro.php"}]}',
     '#include <stdio.h>\nint main() {\n    printf("Hello, World!");\n    return 0;\n}')
ON DUPLICATE KEY UPDATE title=VALUES(title), description=VALUES(description);

-- C Level 0 - MCQ Questions (5 questions)
INSERT INTO questions (id, level_id, question_type, title, description, difficulty, explanation, concepts) VALUES
    ('880e8400-e29b-41d4-a716-446655440020', '660e8400-e29b-41d4-a716-446655440010', 'mcq', 'C Creator', 'Who developed the C programming language?', 'easy', 'C was developed by Dennis Ritchie at Bell Labs in 1972.', '["history", "c"]'),
    ('880e8400-e29b-41d4-a716-446655440021', '660e8400-e29b-41d4-a716-446655440010', 'mcq', 'C File Extension', 'What is the file extension for C source files?', 'easy', 'C source files use the .c extension.', '["files", "syntax"]'),
    ('880e8400-e29b-41d4-a716-446655440022', '660e8400-e29b-41d4-a716-446655440010', 'mcq', 'Print in C', 'Which function is used to print output in C?', 'easy', 'printf() is used to print formatted output in C.', '["printf", "output"]'),
    ('880e8400-e29b-41d4-a716-446655440023', '660e8400-e29b-41d4-a716-446655440010', 'mcq', 'Entry Point', 'What is the entry point of a C program?', 'easy', 'The main() function is the entry point of every C program.', '["main", "functions"]'),
    ('880e8400-e29b-41d4-a716-446655440024', '660e8400-e29b-41d4-a716-446655440010', 'mcq', 'Statement Terminator', 'How do you end a statement in C?', 'easy', 'Statements in C are terminated with a semicolon (;).', '["syntax", "statements"]')
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- MCQ Options for C Level 0
INSERT INTO mcq_options (id, question_id, option_text, is_correct, option_letter) VALUES
    (UUID(), '880e8400-e29b-41d4-a716-446655440020', 'Dennis Ritchie', TRUE, 'A'),
    (UUID(), '880e8400-e29b-41d4-a716-446655440020', 'Ken Thompson', FALSE, 'B'),
    (UUID(), '880e8400-e29b-41d4-a716-446655440020', 'Guido van Rossum', FALSE, 'C'),
    (UUID(), '880e8400-e29b-41d4-a716-446655440020', 'Brian Kernighan', FALSE, 'D'),
    
    (UUID(), '880e8400-e29b-41d4-a716-446655440021', '.cpp', FALSE, 'A'),
    (UUID(), '880e8400-e29b-41d4-a716-446655440021', '.c', TRUE, 'B'),
    (UUID(), '880e8400-e29b-41d4-a716-446655440021', '.h', FALSE, 'C'),
    (UUID(), '880e8400-e29b-41d4-a716-446655440021', '.cc', FALSE, 'D'),
    
    (UUID(), '880e8400-e29b-41d4-a716-446655440022', 'print()', FALSE, 'A'),
    (UUID(), '880e8400-e29b-41d4-a716-446655440022', 'printf()', TRUE, 'B'),
    (UUID(), '880e8400-e29b-41d4-a716-446655440022', 'cout', FALSE, 'C'),
    (UUID(), '880e8400-e29b-41d4-a716-446655440022', 'echo()', FALSE, 'D'),
    
    (UUID(), '880e8400-e29b-41d4-a716-446655440023', 'start()', FALSE, 'A'),
    (UUID(), '880e8400-e29b-41d4-a716-446655440023', 'main()', TRUE, 'B'),
    (UUID(), '880e8400-e29b-41d4-a716-446655440023', 'begin()', FALSE, 'C'),
    (UUID(), '880e8400-e29b-41d4-a716-446655440023', 'init()', FALSE, 'D'),
    
    (UUID(), '880e8400-e29b-41d4-a716-446655440024', 'Colon (:)', FALSE, 'A'),
    (UUID(), '880e8400-e29b-41d4-a716-446655440024', 'Semicolon (;)', TRUE, 'B'),
    (UUID(), '880e8400-e29b-41d4-a716-446655440024', 'Period (.)', FALSE, 'C'),
    (UUID(), '880e8400-e29b-41d4-a716-446655440024', 'Comma (,)', FALSE, 'D')
ON DUPLICATE KEY UPDATE id=id;

-- C Level 0 - Coding Questions (2 questions)
INSERT INTO questions (id, level_id, question_type, title, description, difficulty, input_format, output_format, constraints, reference_solution, explanation, concepts) VALUES
    ('880e8400-e29b-41d4-a716-446655440030', '660e8400-e29b-41d4-a716-446655440010', 'coding', 'Hello C', 
     'Write a C program that prints "Hello, C!" to the console.',
     'easy', 'No input required', 'Hello, C!', 'Print exact string.',
     '#include <stdio.h>\nint main() {\n    printf("Hello, C!");\n    return 0;\n}',
     'Use printf() to print the string.', '["printf", "main"]'),
    ('880e8400-e29b-41d4-a716-446655440031', '660e8400-e29b-41d4-a716-446655440010', 'coding', 'Sum of Two',
     'Read two integers and print their sum.',
     'easy', '5 3', '8', '1 <= a, b <= 1000',
     '#include <stdio.h>\nint main() {\n    int a, b;\n    scanf("%d %d", &a, &b);\n    printf("%d", a + b);\n    return 0;\n}',
     'Use scanf() to read integers and printf() to print the sum.', '["scanf", "printf", "arithmetic"]')
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- Test Cases for C Level 0 Coding
INSERT INTO test_cases (id, question_id, input_data, expected_output, is_hidden, test_case_number) VALUES
    (UUID(), '880e8400-e29b-41d4-a716-446655440030', '', 'Hello, C!', FALSE, 1),
    (UUID(), '880e8400-e29b-41d4-a716-446655440030', '', 'Hello, C!', TRUE, 2),
    
    (UUID(), '880e8400-e29b-41d4-a716-446655440031', '5 3', '8', FALSE, 1),
    (UUID(), '880e8400-e29b-41d4-a716-446655440031', '10 20', '30', FALSE, 2),
    (UUID(), '880e8400-e29b-41d4-a716-446655440031', '0 0', '0', TRUE, 3),
    (UUID(), '880e8400-e29b-41d4-a716-446655440031', '100 200', '300', TRUE, 4),
    (UUID(), '880e8400-e29b-41d4-a716-446655440031', '999 1', '1000', TRUE, 5)
ON DUPLICATE KEY UPDATE id=id;

-- ============================================
-- MACHINE LEARNING COURSE - Level 0 (Introduction)
-- ============================================

INSERT INTO levels (id, course_id, level_number, title, description, learning_materials, code_snippet) VALUES
    ('660e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440003', 0, 'What is Machine Learning?', 'Introduction to ML concepts and history',
     '{"introduction": "Machine Learning is a subset of AI that enables systems to learn from data.", "concepts": [{"title": "AI vs ML", "explanation": "ML is a approach to achieve AI."}, {"title": "Types of ML", "explanation": "Supervised, Unsupervised, Reinforcement."}], "key_terms": ["AI", "ML", "Data", "Model"], "resources": [{"title": "ML Introduction", "url": "https://www.w3schools.com/python/python_ml_getting_started.asp"}]}',
     '# Machine Learning is about learning from data\n# Types: Supervised, Unsupervised, Reinforcement')
ON DUPLICATE KEY UPDATE title=VALUES(title), description=VALUES(description);

-- ML Level 0 - MCQ Questions (5 questions)
INSERT INTO questions (id, level_id, question_type, title, description, difficulty, explanation, concepts) VALUES
    ('880e8400-e29b-41d4-a716-446655440040', '660e8400-e29b-41d4-a716-446655440020', 'mcq', 'What is ML', 'What is Machine Learning?', 'easy', 'Machine Learning is a method of teaching computers to learn from data.', '["ml", "definition"]'),
    ('880e8400-e29b-41d4-a716-446655440041', '660e8400-e29b-41d4-a716-446655440020', 'mcq', 'ML Relationship to AI', 'What is the relationship between AI and ML?', 'easy', 'Machine Learning is a subset of Artificial Intelligence.', '["ai", "ml", "relationship"]'),
    ('880e8400-e29b-41d4-a716-446655440042', '660e8400-e29b-41d4-a716-446655440020', 'mcq', 'Types of ML', 'How many main types of Machine Learning are there?', 'easy', 'There are three main types: Supervised, Unsupervised, and Reinforcement Learning.', '["types", "ml"]'),
    ('880e8400-e29b-41d4-a716-446655440043', '660e8400-e29b-41d4-a716-446655440020', 'mcq', 'ML Purpose', 'What does ML enable computers to do?', 'easy', 'ML enables computers to learn and improve from experience without being explicitly programmed.', '["purpose", "ml"]'),
    ('880e8400-e29b-41d4-a716-446655440044', '660e8400-e29b-41d4-a716-446655440020', 'mcq', 'ML Applications', 'Which is NOT a common ML application?', 'easy', 'Printing documents is not an ML application. Others use pattern recognition and prediction.', '["applications", "ml"]')
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- MCQ Options for ML Level 0
INSERT INTO mcq_options (id, question_id, option_text, is_correct, option_letter) VALUES
    (UUID(), '880e8400-e29b-41d4-a716-446655440040', 'A programming language', FALSE, 'A'),
    (UUID(), '880e8400-e29b-41d4-a716-446655440040', 'A method of teaching computers to learn from data', TRUE, 'B'),
    (UUID(), '880e8400-e29b-41d4-a716-446655440040', 'A type of database', FALSE, 'C'),
    (UUID(), '880e8400-e29b-41d4-a716-446655440040', 'A hardware component', FALSE, 'D'),
    
    (UUID(), '880e8400-e29b-41d4-a716-446655440041', 'AI is a subset of ML', FALSE, 'A'),
    (UUID(), '880e8400-e29b-41d4-a716-446655440041', 'ML is a subset of AI', TRUE, 'B'),
    (UUID(), '880e8400-e29b-41d4-a716-446655440041', 'They are the same', FALSE, 'C'),
    (UUID(), '880e8400-e29b-41d4-a716-446655440041', 'They are unrelated', FALSE, 'D'),
    
    (UUID(), '880e8400-e29b-41d4-a716-446655440042', 'Two', FALSE, 'A'),
    (UUID(), '880e8400-e29b-41d4-a716-446655440042', 'Three', TRUE, 'B'),
    (UUID(), '880e8400-e29b-41d4-a716-446655440042', 'Four', FALSE, 'C'),
    (UUID(), '880e8400-e29b-41d4-a716-446655440042', 'Five', FALSE, 'D'),
    
    (UUID(), '880e8400-e29b-41d4-a716-446655440043', 'Print documents', FALSE, 'A'),
    (UUID(), '880e8400-e29b-41d4-a716-446655440043', 'Learn and improve from experience', TRUE, 'B'),
    (UUID(), '880e8400-e29b-41d4-a716-446655440043', 'Store data only', FALSE, 'C'),
    (UUID(), '880e8400-e29b-41d4-a716-446655440043', 'Display graphics', FALSE, 'D'),
    
    (UUID(), '880e8400-e29b-41d4-a716-446655440044', 'Spam detection', FALSE, 'A'),
    (UUID(), '880e8400-e29b-41d4-a716-446655440044', 'Image recognition', FALSE, 'B'),
    (UUID(), '880e8400-e29b-41d4-a716-446655440044', 'Printing documents', TRUE, 'C'),
    (UUID(), '880e8400-e29b-41d4-a716-446655440044', 'Speech recognition', FALSE, 'D')
ON DUPLICATE KEY UPDATE id=id;

-- ML Level 0 - Coding Questions (2 questions - Python-based)
INSERT INTO questions (id, level_id, question_type, title, description, difficulty, input_format, output_format, constraints, reference_solution, explanation, concepts) VALUES
    ('880e8400-e29b-41d4-a716-446655440050', '660e8400-e29b-41d4-a716-446655440020', 'coding', 'Calculate Average', 
     'Given a list of numbers, calculate and return the average. Read n numbers and print their average rounded to 2 decimal places.',
     'easy', '4\n10 20 30 40', '25.00', 'n >= 1',
     'n = int(input())\nnums = list(map(int, input().split()))\navg = sum(nums) / len(nums)\nprint(f"{avg:.2f}")',
     'Sum all numbers and divide by count. Use f-string for formatting.', '["average", "lists", "formatting"]'),
    ('880e8400-e29b-41d4-a716-446655440051', '660e8400-e29b-41d4-a716-446655440020', 'coding', 'Find Maximum',
     'Given a list of numbers, find and return the maximum value.',
     'easy', '5\n3 7 2 9 4', '9', 'n >= 1',
     'n = int(input())\nnums = list(map(int, input().split()))\nprint(max(nums))',
     'Use the built-in max() function to find the largest value.', '["max", "lists"]')
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- Test Cases for ML Level 0 Coding
INSERT INTO test_cases (id, question_id, input_data, expected_output, is_hidden, test_case_number) VALUES
    (UUID(), '880e8400-e29b-41d4-a716-446655440050', '4\n10 20 30 40', '25.00', FALSE, 1),
    (UUID(), '880e8400-e29b-41d4-a716-446655440050', '3\n5 10 15', '10.00', FALSE, 2),
    (UUID(), '880e8400-e29b-41d4-a716-446655440050', '1\n100', '100.00', TRUE, 3),
    (UUID(), '880e8400-e29b-41d4-a716-446655440050', '2\n7 3', '5.00', TRUE, 4),
    (UUID(), '880e8400-e29b-41d4-a716-446655440050', '5\n1 2 3 4 5', '3.00', TRUE, 5),
    
    (UUID(), '880e8400-e29b-41d4-a716-446655440051', '5\n3 7 2 9 4', '9', FALSE, 1),
    (UUID(), '880e8400-e29b-41d4-a716-446655440051', '3\n1 2 3', '3', FALSE, 2),
    (UUID(), '880e8400-e29b-41d4-a716-446655440051', '1\n42', '42', TRUE, 3),
    (UUID(), '880e8400-e29b-41d4-a716-446655440051', '4\n-5 -2 -10 -1', '-1', TRUE, 4),
    (UUID(), '880e8400-e29b-41d4-a716-446655440051', '3\n100 100 100', '100', TRUE, 5)
ON DUPLICATE KEY UPDATE id=id;

-- ============================================
-- Additional Python Level 1 Coding Questions
-- ============================================

INSERT INTO questions (id, level_id, question_type, title, description, difficulty, input_format, output_format, constraints, reference_solution, explanation, concepts) VALUES
    ('880e8400-e29b-41d4-a716-446655440060', '660e8400-e29b-41d4-a716-446655440001', 'coding', 'Even or Odd', 
     'Given a number, print "Even" if it is even, otherwise print "Odd".',
     'easy', '4', 'Even', '-1000 <= n <= 1000',
     'n = int(input())\nprint("Even" if n % 2 == 0 else "Odd")',
     'Use modulo operator to check if number is divisible by 2.', '["conditionals", "modulo"]'),
    ('880e8400-e29b-41d4-a716-446655440061', '660e8400-e29b-41d4-a716-446655440001', 'coding', 'Sum of Digits',
     'Given a positive integer, find the sum of its digits.',
     'easy', '123', '6', '1 <= n <= 10^9',
     'n = input()\nprint(sum(int(d) for d in n))',
     'Convert each character to int and sum them.', '["strings", "math", "loops"]')
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- Test Cases for Additional Python Level 1
INSERT INTO test_cases (id, question_id, input_data, expected_output, is_hidden, test_case_number) VALUES
    (UUID(), '880e8400-e29b-41d4-a716-446655440060', '4', 'Even', FALSE, 1),
    (UUID(), '880e8400-e29b-41d4-a716-446655440060', '7', 'Odd', FALSE, 2),
    (UUID(), '880e8400-e29b-41d4-a716-446655440060', '0', 'Even', TRUE, 3),
    (UUID(), '880e8400-e29b-41d4-a716-446655440060', '-3', 'Odd', TRUE, 4),
    (UUID(), '880e8400-e29b-41d4-a716-446655440060', '100', 'Even', TRUE, 5),
    
    (UUID(), '880e8400-e29b-41d4-a716-446655440061', '123', '6', FALSE, 1),
    (UUID(), '880e8400-e29b-41d4-a716-446655440061', '9999', '36', FALSE, 2),
    (UUID(), '880e8400-e29b-41d4-a716-446655440061', '1', '1', TRUE, 3),
    (UUID(), '880e8400-e29b-41d4-a716-446655440061', '10', '1', TRUE, 4),
    (UUID(), '880e8400-e29b-41d4-a716-446655440061', '555', '15', TRUE, 5)
ON DUPLICATE KEY UPDATE id=id;

-- Success message
SELECT 'Course content seed completed successfully!' AS status;
