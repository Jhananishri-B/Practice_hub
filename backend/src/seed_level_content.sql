-- Level-Specific Course Content Seed
-- Content matches each level's specific topic

-- ============================================
-- PYTHON LEVEL 2: CONDITIONALS
-- ============================================
INSERT INTO questions (id, level_id, question_type, title, description, difficulty, explanation, concepts) VALUES
    ('990e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440002', 'mcq', 'If Statement Syntax', 'What is the correct syntax for an if statement in Python?', 'easy', 'Python uses indentation and colon (:) for if statements.', '["if", "syntax"]'),
    ('990e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440002', 'mcq', 'Elif Keyword', 'What does elif stand for in Python?', 'easy', 'elif is short for "else if" and allows checking multiple conditions.', '["elif", "conditionals"]'),
    ('990e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440002', 'mcq', 'Comparison Operator', 'Which operator checks for equality in Python?', 'easy', '== is the equality comparison operator. = is assignment.', '["operators", "comparison"]'),
    ('990e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440002', 'mcq', 'Logical AND', 'What is the result of: True and False?', 'easy', 'AND requires both conditions to be True.', '["logical", "and"]'),
    ('990e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440002', 'mcq', 'Nested If', 'Can you have an if statement inside another if statement?', 'easy', 'Yes, this is called nested conditionals.', '["nested", "if"]')
ON DUPLICATE KEY UPDATE title=VALUES(title);

INSERT INTO mcq_options (id, question_id, option_text, is_correct, option_letter) VALUES
    (UUID(), '990e8400-e29b-41d4-a716-446655440001', 'if x > 5:', TRUE, 'A'),
    (UUID(), '990e8400-e29b-41d4-a716-446655440001', 'if (x > 5) {', FALSE, 'B'),
    (UUID(), '990e8400-e29b-41d4-a716-446655440001', 'if x > 5 then', FALSE, 'C'),
    (UUID(), '990e8400-e29b-41d4-a716-446655440001', 'IF x > 5:', FALSE, 'D'),
    
    (UUID(), '990e8400-e29b-41d4-a716-446655440002', 'else if', TRUE, 'A'),
    (UUID(), '990e8400-e29b-41d4-a716-446655440002', 'else in', FALSE, 'B'),
    (UUID(), '990e8400-e29b-41d4-a716-446655440002', 'elseif', FALSE, 'C'),
    (UUID(), '990e8400-e29b-41d4-a716-446655440002', 'elsif', FALSE, 'D'),
    
    (UUID(), '990e8400-e29b-41d4-a716-446655440003', '=', FALSE, 'A'),
    (UUID(), '990e8400-e29b-41d4-a716-446655440003', '==', TRUE, 'B'),
    (UUID(), '990e8400-e29b-41d4-a716-446655440003', '===', FALSE, 'C'),
    (UUID(), '990e8400-e29b-41d4-a716-446655440003', '!=', FALSE, 'D'),
    
    (UUID(), '990e8400-e29b-41d4-a716-446655440004', 'True', FALSE, 'A'),
    (UUID(), '990e8400-e29b-41d4-a716-446655440004', 'False', TRUE, 'B'),
    (UUID(), '990e8400-e29b-41d4-a716-446655440004', 'None', FALSE, 'C'),
    (UUID(), '990e8400-e29b-41d4-a716-446655440004', 'Error', FALSE, 'D'),
    
    (UUID(), '990e8400-e29b-41d4-a716-446655440005', 'Yes', TRUE, 'A'),
    (UUID(), '990e8400-e29b-41d4-a716-446655440005', 'No', FALSE, 'B'),
    (UUID(), '990e8400-e29b-41d4-a716-446655440005', 'Only in Python 3', FALSE, 'C'),
    (UUID(), '990e8400-e29b-41d4-a716-446655440005', 'With special syntax', FALSE, 'D')
ON DUPLICATE KEY UPDATE id=id;

-- Python Level 2 Coding Questions
INSERT INTO questions (id, level_id, question_type, title, description, difficulty, input_format, output_format, constraints, reference_solution, explanation, concepts) VALUES
    ('990e8400-e29b-41d4-a716-446655440010', '660e8400-e29b-41d4-a716-446655440002', 'coding', 'Check Positive or Negative',
     'Given a number, print "Positive" if it is greater than 0, "Negative" if less than 0, and "Zero" otherwise.',
     'easy', '5', 'Positive', '-1000 <= n <= 1000',
     'n = int(input())\nif n > 0:\n    print("Positive")\nelif n < 0:\n    print("Negative")\nelse:\n    print("Zero")',
     'Use if-elif-else to handle three cases.', '["if", "elif", "else"]'),
    ('990e8400-e29b-41d4-a716-446655440011', '660e8400-e29b-41d4-a716-446655440002', 'coding', 'Grade Calculator',
     'Given a score (0-100), print the grade: A (90+), B (80-89), C (70-79), D (60-69), F (below 60).',
     'medium', '85', 'B', '0 <= score <= 100',
     'score = int(input())\nif score >= 90:\n    print("A")\nelif score >= 80:\n    print("B")\nelif score >= 70:\n    print("C")\nelif score >= 60:\n    print("D")\nelse:\n    print("F")',
     'Use multiple elif statements to check ranges.', '["if", "elif", "grading"]')
