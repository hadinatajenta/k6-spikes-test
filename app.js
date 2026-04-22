import http from 'http';
import https from 'https';

const TARGET_URL = 'https://djp.skehgo.cc/';

// Spike test stages (mirrors spike_test.js config)
const STAGES = [
    { duration: 10000,  targetVUs: 1000  },
    { duration: 30000,  targetVUs: 5000  },
    { duration: 60000,  targetVUs: 10000 },
    { duration: 180000, targetVUs: 10000 },
    { duration: 30000,  targetVUs: 0     },
];

const metrics = {
    totalRequests: 0,
    failedRequests: 0,
    durations: [],
};

const makeRequest = () => {
    return new Promise((resolve) => {
        const start = Date.now();
        const req = https.get(TARGET_URL, (res) => {
            res.resume();
            res.on('end', () => {
                const duration = Date.now() - start;
                metrics.totalRequests++;
                metrics.durations.push(duration);
                if (res.statusCode !== 200) metrics.failedRequests++;
                resolve({ status: res.statusCode, duration });
            });
        });
        req.on('error', () => {
            metrics.totalRequests++;
            metrics.failedRequests++;
            resolve({ status: 0, duration: Date.now() - start });
        });
        req.setTimeout(5000, () => {
            req.destroy();
            metrics.totalRequests++;
            metrics.failedRequests++;
            resolve({ status: 0, duration: 5000 });
        });
    });
};

const percentile = (arr, p) => {
    if (arr.length === 0) return 0;
    const sorted = [...arr].sort((a, b) => a - b);
    const idx = Math.ceil((p / 100) * sorted.length) - 1;
    return sorted[idx];
};

const runSpikeTest = async (logFn = console.log) => {
    metrics.totalRequests = 0;
    metrics.failedRequests = 0;
    metrics.durations = [];

    let currentVUs = 0;
    let activeWorkers = new Set();

    const workerLoop = async (id) => {
        while (activeWorkers.has(id)) {
            await makeRequest();
        }
    };

    const startTime = Date.now();
    logFn('\n🚀 Starting spike test → ' + TARGET_URL);

    for (const stage of STAGES) {
        const elapsed = Date.now() - startTime;
        logFn(`\n📈 Stage: ramp to ${stage.targetVUs} VUs over ${stage.duration / 1000}s`);

        const stageStart = Date.now();
        while (Date.now() - stageStart < stage.duration) {
            // Ramp VUs up/down gradually
            const progress = (Date.now() - stageStart) / stage.duration;
            const targetNow = Math.round(currentVUs + (stage.targetVUs - currentVUs) * Math.min(progress, 1));

            while (activeWorkers.size < targetNow) {
                const id = Symbol();
                activeWorkers.add(id);
                workerLoop(id);
            }
            while (activeWorkers.size > targetNow && activeWorkers.size > 0) {
                const id = activeWorkers.values().next().value;
                activeWorkers.delete(id);
            }

            await new Promise(r => setTimeout(r, 500));
            logFn(`  VUs: ${activeWorkers.size} | Requests: ${metrics.totalRequests} | Failed: ${metrics.failedRequests}`);
        }
        currentVUs = stage.targetVUs;
    }

    // Stop all workers
    activeWorkers.clear();
    await new Promise(r => setTimeout(r, 500));

    // Print summary
    const avg = metrics.durations.reduce((a, b) => a + b, 0) / (metrics.durations.length || 1);
    const p95 = percentile(metrics.durations, 95);
    const p99 = percentile(metrics.durations, 99);
    const failRate = (metrics.failedRequests / (metrics.totalRequests || 1)) * 100;

    const summary = `
═══════════════ SPIKE TEST SUMMARY ═══════════════
  Total Requests : ${metrics.totalRequests}
  Failed         : ${metrics.failedRequests} (${failRate.toFixed(2)}%)
  Avg Response   : ${avg.toFixed(2)}ms
  P95 Response   : ${p95}ms
  P99 Response   : ${p99}ms
═══════════════════════════════════════════════════
`;
    logFn(summary);
    return { totalRequests: metrics.totalRequests, failedRequests: metrics.failedRequests, avg, p95, p99, failRate };
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// HTTP Server for Vercel
const server = http.createServer(async (req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.write('✅ Vercel K6 Node Triggered\n');
    res.write(`Target: ${TARGET_URL}\n\n`);

    const log = (msg) => {
        console.log(msg);
        try { res.write(msg + '\n'); } catch (_) {}
    };

    await runSpikeTest(log);
    res.end('\n✅ Execution finished (or timed out by Vercel)\n');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);

    // If NOT on Vercel, run the infinite loop
    if (!process.env.VERCEL) {
        (async () => {
            while (true) {
                await runSpikeTest();
                console.log('⏳ Waiting 5 seconds before next run...\n');
                await delay(5000);
            }
        })();
    }
});
