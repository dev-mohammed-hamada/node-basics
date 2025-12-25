// function addCallback(a: number, b: number, callback: CallableFunction) {
//   callback(a + b);
// }
// console.log('Before Sync');
// addCallback(10, 20, (result: number) => {
//   console.log(result);
// });
// console.log('After Sync');

// console.log('-'.repeat(100));

// function addCallbackAsync(
//   a: number,
//   b: number,
//   time: number,
//   callback: CallableFunction
// ) {
//   setTimeout(() => {
//     callback(a + b);
//   }, time);
// }
// console.log('Before Async');
// addCallbackAsync(10, 10, 100, (result: number) => console.log(result));
// addCallbackAsync(20, 20, 99, (result: number) => console.log(result));
// console.log('After Async');

// function mapArrayCallback(array: number[], callback: CallableFunction) {
//   const newArray = [];

//   for (let item of array) {
//     const newItem = callback(item);
//     newArray.push(newItem);
//   }

//   return newArray;
// }

// const arr = [1, 2, 3, 4, 5, 6];

// const newArray = mapArrayCallback(arr, (item: number) => {
//   return item + 1;
// });

// const arr2 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// function filterArrayCallback(array: number[], callback: CallableFunction) {
//   const newArr = [];

//   for (const item of array) {
//     const added = callback(item);
//     if (added) {
//       newArr.push(item);
//     }
//   }
//   return newArr;
// }

// const newArray2 = filterArrayCallback(arr2, (item: number) => {
//   return item % 2 !== 0;
// });

// console.log(newArray2);

// import { readFileSync, type PathLike } from 'fs';
// import path from 'path';

// const cache = new Map();

// function consistentReadSync(filename: PathLike) {
//   if (cache.has(filename)) {
//     return cache.get(filename);
//   } else {
//     const data = readFileSync(filename);
//     cache.set(filename, data);
//     return data;
//   }
// }
// console.log(cache);
// const data1 = consistentReadSync(path.join(process.cwd(), 'test.txt'));
// console.log(data1);

// console.log('-'.repeat(40));

// console.log(cache);
// const data2 = consistentReadSync(path.join(process.cwd(), 'test.txt'));
// console.log(data2);

// // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // //

import { readFile } from 'fs';

const cache = new Map();

function consistentReadAsync(filename: string, callback: Function) {
  if (cache.has(filename)) {
    process.nextTick(() => callback(cache.get(filename)));
  } else {
    readFile(filename, 'utf8', (err, data) => {
      cache.set(filename, data);
      callback(data);
    });
  }
}

consistentReadAsync('./test.txt', (data: any) => {
  console.log(data);
});

console.log('Hi');

consistentReadAsync('./test.txt', (data: any) => {
  console.log(data);
});

console.log('Hi');
