import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  scenarios: {
    spike_test: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '10s', target: 1000 },
        { duration: '30s', target: 5000 },
        { duration: '1m', target: 10000 },
        { duration: '3m', target: 10000 },
        { duration: '30s', target: 0 },
      ],
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'],
    http_req_failed: ['rate<0.1'],
  },
};

export function handleSummary(data) {
  return {
    'results.json': JSON.stringify(data),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}

function textSummary(data, options = {}) {
  const { indent = '', enableColors = false } = options;
  const color = enableColors ? (text, code) => `\x1b[${code}m${text}\x1b[0m` : (text) => text;
  
  const metrics = data.metrics;
  let summary = '\n' + color('═══════════════ K6 TEST SUMMARY ═══════════════', '36') + '\n\n';
  
  if (metrics.http_reqs) {
    summary += `${indent}Total Requests: ${metrics.http_reqs.value}\n`;
  }
  if (metrics.http_req_failed) {
    summary += `${indent}Failed Requests: ${metrics.http_req_failed.value}\n`;
  }
  if (metrics.http_req_duration) {
    const dur = metrics.http_req_duration.values;
    summary += `${indent}Response Time (avg): ${dur.avg?.toFixed(2)}ms\n`;
    summary += `${indent}Response Time (p95): ${dur['p(95)']?.toFixed(2)}ms\n`;
  }
  if (metrics.vus_max) {
    summary += `${indent}Max VUs: ${metrics.vus_max.value}\n`;
  }
  
  summary += '\n' + color('═══════════════════════════════════════════════', '36') + '\n';
  return summary;
}

export default function () {
  const res = http.get('https://djp.skehgo.cc/');
  
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
  
  sleep(1);
}