ON DUPLICATE KEY UPDATE title=VALUES(title);

INSERT INTO test_cases (id, question_id, input_data, expected_output, is_hidden, test_case_number) VALUES
    (UUID(), '990e8400-e29b-41d4-a716-446655440010', '5', 'Positive', FALSE, 1),
    (UUID(), '990e8400-e29b-41d4-a716-446655440010', '-3', 'Negative', FALSE, 2),
    (UUID(), '990e8400-e29b-41d4-a716-446655440010', '0', 'Zero', TRUE, 3),
    (UUID(), '990e8400-e29b-41d4-a716-446655440010', '100', 'Positive', TRUE, 4),
    (UUID(), '990e8400-e29b-41d4-a716-446655440010', '-999', 'Negative', TRUE, 5),
    
    (UUID(), '990e8400-e29b-41d4-a716-446655440011', '85', 'B', FALSE, 1),
    (UUID(), '990e8400-e29b-41d4-a716-446655440011', '95', 'A', FALSE, 2),
    (UUID(), '990e8400-e29b-41d4-a716-446655440011', '72', 'C', TRUE, 3),
    (UUID(), '990e8400-e29b-41d4-a716-446655440011', '65', 'D', TRUE, 4),
    (UUID(), '990e8400-e29b-41d4-a716-446655440011', '50', 'F', TRUE, 5)
ON DUPLICATE KEY UPDATE id=id;

-- ============================================
-- PYTHON LEVEL 3: LOOPS
-- ============================================
INSERT INTO questions (id, level_id, question_type, title, description, difficulty, explanation, concepts) VALUES
    ('990e8400-e29b-41d4-a716-446655440020', '660e8400-e29b-41d4-a716-446655440003', 'mcq', 'For Loop Range', 'What does range(5) produce?', 'easy', 'range(5) produces 0, 1, 2, 3, 4 (5 numbers starting from 0).', '["range", "for"]'),
    ('990e8400-e29b-41d4-a716-446655440021', '660e8400-e29b-41d4-a716-446655440003', 'mcq', 'While Loop Condition', 'When does a while loop stop?', 'easy', 'While loop stops when its condition becomes False.', '["while", "condition"]'),
    ('990e8400-e29b-41d4-a716-446655440022', '660e8400-e29b-41d4-a716-446655440003', 'mcq', 'Break Statement', 'What does break do in a loop?', 'easy', 'break immediately exits the loop.', '["break", "control"]'),
    ('990e8400-e29b-41d4-a716-446655440023', '660e8400-e29b-41d4-a716-446655440003', 'mcq', 'Continue Statement', 'What does continue do in a loop?', 'easy', 'continue skips to the next iteration.', '["continue", "control"]'),
    ('990e8400-e29b-41d4-a716-446655440024', '660e8400-e29b-41d4-a716-446655440003', 'mcq', 'Infinite Loop', 'Which creates an infinite loop?', 'medium', 'while True: creates an infinite loop unless break is used.', '["infinite", "while"]')
ON DUPLICATE KEY UPDATE title=VALUES(title);

INSERT INTO mcq_options (id, question_id, option_text, is_correct, option_letter) VALUES
    (UUID(), '990e8400-e29b-41d4-a716-446655440020', '0, 1, 2, 3, 4', TRUE, 'A'),
    (UUID(), '990e8400-e29b-41d4-a716-446655440020', '1, 2, 3, 4, 5', FALSE, 'B'),
    (UUID(), '990e8400-e29b-41d4-a716-446655440020', '0, 1, 2, 3, 4, 5', FALSE, 'C'),
    (UUID(), '990e8400-e29b-41d4-a716-446655440020', '1, 2, 3, 4', FALSE, 'D'),
    
    (UUID(), '990e8400-e29b-41d4-a716-446655440021', 'When condition is True', FALSE, 'A'),
    (UUID(), '990e8400-e29b-41d4-a716-446655440021', 'When condition is False', TRUE, 'B'),
    (UUID(), '990e8400-e29b-41d4-a716-446655440021', 'After 10 iterations', FALSE, 'C'),
    (UUID(), '990e8400-e29b-41d4-a716-446655440021', 'Never', FALSE, 'D'),
    
    (UUID(), '990e8400-e29b-41d4-a716-446655440022', 'Pauses the loop', FALSE, 'A'),
    (UUID(), '990e8400-e29b-41d4-a716-446655440022', 'Exits the loop completely', TRUE, 'B'),
    (UUID(), '990e8400-e29b-41d4-a716-446655440022', 'Goes to next iteration', FALSE, 'C'),
    (UUID(), '990e8400-e29b-41d4-a716-446655440022', 'Restarts the loop', FALSE, 'D'),
    
    (UUID(), '990e8400-e29b-41d4-a716-446655440023', 'Exits the loop', FALSE, 'A'),
    (UUID(), '990e8400-e29b-41d4-a716-446655440023', 'Skips to next iteration', TRUE, 'B'),
    (UUID(), '990e8400-e29b-41d4-a716-446655440023', 'Pauses execution', FALSE, 'C'),
    (UUID(), '990e8400-e29b-41d4-a716-446655440023', 'Restarts from beginning', FALSE, 'D'),
    
    (UUID(), '990e8400-e29b-41d4-a716-446655440024', 'for i in range(10):', FALSE, 'A'),
    (UUID(), '990e8400-e29b-41d4-a716-446655440024', 'while True:', TRUE, 'B'),
    (UUID(), '990e8400-e29b-41d4-a716-446655440024', 'while x > 0:', FALSE, 'C'),
    (UUID(), '990e8400-e29b-41d4-a716-446655440024', 'for x in list:', FALSE, 'D')
