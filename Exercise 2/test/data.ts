import { func } from "joi";
import { Model } from "../models/model";
import { Project } from "../models/project";

export let projects: Project[] = [];
export let models: Model[] = [];

export function SwapModels(newModels: Model[]){
    models = newModels;
}

export function SwapProjects(newProjects: Project[]){
    projects = newProjects;
}