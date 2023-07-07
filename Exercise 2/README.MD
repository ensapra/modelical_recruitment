# Create an REST API microservice to manage a collection 3D models related to a project
You are tasked with creating an API microservice that allows users to manage a collection of 3D models on a website.
The API should have the following functionalities:

- Returns an array of all models in the collection.
- Returns the model with the specified ID.
- Returns an array of all projects in the collection.
- Returns the project with the specified ID.
- Add a new project: Expects a JSON payload with project details (name, description, etc.).

Adds the new project to the collection and returns the created project.
- Update an existing project: Expects a JSON payload with updated project details. Updates the project with the specified ID and returns the updated project.
- Deletes the project with the specified ID.
- Returns an array of all models belonging to the project with the specified ID.
- Returns the model with the specified ID.
- Add a new model to a project: Expects a JSON payload with model details (name, description, etc.). Adds the new model to the project with the specified ID and returns the created model.
- Update an existing model: Expects a JSON payload with updated model details. Updates the model with the specified ID and returns the updated model.
- Deletes the model with the specified ID.
Other requirements:
- Use clean code practices
- Add testing
- Use design patterns, those that applies
- Implement using Node.js and TypeScript
- 
While you must use Node.Js you are allowed to use the frameworks or libraries that you want,but it should allow some features such as (reliability, oauth, ci/cd, testing, performance, ... ) for handling HTTP requests and responses. You can store the models, projects, and sites in separate in-memory arrays for simplicity.

# Solution
You can find the different endpoints of the solution at [EndPoints](<Exercise 2.postman_collection.json>).

- app.ts: Contains the main script
- /test/app.test.ts: Contains the tests of the project. Can be run through:
```
npm test
```

- server.ts: Contains the launch of app.ts. Can be started through:
```
npx nodemon app.ts //For active reload when changes on the script happen

npx ts-node app.ts //Normal server execution
```

## Libraries Used
It makes use of:
- express: For the networking
- jest, supertest: For testing
- joi: For JSON Schema validation
