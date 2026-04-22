import { spawn } from 'child_process';

const runK6 = () => {
    return new Promise((resolve, reject) => {
        console.log('\n=======================================');
        console.log('🚀 Starting k6 spike_test.js...');
        console.log('=======================================\n');
        
        // Spawn k6 process
        const k6Process = spawn('k6', ['run', 'spike_test.js'], { stdio: 'inherit' });

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

const main = async () => {
    while (true) {
        try {
            await runK6();
        } catch (error) {
            console.error('Error during execution:', error);
        }

        if (process.env.RUN_ONCE === 'true') {
            console.log('✅ RUN_ONCE is set to true. Exiting after one run.');
            break;
        }

        console.log('⏳ Waiting 5 seconds before the next execution...\n');
        await delay(5000);
    }
};

// Start the loop
main();
