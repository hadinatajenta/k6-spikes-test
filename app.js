import { spawn } from 'child_process';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const k6Path = process.env.VERCEL ? path.join(__dirname, 'k6-bin') : 'k6';

const runK6 = () => {
    return new Promise((resolve, reject) => {
        console.log('\n=======================================');
        console.log('🚀 Starting k6 spike_test.js...');
        console.log('=======================================\n');
        
        const k6Process = spawn(k6Path, ['run', 'spike_test.js'], { stdio: 'inherit' });

        k6Process.on('close', (code) => {
            console.log(`\n✅ k6 process exited with code ${code}`);
            resolve(code);
        });

        k6Process.on('error', (err) => {
            console.error('\n❌ Failed to start k6 process:', err);
            reject(err);
        });
    });
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const main = async (res) => {
    try {
        if (res) res.write('Test started...\n');
        await runK6();
        if (res) res.write('Test completed.\n');
    } catch (error) {
        console.error('Error during execution:', error);
        if (res) res.write(`Error: ${error.message}\n`);
    }
};

// Create a simple HTTP server for Vercel
const server = http.createServer(async (req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.write('Vercel K6 Triggered\n');
    
    // Execute once for Vercel (since it will be killed anyway)
    await main(res);
    
    res.end('Execution finished (or timed out by Vercel)\n');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    
    // If NOT on Vercel, run the infinite loop
    if (!process.env.VERCEL) {
        (async () => {
            while (true) {
                await main();
                console.log('⏳ Waiting 5 seconds before the next execution...\n');
                await delay(5000);
            }
        })();
    }
});
