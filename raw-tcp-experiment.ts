import net from 'net';

/**
 * RAW TCP SOCKET EXPERIMENT
 * This demonstrates that HTTP is simply formatted text sent over a TCP connection
 * We'll manually craft HTTP requests and see the raw responses
 */

console.log('═'.repeat(70));
console.log('   HOUR 5: THE RAW EXPERIMENT - HTTP is Just Text Over TCP');
console.log('═'.repeat(70));
console.log();

// ========================================
// EXPERIMENT 1: Basic HTTP/1.1 GET Request
// ========================================

function rawHttpRequest(host: string, port: number, path: string = '/'): void {
  console.log(`\n🔌 Connecting to ${host}:${port}...\n`);

  // Create a raw TCP socket connection
  const socket = net.connect(port, host, () => {
    console.log('✅ TCP Connection established!');
    console.log(`   Local: ${socket.localAddress}:${socket.localPort}`);
    console.log(`   Remote: ${socket.remoteAddress}:${socket.remotePort}`);
    console.log();

    // Manually craft the HTTP request as a string
    const httpRequest =
      `GET ${path} HTTP/1.1\r\n` +
      `Host: ${host}\r\n` +
      `Connection: close\r\n` +
      `User-Agent: RawTCP-Client/1.0\r\n` +
      `Accept: */*\r\n` +
      `\r\n`;

    console.log('📤 SENDING RAW HTTP REQUEST:');
    console.log('─'.repeat(70));
    console.log(httpRequest.replace(/\r\n/g, '\\r\\n\n'));
    console.log('─'.repeat(70));
    console.log();

    // Write the raw text to the socket
    socket.write(httpRequest);
  });

  let responseData = '';
  let chunkCount = 0;

  // Listen for data coming back (the HTTP response)
  socket.on('data', (chunk: Buffer) => {
    chunkCount++;
    responseData += chunk.toString();
    console.log(`📦 Chunk ${chunkCount} received: ${chunk.length} bytes`);
  });

  // When connection closes, parse the response
  socket.on('end', () => {
    console.log('\n✅ Connection closed by server');
    console.log('═'.repeat(70));
    console.log('📥 COMPLETE RAW HTTP RESPONSE:');
    console.log('═'.repeat(70));

    // Split response into headers and body
    const [rawHeaders, ...bodyParts] = responseData.split('\r\n\r\n');
    const body = bodyParts.join('\r\n\r\n');

    console.log('\n📋 HEADERS (raw text):');
    console.log('─'.repeat(70));
    console.log(rawHeaders);
    console.log('─'.repeat(70));

    console.log('\n📄 BODY (first 500 characters):');
    console.log('─'.repeat(70));
    console.log(body.substring(0, 500));
    if (body.length > 500) {
      console.log(`\n... (${body.length - 500} more characters)`);
    }
    console.log('─'.repeat(70));

    // Parse the status line
    const statusLine = rawHeaders!.split('\r\n')[0];
    const [protocol, statusCode, ...statusTextParts] = statusLine!.split(' ');
    const statusText = statusTextParts.join(' ');

    console.log('\n🔍 PARSED METADATA:');
    console.log(`   Protocol: ${protocol}`);
    console.log(`   Status Code: ${statusCode}`);
    console.log(`   Status Text: ${statusText}`);
    console.log(`   Total Response Size: ${responseData.length} bytes`);
    console.log(`   Total Chunks: ${chunkCount}`);
  });

  // Error handling
  socket.on('error', (err) => {
    console.error('\n❌ Socket error:', err.message);
  });

  // Timeout handling
  socket.setTimeout(10000, () => {
    console.log('\n⏱️  Socket timeout');
    socket.destroy();
  });
}

// ========================================
// EXPERIMENT 2: Comparing Different HTTP Methods
// ========================================

function demonstrateHttpMethods(): void {
  console.log('\n\n');
  console.log('═'.repeat(70));
  console.log('   DEMONSTRATION: Different HTTP Request Formats');
  console.log('═'.repeat(70));
  console.log();

  console.log('🔹 HTTP GET Request:');
  console.log('─'.repeat(70));
  const getRequest =
    `GET /api/users HTTP/1.1\r\n` +
    `Host: api.example.com\r\n` +
    `Accept: application/json\r\n` +
    `\r\n`;
  console.log(getRequest.replace(/\r\n/g, '\\r\\n\n'));

  console.log('🔹 HTTP POST Request (with body):');
  console.log('─'.repeat(70));
  const postData = JSON.stringify({ name: 'Alice', age: 30 });
  const postRequest =
    `POST /api/users HTTP/1.1\r\n` +
    `Host: api.example.com\r\n` +
    `Content-Type: application/json\r\n` +
    `Content-Length: ${postData.length}\r\n` +
    `\r\n` +
    `${postData}`;
  console.log(postRequest.replace(/\r\n/g, '\\r\\n\n'));

  console.log('🔹 HTTP HEAD Request (headers only):');
  console.log('─'.repeat(70));
  const headRequest = `HEAD / HTTP/1.1\r\n` + `Host: example.com\r\n` + `\r\n`;
  console.log(headRequest.replace(/\r\n/g, '\\r\\n\n'));
}

