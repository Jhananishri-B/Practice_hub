
export const calculateHtmlScore = (userDoc, correctDoc, correctWin, userWin) => {
    if (!userDoc || !correctDoc || !correctWin || !userWin) {
        return { structure: 0, content: 0, style: 0, total: 0 };
    }

    const correctElements = Array.from(correctDoc.body.querySelectorAll('*'));

    if (correctElements.length === 0) {
        return { structure: 100, content: 100, style: 100, total: 100 };
    }

    let structurePoints = 0;
    let maxStructurePoints = 0;

    let contentPoints = 0;
    let maxContentPoints = 0;

    let stylePoints = 0;
    let maxStylePoints = 0;

    const usedUserElements = new Set();

    correctElements.forEach(correctEl => {
        maxStructurePoints += 1; // Base point for existence

        // --- FIND BEST MATCH START ---
        const candidates = Array.from(userDoc.body.getElementsByTagName(correctEl.tagName));

        let bestMatch = null;
        let bestMatchScore = -1;

        candidates.forEach(cand => {
            if (usedUserElements.has(cand)) return;

            let currentScore = 0;
            if (correctEl.id && cand.id === correctEl.id) currentScore += 50;

            const cClasses = Array.from(correctEl.classList);
            const uClasses = Array.from(cand.classList);
            const intersection = cClasses.filter(c => uClasses.includes(c));
            if (cClasses.length > 0) {
                currentScore += (intersection.length / cClasses.length) * 20;
            }

            if (correctEl.children.length === 0 && correctEl.textContent.trim()) {
                if (correctEl.textContent.trim() === cand.textContent.trim()) currentScore += 30;
                else if (cand.textContent.includes(correctEl.textContent.trim())) currentScore += 10;
            }

            if (correctEl.parentElement && cand.parentElement && correctEl.parentElement.tagName === cand.parentElement.tagName) {
                currentScore += 5;
            }

            if (currentScore > bestMatchScore) {
                bestMatchScore = currentScore;
                bestMatch = cand;
            }
        });

        let userEl = bestMatch;
        if (!userEl && candidates.length > 0) {
            userEl = candidates.find(c => !usedUserElements.has(c));
        }
        // --- FIND BEST MATCH END ---

        if (userEl) {
            usedUserElements.add(userEl);

            // Scored Match
            structurePoints += 1;

            const correctClasses = Array.from(correctEl.classList).sort().join(' ');
            const userClasses = Array.from(userEl.classList).sort().join(' ');
            if (correctClasses === userClasses) structurePoints += 0.5;
            maxStructurePoints += 0.5;

            // Content Check
            if (correctEl.children.length === 0 && correctEl.textContent.trim().length > 0) {
                maxContentPoints += 1;
                const norm = (s) => s.replace(/\s+/g, ' ').trim();
                if (norm(correctEl.textContent) === norm(userEl.textContent)) {
                    contentPoints += 1;
                }
            }

            // --- PIXEL SIMILARITY / STYLE CHECK ---

            // 1. Comprehensive CSS Properties
            const expandedStyles = [
                'display', 'position', 'color', 'background-color',
                'font-size', 'font-family', 'font-weight', 'line-height', 'text-align', 'text-decoration',
                'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
                'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
                'border-top-width', 'border-right-width', 'border-bottom-width', 'border-left-width',
                'border-radius', 'box-shadow', 'opacity',
                'flex-direction', 'justify-content', 'align-items', 'flex-wrap', 'gap'
            ];

            maxStylePoints += expandedStyles.length;
            const correctStyle = correctWin.getComputedStyle(correctEl);
            const userStyle = userWin.getComputedStyle(userEl);

            expandedStyles.forEach(prop => {
                if (correctStyle.getPropertyValue(prop) === userStyle.getPropertyValue(prop)) {
                    stylePoints += 1;
                }
            });

            // 2. Geometry Check (Bounding Box)
            // Verifies: Width, Height, Absolute Position (Top, Left)
            maxStylePoints += 4;
            const correctRect = correctEl.getBoundingClientRect();
            const userRect = userEl.getBoundingClientRect();
            const tolerance = 2; // 2px tolerance

            // Size
            if (Math.abs(correctRect.width - userRect.width) <= tolerance) stylePoints += 1;
            else if (correctRect.width > 0 && Math.abs(correctRect.width - userRect.width) / correctRect.width < 0.05) stylePoints += 1; // 5% diff

            if (Math.abs(correctRect.height - userRect.height) <= tolerance) stylePoints += 1;
            else if (correctRect.height > 0 && Math.abs(correctRect.height - userRect.height) / correctRect.height < 0.05) stylePoints += 1;

            // Position (Layout)
            if (Math.abs(correctRect.top - userRect.top) <= tolerance) stylePoints += 1;
            if (Math.abs(correctRect.left - userRect.left) <= tolerance) stylePoints += 1;

        } else {
            // Missing element penalties
            if (correctEl.children.length === 0 && correctEl.textContent.trim().length > 0) {
                maxContentPoints += 1;
            }
            // Style penalties (max points increase but stylePoints don't)
            // Styles + Geometry points
            maxStylePoints += 34; // 30 styles + 4 geometry
        }
    });

    const structureScore = maxStructurePoints > 0 ? Math.round((structurePoints / maxStructurePoints) * 100) : 100;
    const contentScore = maxContentPoints > 0 ? Math.round((contentPoints / maxContentPoints) * 100) : 100;
    const styleScoreVal = maxStylePoints > 0 ? Math.round((stylePoints / maxStylePoints) * 100) : 100;

    // Weighted Total: 30% Structure, 50% Style/Pixels, 20% Content
    const total = Math.round((structureScore * 0.3) + (styleScoreVal * 0.5) + (contentScore * 0.2));

    return {
        structure: structureScore,
        content: contentScore,
        style: styleScoreVal,
        total: total
    };
};
