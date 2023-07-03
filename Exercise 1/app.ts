import { Request, Response } from 'express';
import express from 'express';
import { Worker } from 'worker_threads';
import os from 'os'
import { debug } from 'console';

var app = express();

app.use(express.urlencoded())
app.use(express.json());
app.listen(3000, () => {
 console.log("Server running on port 3000");
});

function calculateExpensiveFunction(workerdata: number[]) : Promise<number[]>{
  return new Promise<number[]>((resolve, reject)=>{
      const worker = new Worker('./worker.js', {
        workerData: workerdata
      });

      worker.on('message', resolve)
      worker.on('error', reject)
      worker.on('exit', (code)=>{
        if(code!== 0)
          reject(new Error('Worker stopped working with code ${code}'))
      })
    })
}

app.post('/expensive', (req: Request, res: Response) => {
  const numbers = req.body.numbers; //We get the numbers from the request
  if (!Array.isArray(numbers)) {
    res.status(400).json({ error: 'Invalid input', message: 'Numbers must be an array' });
    return;
  }

  const availableCores = os.cpus().length;
  const chunkSize: number = numbers.length/availableCores;
  const chunks: number[][] = [];
  for (let i = 0; i < numbers.length; i += chunkSize) {
    const chunk = numbers.slice(i, i + chunkSize);
    chunks.push(chunk);
  }

  const results: number[] = [];
  Promise.all(chunks.map((numbers: number[])=>{
    return calculateExpensiveFunction(numbers)
  })).then((finalArrays: number[][])=>{
    finalArrays.map((number: number[])=>{
      results.push(...number);
    });
    console.log("Completed Successfully")
    res.status(200).json({results});
  }).catch((error)=>{
    console.error('There was an error: ', error);
    res.status(500).json({ error: 'An error occurred', message: error.message });
  })
})

//Aggregte the results and send it back to the client