ON DUPLICATE KEY UPDATE id=id;

-- Python Level 3 Coding Questions
INSERT INTO questions (id, level_id, question_type, title, description, difficulty, input_format, output_format, constraints, reference_solution, explanation, concepts) VALUES
    ('990e8400-e29b-41d4-a716-446655440025', '660e8400-e29b-41d4-a716-446655440003', 'coding', 'Sum 1 to N',
     'Given a positive integer N, calculate the sum of all integers from 1 to N.',
     'easy', '5', '15', '1 <= N <= 1000',
     'n = int(input())\ntotal = 0\nfor i in range(1, n + 1):\n    total += i\nprint(total)',
     'Use a for loop with range(1, n+1) to iterate from 1 to N.', '["for", "range", "sum"]'),
    ('990e8400-e29b-41d4-a716-446655440026', '660e8400-e29b-41d4-a716-446655440003', 'coding', 'Factorial',
     'Given a positive integer N, calculate N! (N factorial).',
     'medium', '5', '120', '1 <= N <= 12',
     'n = int(input())\nresult = 1\nfor i in range(1, n + 1):\n    result *= i\nprint(result)',
     'Multiply all numbers from 1 to N using a loop.', '["for", "factorial", "multiplication"]')
ON DUPLICATE KEY UPDATE title=VALUES(title);

INSERT INTO test_cases (id, question_id, input_data, expected_output, is_hidden, test_case_number) VALUES
    (UUID(), '990e8400-e29b-41d4-a716-446655440025', '5', '15', FALSE, 1),
    (UUID(), '990e8400-e29b-41d4-a716-446655440025', '10', '55', FALSE, 2),
    (UUID(), '990e8400-e29b-41d4-a716-446655440025', '1', '1', TRUE, 3),
    (UUID(), '990e8400-e29b-41d4-a716-446655440025', '100', '5050', TRUE, 4),
    
    (UUID(), '990e8400-e29b-41d4-a716-446655440026', '5', '120', FALSE, 1),
    (UUID(), '990e8400-e29b-41d4-a716-446655440026', '3', '6', FALSE, 2),
    (UUID(), '990e8400-e29b-41d4-a716-446655440026', '1', '1', TRUE, 3),
    (UUID(), '990e8400-e29b-41d4-a716-446655440026', '10', '3628800', TRUE, 4)
ON DUPLICATE KEY UPDATE id=id;

-- ============================================
-- PYTHON LEVEL 4: LISTS & ARRAYS
-- ============================================
INSERT INTO questions (id, level_id, question_type, title, description, difficulty, explanation, concepts) VALUES
    ('990e8400-e29b-41d4-a716-446655440030', '660e8400-e29b-41d4-a716-446655440004', 'mcq', 'List Creation', 'How do you create an empty list in Python?', 'easy', 'Use [] or list() to create an empty list.', '["list", "creation"]'),
    ('990e8400-e29b-41d4-a716-446655440031', '660e8400-e29b-41d4-a716-446655440004', 'mcq', 'List Append', 'Which method adds an element to the end of a list?', 'easy', 'append() adds a single element to the end.', '["append", "methods"]'),
    ('990e8400-e29b-41d4-a716-446655440032', '660e8400-e29b-41d4-a716-446655440004', 'mcq', 'List Indexing', 'What is list[0] for list = [10, 20, 30]?', 'easy', 'Index 0 is the first element.', '["indexing", "list"]'),
    ('990e8400-e29b-41d4-a716-446655440033', '660e8400-e29b-41d4-a716-446655440004', 'mcq', 'List Slicing', 'What is list[1:3] for list = [1, 2, 3, 4, 5]?', 'medium', 'Slicing [1:3] returns elements from index 1 up to (not including) 3.', '["slicing", "list"]'),
    ('990e8400-e29b-41d4-a716-446655440034', '660e8400-e29b-41d4-a716-446655440004', 'mcq', 'List Length', 'How do you get the number of elements in a list?', 'easy', 'Use len(list) to get the count of elements.', '["len", "list"]')
ON DUPLICATE KEY UPDATE title=VALUES(title);

