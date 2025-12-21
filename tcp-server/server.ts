/**
 * SIMPLE HTTP SERVER (Raw TCP)
 * This demonstrates how an HTTP server works at the TCP level
 * We'll manually parse HTTP requests and craft HTTP responses
 */

import net from 'net';

console.log('═'.repeat(70));
console.log('   RAW TCP HTTP SERVER');
console.log('═'.repeat(70));
console.log();

const PORT = 8080;
const HOST = '127.0.0.1';

const server = net.createServer((socket) => {
  console.log('\n🔌 New connection from:', socket.remoteAddress);

  let requestData = '';

  // Listen for data from the client
  socket.on('data', (data) => {
    requestData += data.toString();

    if (requestData.includes('\r\n\r\n')) {
      console.log('\n📥 RECEIVED HTTP REQUEST:');
      console.log('─'.repeat(70));
      console.log(requestData.replace(/\r\n/g, '\\r\\n\n'));
      console.log('─'.repeat(70));

      const lines = requestData.split('\r\n');
      const [method, path, protocol] = lines[0]?.split(' ') || [];

      console.log('\n🔍 PARSED REQUEST:');
      console.log(`   Method: ${method}`);
      console.log(`   Path: ${path}`);
      console.log(`   Protocol: ${protocol}`);

      const headers: Record<string, string> = {};
      const headers2: Record<string, string> = {};

      for (let i = 1; i < lines.length; i++) {
        if (lines[i] === '') break; // End of headers
        const [key, ...values] = lines[i]?.split(':') || [];

        if (key && values.length) {
          headers[key.trim().toLowerCase()] = values.join(':').trim();
          headers2[key.trim().toLowerCase()] = values.join('').trim();
        }
      }

      console.log('\n📋 HEADERS:');
      Object.entries(headers).forEach(([key, value]) => {
        console.log(`   ${key}: ${value}`);
      });

      // Craft different responses based on path
      let statusCode = '200 OK';
      let contentType = 'text/html';

      let body = '';

      if (path === '/') {
        body = `<!DOCTYPE html>
<html>
<head><title>Raw TCP Server</title></head>
<body>
  <h1>Hello from Raw TCP Server!</h1>
  <p>This response was crafted manually as a string.</p>
  <p>Try these paths:</p>
  <ul>
    <li><a href="/json">/json</a> - Get JSON data</li>
    <li><a href="/time">/time</a> - Get current time</li>
    <li><a href="/notfound">/notfound</a> - See a 404</li>
  </ul>
</body>
</html>`;
      } else if (path === '/json') {
        contentType = 'application/json';
        body = JSON.stringify(
          {
            message: 'This is JSON from a raw TCP server',
            timestamp: new Date().toISOString(),
            method: method,
            path: path,
          },
          null,
          2
        );
      } else if (path === '/time') {
        body = `Current server time: ${new Date().toISOString()}`;
        contentType = 'text/plain';
      } else {
        statusCode = '404 Not Found';
        body = `404 - Path "${path}" not found`;
        contentType = 'text/plain';
      }

      const httpResponse =
        `HTTP/1.1 ${statusCode}\r\n` +
        `Content-Type: ${contentType}\r\n` +
        `Content-Length: ${Buffer.byteLength(body)}\r\n` +
        `Connection: close\r\n` +
        `Date: ${new Date().toUTCString()}\r\n` +
        `Server: RawTCP-Server/1.0\r\n` +
        `\r\n` +
        body;

      console.log('\n📤 SENDING HTTP RESPONSE:');
      console.log('─'.repeat(70));
      console.log(
        (httpResponse.split('\r\n\r\n')[0] ?? '').replace(/\r\n/g, '\\r\\n\n')
      );
      console.log('\\r\\n');
      console.log(`[Body: ${body.length} bytes]`);
      console.log('─'.repeat(70));

      socket.write(httpResponse);

      socket.end();
    }
  });

  socket.on('end', () => {
    console.log('👋 Client disconnected');
  });

  socket.on('error', (err) => {
    console.error('❌ Socket error:', err.message);
  });
});

server.listen(PORT, HOST, () => {
  console.log(`🚀 Server listening on ${HOST}:${PORT}`);
  console.log();
  console.log('📝 You can test it with:');
  console.log();
  console.log('   1. Web browser:');
  console.log(`      http://localhost:${PORT}/`);
  console.log();
  console.log('   2. curl command:');
  console.log(`      curl http://localhost:${PORT}/`);
  console.log(`      curl http://localhost:${PORT}/json`);
  console.log();
  console.log('   3. Raw TCP client (run in another terminal):');
  console.log(`      npx tsx client.ts`);
  console.log();
  console.log('   4. Telnet (manual typing):');
  console.log(`      telnet localhost ${PORT}`);
  console.log('      Then type: GET / HTTP/1.1');
  console.log('                 Host: localhost');
  console.log('                 [press Enter twice]');
  console.log();
  console.log('Press Ctrl+C to stop the server');
  console.log('═'.repeat(70));
});

// Handle server errors
server.on('error', (err) => {
  console.error('❌ Server error:', err.message);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n🛑 Shutting down server...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});
