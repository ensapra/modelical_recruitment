# Node.js exercise to aggregate data from test results to a bucket for a graph visualization An external tool is dumping data to a database with the following data model (GraphQL):

```ts
type Test {
  ID: ID!
  project: ID!
  analysis: ID!
  document: ID!
  key: String!
  value: JSON
  contentType: TestContentType
  status: TestStatus
  message: String
  createdAt: Int
  updatedAt: Int
}
```

This data is dumped from documents (document) that belong to a project (project) in a periodical schedule. Each time data is dumped from a project an analysis entry is created to link the dumped data to the documents and to a single state in time of the project.

For the entries that have a contentType equal to number we can plot charts for each of the different keys available. For this kind of entries, the value field of type JSON is just a number. There are several keys available, for example, FileSize, Families, DetailLines. 

For a project, we can have several models and each project has been analyzed thousands of times. This means that we have a high data volume that makes it very difficult to retrieve this data quick enough to avoid hitting on a performance issue. We want to develop a procedure that reads data from the Test models and create a Bucket model with all the data aggregated. We will also take the opportunity to follow the data model used by the chart library that we are using in the frontend. 

```ts
interface Bucket {
  ID: ID! @id(autogenerate: true, unique: true)
  project: ID!
  analysis: ID!
  updatedAt: DateTime! @timestamp(operations: [CREATE, UPDATE])
}

type ChartData implements Bucket {
  ID: ID! @id(autogenerate: true, unique: true)
  project: ID!
  analysis: ID!
  updatedAt: DateTime! @timestamp(operations: [CREATE, UPDATE])
  key: ChartDataKey
  type: String
  title: String
  xAxis: String
  yAxis: String
  dataSets: [DataSet!]! @relationship(type: "CHART_SET", direction: OUT)
}

```

```ts
type DataSet {
  label: String
  color: String
  data: [Data!]! @relationship(type: "SET_DATA", direction: OUT)
}
type Data {
  Values: [String]
}
enum ChartDataKey {
  DetailLines
  FileSize
  LoadedFamilies
  [...]
}
```
A data set array can look something like this:

```json
"dataSets": [{
  "data": [
    ["2017-05-24 01:00:00.000", "410"],
    ["2017-05-29 01:00:00.000", "410"],
    ["2017-06-13 12:06:38.000", "410"],
    ["2017-06-14 03:01:35.000", "410"]
    ],
  "color": "#b27b33",
  "label": "AR_ARC"
  }, {
  "data": [
    ["2017-05-24 01:00:00.000", "410"],
    ["2017-05-29 01:00:00.000", "410"],
    ["2017-06-06 11:53:10.000", "410"],
    ["2017-06-07 07:12:35.000", "410"],
    ["2017-06-08 03:02:45.000", "410"],
    ["2017-06-08 09:36:58.000", "410"],
    ["2017-06-09 03:02:15.000", "410"],
    ["2017-06-10 03:02:21.000", "410"],
    ["2017-06-11 03:02:23.000", "410"],
    ["2017-06-12 03:02:00.000", "410"],
    ["2017-06-13 12:06:38.000", "410"],
    ["2017-06-14 03:01:35.000", "410"]
    ],
  "color": "#3ed822",
  "label": "AR_ENV"
}]
```

# Solution
In this exercise we can find: 
- app.ts: Containing the solution to the project.

````ts
npx ts-node app.ts //Normal server execution
````

- fakeDatabase.ts: Containing a fake database generation

In a real case scenario, fakeDatabase should be replaced by a real database, and performance checks on the system. If found necessary, the work could be split into different worker threads to increase performance

This piece of code simulates the generation of a chart, the user, in a real scenario, would create a filter with its desired parameters, and then use that filter to generate the desired chart. 

```ts
GenerateTests().then(()=>{
    const filter = GetFilter();
    let Chart = GenerateChartData(filter, "pie");
    console.log(Chart);
})
```

The filter requires these parameters:
````ts
export class ChartFilter{
    project: string = "";
    analysis: string = "";
    chartDatakey: ChartDataKey | undefined;
    from: number = 0;
    to: number = 0;
    //...
}
````
An example of a generated chart would be:

```ts
ChartData {
  ID: '1688729609816',
  project: '6',
  analysis: '65',
  updatedAt: 1688729609816,
  type: 'pie',
  title: '6/65:0-1000000',
  xAxis: 'TimeStamp',
  yAxis: 'DetailLines',
  dataSets: [
    DataSet { label: '5', color: '#C559AA', data: [Array] },
    DataSet { label: '6', color: '#9460A8', data: [Array] },
    DataSet { label: '4', color: '#C4D1ED', data: [Array] },
    DataSet { label: '9', color: '#B851C2', data: [Array] },
    DataSet { label: '3', color: '#B15676', data: [Array] },
    DataSet { label: '8', color: '#D7F41F', data: [Array] },
    DataSet { label: '10', color: '#0EEFD7', data: [Array] },
    DataSet { label: '1', color: '#6E6378', data: [Array] },
    DataSet { label: '2', color: '#2AC94B', data: [Array] }
  ],
  key: 0
}
```

# Future Improvement
This solution could be improved by tests, implementation of API endpoints and work threading.