INSERT INTO mcq_options (id, question_id, option_text, is_correct, option_letter) VALUES
    (UUID(), '990e8400-e29b-41d4-a716-446655440030', '[]', TRUE, 'A'),
    (UUID(), '990e8400-e29b-41d4-a716-446655440030', '{}', FALSE, 'B'),
    (UUID(), '990e8400-e29b-41d4-a716-446655440030', '()', FALSE, 'C'),
    (UUID(), '990e8400-e29b-41d4-a716-446655440030', 'array()', FALSE, 'D'),
    
    (UUID(), '990e8400-e29b-41d4-a716-446655440031', 'add()', FALSE, 'A'),
    (UUID(), '990e8400-e29b-41d4-a716-446655440031', 'append()', TRUE, 'B'),
    (UUID(), '990e8400-e29b-41d4-a716-446655440031', 'insert()', FALSE, 'C'),
    (UUID(), '990e8400-e29b-41d4-a716-446655440031', 'push()', FALSE, 'D'),
    
    (UUID(), '990e8400-e29b-41d4-a716-446655440032', '10', TRUE, 'A'),
    (UUID(), '990e8400-e29b-41d4-a716-446655440032', '20', FALSE, 'B'),
    (UUID(), '990e8400-e29b-41d4-a716-446655440032', '30', FALSE, 'C'),
    (UUID(), '990e8400-e29b-41d4-a716-446655440032', 'Error', FALSE, 'D'),
    
    (UUID(), '990e8400-e29b-41d4-a716-446655440033', '[1, 2]', FALSE, 'A'),
    (UUID(), '990e8400-e29b-41d4-a716-446655440033', '[2, 3]', TRUE, 'B'),
    (UUID(), '990e8400-e29b-41d4-a716-446655440033', '[2, 3, 4]', FALSE, 'C'),
    (UUID(), '990e8400-e29b-41d4-a716-446655440033', '[1, 2, 3]', FALSE, 'D'),
    
    (UUID(), '990e8400-e29b-41d4-a716-446655440034', 'size(list)', FALSE, 'A'),
    (UUID(), '990e8400-e29b-41d4-a716-446655440034', 'len(list)', TRUE, 'B'),
    (UUID(), '990e8400-e29b-41d4-a716-446655440034', 'count(list)', FALSE, 'C'),
    (UUID(), '990e8400-e29b-41d4-a716-446655440034', 'list.length', FALSE, 'D')
ON DUPLICATE KEY UPDATE id=id;

-- Python Level 4 Coding Questions
INSERT INTO questions (id, level_id, question_type, title, description, difficulty, input_format, output_format, constraints, reference_solution, explanation, concepts) VALUES
    ('990e8400-e29b-41d4-a716-446655440035', '660e8400-e29b-41d4-a716-446655440004', 'coding', 'Find Maximum',
     'Given a list of N integers, find and print the maximum value.',
     'easy', '5\n3 7 2 9 4', '9', '1 <= N <= 1000',
     'n = int(input())\nnums = list(map(int, input().split()))\nprint(max(nums))',
     'Use the built-in max() function.', '["max", "list"]'),
    ('990e8400-e29b-41d4-a716-446655440036', '660e8400-e29b-41d4-a716-446655440004', 'coding', 'Reverse List',
     'Given a list of N integers, print them in reverse order.',
     'easy', '5\n1 2 3 4 5', '5 4 3 2 1', '1 <= N <= 100',
     'n = int(input())\nnums = list(map(int, input().split()))\nprint(" ".join(map(str, nums[::-1])))',
     'Use slicing [::-1] to reverse the list.', '["reverse", "slicing"]')
ON DUPLICATE KEY UPDATE title=VALUES(title);

INSERT INTO test_cases (id, question_id, input_data, expected_output, is_hidden, test_case_number) VALUES
    (UUID(), '990e8400-e29b-41d4-a716-446655440035', '5\n3 7 2 9 4', '9', FALSE, 1),
    (UUID(), '990e8400-e29b-41d4-a716-446655440035', '3\n1 2 3', '3', FALSE, 2),
    (UUID(), '990e8400-e29b-41d4-a716-446655440035', '1\n42', '42', TRUE, 3),
    (UUID(), '990e8400-e29b-41d4-a716-446655440035', '4\n-5 -2 -10 -1', '-1', TRUE, 4),
    
    (UUID(), '990e8400-e29b-41d4-a716-446655440036', '5\n1 2 3 4 5', '5 4 3 2 1', FALSE, 1),
    (UUID(), '990e8400-e29b-41d4-a716-446655440036', '3\n10 20 30', '30 20 10', FALSE, 2),
    (UUID(), '990e8400-e29b-41d4-a716-446655440036', '1\n99', '99', TRUE, 3),
    (UUID(), '990e8400-e29b-41d4-a716-446655440036', '4\n4 3 2 1', '1 2 3 4', TRUE, 4)
ON DUPLICATE KEY UPDATE id=id;

