
import pool from '../config/database';

const fixQuestion = async () => {
    try {
        console.log('Fixing Online Portfolio question...');
        const id = '444b2171-3a47-46ce-9e3f-94011280bf71';

        // 1. Define Assets
        const assets = [
            { name: "web_project1.jpg", path: "/assets/web_project1.jpg" },
            { name: "ecommerce.jpg", path: "/assets/ecommerce.jpg" },
            { name: "logo_design.jpg", path: "/assets/logo_design.jpg" },
            { name: "poster_design.jpg", path: "/assets/poster_design.jpg" }
        ];
        const outputFormat = JSON.stringify(assets);

        // 2. Fetch current reference solution
        const [rows]: any = await pool.query('SELECT reference_solution FROM questions WHERE id = ?', [id]);
        if (!rows || rows.length === 0) {
            console.error('Question not found');
            return;
        }

        let refSol = rows[0].reference_solution;
        if (refSol) {
            const parsed = JSON.parse(refSol);
            let html = parsed.html || '';

            // 3. Fix HTML paths
            // Replace src="foo.jpg" with src="/assets/foo.jpg"
            // Avoid double prefixing if run multiple times
            html = html.replace(/src="([^"/]+\.jpg)"/g, 'src="/assets/$1"');

            parsed.html = html;
            const newRefSol = JSON.stringify(parsed);

            // 4. Update DB
            await pool.query(
                'UPDATE questions SET output_format = ?, reference_solution = ? WHERE id = ?',
                [outputFormat, newRefSol, id]
            );
            console.log('Successfully updated question assets and HTML paths.');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit();
    }
};

fixQuestion();
