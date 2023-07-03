# Node.js exercise to

We want to create a microservice that will process tasks aggregating data periodically. The
microservice will receive a Task model with the information needed to perform the aggregation.

```json
type Task{
    ID: ID!
    project: ID!
    analysis: ID!
    key: String!
    value: JSON
    createdAt: Int
    updatedAt: Int
}
```

For this microservice, only tasks with key “Chart” will be received. The task will give us a reference of
the project and a reference of the analysis that has been completed.