export interface Bucket {
    ID: string,
    project: string,
    analysis: string,
    updatedAt: number
}

export enum ChartDataKey {
    DetailLines,
    FileSize,
    LoadedFamilies,
}

export class ChartData implements Bucket {
    ID: string = "";
    project: string = "";
    analysis: string = "";
    updatedAt: number = -1;
    key: ChartDataKey |undefined;
    type: string = "";
    title: string = "";
    xAxis: string = "";
    yAxis: string = "";
    dataSets: DataSet[] = [];
}

export class DataSet {
    label: string = "";
    color: string = "";
    data: Data[] = [];
}

export class Data {
    Values: string[] = [];
}
