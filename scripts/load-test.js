import http from 'k6/http'
import { check, sleep } from 'k6'

export const options = {
  stages: [
    { duration: '10s', target: 50 },  // Ramp up to 50 users
    { duration: '30s', target: 50 },  // Stay at 50
    { duration: '10s', target: 100 }, // Spike to 100
    { duration: '10s', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests must complete below 500ms
    http_req_failed: ['rate<0.01'],   // Error rate < 1%
  },
}

export default function () {
  const payload = JSON.stringify({
    customerName: `TestUser_${__VU}_${__ITER}`,
    phoneNumber: `+1555${Math.floor(1000000 + Math.random() * 9000000)}`,
    city: 'San Francisco',
    description: 'Load testing request',
    serviceId: 3 // Mixed mandatory and fair providers
  })

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  }

  const res = http.post('http://localhost:3000/api/leads', payload, params)

  check(res, {
    'is status 200': (r) => r.status === 200,
    'has lead id': (r) => r.json('lead.id') !== undefined,
  })

  // Short sleep to simulate real-world request spacing but keep pressure high
  sleep(Math.random() * 0.5)
}
