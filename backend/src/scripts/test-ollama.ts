
const OLLAMA_BASE_URL = 'http://localhost:11434';
const OLLAMA_MODEL = 'llama3:latest';

async function testOllama() {
    console.log(`Checking connection to Ollama at ${OLLAMA_BASE_URL}...`);
    try {
        const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`);
        if (!response.ok) {
            throw new Error(`Failed to fetch tags: ${response.statusText}`);
        }
        const data = await response.json() as any;
        console.log('Ollama is running. Available models:');
        const models = data.models.map((m: any) => m.name);
        console.log(models);

        if (!models.includes(OLLAMA_MODEL)) {
            console.warn(`WARNING: Model '${OLLAMA_MODEL}' not found. Please run 'ollama pull ${OLLAMA_MODEL}'`);
        } else {
            console.log(`SUCCESS: Model '${OLLAMA_MODEL}' is available.`);

            console.log('Running a test chat generation...');
            const chatResp = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: OLLAMA_MODEL,
                    messages: [{ role: 'user', content: 'Say "Hello Practice Hub!"' }],
                    stream: false
                })
            });
            const chatData = await chatResp.json() as any;
            console.log('Response:', chatData.message.content);
        }

    } catch (error) {
        console.error('Failed to connect to Ollama. Make sure it is running via `ollama serve`.');
        console.error(error);
    }
}

testOllama();
