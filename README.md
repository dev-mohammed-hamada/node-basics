# Node.js HTTP Module - Stream-Based Learning

## Overview

This project demonstrates the **Node.js built-in `http/https` module** with a focus on understanding **stream-based data handling** and **chunk processing**. Unlike high-level libraries like `axios` or `fetch`, the `http` module forces you to understand how data actually arrives over the network.

---

## 🎯 Learning Objectives

1. **Understand HTTP streaming**: Data doesn't arrive all at once
2. **Event-driven architecture**: How Node.js uses events for async I/O
3. **Buffer management**: Working with raw bytes and converting to strings
4. **Response metadata**: Accessing status codes and headers
5. **Error handling**: Proper patterns for network requests

---

## 📁 Files Included

### 1. `fetcher.ts` - Basic HTTP GET Request
The main task implementation that:
- Makes a GET request to JSONPlaceholder API
- Listens to the `'data'` event to collect chunks
- Listens to the `'end'` event to parse complete JSON
- Logs status codes and headers

**Run it:**
```bash
npx tsx fetcher.ts
```

### 2. `streaming-demo.ts` - Conceptual Demonstration
A simulated example that shows:
- How data arrives in chunks
- The event flow (request → response → data → end)
- Visual representation of chunk processing
- Why streaming matters

**Run it:**
```bash
npx tsx streaming-demo.ts
```

### 3. `advanced-patterns.ts` - Production Patterns
Advanced techniques including:
- Promise-wrapped HTTP requests
- POST requests with data
- Status code handling and redirects
- Timeout management
- Common mistakes to avoid

**Run it:**
```bash
npx tsx advanced-patterns.ts
```

---

## 🔄 How HTTP Streaming Works

### The Event Flow

```
1. https.request() or https.get()
   ↓
2. 'response' event fires
   • Headers received
   • Status code available
   • Body streaming begins
   ↓
3. 'data' events fire (multiple times)
   • Each event provides one chunk
   • Chunks are Buffer objects
   • Collect into an array
   ↓
4. 'end' event fires
   • All data received
   • Combine chunks with Buffer.concat()
   • Parse or process complete data
```

### Visual Example

```
Network → [chunk1] → [chunk2] → [chunk3] → Complete Data
          ↓          ↓          ↓
       'data'     'data'     'data'  →  'end'
```

---

## 💡 Key Concepts

### 1. **Buffers vs Strings**

```typescript
// Chunks arrive as Buffers (raw bytes)
response.on('data', (chunk: Buffer) => {
  console.log(chunk); // <Buffer 7b 22 75 73 ...>
  console.log(chunk.toString()); // {"userId": 1, ...}
});
```

**Why Buffers?**
- Efficient for binary data
- Supports different encodings
- Lower-level control over data

### 2. **Why Collect Chunks?**

❌ **WRONG - Parsing incomplete data:**
```typescript
response.on('data', (chunk) => {
  const data = JSON.parse(chunk); // Might fail! Chunk could be incomplete
});
```

✅ **CORRECT - Collect all chunks first:**
```typescript
const chunks: Buffer[] = [];

response.on('data', (chunk) => {
  chunks.push(chunk);
});

response.on('end', () => {
  const completeData = Buffer.concat(chunks).toString();
  const json = JSON.parse(completeData); // Safe!
});
```

### 3. **Event-Driven Model**

Node.js uses an event emitter pattern:

```typescript
// Register event listeners
response.on('data', handleData);    // Called multiple times
response.on('end', handleEnd);      // Called once
response.on('error', handleError);  // Called if error occurs

// Node.js calls these functions when events happen
```

### 4. **Request vs Response**

```typescript
// REQUEST - what you send
const req = https.request(options, callback);
req.write(data);  // Send data (for POST/PUT)
req.end();        // Signal done sending

// RESPONSE - what you receive
req.on('response', (res) => {
  res.on('data', ...);   // Receive data chunks
  res.on('end', ...);    // All data received
});
```

---

## 🎓 Common Patterns

### Pattern 1: Promise Wrapper

Convert callback-based API to Promise:

```typescript
function httpGet(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      const chunks: Buffer[] = [];
      
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => {
        resolve(Buffer.concat(chunks).toString());
      });
      response.on('error', reject);
    }).on('error', reject);
  });
}

// Use with async/await
const data = await httpGet('https://api.example.com/data');
```

### Pattern 2: POST Request

```typescript
const postData = JSON.stringify({ name: 'Alice' });

const options = {
  hostname: 'api.example.com',
  path: '/users',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = https.request(options, (res) => {
  // Handle response...
});

req.write(postData);  // Send data
req.end();            // Important!
```

### Pattern 3: Timeout Handling

```typescript
const req = https.get(url, callback);

req.setTimeout(5000, () => {
  req.destroy();
  console.error('Request timeout');
});

req.on('error', (err) => {
  console.error('Request error:', err);
});
```

---

## ⚠️ Common Mistakes

