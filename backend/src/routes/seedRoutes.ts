import express from 'express';
import pool from '../config/database';

const router = express.Router();

const CONTENT_MAP: any = {
    'Data Science': {
        0: {
            title: "Primitives: Arrays & Tables",
            content: {
                introduction: "Data Science is built on powerful primitives: Vectors and DataFrames. Just as integers and strings are the atoms of Python, Arrays (NumPy) and Tables (Pandas) are the atoms of Data Science.",
                concepts: [
                    { title: "NumPy Arrays", explanation: "The fundamental grid of values. Unlike Python lists, arrays are typed and optimized for matrix math." },
                    { title: "Pandas Series & DataFrames", explanation: "Tabular data structures. Think of a DataFrame as a programmable Excel sheet." },
                    { title: "Vectorization", explanation: "Performing operations on entire arrays at once, avoiding slow Python loops." },
                    { title: "Indexing & Slicing", explanation: "Precise techniques to access specific rows, columns, or subsets of data." }
                ],
                resources: [
                    { title: "NumPy Quickstart", url: "https://numpy.org/doc/stable/user/quickstart.html" },
                    { title: "10 Minutes to pandas", url: "https://pandas.pydata.org/docs/user_guide/10min.html" }
                ],
                key_terms: ["Scalar", "Vector", "Matrix", "DataFrame", "Axis"],
                example_code: "import numpy as np\nimport pandas as pd\n\n# A Vector (1D Array)\nvec = np.array([1, 2, 3])\n\n# A Matrix (2D Array)\nmat = np.array([[1, 2], [3, 4]])\n\n# A DataFrame\ndf = pd.DataFrame({'A': [1, 2], 'B': [3, 4]})\nprint(df)"
            }
        },
        1: {
            title: "Control: Cleaning & Flow",
            content: {
                introduction: "Once you have data structures, you need to control them. This level covers Data Cleaning and Transformation—the 'Control Flow' of data science pipelines.",
                concepts: [
                    { title: "Handling Missing Data", explanation: "Strategies to fill (impute) or drop null values (`NaN`)." },
                    { title: "Filtering & Masking", explanation: "Selecting data based on conditions (e.g., `df[df['age'] > 30]`)." },
                    { title: "Group By & Aggregation", explanation: "Split-Apply-Combine pattern to summarize data categories." },
                    { title: "Apply Functions", explanation: "Mapping custom logic across rows or columns." }
                ],
                resources: [
                    { title: "Pandas Data Cleaning", url: "https://realpython.com/python-data-cleaning-numpy-pandas/" },
                    { title: "Kaggle: Data Cleaning Challenge", url: "https://www.kaggle.com/learn/data-cleaning" }
                ],
                key_terms: ["Imputation", "NaN", "Masking", "Aggregation", "Apply"],
                example_code: "# Drop missing values\ndf_clean = df.dropna()\n\n# Fill missing values\ndf_filled = df.fillna(0)\n\n# Filter: People older than 18\nadults = df[df['age'] > 18]\n\n# Group By\navg_scores = df.groupby('class')['score'].mean()"
            }
        }
    },
    'Machine Learning': {
        0: {
            title: "Primitives: Features & Labels",
            content: {
                introduction: "In traditional programming, you write rules. In Machine Learning, you write algorithms that LEARN rules from data. The primitive here is the 'Feature Vector'.",
                concepts: [
                    { title: "Features & Labels", explanation: "Features (Inputs) are what the model sees. Labels (Outputs) are what it predicts." },
                    { title: "Supervised vs Unsupervised", explanation: "Learning with an answer key vs. finding patterns in chaos." },
                    { title: "The Loss Function", explanation: "A mathematical score of how WRONG the model is. Lower is better." },
                    { title: "Train / Test Split", explanation: "Separating data to ensure the model doesn't just memorize constraints." }
                ],
                resources: [
                    { title: "Google ML Crash Course", url: "https://developers.google.com/machine-learning/crash-course" },
                    { title: "Visual Intro to ML", url: "http://www.r2d3.us/visual-intro-to-machine-learning-part-1/" }
                ],
                key_terms: ["Feature", "Label", "Model", "Loss", "Overfitting"],
                example_code: "from sklearn.model_selection import train_test_split\n\n# Features (X) and Labels (y)\nX = [[1, 2], [3, 4], [5, 6]]\ny = [0, 1, 1]\n\n# Split\nX_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)"
            }
        },
        1: {
            title: "Control: The Training Loop",
            content: {
                introduction: "Control in ML is the 'Training Loop'. We use algorithms like Gradient Descent to iteratively adjust the model's internal knobs (weights) to minimize error.",
                concepts: [
                    { title: "Linear Regression", explanation: "Fitting a line to data. The 'Hello World' of ML." },
                    { title: "Gradient Descent", explanation: "An iterative optimization algorithm for finding the minimum of a function." },
                    { title: "Learning Rate", explanation: "How big of a step we take during optimization. Too big? Unstable. Too small? Slow." },
                    { title: "Epochs & Batches", explanation: "One pass over the dataset (Epoch) and processing small chunks (Batches)." }
                ],
                resources: [
                    { title: "Gradient Descent (3Blue1Brown)", url: "https://www.youtube.com/watch?v=IHZwWFHWa-w" },
                    { title: "Scikit-Learn Regression", url: "https://scikit-learn.org/stable/modules/linear_model.html" }
                ],
                key_terms: ["Weights", "Bias", "Convergence", "Hyperparameter", "Regression"],
                example_code: "from sklearn.linear_model import LinearRegression\n\nmodel = LinearRegression()\n\n# The Training Step (Fit)\nmodel.fit(X_train, y_train)\n\n# The Prediction Step\npredictions = model.predict(X_test)"
            }
        }
    },
    'Deep Learning': {
        0: {
            title: "Primitives: The Neuron",
            content: {
                introduction: "Deep Learning mimics the brain's primitives. The atom here is the 'Neuron' (Perceptron), taking inputs, applying weights, and firing an activation.",
                concepts: [
                    { title: "The Artificial Neuron", explanation: "A mathematical function: Output = Activation(WeightedSum(Inputs) + Bias)." },
                    { title: "Activation Functions", explanation: "ReLU, Sigmoid, Tanh. They introduce non-linearity, allowing learning of complex patterns." },
                    { title: "Layers (Dense/FC)", explanation: "Stacking neurons in parallel to form a layer." },
                    { title: "Neural Network Architecture", explanation: "Input Layer -> Hidden Layers -> Output Layer." }
                ],
                resources: [
                    { title: "Playground.tensorflow.org", url: "https://playground.tensorflow.org/" },
                    { title: "Neural Networks (3Blue1Brown)", url: "https://www.youtube.com/watch?v=aircAruvnKk" }
                ],
                key_terms: ["Perceptron", "ReLU", "Sigmoid", "Weights", "Bias"],
                example_code: "import torch.nn as nn\n\n# A Single Dense Layer\nlayer = nn.Linear(in_features=10, out_features=5)\n\n# An Activation Function\nactivation = nn.ReLU()\n\n# Forward Pass\noutput = activation(layer(input_data))"
            }
        },
        1: {
            title: "Control: Backpropagation",
            content: {
                introduction: "Control in Deep Learning is 'Backpropagation'. It's the mechanism that attributes blame for errors and updates every neuron in the network accordingly.",
                concepts: [
                    { title: "Forward Propagation", explanation: "Passing data through the network to get a prediction." },
                    { title: "Backpropagation", explanation: "Calculating gradients (derivatives) using the Chain Rule to update weights." },
                    { title: "Optimizers (Adam/SGD)", explanation: "Advanced algorithms that use gradients to update weights efficiently." },
                    { title: "The Training Loop", explanation: "Forward -> Loss -> Backward -> Step -> ZeroGrad." }
                ],
                resources: [
                    { title: "Andrej Karpathy: Micrograd", url: "https://www.youtube.com/watch?v=VMj-3S1tku0" },
                    { title: "PyTorch Blitz", url: "https://pytorch.org/tutorials/beginner/deep_learning_60min_blitz.html" }
                ],
                key_terms: ["Gradient", "Chain Rule", "Optimizer", "Loss Landscape", "Backprop"],
                example_code: "# Typical PyTorch Loop\noutput = model(inputs)\nloss = criterion(output, labels)\n\n# Backward\noptimizer.zero_grad()\nloss.backward()\noptimizer.step()"
            }
        }
    },
    'Cloud Computing': {
        0: {
            title: "Primitives: Compute & Storage",
            content: {
                introduction: "The Cloud is the OS of the Internet. Its primitives are Compute (Virtual Machines) and Storage (Buckets). You rent them via API.",
                concepts: [
                    { title: "IaaS vs PaaS vs SaaS", explanation: "Infrastructure (EC2), Platform (Heroku), Software (Gmail). The abstraction ladder." },
                    { title: "Virtual Machines (EC2)", explanation: "Renting a slice of a server. You control the OS." },
                    { title: "Object Storage (S3)", explanation: "Infinite bucket for files. Not a file system, but a key-value store for blobs." },
                    { title: "Regions & Zones", explanation: "Physical locations of data centers. Latency and redundancy matter." }
                ],
                resources: [
                    { title: "AWS Cloud Practitioner Essentials", url: "https://aws.amazon.com/training/digital/aws-cloud-practitioner-essentials/" },
                    { title: "Azure Fundamentals", url: "https://learn.microsoft.com/en-us/training/paths/microsoft-azure-fundamentals-describe-cloud-concepts/" }
                ],
                key_terms: ["EC2", "S3", "Latency", "Availability Zone", "IaaS"],
                example_code: "# AWS CLI Example\naws s3 cp my_file.txt s3://my-bucket/\n\n# Terraform Primitive\nresource \"aws_instance\" \"web\" {\n  ami = \"ami-12345678\"\n  instance_type = \"t2.micro\"\n}"
            }
        },
        1: {
            title: "Control: Scaling & Load Balancing",
            content: {
                introduction: "Control in Cloud is 'Scaling'. How does your system react to traffic? It's about Load Balancing, Auto-Scaling, and Stateless design.",
                concepts: [
                    { title: "Vertical vs Horizontal Scaling", explanation: "Bigger machine (Vertical) vs More machines (Horizontal)." },
                    { title: "Load Balancers", explanation: "Traffic cops that distribute requests across healthy servers." },
                    { title: "Auto-Scaling Groups", explanation: "Automatically defined rules to add/remove servers based on CPU load." },
                    { title: "Statelessness", explanation: "Servers shouldn't remember users locally. Store state in DB/Redis so any server can handle any request." }
                ],
                resources: [
                    { title: "System Design Primer", url: "https://github.com/donnemartin/system-design-primer" },
                    { title: "The Twelve-Factor App", url: "https://12factor.net/" }
                ],
                key_terms: ["Load Balancer", "Auto-Scaling", "Stateless", "Elasticity", "Horizontal Scaling"],
                example_code: "# NGINX Load Balancer Config\nupstream backend {\n    server backend1.example.com;\n    server backend2.example.com;\n}\n\nserver {\n    location / {\n        proxy_pass http://backend;\n    }\n}"
            }
        }
    }
};

