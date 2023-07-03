# Create an REST API microservice where a multithreaded computation is required
You are tasked with developing a web application that needs to process a large amount of
computationally intensive tasks in parallel. Each task involves complex mathematical calculations
that take a significant amount of time to complete. The application needs to scale efficiently and
make use of all available CPU resources to minimize the processing time.

The API should have the following functionalities:
● Accepts incoming HTTP requests containing a list of numbers to be processed.

● Divides the list of numbers into smaller chunks to distribute the workload across multiple
threads or processes.

● For each chunk, performs a computationally intensive mathematical operation (e.g.,
calculating prime numbers, finding Fibonacci sequence, etc.) on each number.

● Aggregates the results from all the chunks and sends the response back to the client.
Other requirements:

● Implement using Node.js and TypeScript

Tips: do not focus on api design, just focus on the multithreaded parallelization of the processes,
testing is not required but clean code and design patterns are always welcomed