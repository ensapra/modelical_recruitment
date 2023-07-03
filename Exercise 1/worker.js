const { parentPort, workerData } = require('worker_threads');

//Do an expensive operation on each number
function fibonacci(num) {
  if(typeof(num) !== "number")
    return 0 ;
    
  if (num <= 1) {
    return num;
  }
  console.log(num);
  return fibonacci(num - 1) + fibonacci(num - 2);
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