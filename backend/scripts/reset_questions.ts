import pool from '../src/config/database';
import { getRows } from '../src/utils/mysqlHelper';

async function resetQuestions() {
    console.log('=== RESETTING QUESTIONS DATABASE ===\n');

    console.log('Step 1: Deleting all existing questions, options, and test cases...');

    // Disable foreign key checks temporarily
    await pool.query('SET FOREIGN_KEY_CHECKS = 0');

    // Delete all question-related data
    await pool.query('DELETE FROM test_cases');
    await pool.query('DELETE FROM mcq_options');
    await pool.query('DELETE FROM questions');

    // Re-enable FK checks
    await pool.query('SET FOREIGN_KEY_CHECKS = 1');

    console.log('Done! All questions cleared.\n');

    console.log('Step 2: Inserting level-specific content...\n');

    // Get all levels
    const levels = await pool.query(`
        SELECT l.id, l.level_number, l.title, c.title as course 
        FROM levels l 
        JOIN courses c ON l.course_id = c.id 
        ORDER BY c.title, l.level_number
    `);
    const levelRows = getRows(levels);

    // Content definitions for each course/level
    const contentMap: any = {
        'Python': {
            0: {
                topic: 'Getting Started', mcqs: ['Python Creator', 'File Extension', 'Print Function', 'Python Type', 'Case Sensitivity', 'Indentation', 'Comments', 'IDLE', 'Interpreter', 'Script Mode'],
                coding: [{ title: 'Hello Python', desc: 'Print "Hello, Python!"', solution: 'print("Hello, Python!")', tests: ['', 'Hello, Python!'] },
                { title: 'Add Numbers', desc: 'Read two numbers and print sum', solution: 'a=int(input())\nb=int(input())\nprint(a+b)', tests: [['5\n3', '8'], ['10\n20', '30']] }]
            },
            1: {
                topic: 'Variables & Data Types', mcqs: ['Variable Naming', 'Data Types', 'String Type', 'Integer Type', 'Float Type', 'Boolean', 'Type Conversion', 'Input Function', 'Multiple Assignment', 'Variable Scope'],
                coding: [{ title: 'Swap Variables', desc: 'Swap two variables', solution: 'a=int(input())\nb=int(input())\na,b=b,a\nprint(a,b)', tests: [['1\n2', '2 1']] },
                { title: 'Type Check', desc: 'Print type name', solution: 'x=input()\nprint(type(eval(x)).__name__)', tests: [['42', 'int']] }]
            },
            2: {
                topic: 'Conditionals', mcqs: ['If Syntax', 'Elif Keyword', 'Else Block', 'Comparison ==', 'Logical AND', 'Logical OR', 'Nested If', 'Ternary Operator', 'Boolean Values', 'If-Else Flow'],
                coding: [{ title: 'Positive/Negative', desc: 'Check if positive, negative, or zero', solution: 'n=int(input())\nif n>0:print("Positive")\nelif n<0:print("Negative")\nelse:print("Zero")', tests: [['5', 'Positive'], ['-3', 'Negative']] },
                { title: 'Grade Calculator', desc: 'A(90+),B(80+),C(70+),D(60+),F', solution: 's=int(input())\nif s>=90:print("A")\nelif s>=80:print("B")\nelif s>=70:print("C")\nelif s>=60:print("D")\nelse:print("F")', tests: [['85', 'B']] }]
            },
            3: {
                topic: 'Loops', mcqs: ['For Loop', 'Range Function', 'While Loop', 'Break Statement', 'Continue Statement', 'Nested Loops', 'Loop Else', 'Infinite Loop', 'Range with Step', 'Loop Counter'],
                coding: [{ title: 'Sum 1 to N', desc: 'Sum of 1 to N', solution: 'n=int(input())\nprint(sum(range(1,n+1)))', tests: [['5', '15'], ['10', '55']] },
                { title: 'Factorial', desc: 'Calculate N!', solution: 'n=int(input())\nr=1\nfor i in range(1,n+1):r*=i\nprint(r)', tests: [['5', '120']] }]
            },
            4: {
                topic: 'Lists & Arrays', mcqs: ['List Creation', 'List Indexing', 'List Append', 'List Slicing', 'List Length', 'List Methods', 'List Comprehension', 'Negative Index', 'List Copy', 'In Operator'],
                coding: [{ title: 'Find Max', desc: 'Find maximum in list', solution: 'n=int(input())\nnums=list(map(int,input().split()))\nprint(max(nums))', tests: [['5\n3 7 2 9 4', '9']] },
                { title: 'Reverse List', desc: 'Print list reversed', solution: 'n=int(input())\nnums=list(map(int,input().split()))\nprint(" ".join(map(str,nums[::-1])))', tests: [['5\n1 2 3 4 5', '5 4 3 2 1']] }]
            },
            5: {
                topic: 'Functions', mcqs: ['Def Keyword', 'Return Statement', 'Parameters', 'Default Args', 'Lambda Function', 'Function Call', 'Scope', 'Recursion', 'Docstrings', 'Args/Kwargs'],
                coding: [{ title: 'Square Function', desc: 'Return square of number', solution: 'def sq(n):return n*n\nprint(sq(int(input())))', tests: [['5', '25']] },
                { title: 'Is Prime', desc: 'Check if prime', solution: 'def prime(n):\n if n<2:return False\n for i in range(2,int(n**0.5)+1):\n  if n%i==0:return False\n return True\nprint("Prime" if prime(int(input())) else "Not Prime")', tests: [['7', 'Prime'], ['4', 'Not Prime']] }]
            }
        },
        'C Programming': {
            0: {
                topic: 'Getting Started', mcqs: ['C Creator', 'File Extension', 'printf Function', 'main Function', 'Semicolon', 'Include Directive', 'Comments', 'Compilation', 'Header Files', 'Return Statement'],
                coding: [{ title: 'Hello C', desc: 'Print Hello C', solution: '#include<stdio.h>\nint main(){printf("Hello, C!");return 0;}', tests: ['', 'Hello, C!'] },
                { title: 'Sum Two', desc: 'Add two integers', solution: '#include<stdio.h>\nint main(){int a,b;scanf("%d %d",&a,&b);printf("%d",a+b);return 0;}', tests: [['5 3', '8']] }]
            },
            1: {
                topic: 'Variables & Data Types', mcqs: ['int Type', 'float Type', 'char Type', 'Variable Declaration', 'Constants', 'sizeof', 'Type Modifiers', 'Format Specifiers', 'Type Casting', 'Literals'],
                coding: [{ title: 'Swap Variables', desc: 'Swap two integers', solution: '#include<stdio.h>\nint main(){int a,b;scanf("%d %d",&a,&b);printf("%d %d",b,a);return 0;}', tests: [['1 2', '2 1']] },
                { title: 'ASCII Value', desc: 'Print ASCII of char', solution: '#include<stdio.h>\nint main(){char c;scanf("%c",&c);printf("%d",(int)c);return 0;}', tests: [['A', '65']] }]
            },
            2: {
                topic: 'Conditionals', mcqs: ['If Syntax', 'Else If', 'Switch Case', 'Ternary Operator', 'Break in Switch', 'Default Case', 'Nested If', 'Relational Operators', 'Logical Operators', 'Boolean in C'],
                coding: [{ title: 'Max of Three', desc: 'Find maximum of 3 numbers', solution: '#include<stdio.h>\nint main(){int a,b,c,m;scanf("%d %d %d",&a,&b,&c);m=a;if(b>m)m=b;if(c>m)m=c;printf("%d",m);return 0;}', tests: [['5 10 3', '10']] },
                { title: 'Absolute Value', desc: 'Print absolute value', solution: '#include<stdio.h>\nint main(){int n;scanf("%d",&n);if(n<0)n=-n;printf("%d",n);return 0;}', tests: [['-5', '5'], ['10', '10']] }]
            },
            3: {
                topic: 'Loops', mcqs: ['For Loop Parts', 'While vs Do-While', 'Loop Counter', 'Nested Loops', 'Break Statement', 'Continue Statement', 'Infinite Loop', 'Loop Condition', 'Pre/Post Increment', 'Loop Optimization'],
                coding: [{ title: 'Print 1 to N', desc: 'Print numbers 1 to N', solution: '#include<stdio.h>\nint main(){int n,i;scanf("%d",&n);for(i=1;i<=n;i++)printf("%d\\n",i);return 0;}', tests: [['3', '1\n2\n3']] },
                { title: 'Sum 1 to N', desc: 'Calculate sum', solution: '#include<stdio.h>\nint main(){int n,s=0;scanf("%d",&n);for(int i=1;i<=n;i++)s+=i;printf("%d",s);return 0;}', tests: [['10', '55']] }]
            }
        },
        'Machine Learning': {
            0: {
                topic: 'What is ML', mcqs: ['ML Definition', 'ML vs AI', 'ML Types', 'ML Purpose', 'ML Applications', 'Training Data', 'Testing Data', 'Model', 'Features', 'Labels'],
                coding: [{ title: 'Calculate Mean', desc: 'Find average of numbers', solution: 'n=int(input())\nnums=list(map(float,input().split()))\nprint(f"{sum(nums)/len(nums):.2f}")', tests: [['4\n10 20 30 40', '25.00']] },
                { title: 'Find Min Max', desc: 'Print min and max', solution: 'n=int(input())\nnums=list(map(int,input().split()))\nprint(min(nums),max(nums))', tests: [['5\n3 7 2 9 4', '2 9']] }]
            },
            1: {
                topic: 'Supervised Learning', mcqs: ['Supervised Def', 'Classification', 'Regression', 'Overfitting', 'Underfitting', 'Train-Test Split', 'Cross Validation', 'Accuracy', 'Precision', 'Recall'],
                coding: [{ title: 'Normalize Data', desc: 'Min-max normalize to 0-1', solution: 'n=int(input())\nnums=list(map(float,input().split()))\nmn,mx=min(nums),max(nums)\nprint(" ".join(f"{(x-mn)/(mx-mn):.2f}" for x in nums))', tests: [['5\n1 2 3 4 5', '0.00 0.25 0.50 0.75 1.00']] },
                { title: 'Euclidean Distance', desc: 'Distance between 2 points', solution: 'import math\np1=list(map(float,input().split()))\np2=list(map(float,input().split()))\nprint(f"{math.sqrt(sum((a-b)**2 for a,b in zip(p1,p2))):.2f}")', tests: [['0 0\n3 4', '5.00']] }]
            }
        },
        'Data Science': {
            0: {
                topic: 'What is DS', mcqs: ['DS Definition', 'DS Lifecycle', 'DS Tools', 'Data Types', 'Structured Data', 'Unstructured Data', 'Data Cleaning', 'Data Visualization', 'Statistics', 'DS vs ML'],
                coding: [{ title: 'Calculate Mean', desc: 'Average of numbers', solution: 'n=int(input())\nnums=list(map(float,input().split()))\nprint(f"{sum(nums)/len(nums):.2f}")', tests: [['4\n10 20 30 40', '25.00']] },
                { title: 'Find Min Max', desc: 'Print min and max', solution: 'n=int(input())\nnums=list(map(int,input().split()))\nprint(min(nums),max(nums))', tests: [['5\n3 7 2 9 4', '2 9']] }]
            },
            1: {
                topic: 'NumPy & Pandas', mcqs: ['NumPy Array', 'Pandas DataFrame', 'Read CSV', 'Array Shape', 'Column Access', 'DataFrame Index', 'Missing Values', 'Groupby', 'NumPy vs List', 'Data Selection'],
                coding: [{ title: 'Array Sum', desc: 'Sum of array', solution: 'n=int(input())\nnums=list(map(int,input().split()))\nprint(sum(nums))', tests: [['5\n1 2 3 4 5', '15']] },
                { title: 'Standard Deviation', desc: 'Calculate std dev', solution: 'import statistics\nn=int(input())\nnums=list(map(float,input().split()))\nprint(f"{statistics.pstdev(nums):.2f}")', tests: [['5\n2 4 4 4 5', '1.10']] }]
            }
        },
        'Cloud Computing': {
            0: {
                topic: 'Cloud Intro', mcqs: ['Cloud Definition', 'Cloud Providers', 'Cloud Benefits', 'IaaS', 'PaaS', 'SaaS', 'Public Cloud', 'Private Cloud', 'Hybrid Cloud', 'Cloud Storage'],
                coding: [{ title: 'Parse JSON', desc: 'Extract service and region', solution: 'import json\nd=json.loads(input())\nprint(d["service"],d["region"])', tests: [['{"service":"EC2","region":"us-east-1"}', 'EC2 us-east-1']] },
                { title: 'ENV Format', desc: 'Format KEY=VALUE', solution: 'k=input()\nv=input()\nprint(f"{k}={v}")', tests: [['PORT\n3000', 'PORT=3000']] }]
            },
            1: {
                topic: 'Cloud Services', mcqs: ['IaaS Examples', 'PaaS Examples', 'SaaS Examples', 'Serverless', 'Virtual Machines', 'Containers', 'Load Balancing', 'Auto Scaling', 'CDN', 'Cloud Security'],
                coding: [{ title: 'Cloud Cost', desc: 'hours * rate', solution: 'h=float(input())\nr=float(input())\nprint(f"{h*r:.2f}")', tests: [['10\n0.5', '5.00']] },
                { title: 'Scale Instances', desc: 'instances * factor (ceil)', solution: 'import math\ni=int(input())\nf=float(input())\nprint(math.ceil(i*f))', tests: [['5\n2.5', '13']] }]
            }
        },
        'Deep Learning': {
            0: {
                topic: 'DL Intro', mcqs: ['DL Definition', 'Neural Network', 'DL Frameworks', 'Layers', 'Neurons', 'GPU Usage', 'Training Data', 'Test Data', 'Epoch', 'Batch Size'],
                coding: [{ title: 'Sigmoid', desc: '1/(1+e^-x)', solution: 'import math\nx=float(input())\nprint(f"{1/(1+math.exp(-x)):.4f}")', tests: [['0', '0.5000'], ['1', '0.7311']] },
                { title: 'ReLU', desc: 'max(0,x)', solution: 'x=float(input())\nprint(int(max(0,x)) if x==int(x) else max(0,x))', tests: [['-5', '0'], ['5', '5']] }]
            },
            1: {
                topic: 'NN Fundamentals', mcqs: ['Activation Functions', 'Backpropagation', 'Gradient Descent', 'Learning Rate', 'Loss Function', 'Vanishing Gradient', 'Dropout', 'Softmax', 'Overfitting', 'Regularization'],
                coding: [{ title: 'Weighted Sum', desc: 'Dot product', solution: 'w=list(map(float,input().split()))\nx=list(map(float,input().split()))\nprint(f"{sum(a*b for a,b in zip(w,x)):.2f}")', tests: [['1 2 3\n4 5 6', '32.00']] },
                { title: 'MSE Loss', desc: 'Mean squared error', solution: 'n=int(input())\np=list(map(float,input().split()))\na=list(map(float,input().split()))\nprint(f"{sum((x-y)**2 for x,y in zip(p,a))/n:.4f}")', tests: [['3\n1 2 3\n1.5 2.5 2.5', '0.1667']] }]
            }
        }
    };

    let totalQ = 0, totalO = 0, totalT = 0;

    for (const row of levelRows as any[]) {
        const courseContent = contentMap[row.course];
        if (!courseContent || !courseContent[row.level_number]) {
            console.log(`Skipping ${row.course} Level ${row.level_number} - no content defined`);
            continue;
        }

        const content = courseContent[row.level_number];
        console.log(`Adding ${row.course} Level ${row.level_number} (${content.topic})...`);

        // Add MCQs
        for (let i = 0; i < content.mcqs.length; i++) {
            const qId = `q-${row.course.replace(/\s+/g, '')}-${row.level_number}-mcq-${i}`;
            await pool.query(`INSERT INTO questions (id, level_id, question_type, title, description, difficulty) VALUES (?, ?, 'mcq', ?, ?, 'easy')`,
                [qId, row.id, content.mcqs[i], `Question about ${content.mcqs[i]} in ${content.topic}`]);
            totalQ++;

            // Add 4 options
            const letters = ['A', 'B', 'C', 'D'];
            for (let j = 0; j < 4; j++) {
                await pool.query(`INSERT INTO mcq_options (id, question_id, option_text, is_correct, option_letter) VALUES (UUID(), ?, ?, ?, ?)`,
                    [qId, `Option ${letters[j]} for ${content.mcqs[i]}`, j === 0, letters[j]]);
                totalO++;
            }
        }

        // Add Coding questions
        for (let i = 0; i < content.coding.length; i++) {
            const c = content.coding[i];
            const qId = `q-${row.course.replace(/\s+/g, '')}-${row.level_number}-code-${i}`;
            await pool.query(`INSERT INTO questions (id, level_id, question_type, title, description, difficulty, reference_solution) VALUES (?, ?, 'coding', ?, ?, 'easy', ?)`,
                [qId, row.id, c.title, c.desc, c.solution]);
            totalQ++;

            // Add test cases
            const tests = Array.isArray(c.tests[0]) ? c.tests : [[c.tests[0], c.tests[1]]];
            for (let j = 0; j < tests.length; j++) {
                await pool.query(`INSERT INTO test_cases (id, question_id, input_data, expected_output, is_hidden, test_case_number) VALUES (UUID(), ?, ?, ?, ?, ?)`,
                    [qId, tests[j][0] || '', tests[j][1], j > 0, j + 1]);
                totalT++;
            }
        }
    }

    console.log(`\n=== COMPLETE ===`);
    console.log(`Questions: ${totalQ}`);
    console.log(`MCQ Options: ${totalO}`);
    console.log(`Test Cases: ${totalT}`);

    process.exit(0);
}

resetQuestions().catch(e => { console.error(e); process.exit(1); });
