import { error } from 'console';
import { IncomingMessage } from 'http';
import https from 'https';

const httpGetPromise = (
  url: string
): Promise<{
  statusCode: number;
  headers: any;
  body: string;
}> => {
  return new Promise((resolve, reject) => {
    https
      .get(url, (response: IncomingMessage) => {
        const chunks: Buffer[] = [];
        response.on('data', (chunk) => {
          chunks.push(chunk);
        });
        response.on('end', () => {
          const body = Buffer.concat(chunks).toString();
          return resolve({
            statusCode: response.statusCode || 0,
            headers: response.headers,
            body,
          });
        });

        response.on('error', () => {
          return reject(error);
        });
      })
      .on('error', reject);
  });
};

const httpPost = (url: string, data: any): Promise<any> => {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const postData = JSON.stringify(data);

    const req = https.request(
      {
        hostname: urlObj.hostname,
        port: 443,
        path: urlObj.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
        },
      },
      (res) => {
        const chunks: Buffer[] = [];

        res.on('data', (chunk) => {
          chunks.push(chunk);
        });

        res.on('end', () => {
          const body = Buffer.concat(chunks).toString();
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: JSON.parse(body),
          });
        });

        res.on('error', reject);
      }
    );
    req.on('error', reject);

    req.write(postData);

    req.end();
  });
};

// console.log(
//   await httpGetPromise('https://jsonplaceholder.typicode.com/posts/1')
// );

console.log(await httpPost('https://httpbin.org/post', { id: 'test' }));
