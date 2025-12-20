/**
 * DEMONSTRATION: HTTP Module Streaming Concepts
 *
 * This shows how the Node.js http module works with streams and chunks
 */

console.log('═'.repeat(60));
console.log('   UNDERSTANDING NODE.JS HTTP MODULE - STREAMING DATA');
console.log('═'.repeat(60));

console.log('\n📚 CONCEPT: Why Streams and Chunks?\n');
console.log("When data arrives over the network, it doesn't come all at once.");
console.log('Instead, it arrives in "chunks" - small pieces of data.');
console.log('The http module emits events as data flows through.\n');

console.log('🔄 EVENT FLOW:');
console.log('  1. request()  → Initiates the HTTP request');
console.log('  2. "response" → Fires when headers are received');
console.log('  3. "data"     → Fires for EACH chunk of body data');
console.log('  4. "end"      → Fires when all data is received');
console.log('  5. "error"    → Fires if something goes wrong\n');

console.log('─'.repeat(60));

// Simulated example to demonstrate the concept
console.log('\n💡 SIMULATED EXAMPLE OF HOW IT WORKS:\n');

function simulateHttpRequest() {
  // Simulate the response data
  const fullResponse = JSON.stringify(
    {
      userId: 1,
      id: 1,
      title: 'sunt aut facere repellat provident',
      body: 'quia et suscipit\nsuscipit recusandae consequuntur',
    },
    null,
    2
  );

  // Split into chunks to simulate network behavior
  const chunkSize = 30;
  const chunks: string[] = [];

  for (let i = 0; i < fullResponse.length; i += chunkSize) {
    chunks.push(fullResponse.slice(i, i + chunkSize));
  }

  console.log(`📦 Response will arrive in ${chunks.length} chunks:\n`);

  // Simulate receiving chunks
  const receivedChunks: Buffer[] = [];

  chunks.forEach((chunk, index) => {
    setTimeout(() => {
      const buffer = Buffer.from(chunk);
      receivedChunks.push(buffer);

      console.log(`   Chunk ${index + 1}: ${buffer.length} bytes`);
      console.log(`   Raw: "${chunk.replace(/\n/g, '\\n')}"`);

      if (index === chunks.length - 1) {
        setTimeout(() => {
          console.log('\n✅ All chunks received! Now combining...\n');

          const complete = Buffer.concat(receivedChunks).toString();
          console.log('📄 COMPLETE DATA:');
          console.log(complete);

          console.log('\n🎯 PARSED JSON:');
          const parsed = JSON.parse(complete);
          console.log(`   Title: ${parsed.title}`);
          console.log(`   User ID: ${parsed.userId}`);
        }, 100);
      }
    }, index * 800);
  });
}

simulateHttpRequest();

// Wait for simulation to complete, then show the actual code pattern
setTimeout(() => {
  console.log('\n' + '═'.repeat(60));
  console.log('   ACTUAL HTTP MODULE CODE PATTERN');
  console.log('═'.repeat(60) + '\n');

  console.log(`
const https = require('https');

https.get('https://api.example.com/data', (response) => {
  
  // 1. Log response metadata
  console.log('Status:', response.statusCode);
  console.log('Headers:', response.headers);
  
  // 2. Collect chunks
  const chunks = [];
  
  // 3. Listen for data events (each chunk)
  response.on('data', (chunk) => {
    console.log('Received chunk:', chunk.length, 'bytes');
    chunks.push(chunk);
  });
  
  // 4. Listen for end event (all done)
  response.on('end', () => {
    // Combine all chunks
    const completeData = Buffer.concat(chunks);
    const jsonString = completeData.toString();
    const parsed = JSON.parse(jsonString);
    
    console.log('Final data:', parsed);
  });
  
}).on('error', (err) => {
  console.error('Error:', err.message);
});
`);

  console.log('─'.repeat(60));
  console.log('\n🔑 KEY POINTS:\n');
  console.log('1. BUFFER vs STRING:');
  console.log('   • Chunks arrive as Buffer objects (raw bytes)');
  console.log('   • Call .toString() to convert to string');
  console.log('   • Use Buffer.concat() to combine chunks\n');

  console.log('2. WHY NOT JUST response.body?');
  console.log('   • Streaming allows handling large responses');
  console.log('   • Memory efficient (process as data arrives)');
  console.log('   • Can start processing before all data arrives\n');

  console.log('3. EVENT-DRIVEN NATURE:');
  console.log('   • You register callbacks for events');
  console.log('   • Node.js calls them when events occur');
  console.log('   • Asynchronous and non-blocking\n');

  console.log('4. WHEN TO USE:');
  console.log('   • Learning HTTP internals (like now!)');
  console.log('   • Need fine-grained control over streaming');
  console.log('   • Building HTTP libraries/frameworks');
  console.log('   • For most apps: use fetch/axios instead\n');
}, 4000);
