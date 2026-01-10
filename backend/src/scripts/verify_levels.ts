import pool from '../config/database';
import { RowDataPacket } from 'mysql2';

async function verifyAndFixLevels() {
    try {
        console.log('Verifying course levels...');
        const [courses] = await pool.query<RowDataPacket[]>('SELECT * FROM courses');

        for (const course of courses) {
            const [levels] = await pool.query<RowDataPacket[]>(
                'SELECT * FROM levels WHERE course_id = ? ORDER BY level_number',
                [course.id]
            );

            console.log(`Course: ${course.title} (ID: ${course.id})`);
            console.log(`  - Declared total_levels: ${course.total_levels}`);
            console.log(`  - Actual levels found: ${levels.length}`);

            if (levels.length === 0) {
                console.log(`  ! MISSING LEVELS. Adding default levels for ${course.title}...`);
                await addDefaultLevels(course.id, course.title);
            } else if (levels.length !== course.total_levels) {
                console.log(`  ! MISMATCH. Updating total_levels to ${levels.length}...`);
                await pool.query('UPDATE courses SET total_levels = ? WHERE id = ?', [levels.length, course.id]);
            } else {
                console.log('  - OK');
            }
        }
        console.log('Verification complete.');
        process.exit(0);
    } catch (error) {
        console.error('Error verifying levels:', error);
        process.exit(1);
    }
}

async function addDefaultLevels(courseId: string, courseTitle: string) {
    const levelsData = [];

    if (courseTitle.includes('Data Science')) {
        levelsData.push(
            { num: 1, title: 'Introduction to Data Science', desc: 'Overview of DS, roles, and workflow' },
            { num: 2, title: 'Data Analysis with Pandas', desc: 'Data manipulation and analysis' },
            { num: 3, title: 'Data Visualization', desc: 'Plotting with Matplotlib and Seaborn' },
            { num: 4, title: 'Statistical Foundations', desc: 'Probability, distributions, and hypothesis testing' },
            { num: 5, title: 'Capstone Project', desc: 'End-to-end data science project' }
        );
    } else if (courseTitle.includes('Deep Learning')) {
        levelsData.push(
            { num: 1, title: 'Neural Networks Basics', desc: 'Neurons, activation functions, and backpropagation' },
            { num: 2, title: 'Convolutional Neural Networks (CNNs)', desc: 'Image processing and computer vision' },
            { num: 3, title: 'Recurrent Neural Networks (RNNs)', desc: 'Sequence models and NLP' },
            { num: 4, title: 'Transfer Learning', desc: 'Using pre-trained models' },
            { num: 5, title: 'Generative Models', desc: 'GANs and VAEs' }
        );
    } else if (courseTitle.includes('Cloud Computing')) {
        levelsData.push(
            { num: 1, title: 'Cloud Concepts', desc: 'IaaS, PaaS, SaaS, and deployment models' },
            { num: 2, title: 'Virtualization & Containers', desc: 'VMs, Docker, and Kubernetes' },
            { num: 3, title: 'Storage & Databases', desc: 'Object storage, SQL, and NoSQL in the cloud' },
            { num: 4, title: 'Networking & Security', desc: 'VPCs, load balancing, and IAM' },
            { num: 5, title: 'Serverless Computing', desc: 'Lambda/Functions and event-driven architecture' }
        );
    } else {
        // Default generic levels
        levelsData.push(
            { num: 1, title: `${courseTitle} Basics`, desc: `Introduction to ${courseTitle}` }
        );
    }

    for (const level of levelsData) {
        // Generate a pseudo-random UUID-like string for ID (simpler than importing uuid lib if not available)
        // Actually, let's just use a simple random string generator for this script
        const id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

        await pool.query(
            'INSERT INTO levels (id, course_id, level_number, title, description) VALUES (?, ?, ?, ?, ?)',
            [id, courseId, level.num, level.title, level.desc]
        );
    }

    // Update total_levels
    await pool.query('UPDATE courses SET total_levels = ? WHERE id = ?', [levelsData.length, courseId]);
    console.log(`  + Added ${levelsData.length} levels.`);
}

verifyAndFixLevels();