// ========================================
// EXPERIMENT 3: Understanding HTTP Components
// ========================================

console.log('📚 UNDERSTANDING THE HTTP REQUEST FORMAT:\n');
console.log('HTTP Request Structure:');
console.log(`
┌─────────────────────────────────────────────────────────┐
│ Request Line:                                           │
│   GET /path HTTP/1.1                                    │
│   │   │    │                                            │
│   │   │    └─ Protocol version                          │
│   │   └────── Path/Resource                             │
│   └────────── Method (GET, POST, PUT, DELETE, etc.)     │
├─────────────────────────────────────────────────────────┤
│ Headers (key: value pairs):                             │
│   Host: example.com                                     │
│   Content-Type: application/json                        │
│   Content-Length: 42                                    │
│   User-Agent: MyClient/1.0                              │
│   ... (more headers)                                    │
├─────────────────────────────────────────────────────────┤
│ Empty Line (\\r\\n\\r\\n):                                  │
│   (separates headers from body)                         │
├─────────────────────────────────────────────────────────┤
│ Body (optional):                                        │
│   {"name": "Alice", "age": 30}                          │
│   (only for POST, PUT, PATCH)                           │
└─────────────────────────────────────────────────────────┘
`);

console.log('🔑 CRITICAL DETAILS:\n');
console.log(
  '1. Line endings MUST be \\r\\n (CRLF - Carriage Return + Line Feed)'
);
console.log('   • \\r = Carriage Return (ASCII 13)');
console.log('   • \\n = Line Feed (ASCII 10)');
console.log("   • Just \\n (LF) won't work - HTTP spec requires CRLF!");
console.log();
console.log('2. Headers end with double CRLF (\\r\\n\\r\\n)');
console.log('   • First \\r\\n ends the last header');
console.log('   • Second \\r\\n signals "headers are done, body starts now"');
console.log();
console.log('3. Host header is REQUIRED in HTTP/1.1');
console.log('   • HTTP/1.1 introduced virtual hosting');
console.log('   • Multiple domains can share one IP address');
console.log('   • Server uses Host header to determine which site');
console.log();
console.log('4. Connection: close tells server to close after response');
console.log('   • Without this, server keeps connection open (keep-alive)');
console.log('   • We need it to know when response is complete');
console.log();

// ========================================
// DEMONSTRATION: Show what we're actually sending as bytes
// ========================================

console.log('═'.repeat(70));
console.log('   BYTE-LEVEL VIEW: What Actually Goes Over the Wire');
console.log('═'.repeat(70));
console.log();

const exampleRequest = `GET / HTTP/1.1\r\nHost: example.com\r\n\r\n`;

console.log('📝 String representation:');
console.log(`   "${exampleRequest.replace(/\r\n/g, '\\r\\n')}"`);
console.log();

console.log('🔢 As bytes (hexadecimal):');
const buffer = Buffer.from(exampleRequest);
let hexString = '';
for (let i = 0; i < buffer.length; i++) {
  hexString += buffer[i]?.toString(16).padStart(2, '0') + ' ';
  if ((i + 1) % 16 === 0) hexString += '\n   ';
}
console.log('   ' + hexString);
console.log();

console.log('📊 Character breakdown:');
exampleRequest.split('').forEach((char, i) => {
  const code = char.charCodeAt(0);
  let display = char;
  if (char === '\r') display = '\\r (CR)';
  else if (char === '\n') display = '\\n (LF)';
  else if (char === ' ') display = '(space)';

  if (i < 30) {
    // Show first 30 characters
    console.log(
      `   [${i}] '${display}' = ASCII ${code} = 0x${code.toString(16)}`
    );
  }
});
console.log('   ... (more characters)');
console.log();

// ========================================
// RUN THE ACTUAL EXPERIMENT
// ========================================

console.log('═'.repeat(70));
console.log('   LIVE EXPERIMENT: Making a Real TCP Connection');
console.log('═'.repeat(70));

// Demonstrate different methods
demonstrateHttpMethods();

// Make an actual request to example.com
console.log('\n\n');
console.log('🚀 Now making a REAL request to example.com:80...');
console.log();

rawHttpRequest('example.com', 80, '/');
