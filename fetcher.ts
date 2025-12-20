import https from 'https';

function fetchData(url: string): void {
  console.log(`\n🚀 Making GET request to: ${url}\n`);

  const urlObj = new URL(url);

  const options = {
    method: 'GET',
    hostname: urlObj.host,
    port: urlObj.port || 443,
    path: urlObj.pathname,
    headers: {
      'user-agent': 'Node.js HTTP Client',
    },
  };

  const req = https.request(options, (res) => {
    console.log('📊 RESPONSE METADATA:');
    console.log('─'.repeat(50));
    console.log(`Status Code: ${res.statusCode}`);
    console.log(`Status Message: ${res.statusMessage}`);
    console.log('\n📋 SELECTED HEADERS:');
    console.log(`  Date: ${res.headers.date}`);
    console.log(`  Content-Type: ${res.headers['content-type']}`);
    console.log(
      `  Content-Length: ${res.headers['content-length'] || 'chunked'}`
    );
    console.log(`  Server: ${res.headers.server || 'N/A'}`);
    console.log('─'.repeat(50));

    const chunks: Buffer[] = [];
    let chunkCount = 0;

    res.on('data', (chunk: Buffer) => {
      chunkCount++;

      console.log(`\n📦 Chunk ${chunkCount} received: ${chunk.length} bytes`);

      const preview = chunk.toString();
      console.log(`   Preview: ${preview}`);

      chunks.push(chunk);
    });

    res.on('end', () => {
      console.log('\n✅ All chunks received!');
      console.log('─'.repeat(50));

      const completedData = Buffer.concat(chunks);
      const totalBytes = completedData.length;

      console.log(`\n📊 SUMMARY:`);
      console.log(`  Total chunks: ${chunkCount}`);
      console.log(`  Total bytes: ${totalBytes}`);

      try {
        const jsonData = JSON.parse(completedData.toString());

        console.log('\n📄 PARSED JSON DATA:');
        console.log('─'.repeat(50));
        console.log(JSON.stringify(jsonData, null, 2));
        console.log('─'.repeat(50));

        // Access specific fields
        console.log('\n🔍 SPECIFIC FIELDS:');
        console.log(`  Post ID: ${jsonData.id}`);
        console.log(`  User ID: ${jsonData.userId}`);
        console.log(`  Title: ${jsonData.title}`);
        console.log(`  Body Length: ${jsonData.body?.length || 0} characters`);
      } catch (error) {
        console.error('\n❌ Error parsing JSON:', error);
      }
    });
  });

  req.on('error', (error) => {
    console.error('\n❌ Request error:', error.message);
  });

  req.on('socket', (socket) => {
    socket.on('timeout', () => {
      console.error('\n⏱️  Request timeout');
      req.destroy();
    });
  });

  req.setTimeout(5000);

  req.end('✅\nRequest ending successfully');
}

const url = 'https://jsonplaceholder.typicode.com/posts/1';
fetchData(url);

console.log('\n💡 KEY CONCEPTS DEMONSTRATED:');
console.log('  1. Stream-based data handling (chunks)');
console.log('  2. Event-driven architecture (data, end, error events)');
console.log('  3. Buffer management and concatenation');
console.log('  4. Header inspection and metadata extraction');
console.log('  5. Proper error handling\n');
