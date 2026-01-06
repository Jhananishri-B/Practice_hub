import pool from '../config/database';

const levels = [
    {
        // Level 1: Introduction
        id: '660e8400-e29b-41d4-a716-446655440011',
        materials: [
            { title: 'C Introduction', url: 'https://www.w3schools.com/c/c_intro.php' },
            { title: 'C Syntax', url: 'https://www.w3schools.com/c/c_syntax.php' },
            { title: 'C Output', url: 'https://www.w3schools.com/c/c_output.php' },
            { title: 'C Comments', url: 'https://www.w3schools.com/c/c_comments.php' },
            { title: 'GeeksForGeeks: C Language', url: 'https://www.geeksforgeeks.org/c-programming-language/' }
        ],
        code_snippet: `#include <stdio.h>\n\nint main() { \n  printf("Hello World!"); \n  return 0; \n } `
    },
    {
        // Level 2: Conditionals
        id: '660e8400-e29b-41d4-a716-446655440012',
        materials: [
            { title: 'C If...Else', url: 'https://www.w3schools.com/c/c_conditions.php' },
            { title: 'C Switch', url: 'https://www.w3schools.com/c/c_switch.php' },
            { title: 'Using Ternary Operator', url: 'https://www.w3schools.com/c/c_conditions_short_hand.php' },
            { title: 'GeeksForGeeks: Decision Making', url: 'https://www.geeksforgeeks.org/decision-making-c-c-else-nested-else/' }
        ],
        code_snippet: `#include <stdio.h>\n\nint main() { \n  int x = 20; \n  int y = 18; \n  if (x > y) { \n    printf("x is greater than y"); \n } \n  return 0; \n } `
    },
    {
        // Level 3: Loops
        id: '660e8400-e29b-41d4-a716-446655440013',
        materials: [
            { title: 'C While Loop', url: 'https://www.w3schools.com/c/c_while_loop.php' },
            { title: 'C For Loop', url: 'https://www.w3schools.com/c/c_for_loop.php' },
            { title: 'C Break and Continue', url: 'https://www.w3schools.com/c/c_break_continue.php' },
            { title: 'GeeksForGeeks: Loops in C', url: 'https://www.geeksforgeeks.org/loops-in-c/' }
        ],
        code_snippet: `#include <stdio.h>\n\nint main() { \n  int i; \n  for (i = 0; i < 5; i++) { \n    printf("%d\\n", i); \n } \n  return 0; \n } `
    },
    {
        // Level 4: Arrays
        id: '660e8400-e29b-41d4-a716-446655440014',
        materials: [
            { title: 'C Arrays', url: 'https://www.w3schools.com/c/c_arrays.php' },
            { title: 'GeeksForGeeks: Arrays in C', url: 'https://www.geeksforgeeks.org/c-arrays/' }
        ],
        code_snippet: `#include <stdio.h>\n\nint main() { \n  int myNumbers[] = { 25, 50, 75, 100}; \n  printf("%d", myNumbers[0]); \n  return 0; \n } `
    },
    {
        // Level 5: Strings
        id: '660e8400-e29b-41d4-a716-446655440015',
        materials: [
            { title: 'C Strings', url: 'https://www.w3schools.com/c/c_strings.php' },
            { title: 'String Functions', url: 'https://www.w3schools.com/c/c_strings_functions.php' },
            { title: 'GeeksForGeeks: Strings in C', url: 'https://www.geeksforgeeks.org/strings-in-c/' }
        ],
        code_snippet: `#include <stdio.h>\n\nint main() { \n  char greetings[] = "Hello World!"; \n  printf("%s", greetings); \n  return 0; \n } `
    },
    {
        // Level 6: Functions
        id: '660e8400-e29b-41d4-a716-446655440016',
        materials: [
            { title: 'C Functions', url: 'https://www.w3schools.com/c/c_functions.php' },
            { title: 'Function Parameters', url: 'https://www.w3schools.com/c/c_functions_parameters.php' },
            { title: 'Recursion', url: 'https://www.w3schools.com/c/c_recursion.php' },
            { title: 'GeeksForGeeks: C Functions', url: 'https://www.geeksforgeeks.org/c-functions/' }
        ],
        code_snippet: `#include <stdio.h>\n\nvoid myFunction() { \n  printf("I just got executed!"); \n } \n\nint main() { \n  myFunction(); \n  return 0; \n } `
    }
];

const updateResources = async () => {
    try {
        console.log("Updating Learning Materials...");
        for (const level of levels) {
            const json = JSON.stringify(level.materials);
            await pool.query('UPDATE levels SET learning_materials = ?, code_snippet = ? WHERE id = ?', [json, level.code_snippet, level.id]);
            console.log(`Updated Level ${level.id} `);
        }
        console.log("All levels updated successfully.");
        process.exit(0);
    } catch (e) {
        console.error("Failed to update resources:", e);
        process.exit(1);
    }
};

updateResources();