// ... (CONTENT_MAP ends)

const QUESTION_MAP: any = {
    'Data Science': {
        0: [
            {
                title: "Create a NumPy Array",
                description: "Create a NumPy array from a python list `[1, 2, 3, 4, 5]` and return it.",
                type: "coding",
                input_format: "No input",
                output_format: "A numpy array",
                test_cases: [
                    { input: "", expected: "[1 2 3 4 5]", hidden: false }
                ],
                template: "import numpy as np\n\ndef create_array():\n    # Your code here\n    return np.array([])"
            },
            {
                title: "Pandas DataFrame Basics",
                description: "Create a DataFrame with columns 'A' and 'B' where A=[1, 2] and B=[3, 4].",
                type: "coding",
                input_format: "No input",
                output_format: "DataFrame string representation",
                test_cases: [
                    { input: "", expected: "   A  B\n0  1  3\n1  2  4", hidden: false }
                ],
                template: "import pandas as pd\n\ndef create_df():\n    # Your code here\n    return pd.DataFrame()"
            }
        ],
        1: [
            {
                title: "Filter DataFrame",
                description: "Given a DataFrame with column 'age', return all rows where 'age' > 25.\nAssume global `df` is available for testing, but writes your function to accept it.",
                type: "coding",
                input_format: "DataFrame",
                output_format: "Filtered DataFrame",
                test_cases: [
                    // Mocking data logic would be complex here without backend runner having pandas context.
                    // For now, simpler python logic that mimics filtering.
                    { input: "30", expected: "True", hidden: false }
                ],
                template: "def filter_adults(age):\n    return age > 25" // Simplified for now
            },
            {
                title: "Handling Missing Data",
                description: "Which function is used to remove missing values in Pandas?",
                type: "mcq",
                options: [
                    { text: "df.fillna()", correct: false, letter: "A" },
                    { text: "df.dropna()", correct: true, letter: "B" },
                    { text: "df.remove()", correct: false, letter: "C" },
                    { text: "df.clean()", correct: false, letter: "D" }
                ]
            }
        ]
    },
    'Machine Learning': {
        0: [
            {
                title: "Feature Selection",
                description: "Which of the following is likely a FEATURE for predicting House Price?",
                type: "mcq",
                options: [
                    { text: "Sale Price", correct: false, letter: "A" },
                    { text: "Number of Bedrooms", correct: true, letter: "B" },
                    { text: "Tax Paid last year", correct: false, letter: "C" },
                    { text: "Owner's Name", correct: false, letter: "D" }
                ]
            },
            {
                title: "Split Data",
                description: "Write a function that splits a list into two halves: 80% train, 20% test (integer split). Return tuple (train, test).",
                type: "coding",
                test_cases: [
                    { input: "10", expected: "([0, 1, 2, 3, 4, 5, 6, 7], [8, 9])", hidden: false }
                ],
                template: "def manual_split(data_size):\n    data = list(range(data_size))\n    # Returns (train_list, test_list)\n    return [], []"
            }
        ],
        1: [
            {
                title: "Simple Threshold Model",
                description: "Predict class 1 if x > 5, else class 0.",
                type: "coding",
                test_cases: [
                    { input: "6", expected: "1", hidden: false },
                    { input: "2", expected: "0", hidden: false }
                ],
                template: "def predict(x):\n    pass"
            }
        ]
    },
    'Deep Learning': {
        0: [
            {
                title: "ReLU Activation",
                description: "Implement ReLU: return x if x > 0 else 0.",
                type: "coding",
                test_cases: [
                    { input: "5", expected: "5", hidden: false },
                    { input: "-2", expected: "0", hidden: false }
                ],
                template: "def relu(x):\n    pass"
            }
        ],
        1: [
            {
                title: "Gradient Update",
                description: "Update weight `w` using gradient `g` and learning rate `lr`. Formula: w_new = w - lr * g",
                type: "coding",
                test_cases: [
                    { input: "10 1 2", expected: "8", hidden: false } // w=10, lr=1, g=2 => 10 - 2 = 8
                ],
                template: "def update_weight(w, lr, g):\n    return w"
            }
        ]
    },
    'Cloud Computing': {
        0: [
            {
                title: "Choose Storage",
                description: "You need to store user profile pictures. Which AWS service is best?",
                type: "mcq",
                options: [
                    { text: "EC2", correct: false, letter: "A" },
                    { text: "RDS", correct: false, letter: "B" },
                    { text: "S3", correct: true, letter: "C" },
                    { text: "Lambda", correct: false, letter: "D" }
                ]
            }
        ],
        1: [
            {
                title: "Load Balancer Logic",
                description: "Implement Round Robin. Given 3 servers (0, 1, 2) and current request index `i`, return server index.",
                type: "coding",
                test_cases: [
                    { input: "0", expected: "0", hidden: false },
                    { input: "4", expected: "1", hidden: false }
                ],
                template: "def get_server(request_index):\n    num_servers = 3\n    return 0"
            }
        ]
    }
};

