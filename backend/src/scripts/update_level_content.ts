
import pool from '../config/database';
import { getRows } from '../utils/mysqlHelper';

const updateLevelContent = async () => {
    try {
        console.log('Starting Level Content Update...');

        // 1. Remove Test Course 101
        console.log('Removing Test Course 101...');
        await pool.query("DELETE FROM courses WHERE title LIKE '%Test Course%' OR title = 'Test Course 101'");

        // 2. Define standard courses and their Level 1 content
        const level1Content = {
            "C Programming": {
                introduction: "C is a powerful general-purpose programming language. It is fast, portable, and available on all platforms. If you are new to programming, C is a great choice to start your journey.",
                concepts: [
                    { title: "Variables", explanation: "Containers for storing data values, like numbers and characters." },
                    { title: "Data Types", explanation: "Specifies the type of data a variable can hold (int, float, char, etc)." },
                    { title: "Input/Output", explanation: "Using printf() to display output and scanf() to take user input." }
                ],
                resources: [
                    { title: "W3Schools C Tutorial", url: "https://www.w3schools.com/c/index.php", type: "article" },
                    { title: "GeeksforGeeks C Programming", url: "https://www.geeksforgeeks.org/c-programming-language/", type: "article" },
                    { title: "Programiz C Guide", url: "https://www.programiz.com/c-programming", type: "article" }
                ],
                example_code: `#include <stdio.h>\n\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}`
            },
            "Python": {
                introduction: "Python is a high-level, interpreted programming language known for its easy readability and versatility. It is widely used in web development, data science, and artificial intelligence.",
                concepts: [
                    { title: "Syntax", explanation: "Python uses indentation to define blocks of code, making it clean and readable." },
                    { title: "Variables", explanation: "No command for declaring a variable; created the moment you first assign a value to it." },
                    { title: "Comments", explanation: "Lines starting with # are comments and are ignored by the interpreter." }
                ],
                resources: [
                    { title: "W3Schools Python", url: "https://www.w3schools.com/python/", type: "article" },
                    { title: "Python Official Docs", url: "https://docs.python.org/3/tutorial/", type: "article" },
                    { title: "GeeksforGeeks Python", url: "https://www.geeksforgeeks.org/python-programming-language/", type: "article" }
                ],
                example_code: `# This is a comment\nprint("Hello, World!")\n\nx = 5\ny = "John"\nprint(x)\nprint(y)`
            },
            "Java": {
                introduction: "Java is a popular programming language, created in 1995. It is owned by Oracle, and more than 3 billion devices run Java. It is used for mobile apps, web apps, desktop apps, games and much more.",
                concepts: [
                    { title: "JVM", explanation: "Java Virtual Machine - executes Java bytecode." },
                    { title: "Classes & Objects", explanation: "Java is object-oriented. Everything is associated with classes and objects." },
                    { title: "Main Method", explanation: "The entry point for any Java application." }
                ],
                resources: [
                    { title: "W3Schools Java", url: "https://www.w3schools.com/java/", type: "article" },
                    { title: "GeeksforGeeks Java", url: "https://www.geeksforgeeks.org/java/", type: "article" },
                    { title: "Oracle Java Docs", url: "https://docs.oracle.com/en/java/", type: "article" }
                ],
                example_code: `public class Main {\n  public static void main(String[] args) {\n    System.out.println("Hello World");\n  }\n}`
            },
            "Data Structures & Algorithms": {
                introduction: "Data Structures and Algorithms (DSA) is the foundation of efficient programming. It involves organizing data and solving problems effectively.",
                concepts: [
                    { title: "Time Complexity", explanation: "How the run time of an algorithm increases as the size of input increases." },
                    { title: "Arrays", explanation: "A collection of items stored at contiguous memory locations." },
                    { title: "Big O Notation", explanation: "Mathematical notation to describe the limiting behavior of a function." }
                ],
                resources: [
                    { title: "GeeksforGeeks DSA", url: "https://www.geeksforgeeks.org/data-structures/", type: "article" },
                    { title: "W3Schools DSA", url: "https://www.w3schools.com/dsa/", type: "article" }
                ],
                example_code: `// Array Traversal\nint arr[] = {1, 2, 3, 4, 5};\nfor(int i=0; i<5; i++) {\n    printf("%d ", arr[i]);\n}`
            },
            "C++": {
                introduction: "C++ is a cross-platform language that can be used to create high-performance applications. It gives programmers high control over system resources and memory.",
                concepts: [
                    { title: "OOP", explanation: "Object-Oriented Programming (Classes, Objects, Inheritance)." },
                    { title: "STL", explanation: "Standard Template Library - set of C++ template classes to provide common programming data structures." },
                    { title: "Pointers", explanation: "Variables that store the memory address of another variable." }
                ],
                resources: [
                    { title: "W3Schools C++", url: "https://www.w3schools.com/cpp/", type: "article" },
                    { title: "GeeksforGeeks C++", url: "https://www.geeksforgeeks.org/c-plus-plus/", type: "article" }
                ],
                example_code: `#include <iostream>\nusing namespace std;\n\nint main() {\n  cout << "Hello World!";\n  return 0;\n}`
            }
        };

        // 3. Update Level 1 for each course
        for (const [courseTitle, content] of Object.entries(level1Content)) {
            const courseResult = await pool.query("SELECT id FROM courses WHERE title = ?", [courseTitle]);
            const courseRows = getRows(courseResult);

            if (courseRows.length > 0) {
                const courseId = courseRows[0].id;
                console.log(`Updating Level 1 for ${courseTitle}...`);

                const learningMaterials = JSON.stringify({
                    introduction: content.introduction,
                    concepts: content.concepts,
                    resources: content.resources
                });

                await pool.query(
                    `UPDATE levels 
                     SET description = ?, 
                         learning_materials = ?, 
                         code_snippet = ? 
                     WHERE course_id = ? AND level_number = 1`,
                    [content.introduction, learningMaterials, content.example_code, courseId]
                );
            } else {
                console.log(`Course ${courseTitle} not found, skipping...`);
            }
        }

        console.log('Update Complete!');
        process.exit(0);

    } catch (error) {
        console.error('Update Failed:', error);
        process.exit(1);
    }
};

updateLevelContent();
