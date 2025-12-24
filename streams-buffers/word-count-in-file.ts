import fs from 'fs';
import path from 'path';
import readline from 'readline';

const countWordOccurrences = (
  filePath: string,
  searchWord: string
): Promise<number> => {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(filePath)) {
      reject(new Error(`File not found: ${filePath}`));
      return;
    }

    let count = 0;

    const fileStream = fs.createReadStream(filePath, {
      encoding: 'utf8',
      highWaterMark: 64 * 1024,
    });

    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });

    rl.on('line', (line) => {
      const words = line.match(/\b\w+\b/g) || [];

      words.forEach((word) => {
        if (word === searchWord) {
          count++;
        }
      });

      rl.on('close', () => {
        resolve(count);
      });
    });

    fileStream.on('error', reject);

    rl.on('error', reject);
  });
};

const filePath = path.join(process.cwd(), 'test.txt');
const searchWord = 'cotton';

const startTime = Date.now();

try {
  const wordCount = await countWordOccurrences(filePath, searchWord);
  const endTime = Date.now();

  const duration = ((endTime - startTime) / 1000).toFixed(2);

  console.log(`✓ Found "${searchWord}" ${wordCount} times`);
  console.log(`✓ Processed in ${duration} seconds`);
} catch (error) {
  console.log(error);
}
