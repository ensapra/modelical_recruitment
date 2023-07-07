//Required imports
import { Request, Response } from 'express';
import express from 'express';
import { Worker } from 'worker_threads';
import os from 'os'

//Initialization of the server
var app = express();
app.use(express.urlencoded())
app.use(express.json());
app.listen(3000, () => {
 console.log("Server running on port 3000");
});


//Function responsible to schedule the diferent workers
function calculateExpensiveFunction(workerdata: number[]) : Promise<number[]>{
  return new Promise<number[]>((resolve, reject)=>{
      const worker = new Worker('./worker.js', { //Create a new worker with the array
        workerData: workerdata
      });

      worker.on('message', resolve) //Bind the diferent events to the corresponding promise calls
      worker.on('error', reject)
      worker.on('exit', (code)=>{
        if(code!== 0)
          reject(new Error('Worker stopped working with code ${code}'))
      })
    })
}

//API POST endpoint at '/expensive'
app.post('/expensive', (req: Request, res: Response) => {
  const numbers = req.body.numbers; //We get the numbers from the request
  if (!Array.isArray(numbers)) {
    res.status(400).json({ error: 'Invalid input', message: 'Numbers must be an array' }); //If they are not in the form of an array, we throw an error
    return;
  }

  const availableCores = os.cpus().length; //We get the number of available cores
  const chunkSize: number = numbers.length/availableCores; //Calculate the amount of chunks to be generated
  const chunks: number[][] = []; //We split the work into diferent cores
  for (let i = 0; i < numbers.length; i += chunkSize) {
    const chunk = numbers.slice(i, i + chunkSize); //Slice the work
    chunks.push(chunk);
  }

  const results: number[] = [];
  Promise.all(chunks.map((numbers: number[])=>{ //Map each of the chunk
    return calculateExpensiveFunction(numbers) //And wait until all the promises on each worker are completed
  })).then((finalArrays: number[][])=>{ //Once it's completed
    finalArrays.map((number: number[])=>{
      results.push(...number); //Store each of the workers return data into the final results array
    });
    console.log("Completed Successfully") //Log a success
    res.status(200).json({results}); //Return the correct response to the client
  }).catch((error)=>{ //If there was an error
    console.error('There was an error: ', error);
    res.status(500).json({ error: 'An error occurred', message: error.message }); //Return the error to the client
  })
})

app.get('*', function(req:Request, res:Response) {
    res.status(404).json({error: "This endpoint doesn't exist"});
});