-- ============================================
-- PYTHON LEVEL 5: FUNCTIONS
-- ============================================
INSERT INTO questions (id, level_id, question_type, title, description, difficulty, explanation, concepts) VALUES
    ('990e8400-e29b-41d4-a716-446655440040', '660e8400-e29b-41d4-a716-446655440005', 'mcq', 'Function Definition', 'Which keyword is used to define a function in Python?', 'easy', 'The def keyword is used to define functions.', '["def", "function"]'),
    ('990e8400-e29b-41d4-a716-446655440041', '660e8400-e29b-41d4-a716-446655440005', 'mcq', 'Return Statement', 'What does return do in a function?', 'easy', 'return sends a value back to the caller.', '["return", "function"]'),
    ('990e8400-e29b-41d4-a716-446655440042', '660e8400-e29b-41d4-a716-446655440005', 'mcq', 'Function Parameters', 'What are the values passed to a function called?', 'easy', 'Values passed to functions are called arguments.', '["parameters", "arguments"]'),
    ('990e8400-e29b-41d4-a716-446655440043', '660e8400-e29b-41d4-a716-446655440005', 'mcq', 'Default Parameters', 'What is a default parameter?', 'medium', 'A parameter with a predefined value if not provided.', '["default", "parameters"]'),
    ('990e8400-e29b-41d4-a716-446655440044', '660e8400-e29b-41d4-a716-446655440005', 'mcq', 'Lambda Function', 'What is a lambda function?', 'medium', 'A small anonymous function defined with lambda keyword.', '["lambda", "anonymous"]')
ON DUPLICATE KEY UPDATE title=VALUES(title);

INSERT INTO mcq_options (id, question_id, option_text, is_correct, option_letter) VALUES
    (UUID(), '990e8400-e29b-41d4-a716-446655440040', 'function', FALSE, 'A'),
    (UUID(), '990e8400-e29b-41d4-a716-446655440040', 'def', TRUE, 'B'),
    (UUID(), '990e8400-e29b-41d4-a716-446655440040', 'func', FALSE, 'C'),
    (UUID(), '990e8400-e29b-41d4-a716-446655440040', 'define', FALSE, 'D'),
    
    (UUID(), '990e8400-e29b-41d4-a716-446655440041', 'Prints a value', FALSE, 'A'),
    (UUID(), '990e8400-e29b-41d4-a716-446655440041', 'Sends a value back to caller', TRUE, 'B'),
    (UUID(), '990e8400-e29b-41d4-a716-446655440041', 'Ends the program', FALSE, 'C'),
    (UUID(), '990e8400-e29b-41d4-a716-446655440041', 'Creates a variable', FALSE, 'D'),
    
    (UUID(), '990e8400-e29b-41d4-a716-446655440042', 'Variables', FALSE, 'A'),
    (UUID(), '990e8400-e29b-41d4-a716-446655440042', 'Arguments', TRUE, 'B'),
    (UUID(), '990e8400-e29b-41d4-a716-446655440042', 'Constants', FALSE, 'C'),
    (UUID(), '990e8400-e29b-41d4-a716-446655440042', 'Inputs', FALSE, 'D'),
    
    (UUID(), '990e8400-e29b-41d4-a716-446655440043', 'A required parameter', FALSE, 'A'),
    (UUID(), '990e8400-e29b-41d4-a716-446655440043', 'A parameter with a predefined value', TRUE, 'B'),
    (UUID(), '990e8400-e29b-41d4-a716-446655440043', 'An optional keyword', FALSE, 'C'),
    (UUID(), '990e8400-e29b-41d4-a716-446655440043', 'A global variable', FALSE, 'D'),
    
    (UUID(), '990e8400-e29b-41d4-a716-446655440044', 'A named function', FALSE, 'A'),
    (UUID(), '990e8400-e29b-41d4-a716-446655440044', 'A small anonymous function', TRUE, 'B'),
    (UUID(), '990e8400-e29b-41d4-a716-446655440044', 'A recursive function', FALSE, 'C'),
    (UUID(), '990e8400-e29b-41d4-a716-446655440044', 'A built-in function', FALSE, 'D')
ON DUPLICATE KEY UPDATE id=id;

-- Python Level 5 Coding Questions
INSERT INTO questions (id, level_id, question_type, title, description, difficulty, input_format, output_format, constraints, reference_solution, explanation, concepts) VALUES
    ('990e8400-e29b-41d4-a716-446655440045', '660e8400-e29b-41d4-a716-446655440005', 'coding', 'Square Function',
     'Write a function square(n) that returns the square of a number. Read a number and print its square.',
     'easy', '5', '25', '-1000 <= n <= 1000',
     'def square(n):\n    return n * n\n\nnum = int(input())\nprint(square(num))',
     'Define a function that multiplies the number by itself.', '["function", "return"]'),
    ('990e8400-e29b-41d4-a716-446655440046', '660e8400-e29b-41d4-a716-446655440005', 'coding', 'Is Prime',
     'Write a function is_prime(n) that returns True if n is prime, False otherwise. Print "Prime" or "Not Prime".',
     'medium', '7', 'Prime', '2 <= n <= 1000',
     'def is_prime(n):\n    if n < 2:\n        return False\n    for i in range(2, int(n**0.5) + 1):\n        if n % i == 0:\n            return False\n    return True\n\nnum = int(input())\nprint("Prime" if is_prime(num) else "Not Prime")',
     'Check divisibility up to square root of n.', '["function", "prime", "loops"]')
