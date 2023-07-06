import { Request, Response } from 'express';
import 'joi-extract-type'
import express from 'express';
import { Test, TestStatus } from './models/test';
import { Bucket, ChartData, ChartDataKey, Data, DataSet } from './models/bucket';
import {tests, GenerateTests, GetFilter} from './fakeDatabase';

//Initialization of the server
var app = express();
app.use(express.urlencoded())
app.use(express.json());
app.listen(3000, () => {
 console.log("Server running on port 3000");
});


export class ChartFilter{
    project: string = "";
    analysis: string = "";
    chartDatakey: ChartDataKey | undefined;
    from: number = 0;
    to: number = 0;

    ApplyFilter(tests: Test[]) : Test[]{
        var filteredTests = tests.filter((test: Test)=> test.project === this.project);
        filteredTests = filteredTests.filter((test: Test)=>test.status === TestStatus.success);
        filteredTests = filteredTests.filter((test: Test)=>test.analysis === this.analysis);
        filteredTests = filteredTests.filter((test: Test)=>test.updatedAt > this.from && test.updatedAt < this.to);
        return filteredTests;
    }
}

function GenerateChartData(filter: ChartFilter, chartType: string): ChartData
{
    const validTests: Test[] = filter.ApplyFilter(tests);
    var newChart = new ChartData();
    newChart.ID = Date.now().toString();
    newChart.project = filter.project;
    newChart.analysis = filter.analysis;
    newChart.updatedAt = Date.now();
    newChart.key = filter.chartDatakey;
    newChart.type = chartType;
    newChart.title = '${filter.project}/${filter.analysis}:${filter.from}-${filter.to}';
    newChart.xAxis = "TimeStamp";
    newChart.yAxis = ChartDataKey[filter.chartDatakey!];
    //Get unique documents
    let dataSets: Map<String, DataSet> = new Map<String, DataSet>();
    validTests.forEach((test: Test)=>{
        let data: Data = new Data();
        data.Values = [test.updatedAt.toString(), test.value.toString()];
        let set: DataSet | undefined = dataSets.get(test.document);
        if(set) //Add the new data to the dataset
            set.data.push(data);
        else
        {
            //Generate a new dataset
            let newDataSet = new DataSet();
            newDataSet.color = RandomColor();
            newDataSet.label = test.document;
            newDataSet.data = [];
            newDataSet.data.push(data);
            dataSets.set(test.document, newDataSet);
        }
    })

    newChart.dataSets = Array.from(dataSets.values());
    return newChart;
    
}

function RandomColor():string{ //https://www.geeksforgeeks.org/javascript-generate-random-hex-codes-color/
    let letters = "0123456789ABCDEF";
    let color = '#';
    for (let i = 0; i < 6; i++)
        color += letters[(Math.floor(Math.random() * 16))];
    return color;
}

GenerateTests().then(()=>{
    const filter = GetFilter();
    let Chart = GenerateChartData(filter, "pie");
    console.log(Chart);
})