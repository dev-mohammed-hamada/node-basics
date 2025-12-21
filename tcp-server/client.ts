import net from 'net';

const makeRawRequest = (options: {
  host: string;
  port: number;
  method: string;
  path: string;
  headers?: Record<string, string>;
  body?: string;
}): Promise<string> => {
  const { headers = {}, body = '', host, port, method, path } = options;

  return new Promise((resolve, reject) => {
    console.log(`\n🔌 Connecting to ${host}:${port}...`);

    const socket = net.connect(
      {
        host,
        port,
      },
      () => {
        console.log('✅ Connected!');

        let request = `${method} ${path} HTTP/1.1\r\n`;
        request += `Host: ${host}\r\n`;

        // Add custom headers

        request += `Host: ${host}\r\n`;

        for (const [key, value] of Object.entries(headers)) {
          request += `${key}: ${value}\r\n`;
        }

        if (body) {
          request += `Content-Length: ${Buffer.byteLength(body)}\r\n`;
        }

        request += `Connection: close\r\n`;

        request += '\r\n';

        if (body) {
          request += body;
        }

        console.log('\n📤 SENDING:');
        console.log('─'.repeat(70));
        console.log(request.replace(/\r\n/g, '\\r\\n\n'));
        console.log('─'.repeat(70));

        socket.write(request);
      }
    );

    let response: string = '';

    socket.on('data', (chunk) => {
      response += chunk.toString();
    });

    socket.on('end', () => {
      console.log('\n📥 RECEIVED RESPONSE:');
      console.log('─'.repeat(70));

      const [rawHeaders, ...bodyParts] = response.split('\r\n\r\n');
      const body = bodyParts.join('\r\n\r\n');

      console.log('HEADERS:');
      console.log(rawHeaders);
      console.log();
      console.log('BODY:');
      console.log(body);
      console.log('─'.repeat(70));

      resolve(response);
    });

    socket.on('error', (err) => {
      console.error('\n❌ Error:', err.message);
      reject(err);
    });
  });
};

await makeRawRequest({
  host: '127.0.0.1',
  port: 8080,
  method: 'GET',
  path: '/',
  headers: {
    // Accept: 'application/json',
  },
});