ON DUPLICATE KEY UPDATE title=VALUES(title);

INSERT INTO test_cases (id, question_id, input_data, expected_output, is_hidden, test_case_number) VALUES
    (UUID(), '990e8400-e29b-41d4-a716-446655440045', '5', '25', FALSE, 1),
    (UUID(), '990e8400-e29b-41d4-a716-446655440045', '0', '0', FALSE, 2),
    (UUID(), '990e8400-e29b-41d4-a716-446655440045', '-3', '9', TRUE, 3),
    (UUID(), '990e8400-e29b-41d4-a716-446655440045', '10', '100', TRUE, 4),
    
    (UUID(), '990e8400-e29b-41d4-a716-446655440046', '7', 'Prime', FALSE, 1),
    (UUID(), '990e8400-e29b-41d4-a716-446655440046', '4', 'Not Prime', FALSE, 2),
    (UUID(), '990e8400-e29b-41d4-a716-446655440046', '2', 'Prime', TRUE, 3),
    (UUID(), '990e8400-e29b-41d4-a716-446655440046', '100', 'Not Prime', TRUE, 4),
    (UUID(), '990e8400-e29b-41d4-a716-446655440046', '97', 'Prime', TRUE, 5)
ON DUPLICATE KEY UPDATE id=id;

-- ============================================
-- C LEVEL 2: CONDITIONALS
-- ============================================
INSERT INTO questions (id, level_id, question_type, title, description, difficulty, explanation, concepts) VALUES
    ('990e8400-e29b-41d4-a716-446655440050', '660e8400-e29b-41d4-a716-446655440012', 'mcq', 'If Syntax in C', 'What is the correct if statement syntax in C?', 'easy', 'C uses parentheses for conditions and curly braces for blocks.', '["if", "syntax"]'),
    ('990e8400-e29b-41d4-a716-446655440051', '660e8400-e29b-41d4-a716-446655440012', 'mcq', 'Else If in C', 'How do you write "else if" in C?', 'easy', 'C uses "else if" (two words) for additional conditions.', '["else if", "conditionals"]'),
    ('990e8400-e29b-41d4-a716-446655440052', '660e8400-e29b-41d4-a716-446655440012', 'mcq', 'Switch Statement', 'What statement is used for multiple exact value comparisons?', 'easy', 'Switch statement efficiently handles multiple cases.', '["switch", "case"]'),
    ('990e8400-e29b-41d4-a716-446655440053', '660e8400-e29b-41d4-a716-446655440012', 'mcq', 'Ternary Operator', 'What is the ternary operator in C?', 'medium', 'The ternary operator ?: is a shorthand for if-else.', '["ternary", "operator"]'),
    ('990e8400-e29b-41d4-a716-446655440054', '660e8400-e29b-41d4-a716-446655440012', 'mcq', 'Break in Switch', 'Why is break needed in switch cases?', 'easy', 'Break prevents fall-through to the next case.', '["break", "switch"]')
ON DUPLICATE KEY UPDATE title=VALUES(title);

INSERT INTO mcq_options (id, question_id, option_text, is_correct, option_letter) VALUES
    (UUID(), '990e8400-e29b-41d4-a716-446655440050', 'if (x > 5) { }', TRUE, 'A'),
    (UUID(), '990e8400-e29b-41d4-a716-446655440050', 'if x > 5:', FALSE, 'B'),
    (UUID(), '990e8400-e29b-41d4-a716-446655440050', 'if [x > 5]', FALSE, 'C'),
    (UUID(), '990e8400-e29b-41d4-a716-446655440050', 'if x > 5 then', FALSE, 'D'),
    
    (UUID(), '990e8400-e29b-41d4-a716-446655440051', 'elif', FALSE, 'A'),
    (UUID(), '990e8400-e29b-41d4-a716-446655440051', 'else if', TRUE, 'B'),
    (UUID(), '990e8400-e29b-41d4-a716-446655440051', 'elseif', FALSE, 'C'),
    (UUID(), '990e8400-e29b-41d4-a716-446655440051', 'elsif', FALSE, 'D'),
    
    (UUID(), '990e8400-e29b-41d4-a716-446655440052', 'case', FALSE, 'A'),
    (UUID(), '990e8400-e29b-41d4-a716-446655440052', 'switch', TRUE, 'B'),
    (UUID(), '990e8400-e29b-41d4-a716-446655440052', 'select', FALSE, 'C'),
    (UUID(), '990e8400-e29b-41d4-a716-446655440052', 'match', FALSE, 'D'),
    
    (UUID(), '990e8400-e29b-41d4-a716-446655440053', '?:', TRUE, 'A'),
    (UUID(), '990e8400-e29b-41d4-a716-446655440053', '??', FALSE, 'B'),
    (UUID(), '990e8400-e29b-41d4-a716-446655440053', ':?', FALSE, 'C'),
    (UUID(), '990e8400-e29b-41d4-a716-446655440053', '?', FALSE, 'D'),
    
    (UUID(), '990e8400-e29b-41d4-a716-446655440054', 'To exit the program', FALSE, 'A'),
    (UUID(), '990e8400-e29b-41d4-a716-446655440054', 'To prevent fall-through', TRUE, 'B'),
    (UUID(), '990e8400-e29b-41d4-a716-446655440054', 'It is optional', FALSE, 'C'),
    (UUID(), '990e8400-e29b-41d4-a716-446655440054', 'To improve performance', FALSE, 'D')
