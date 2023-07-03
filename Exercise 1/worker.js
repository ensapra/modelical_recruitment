const { parentPort, workerData } = require('worker_threads');

//Do an expensive operation on each number
function fibonacci(num) {
    let num1 = 0;
    let num2 = 1;
    let sum;
    let i = 0;
    for (i = 0; i < num; i++) {
        sum = num1 + num2;
        num1 = num2;
        num2 = sum;
    }
    return num2;
}

console.log('Starting Worker with data from ' + workerData[0] + ' to ' + workerData[workerData.length-1])
const numberArray = [];
  console.log("asd");

for(const element of workerData){
    const value = fibonacci(element);
    numberArray.push(value);
}
console.log('Finished Worker with data from ' + workerData[0] + ' to ' + workerData[workerData.length-1])
parentPort.postMessage(numberArray);
process.exit();