router.post('/questions', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const { randomUUID } = await import('crypto');

        for (const [courseTitle, levelsData] of Object.entries(QUESTION_MAP)) {
            const [courses]: any = await connection.query('SELECT id FROM courses WHERE title LIKE ?', [`%${courseTitle}%`]);
            if (courses.length === 0) continue;
            const courseId = courses[0].id;

            for (const [levelNum, questions] of Object.entries(levelsData as any)) {
                // Get Level ID
                const [levels]: any = await connection.query('SELECT id FROM levels WHERE course_id = ? AND level_number = ?', [courseId, levelNum]);
                if (levels.length === 0) continue;
                const levelId = levels[0].id;

                // Clear existing questions for this level to avoid dups
                await connection.query('DELETE FROM questions WHERE level_id = ?', [levelId]);

                // Insert Questions
                for (const q of (questions as any[])) {
                    const qId = randomUUID();
                    await connection.query(
                        `INSERT INTO questions (id, level_id, question_type, title, description, input_format, output_format)
                          VALUES (?, ?, ?, ?, ?, ?, ?)`,
                        [qId, levelId, q.type, q.title, q.description, q.input_format || '', q.output_format || '']
                    );

                    if (q.type === 'coding') {
                        let idx = 1;
                        for (const tc of q.test_cases) {
                            const tcId = randomUUID();
                            await connection.query(
                                `INSERT INTO test_cases (id, question_id, input_data, expected_output, is_hidden, test_case_number)
                                  VALUES (?, ?, ?, ?, ?, ?)`,
                                [tcId, qId, tc.input, tc.expected, tc.hidden ? 1 : 0, idx++]
                            );
                        }
                    } else if (q.type === 'mcq') {
                        for (const opt of q.options) {
                            const optId = randomUUID();
                            await connection.query(
                                `INSERT INTO mcq_options (id, question_id, option_text, is_correct, option_letter)
                                  VALUES (?, ?, ?, ?, ?)`,
                                [optId, qId, opt.text, opt.correct, opt.letter]
                            );
                        }
                    }
                }
            }
        }
        res.json({ message: 'Questions seeded successfully' });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ error: error.message });
    } finally {
        if (connection) connection.release();
    }
});

export default router;