ON DUPLICATE KEY UPDATE id=id;

-- C Level 2 Coding Questions
INSERT INTO questions (id, level_id, question_type, title, description, difficulty, input_format, output_format, constraints, reference_solution, explanation, concepts) VALUES
    ('990e8400-e29b-41d4-a716-446655440055', '660e8400-e29b-41d4-a716-446655440012', 'coding', 'Absolute Value',
     'Given an integer, print its absolute value.',
     'easy', '-5', '5', '-1000 <= n <= 1000',
     '#include <stdio.h>\nint main() {\n    int n;\n    scanf("%d", &n);\n    if (n < 0) n = -n;\n    printf("%d", n);\n    return 0;\n}',
     'Use if statement to negate negative numbers.', '["if", "absolute"]'),
    ('990e8400-e29b-41d4-a716-446655440056', '660e8400-e29b-41d4-a716-446655440012', 'coding', 'Max of Three',
     'Given three integers, print the maximum.',
     'easy', '5 10 3', '10', '-1000 <= a, b, c <= 1000',
     '#include <stdio.h>\nint main() {\n    int a, b, c, max;\n    scanf("%d %d %d", &a, &b, &c);\n    max = a;\n    if (b > max) max = b;\n    if (c > max) max = c;\n    printf("%d", max);\n    return 0;\n}',
     'Compare each number to find the maximum.', '["if", "comparison"]')
ON DUPLICATE KEY UPDATE title=VALUES(title);

INSERT INTO test_cases (id, question_id, input_data, expected_output, is_hidden, test_case_number) VALUES
    (UUID(), '990e8400-e29b-41d4-a716-446655440055', '-5', '5', FALSE, 1),
    (UUID(), '990e8400-e29b-41d4-a716-446655440055', '10', '10', FALSE, 2),
    (UUID(), '990e8400-e29b-41d4-a716-446655440055', '0', '0', TRUE, 3),
    (UUID(), '990e8400-e29b-41d4-a716-446655440055', '-999', '999', TRUE, 4),
    
    (UUID(), '990e8400-e29b-41d4-a716-446655440056', '5 10 3', '10', FALSE, 1),
    (UUID(), '990e8400-e29b-41d4-a716-446655440056', '1 1 1', '1', FALSE, 2),
    (UUID(), '990e8400-e29b-41d4-a716-446655440056', '-5 -2 -10', '-2', TRUE, 3),
    (UUID(), '990e8400-e29b-41d4-a716-446655440056', '100 50 75', '100', TRUE, 4)
ON DUPLICATE KEY UPDATE id=id;

-- ============================================
-- C LEVEL 3: LOOPS
-- ============================================
INSERT INTO questions (id, level_id, question_type, title, description, difficulty, explanation, concepts) VALUES
    ('990e8400-e29b-41d4-a716-446655440060', '660e8400-e29b-41d4-a716-446655440013', 'mcq', 'For Loop Parts', 'How many parts does a for loop have in C?', 'easy', 'For loop has 3 parts: initialization, condition, increment.', '["for", "structure"]'),
    ('990e8400-e29b-41d4-a716-446655440061', '660e8400-e29b-41d4-a716-446655440013', 'mcq', 'While vs Do-While', 'When is the condition checked in a do-while loop?', 'easy', 'Do-while checks condition after executing the body.', '["do-while", "condition"]'),
    ('990e8400-e29b-41d4-a716-446655440062', '660e8400-e29b-41d4-a716-446655440013', 'mcq', 'Loop Counter', 'What is incorrect: for(int i = 0; i < 5; i++)?', 'easy', 'This syntax is correct in C99 and later.', '["for", "syntax"]'),
    ('990e8400-e29b-41d4-a716-446655440063', '660e8400-e29b-41d4-a716-446655440013', 'mcq', 'Nested Loops', 'Can loops be nested in C?', 'easy', 'Yes, loops can be nested to any depth.', '["nested", "loops"]'),
    ('990e8400-e29b-41d4-a716-446655440064', '660e8400-e29b-41d4-a716-446655440013', 'mcq', 'Continue Statement', 'What happens after continue in a for loop?', 'medium', 'Control jumps to the increment expression.', '["continue", "for"]')
ON DUPLICATE KEY UPDATE title=VALUES(title);

