import { ChartFilter } from "./app";
import { ChartDataKey } from "./models/bucket";
import { Test, TestContentType, TestDefined, TestStatus } from "./models/test";

const numberOfTestsPerProject = 200000000;
const numberOfProjects = 100;
const numberOfAnalysis = 100;
const numbeOfDocuments = 10;

export var tests: Test[] = [];
async function* counter() {
  let i = 0;
  while (i < numberOfTestsPerProject) {
    yield i++;
  }
}

export async function GenerateTests(){
    tests = [];
    console.log("Start Generation")
    for await (const i of counter()){
        let newTest: Test = new TestDefined();
        newTest.ID = i.toString();
        newTest.project = Math.round(Math.random()*numberOfProjects).toString();
        newTest.analysis = Math.round(Math.random()*numberOfAnalysis).toString();
        newTest.document = Math.round(Math.random()*numbeOfDocuments).toString();

        newTest.key = ChartDataKey[Math.floor(Math.random()*Object.keys(ChartDataKey).length)];
        newTest.value = Math.sin(i);
        newTest.contentType = Math.floor(Math.random()*Object.keys(TestContentType).length);
        newTest.status = TestStatus.success;
        newTest.message = "";
        newTest.createdAt = Math.random()*1000000;
        newTest.updatedAt = newTest.createdAt;

        tests.push(newTest);
    }
    console.log("Generated fake data");
}
export function GetFilter():ChartFilter{
    let filter: ChartFilter = new ChartFilter();
    filter.project = Math.round(Math.random()*numberOfProjects).toString();
    filter.analysis = Math.round(Math.random()*numberOfAnalysis).toString();
    filter.chartDatakey = ChartDataKey.DetailLines;
    filter.from = 0;
    filter.to = 1000000;
    console.log("Generated fake filter");
    return filter;
}

GenerateTests();
