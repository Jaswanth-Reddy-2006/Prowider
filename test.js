fetch('http://localhost:3000/api/leads', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    customerName: 'Test',
    phoneNumber: '1234567890',
    city: 'Test City',
    serviceId: 3
  })
}).then(async r => {
  console.log('Status:', r.status);
  console.log('Text:', await r.text());
}).catch(console.error);