### Mistake 1: Not collecting chunks
```typescript
// ❌ WRONG
res.on('data', (chunk) => {
  const data = JSON.parse(chunk); // Chunk might be incomplete!
});
```

### Mistake 2: Forgetting req.end()
```typescript
// ❌ WRONG
const req = https.request(options, callback);
req.write(data);
// Request never completes!
```

### Mistake 3: Not handling errors
```typescript
// ❌ WRONG
https.get(url, (res) => {
  res.on('data', ...);
  res.on('end', ...);
  // No error handler - app crashes on error
});
```

### Mistake 4: Wrong encoding
```typescript
// ❌ WRONG
let data = '';
res.on('data', (chunk) => {
  data += chunk; // Implicit conversion can fail
});

// ✅ CORRECT
const chunks: Buffer[] = [];
res.on('data', (chunk) => chunks.push(chunk));
res.on('end', () => {
  const data = Buffer.concat(chunks).toString('utf8');
});
```

---

## 🆚 HTTP Module vs Modern Alternatives

### When to use `http` module:
- ✅ Learning HTTP internals
- ✅ Need fine-grained control
- ✅ Building HTTP libraries/frameworks
- ✅ Streaming large files efficiently
- ✅ Understanding how networking works

### When to use `fetch` or `axios`:
- ✅ Production applications
- ✅ Simple API requests
- ✅ Want automatic JSON parsing
- ✅ Need interceptors/middleware
- ✅ Cross-platform code (browser + Node.js)

**Example comparison:**

```typescript
// HTTP module (verbose but explicit)
https.get(url, (res) => {
  const chunks: Buffer[] = [];
  res.on('data', (chunk) => chunks.push(chunk));
  res.on('end', () => {
    const data = JSON.parse(Buffer.concat(chunks).toString());
    console.log(data);
  });
}).on('error', console.error);

// fetch (simple and clean)
const data = await fetch(url).then(r => r.json());
console.log(data);
```

---

## 🔍 Deep Dive: Why Streams?

### Memory Efficiency

**Without streaming (load everything into memory):**
```typescript
// ❌ Loads entire 1GB file into memory
const fileContent = fs.readFileSync('large-file.json');
const data = JSON.parse(fileContent);
```

**With streaming (process incrementally):**
```typescript
// ✅ Processes data as it arrives
const stream = fs.createReadStream('large-file.json');
stream.on('data', (chunk) => {
  processChunk(chunk); // Handle piece by piece
});
```

### Network Reality

Data doesn't teleport - it travels through:
1. Your network interface
2. Your router
3. ISP infrastructure
4. Internet backbone
5. Server's ISP
6. Server's network
7. Back through all of that

Each hop adds latency. Streaming lets you start processing before everything arrives.

---

## 📊 Understanding Headers and Status Codes

```typescript
https.get(url, (response) => {
  // Status information
  console.log('Status:', response.statusCode);     // 200, 404, etc.
  console.log('Message:', response.statusMessage); // "OK", "Not Found"
  
  // Headers (metadata about the response)
  console.log('Type:', response.headers['content-type']);
  console.log('Length:', response.headers['content-length']);
  console.log('Date:', response.headers.date);
  console.log('Server:', response.headers.server);
  
  // All headers
  console.log('All:', response.headers);
});
```

**Common headers:**
- `content-type`: What kind of data (application/json, text/html)
- `content-length`: Size in bytes
- `content-encoding`: Compression (gzip, deflate)
- `set-cookie`: Cookies from server
- `cache-control`: Caching instructions
- `etag`: Version identifier

---

## 🧪 Exercises to Try

1. **Modify `fetcher.ts`** to fetch a different endpoint
2. **Add timing**: Measure how long each chunk takes
3. **Implement retry logic**: Retry failed requests
4. **Create a download progress bar**: Show bytes received / total
5. **Handle different content types**: Images, text, HTML
6. **Build a simple web scraper**: Fetch and parse HTML
7. **Make parallel requests**: Fetch multiple URLs simultaneously

---

## 🎯 Key Takeaways

1. **HTTP is stream-based**: Data arrives in chunks, not all at once
2. **Events drive everything**: Register callbacks for data, end, error
3. **Buffers are fundamental**: Learn to work with raw bytes
4. **Error handling is critical**: Always handle request and response errors
5. **Modern APIs abstract this**: But understanding the low-level is valuable

---

## 📚 Next Steps

After mastering the `http` module:
1. Learn about **TCP sockets** (even lower level)
2. Understand **HTTP/2** multiplexing
3. Explore **WebSockets** for bidirectional communication
4. Study **gRPC** for efficient RPC
5. Build a simple **HTTP server** using the `http` module

---

## 🔗 Resources

- [Node.js HTTP Docs](https://nodejs.org/api/http.html)
- [Node.js HTTPS Docs](https://nodejs.org/api/https.html)
- [Node.js Streams Guide](https://nodejs.org/api/stream.html)
- [Node.js Buffer Docs](https://nodejs.org/api/buffer.html)

---

**Happy Learning! 🚀**

Understanding low-level networking makes you a better developer, even if you use higher-level abstractions in production.