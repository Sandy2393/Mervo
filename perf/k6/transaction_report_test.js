import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: Number(__ENV.VUS || 5),
  duration: __ENV.DURATION || '1m',
  thresholds: {
    http_req_duration: ['p(95)<1000'],
  },
};

const base = __ENV.TARGET_URL || 'http://localhost:3000';
const allowProd = __ENV.ALLOW_PERF_TARGET === 'true';

if (base.includes('prod') && !allowProd) {
  throw new Error('Refusing to target production without ALLOW_PERF_TARGET=true');
}

export default function () {
  const res = http.get(`${base}/api/reports/sample`);
  check(res, { 'status ok': (r) => r.status < 400 });
  sleep(1);
}
