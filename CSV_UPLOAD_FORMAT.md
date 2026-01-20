# CSV Upload Format Guide

This document describes the expected CSV column formats for uploading questions to the Practice Hub admin panel.

## MCQ Questions

### Required Columns

| Column Name | Description | Example |
|------------|-------------|---------|
| `title` | Problem title/question title | "What is Machine Learning?" |
| `description` | Question description/problem statement | "Machine Learning is a subset of..." |
| `option1` | First option text | "A field of AI that enables computers to learn" |
| `option2` | Second option text | "A programming language" |
| `option3` | Third option text | "A database system" |
| `option4` | Fourth option text | "A web framework" |
| `correct_option` | Must exactly match one of option1-option4 (case-insensitive) | "A field of AI that enables computers to learn" |
| `difficulty` | Must be one of: `easy`, `medium`, `hard` | "medium" |

### Example CSV for MCQ

```csv
title,description,option1,option2,option3,option4,correct_option,difficulty
What is ML?,Machine Learning is...,A field of AI,Programing language,Database,Web framework,A field of AI,easy
Supervised Learning,Supervised learning uses...,Labeled data,Unlabeled data,No data,Random data,Labeled data,medium
```

### Important Notes

- All columns are **case-insensitive** (spaces are converted to underscores by the parser)
- `correct_option` must **exactly match** one of the four options (option1, option2, option3, or option4) - comparison is case-insensitive
- `difficulty` must be exactly one of: `easy`, `medium`, `hard` (case-insensitive)
- At least 2 options must be non-empty
- Empty values are allowed for optional fields but not for required fields

---

## Coding Questions

### Required Columns

| Column Name | Description | Example |
|------------|-------------|---------|
| `title` | Problem title | "Two Sum" |
| `description` | Problem description/statement | "Given an array of integers..." |
| `reference_solution` | Solution code in any language | "def two_sum(nums, target):\n    ..." |
| `difficulty` | Must be one of: `easy`, `medium`, `hard` | "easy" |

### Optional Columns

| Column Name | Description | Example |
|------------|-------------|---------|
| `input_format` | Description of input format | "First line contains n, next n lines contain integers" |
| `output_format` | Description of output format | "Print a single integer" |
| `constraints` | Problem constraints | "1 <= n <= 1000" |
| `test_case_1_input` | First test case input | "5\n1 2 3 4 5" |
| `test_case_1_output` | First test case expected output | "15" |
| `test_case_1_hidden` | Whether test case 1 is hidden (true/false) | "false" |
| `test_case_2_input` | Second test case input | "10\n..." |
| `test_case_2_output` | Second test case expected output | "..." |
| `test_case_2_hidden` | Whether test case 2 is hidden (true/false) | "true" |

### Example CSV for Coding

```csv
title,description,input_format,output_format,constraints,reference_solution,difficulty,test_case_1_input,test_case_1_output,test_case_1_hidden,test_case_2_input,test_case_2_output,test_case_2_hidden
Two Sum,Given an array...,First line: n and target,Print indices,1 <= n <= 10000,def two_sum(nums, target):...,easy,5 9\n1 2 3 4 5,0 4,false,10 15\n1 2 3 4 5 6 7 8 9 10,0 14,true
```

### Important Notes

- **Required columns**: `title`, `description`, `reference_solution`, `difficulty`
- **Optional columns**: `input_format`, `output_format`, `constraints`
- **Test cases**: Optional but recommended. Format: `test_case_{N}_input`, `test_case_{N}_output`, `test_case_{N}_hidden`
- If no test cases are provided, a default empty test case will be created
- Test case numbering starts at 1 (`test_case_1_input`, `test_case_2_input`, etc.)
- `test_case_{N}_hidden` should be `"true"` or `"false"` (strings)
- All columns are **case-insensitive** (spaces are converted to underscores by the parser)

---

## Database Schema Reference

### Questions Table
- `id` (UUID, auto-generated)
- `level_id` (UUID, from URL parameter)
- `question_type` (enum: 'coding', 'mcq' - set automatically)
- `title` (VARCHAR 255)
- `description` (TEXT)
- `difficulty` (enum: 'easy', 'medium', 'hard')
- `input_format` (TEXT, coding only)
- `output_format` (TEXT, coding only)
- `constraints` (TEXT, coding only)
- `reference_solution` (TEXT, coding only)

### MCQ Options Table
- `id` (UUID, auto-generated)
- `question_id` (UUID, foreign key)
- `option_text` (TEXT)
- `is_correct` (BOOLEAN)
- `option_letter` (VARCHAR 1: 'A', 'B', 'C', 'D' - auto-assigned)

### Test Cases Table
- `id` (UUID, auto-generated)
- `question_id` (UUID, foreign key)
- `input_data` (TEXT)
- `expected_output` (TEXT)
- `is_hidden` (BOOLEAN)
- `test_case_number` (INTEGER, auto-assigned)

---

## Upload Instructions

1. Open the admin panel and navigate to the desired course level
2. Click the **"Import CSV"** button
3. Select **MCQ** or **Coding** question type
4. Ensure your CSV file has the correct column headers (exact match required)
5. Upload the CSV file
6. Review any errors displayed and correct your CSV if needed

## Common Errors

- **Missing required columns**: Ensure all required columns are present in the CSV header
- **correct_option mismatch**: The `correct_option` value must exactly match one of the option texts (case-insensitive)
- **Invalid difficulty**: Must be exactly `easy`, `medium`, or `hard`
- **Empty required fields**: `title`, `description`, and `correct_option` (MCQ) or `reference_solution` (coding) cannot be empty
