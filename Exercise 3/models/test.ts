export enum TestContentType{
    number,
    string, 
    other,
}

export enum TestStatus{
    success,
    failure,
    inProgress,
    skipped,
}

export interface Test {
    ID: string,
    project: string,
    analysis: string,
    document: string,
    key: string,
    value: number,
    contentType: TestContentType,
    status: TestStatus,
    message: string,
    createdAt: number,
    updatedAt: number,
}

export class TestDefined implements Test {
    ID: string = "";
    project: string = "";
    analysis: string = "";
    document: string = "";
    key: string = "";
    value: number = 0;
    contentType: TestContentType = TestContentType.other;
    status: TestStatus = TestStatus.inProgress;
    message: string = "";
    createdAt: number = 0;
    updatedAt: number = 0;
}
