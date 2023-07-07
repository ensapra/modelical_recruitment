# Create an REST API microservice where a multithreaded computation is required
You are tasked with developing a web application that needs to process a large amount of computationally intensive tasks in parallel. Each task involves complex mathematical calculations that take a significant amount of time to complete. The application needs to scale efficiently and make use of all available CPU resources to minimize the processing time.

The API should have the following functionalities:
- Accepts incoming HTTP requests containing a list of numbers to be processed.
- Divides the list of numbers into smaller chunks to distribute the workload across multiple threads or processes.
- For each chunk, performs a computationally intensive mathematical operation (e.g.,
calculating prime numbers, finding Fibonacci sequence, etc.) on each number.
- Aggregates the results from all the chunks and sends the response back to the client.
  
Other requirements:
- Implement using Node.js and TypeScript

Tips: do not focus on api design, just focus on the multithreaded parallelization of the processes, testing is not required but clean code and design patterns are always welcomed

# Solution
The solution makes use of the **worker_threads** library from Node.js, to split the work into different threads. In this case, it makes use of the os.cpus().length to know the amount of logical cpus available, and uses that as the factor to split the workload in the most efficient and safe way.

- app.ts: Contains the main script, can be started through:

```
npx nodemon app.ts //For active reload when changes on the script happen

npx ts-node app.ts //Normal server execution
```

> The available API POST endpoint is at "/expensive" and requires a JSON with the next formatting:
> 
```json
{
    "numbers": [...]
}
```

- worker.js: Contains the expensive method called, Fibonacci. Although this version is not extremely expensive, it can be substituted by other more expensive variations. 

## Libraries Used
It makes use of:
- express: For the networking
- worker_threads: For splitting the work 
 
# Future improvements
This exercise could be improved by the use of streams. That would allow the system to process multiple API calls concurrently, by stacking the data and delivering chunks of it. 
