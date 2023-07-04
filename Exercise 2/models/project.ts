import { Model } from "./model";

export interface Project{
    ID: string;
    name: string;
    description: string;
    models: Model[];
    modelCount: number;
    totalVertexCount: number;
}