INSERT INTO mcq_options (id, question_id, option_text, is_correct, option_letter) VALUES
    (UUID(), '990e8400-e29b-41d4-a716-446655440060', '2', FALSE, 'A'),
    (UUID(), '990e8400-e29b-41d4-a716-446655440060', '3', TRUE, 'B'),
    (UUID(), '990e8400-e29b-41d4-a716-446655440060', '4', FALSE, 'C'),
    (UUID(), '990e8400-e29b-41d4-a716-446655440060', '1', FALSE, 'D'),
    
    (UUID(), '990e8400-e29b-41d4-a716-446655440061', 'Before the loop body', FALSE, 'A'),
    (UUID(), '990e8400-e29b-41d4-a716-446655440061', 'After the loop body', TRUE, 'B'),
    (UUID(), '990e8400-e29b-41d4-a716-446655440061', 'During the loop', FALSE, 'C'),
    (UUID(), '990e8400-e29b-41d4-a716-446655440061', 'Never', FALSE, 'D'),
    
    (UUID(), '990e8400-e29b-41d4-a716-446655440062', 'The declaration', FALSE, 'A'),
    (UUID(), '990e8400-e29b-41d4-a716-446655440062', 'Nothing is incorrect', TRUE, 'B'),
    (UUID(), '990e8400-e29b-41d4-a716-446655440062', 'The condition', FALSE, 'C'),
    (UUID(), '990e8400-e29b-41d4-a716-446655440062', 'The increment', FALSE, 'D'),
    
    (UUID(), '990e8400-e29b-41d4-a716-446655440063', 'Yes', TRUE, 'A'),
    (UUID(), '990e8400-e29b-41d4-a716-446655440063', 'No', FALSE, 'B'),
    (UUID(), '990e8400-e29b-41d4-a716-446655440063', 'Only 2 levels', FALSE, 'C'),
    (UUID(), '990e8400-e29b-41d4-a716-446655440063', 'Only with while', FALSE, 'D'),
    
    (UUID(), '990e8400-e29b-41d4-a716-446655440064', 'Exits the loop', FALSE, 'A'),
    (UUID(), '990e8400-e29b-41d4-a716-446655440064', 'Goes to increment', TRUE, 'B'),
    (UUID(), '990e8400-e29b-41d4-a716-446655440064', 'Restarts from beginning', FALSE, 'C'),
    (UUID(), '990e8400-e29b-41d4-a716-446655440064', 'Skips increment', FALSE, 'D')
ON DUPLICATE KEY UPDATE id=id;

-- C Level 3 Coding Questions
INSERT INTO questions (id, level_id, question_type, title, description, difficulty, input_format, output_format, constraints, reference_solution, explanation, concepts) VALUES
    ('990e8400-e29b-41d4-a716-446655440065', '660e8400-e29b-41d4-a716-446655440013', 'coding', 'Print Numbers',
     'Print numbers from 1 to N, each on a new line.',
     'easy', '5', '1\n2\n3\n4\n5', '1 <= N <= 100',
     '#include <stdio.h>\nint main() {\n    int n;\n    scanf("%d", &n);\n    for (int i = 1; i <= n; i++) {\n        printf("%d\\n", i);\n    }\n    return 0;\n}',
     'Use a for loop from 1 to N.', '["for", "printing"]'),
    ('990e8400-e29b-41d4-a716-446655440066', '660e8400-e29b-41d4-a716-446655440013', 'coding', 'Sum of N Numbers',
     'Calculate the sum of integers from 1 to N.',
     'easy', '10', '55', '1 <= N <= 1000',
     '#include <stdio.h>\nint main() {\n    int n, sum = 0;\n    scanf("%d", &n);\n    for (int i = 1; i <= n; i++) {\n        sum += i;\n    }\n    printf("%d", sum);\n    return 0;\n}',
     'Accumulate sum in a loop or use formula n*(n+1)/2.', '["for", "sum"]')
ON DUPLICATE KEY UPDATE title=VALUES(title);

INSERT INTO test_cases (id, question_id, input_data, expected_output, is_hidden, test_case_number) VALUES
    (UUID(), '990e8400-e29b-41d4-a716-446655440065', '5', '1\n2\n3\n4\n5', FALSE, 1),
    (UUID(), '990e8400-e29b-41d4-a716-446655440065', '3', '1\n2\n3', FALSE, 2),
    (UUID(), '990e8400-e29b-41d4-a716-446655440065', '1', '1', TRUE, 3),
    (UUID(), '990e8400-e29b-41d4-a716-446655440065', '10', '1\n2\n3\n4\n5\n6\n7\n8\n9\n10', TRUE, 4),
    
    (UUID(), '990e8400-e29b-41d4-a716-446655440066', '10', '55', FALSE, 1),
    (UUID(), '990e8400-e29b-41d4-a716-446655440066', '5', '15', FALSE, 2),
    (UUID(), '990e8400-e29b-41d4-a716-446655440066', '1', '1', TRUE, 3),
    (UUID(), '990e8400-e29b-41d4-a716-446655440066', '100', '5050', TRUE, 4)
ON DUPLICATE KEY UPDATE id=id;

SELECT 'Level-specific content seed completed!' AS status;
