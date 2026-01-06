import pool from '../config/database';

const runMigration = async () => {
    try {
        console.log('Starting migration...');

        // 1. Add learning_materials column if not exists
        try {
            await pool.query(`
        ALTER TABLE levels 
        ADD COLUMN learning_materials TEXT
      `);
            console.log('Added learning_materials column');
        } catch (error: any) {
            if (error.code === 'ER_DUP_FIELDNAME') {
                console.log('learning_materials column already exists');
            } else {
                throw error;
            }
        }

        // 2. Update C Programming Levels (ID: 550e8400-e29b-41d4-a716-446655440002)
        const cCourseId = '550e8400-e29b-41d4-a716-446655440002';

        // Level 1: Introduction
        await pool.query(`
      UPDATE levels 
      SET title = 'Introduction to C', 
          description = 'Basic syntax, variables, and data types',
          learning_materials = ?
      WHERE id = '660e8400-e29b-41d4-a716-446655440011'
    `, [JSON.stringify([
            { title: 'C Introduction', url: 'https://www.w3schools.com/c/c_intro.php', type: 'article' },
            { title: 'C Syntax', url: 'https://www.w3schools.com/c/c_syntax.php', type: 'article' }
        ])]);

        // Level 2: Conditionals
        await pool.query(`
      UPDATE levels 
      SET title = 'Conditionals', 
          description = 'If, Else If, Else, and Switch statements',
          learning_materials = ?
      WHERE id = '660e8400-e29b-41d4-a716-446655440012'
    `, [JSON.stringify([
            { title: 'C Conditions', url: 'https://www.w3schools.com/c/c_conditions.php', type: 'article' },
            { title: 'C Switch', url: 'https://www.w3schools.com/c/c_switch.php', type: 'article' }
        ])]);

        // Level 3: Loops
        await pool.query(`
      UPDATE levels 
      SET title = 'Loops', 
          description = 'While, Do-While, and For loops',
          learning_materials = ?
      WHERE id = '660e8400-e29b-41d4-a716-446655440013'
    `, [JSON.stringify([
            { title: 'C While Loop', url: 'https://www.w3schools.com/c/c_while_loops.php', type: 'article' },
            { title: 'C For Loop', url: 'https://www.w3schools.com/c/c_for_loop.php', type: 'article' }
        ])]);

        // Level 4: Arrays
        await pool.query(`
      UPDATE levels 
      SET title = 'Arrays', 
          description = 'Working with Arrays',
          learning_materials = ?
      WHERE id = '660e8400-e29b-41d4-a716-446655440014'
    `, [JSON.stringify([
            { title: 'C Arrays', url: 'https://www.w3schools.com/c/c_arrays.php', type: 'article' }
        ])]);

        // Level 5: Strings
        await pool.query(`
      UPDATE levels 
      SET title = 'Strings', 
          description = 'Working with Strings',
          learning_materials = ?
      WHERE id = '660e8400-e29b-41d4-a716-446655440015'
    `, [JSON.stringify([
            { title: 'C Strings', url: 'https://www.w3schools.com/c/c_strings.php', type: 'article' }
        ])]);

        // Level 6: Functions
        await pool.query(`
      UPDATE levels 
      SET title = 'Functions', 
          description = 'Creating and calling functions',
          learning_materials = ?
      WHERE id = '660e8400-e29b-41d4-a716-446655440016'
    `, [JSON.stringify([
            { title: 'C Functions', url: 'https://www.w3schools.com/c/c_functions.php', type: 'article' }
        ])]);


        // 3. Clear Old Questions for these levels (to avoid topic mismatch)
        const levelIds = [
            '660e8400-e29b-41d4-a716-446655440011',
            '660e8400-e29b-41d4-a716-446655440012',
            '660e8400-e29b-41d4-a716-446655440013',
            '660e8400-e29b-41d4-a716-446655440014',
            '660e8400-e29b-41d4-a716-446655440015',
            '660e8400-e29b-41d4-a716-446655440016'
        ];

        // Check if we need to delete questions. 
        // We will delete ALL questions for these levels and re-insert.
        // Assuming simple UUID usage, we don't need to preserve old question IDs for this refactor.
        await pool.query('DELETE FROM questions WHERE level_id IN (?)', [levelIds]);
        console.log('Cleared old questions');

        // 4. Insert New Questions
        const questions = [
            // Level 1: Intro
            {
                level_id: '660e8400-e29b-41d4-a716-446655440011',
                title: 'Hello World',
                description: 'Write a program that prints "Hello World!"',
                input_format: 'None',
                output_format: 'Hello World!',
                reference: '#include <stdio.h>\nint main() {\n    printf("Hello World!");\n    return 0;\n}',
                test_cases: [{ input: '', output: 'Hello World!', hidden: false }]
            },
            {
                level_id: '660e8400-e29b-41d4-a716-446655440011',
                title: 'Print Integer',
                description: 'Read an integer from input and print it.',
                input_format: 'A single integer',
                output_format: 'The integer',
                reference: '#include <stdio.h>\nint main() {\n    int n;\n    scanf("%d", &n);\n    printf("%d", n);\n    return 0;\n}',
                test_cases: [{ input: '5', output: '5', hidden: false }, { input: '100', output: '100', hidden: false }]
            },
            // Level 2: Conditionals
            {
                level_id: '660e8400-e29b-41d4-a716-446655440012',
                title: 'Positive or Negative',
                description: 'Check if a number is positive, negative or zero.',
                input_format: 'An integer',
                output_format: 'Positive, Negative, or Zero',
                reference: '...',
                test_cases: [{ input: '5', output: 'Positive', hidden: false }, { input: '-2', output: 'Negative', hidden: false }]
            },
            {
                level_id: '660e8400-e29b-41d4-a716-446655440012',
                title: 'Even or Odd',
                description: 'Check if a number is even or odd.',
                input_format: 'An integer',
                output_format: 'Even or Odd',
                reference: '...',
                test_cases: [{ input: '4', output: 'Even', hidden: false }, { input: '7', output: 'Odd', hidden: false }]
            },
            // Level 3: Loops
            {
                level_id: '660e8400-e29b-41d4-a716-446655440013',
                title: 'Print 1 to N',
                description: 'Print numbers from 1 to N separated by space.',
                input_format: 'Integer N',
                output_format: '1 2 ... N',
                reference: '...',
                test_cases: [{ input: '5', output: '1 2 3 4 5', hidden: false }]
            },
            {
                level_id: '660e8400-e29b-41d4-a716-446655440013',
                title: 'Sum of N Numbers',
                description: 'Calculate sum of first N natural numbers.',
                input_format: 'Integer N',
                output_format: 'Sum',
                reference: '...',
                test_cases: [{ input: '5', output: '15', hidden: false }]
            },
            // Level 4: Arrays
            {
                level_id: '660e8400-e29b-41d4-a716-446655440014',
                title: 'Array Sum',
                description: 'Calculate sum of array elements.',
                input_format: 'N followed by N integers',
                output_format: 'Sum',
                reference: '...',
                test_cases: [{ input: '3\n1 2 3', output: '6', hidden: false }]
            },
            {
                level_id: '660e8400-e29b-41d4-a716-446655440014',
                title: 'Reverse Array',
                description: 'Print array in reverse order.',
                input_format: 'N followed by N integers',
                output_format: 'Reversed elements',
                reference: '...',
                test_cases: [{ input: '3\n1 2 3', output: '3 2 1', hidden: false }]
            },
            // Level 5: Strings
            {
                level_id: '660e8400-e29b-41d4-a716-446655440015',
                title: 'String Length',
                description: 'Find length of a string without using library function.',
                input_format: 'A string',
                output_format: 'Length',
                reference: '...',
                test_cases: [{ input: 'hello', output: '5', hidden: false }]
            },
            {
                level_id: '660e8400-e29b-41d4-a716-446655440015',
                title: 'Count Vowels',
                description: 'Count vowels in a string.',
                input_format: 'A string',
                output_format: 'Count',
                reference: '...',
                test_cases: [{ input: 'hello', output: '2', hidden: false }]
            },
            // Level 6: Functions
            {
                level_id: '660e8400-e29b-41d4-a716-446655440016',
                title: 'Add Two Numbers',
                description: 'Write a function add(a, b) that returns sum.',
                input_format: 'Two integers',
                output_format: 'Sum',
                reference: '...',
                test_cases: [{ input: '3 4', output: '7', hidden: false }]

            },
            {
                level_id: '660e8400-e29b-41d4-a716-446655440016',
                title: 'Factorial Function',
                description: 'Write a function factorial(n).',
                input_format: 'Integer N',
                output_format: 'Factorial',
                reference: '...',
                test_cases: [{ input: '5', output: '120', hidden: false }]
            }
        ];

        const { v4: uuidv4 } = require('uuid');

        for (const q of questions) {
            const qId = uuidv4();
            await pool.query(`
            INSERT INTO questions (id, level_id, question_type, title, description, input_format, output_format, reference_solution, difficulty)
            VALUES (?, ?, 'coding', ?, ?, ?, ?, ?, 'easy')
        `, [qId, q.level_id, q.title, q.description, q.input_format, q.output_format, q.reference]);

            // Insert Test Cases
            for (const tc of q.test_cases) {
                const tcId = uuidv4();
                await pool.query(`
                INSERT INTO test_cases (id, question_id, input_data, expected_output, is_hidden, test_case_number)
                VALUES (?, ?, ?, ?, ?, 1)
            `, [tcId, qId, tc.input, tc.output, tc.hidden]);
            }
        }

        console.log('Inserted new questions');

        console.log('Migration completed successfully');
        process.exit(0);

    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

runMigration();
