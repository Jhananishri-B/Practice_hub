import pool from '../config/database';

const seedHtmlCss = async () => {
    try {
        console.log('Seeding HTML/CSS Course and Levels...');

        // 1. Create HTML/CSS Course
        const courseId = '550e8400-e29b-41d4-a716-446655440007';
        await pool.query(`
            INSERT INTO courses (id, title, description, total_levels)
            VALUES (?, 'HTML/CSS', 'Master the web with HTML5 and CSS3: From basics to responsive design and animations.', 4)
            ON DUPLICATE KEY UPDATE 
                title=VALUES(title), 
                description=VALUES(description), 
                total_levels=VALUES(total_levels)
        `, [courseId]);

        console.log('Course "HTML/CSS" ensured.');

        // 2. Levels Data
        const levels = [
            {
                id: '660e8400-e29b-41d4-a716-446655440131',
                level_number: 1,
                title: 'Basic of HTML, Forms',
                description: 'HTML syntax, structure, tags, and forms.',
                topic_description: 'Introduction to HTML documents, common tags like headings, paragraphs, links, images, lists, and form controls.',
                learning_materials: JSON.stringify({
                    introduction: "HTML (HyperText Markup Language) is the standard markup language for documents designed to be displayed in a web browser. In this level, we cover the basic structure of an HTML document and essential tags.",
                    concepts: [
                        { title: "HTML Structure", explanation: "Every HTML document starts with <!DOCTYPE html>, followed by <html>, <head>, and <body> tags." },
                        { title: "Common Tags", explanation: "<h1>-<h6> for headings, <p> for paragraphs, <a> for links, <img> for images, <ul>/<li> for lists, <div>/<span> for containers." },
                        { title: "Forms", explanation: "Forms allow user input. <form>, <input>, <label>, <textarea>, <button> are key elements. Attributes like 'type', 'name', 'placeholder' control behavior." }
                    ],
                    key_terms: ["HTML5", "Tags", "Attributes", "DOM", "Forms", "Input"],
                    resources: [
                        { title: "MDN: HTML Basics", url: "https://developer.mozilla.org/en-US/docs/Learn/Getting_started_with_the_web/HTML_basics" },
                        { title: "W3Schools: HTML Forms", url: "https://www.w3schools.com/html/html_forms.asp" }
                    ]
                }),
                code_snippet: `<!DOCTYPE html>
<html>
<head>
    <title>My First Page</title>
</head>
<body>
    <h1>Hello World</h1>
    <form>
        <label for="name">Name:</label>
        <input type="text" id="name" name="name">
        <button type="submit">Submit</button>
    </form>
</body>
</html>`
            },
            {
                id: '660e8400-e29b-41d4-a716-446655440132',
                level_number: 2,
                title: 'Tables and Responsive Web Design',
                description: 'Creating tables and intro to responsive concepts.',
                topic_description: 'Working with tabular data: Headers, Rows, Columns. Styling tables and introduction to responsive images.',
                learning_materials: JSON.stringify({
                    introduction: "Tables are used to display data in a tabular format. We also touch upon making content responsive, ensuring it looks good on all devices.",
                    concepts: [
                        { title: "Table Structure", explanation: "<table>, <tr> (row), <th> (header), <td> (data). Use <thead>, <tbody>, <tfoot> for semantic structure." },
                        { title: "Table Styling", explanation: "Borders, padding, and 'colgroup' for column-specific styling." },
                        { title: "Responsive Images", explanation: "Using 'max-width: 100%' and 'height: auto' to make images scale with their container." }
                    ],
                    key_terms: ["Table", "Row", "Column", "Cell", "Responsive", "Viewport"],
                    resources: [
                        { title: "MDN: HTML Tables", url: "https://developer.mozilla.org/en-US/docs/Learn/HTML/Tables" },
                        { title: "Responsive Web Design Images", url: "https://www.w3schools.com/css/css_rwd_images.asp" }
                    ]
                }),
                code_snippet: `<table>
  <tr>
    <th>Name</th>
    <th>Age</th>
  </tr>
  <tr>
    <td>Alice</td>
    <td>24</td>
  </tr>
</table>

<style>
img {
  max-width: 100%;
  height: auto;
}
</style>`
            },
            {
                id: '660e8400-e29b-41d4-a716-446655440133',
                level_number: 3,
                title: 'CSS Basic, Layout and Positioning',
                description: 'CSS syntax, Box Model, Positioning, and Flexbox.',
                topic_description: 'Styling with CSS: Colors, Fonts, Backgrounds. Mastering the Box Model (Margin, Border, Padding). Positioning elements and Flexbox basics.',
                learning_materials: JSON.stringify({
                    introduction: "CSS (Cascading Style Sheets) describes how HTML elements are to be displayed. This level covers core styling, layout mechanisms, and modern Flexbox.",
                    concepts: [
                        { title: "CSS Syntax & Selectors", explanation: "Select elements by tag, class (.), or ID (#). Property: Value;" },
                        { title: "Box Model", explanation: "Content + Padding + Border + Margin. Understanding 'box-sizing: border-box'." },
                        { title: "Positioning", explanation: "static (default), relative, absolute, fixed, sticky." },
                        { title: "Flexbox", explanation: "A one-dimensional layout method for laying out items in rows or columns. 'display: flex', 'justify-content', 'align-items'." }
                    ],
                    key_terms: ["CSS", "Selector", "Box Model", "Margin", "Padding", "Flexbox", "Absolute", "Relative"],
                    resources: [
                        { title: "MDN: CSS Basics", url: "https://developer.mozilla.org/en-US/docs/Learn/CSS/First_steps" },
                        { title: "CSS Tricks: Flexbox", url: "https://css-tricks.com/snippets/css/a-guide-to-flexbox/" }
                    ]
                }),
                code_snippet: `.box {
  background-color: lightblue;
  width: 100px;
  padding: 20px;
  border: 5px solid gray;
  margin: 10px;
}

.container {
  display: flex;
  justify-content: center;
}`
            },
            {
                id: '660e8400-e29b-41d4-a716-446655440134',
                level_number: 4,
                title: 'Responsive Design, Transitions and Animations',
                description: 'Advanced CSS: Media Queries, Grid, and Animations.',
                topic_description: 'Making sites mobile-friendly with Media Queries and Grid Layout. Adding interactivity with Transitions and Keyframe Animations.',
                learning_materials: JSON.stringify({
                    introduction: "Bring your website to life and ensure it works everywhere. Learn Responsive Design principles and add motion with CSS Animations.",
                    concepts: [
                        { title: "Responsive Design", explanation: "Using @media queries to apply different styles based on viewport width. The Viewport Meta Tag." },
                        { title: "CSS Grid", explanation: "Two-dimensional layout system. 'display: grid', 'grid-template-columns'." },
                        { title: "Transitions", explanation: "Smoothly change property values (e.g., hover effects). 'transition: all 0.3s ease'." },
                        { title: "Animations", explanation: "Keyframes (@keyframes) allow complex animation sequences." }
                    ],
                    key_terms: ["Media Query", "Breakpoint", "Grid", "Keyframes", "Transition", "Animation"],
                    resources: [
                        { title: "MDN: Responsive Design", url: "https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design" },
                        { title: "MDN: CSS Animations", url: "https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Animations/Using_CSS_animations" }
                    ]
                }),
                code_snippet: `@media (max-width: 600px) {
  .column {
    width: 100%;
  }
}

.button:hover {
  background-color: blue;
  transition: background-color 0.3s;
}

@keyframes slideIn {
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
}`
            }
        ];

        for (const level of levels) {
            await pool.query(`
                INSERT INTO levels (id, course_id, level_number, title, description, topic_description, learning_materials, code_snippet)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                    title=VALUES(title),
                    description=VALUES(description),
                    topic_description=VALUES(topic_description),
                    learning_materials=VALUES(learning_materials),
                    code_snippet=VALUES(code_snippet)
            `, [level.id, courseId, level.level_number, level.title, level.description, level.topic_description, level.learning_materials, level.code_snippet]);
        }

        console.log(`Successfully seeded ${levels.length} levels for HTML/CSS.`);
        process.exit(0);
    } catch (error) {
        console.error('Seeding HTML/CSS failed:', error);
        process.exit(1);
    }
};

seedHtmlCss();
