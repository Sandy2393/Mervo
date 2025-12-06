import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '30s', target: 50 },
    { duration: '1m', target: 200 },
    { duration: '30s', target: 0 }
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],
    errors: ['rate<0.01']
  }
};

const BASE_URL = __ENV.BASE_URL || 'REPLACE_BASE_URL';
const AUTH_TOKEN = __ENV.AUTH_TOKEN || 'REPLACE_TOKEN';

export default function () {
  // Simulate login (placeholder - real flow should use API auth)
  const headers = { Authorization: `Bearer ${AUTH_TOKEN}`, 'Content-Type': 'application/json' };

  // Hit list jobs
  let res = http.get(`${BASE_URL}/api/job-instances?limit=20`, { headers });
  check(res, { 'list job instances status 200': (r) => r.status === 200 });

  // Simulate clock in/out (placeholder endpoints)
  const instId = 'REPLACE_INSTANCE_ID';
  res = http.post(`${BASE_URL}/api/timesheets/clock-in`, JSON.stringify({ jobInstanceId: instId }), { headers });
  check(res, { 'clock-in accepted': (r) => r.status === 200 || r.status === 201 });

  // Upload small photo via placeholder endpoint
  // Real upload should use signed URLs; here we simulate POST
  res = http.post(`${BASE_URL}/api/job-photos/upload`, JSON.stringify({ jobInstanceId: instId, file: 'dummy' }), { headers });

  // Submit report
  res = http.post(`${BASE_URL}/api/reports/submit`, JSON.stringify({ jobInstanceId: instId, notes: 'Load test report' }), { headers });

  sleep(1);
}
