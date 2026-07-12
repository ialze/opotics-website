const https = require('https');

const auth = Buffer.from(`solutions@opotics.com:9rFcX44cdmS$E#f`).toString('base64');
const data = JSON.stringify({
  from: 'solutions@opotics.com',
  to: 'issa@orientalpress.com',
  subject: 'Test Inquiry',
  text: 'Test Message'
});

const options = {
  hostname: 'api.forwardemail.net',
  port: 443,
  path: '/v1/emails',
  method: 'POST',
  rejectUnauthorized: false,
  headers: {
    'Authorization': `Basic ${auth}`,
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = https.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  res.on('data', (d) => {
    process.stdout.write(d);
  });
});

req.on('error', (error) => {
  console.error(error);
});

req.write(data);
req.end();
