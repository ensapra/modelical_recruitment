import { Request, Response } from 'express';
import express from 'express';
import joi, { date } from "joi";
import 'joi-extract-type'
import { Model } from './models/model';
import { Project } from './models/project';

import { SwapModels, SwapProjects, models, projects } from './test/data';
const ModelSch = joi.object({
    name: joi.string().required(),
    description: joi.string().required(),
    verticesCount: joi.number().required()
})

const ProjectSch = joi.object({
    name: joi.string().required(),
    description: joi.string().required(),
    models: joi.array().items(ModelSch).optional()
})

const ProjectSchPut = joi.object({
    name: joi.string().optional(),
    description: joi.string().optional(),
    models: joi.array().items(ModelSch).optional()
})

//Initialization of the server
var app = express();
app.use(express.urlencoded())
app.use(express.json());

//MODEL ENDPOINTS
app.get("/models", (req: Request, res: Response)=>{
    //Returns an array of all models in the collection.
    //const finalModels: Model[] = [];
    res.status(200).send(models);
})

app.get("/models/:modelID", (req: Request, res: Response)=>{
    //Returns the model with the specified ID.
    const modelID = req.params.modelID;
    const requestedModel = models.find((model: Model)=> model.ID === modelID);
    if(requestedModel)
        res.status(200).json(requestedModel);
    else
        res.status(400).json({error: {status: 400, message: "invalid id"}})
})

app.put("/models/:modelID", (req: Request, res: Response)=>{
    //Update an existing model: Expects a JSON payload with updated model details. Updates the
    //model with the specified ID and returns the updated model.
    const modelID = req.params.modelID;
    ModelSch.validateAsync(req.body).then((result)=>{
        if(result.error)
        {
            res.status(400).send(result.error.details[0].message);
            return;
        }

        const model = models.find((model:Model)=> model.ID === modelID);
        if(model)
        {    
            model.name = result.name.trim().substring(0,255);
            model.description = result.description.trim().substring(0,1000);
            model.verticesCount = result.verticesCount;
            res.status(200).send(model);
        }
        else
            res.status(400).send({error: {status: 400, message: "invalid id"}})
    })
})

app.delete("/models/:modelID", (req: Request, res: Response)=>{
    //Deletes the model with the specified ID.
    const modelID = req.params.modelID;
    if(models.find((m:Model)=> m.ID === modelID))
    {
        SwapModels(models.filter((model:Model)=> model.ID!== modelID));
        res.status(200).json({message: "Successfully deleted project with id: "+ modelID});
    }
    else
        res.status(400).json({error: {status: 400, message: "invalid id"}})
})



//PROJECT ENDPOINTS
app.get("/projects", (req: Request, res: Response)=>{
    //Returns an array of all projects in the collection.
    const filledProjects = projects;
    filledProjects.forEach((project: Project)=>{
        project.models = models.filter((model:Model)=> model.projectID === project.ID);
    })
    res.status(200).json(filledProjects);
})

app.post("/projects", (req: Request, res: Response)=>{
    //Add a new project: Expects a JSON payload with project details (name, description, etc.).
    //Adds the new project to the collection and returns the created project.
    ProjectSch.validateAsync(req.body).then((result)=>{
        if(result.error)
        {
            res.status(400).send(result.error.details[0].message);
            return;
        }
        result.ID = Date.now().toString();
        result.name = result.name.trim().substring(0,255);
        result.description = result.description.trim().substring(0,1000);
        var modelsToAdd = result.models;
        result.models = [];
        projects.push(result);
        if(!modelsToAdd)
            res.status(200).send(result);
        else
        {
            modelsToAdd.forEach((model: any)=>{
                const validatedModel:any = ModelSch.validate(model)
                if(validatedModel)
                {
                    if(validatedModel.error)
                    {
                        res.status(400).send(result.error.details[0].message);
                        return;
                    }
                    validatedModel.value.ID = Date.now().toString();
                    validatedModel.value.projectID = result.ID;
                    result.models.push(validatedModel.value)
                    models.push(validatedModel.value);    
                }
            });
            res.status(200).send(result);
        }

    }).catch((error)=>{
        res.status(500).json({ error: 'An error occurred', message: error.message }); //Return the error to the client
    })    
})

app.get("/projects/:projectID", (req: Request, res: Response)=>{
    //Returns the project with the specified ID.
    const projectid = req.params.projectID;
    const requestedProject = projects.find((project: Project)=> project.ID === projectid);
    if(requestedProject)
    {
        requestedProject.models = models.filter((model:Model)=> model.projectID === requestedProject.ID);
        res.status(200).json(requestedProject);
    }
    else
        res.status(400).json({error: {status: 400, message: "invalid id"}})
})

app.put("/projects/:projectID", (req: Request, res: Response)=>{
    //Update an existing project: Expects a JSON payload with updated project details. Updates the project with the specified ID and returns the updated project.
    const projectId = req.params.projectID;
    ProjectSchPut.validateAsync(req.body).then((result)=>{
        if(result.error)
        {
            res.status(400).send(result.error.details[0].message);
            return;
        }

        const requestedProject = projects.find((project: Project)=> project.ID === projectId);
        if(!requestedProject) res.status(400).send({error: {status: 400, message: "invalid id"}})
        else{
            if(result.name)
                requestedProject.name = result.name.trim().substring(0,255);
            if(result.description)
                requestedProject.description = result.description.trim().substring(0,1000);
            const newModels: Model[] = [];
            if(result.models){
                result.models.forEach((model: Model)=>{
                    model.ID = Date.now().toString();
                    model.projectID = requestedProject.ID;
                    models.push(model);
                    newModels.push(model);
                })
                requestedProject.models = newModels;
            }
            res.status(200).send(requestedProject);
        }
    }).catch((error)=>{
        res.status(500).json({ error: 'An error occurred', message: error.message }); //Return the error to the client
    })
})

app.delete("/projects/:projectID", (req: Request, res: Response)=>{
    //Deletes the project with the specified ID.
    const id = req.params.projectID;
    if(projects.find((project: Project) => project.ID == id))
    {
        SwapProjects(projects.filter((project: Project)=> project.ID !== id));
        SwapModels(models.filter((model: Model)=> model.projectID !== id));
        res.status(200).json({message: "Successfully deleted project with id: "+ id});
    }
    else
        res.status(400).json({error: {status: 400, message: "invalid id"}})
})

app.get("/projects/:projectID/models/", (req: Request, res: Response)=>{
    //Returns an array of all models belonging to the project with the specified ID.
    const projectId = req.params.projectID;
    const theresProject = projects.find((project:Project)=> project.ID == projectId);
    if(theresProject)
    {
        const requestedModels = models.filter((model: Model)=> model.projectID===projectId);
        res.status(200).json(requestedModels);   
    }
    else
        res.status(400).json({error: {status: 400, message: "invalid id"}})
})

app.post("/projects/:projectID/models", (req: Request, res: Response)=>{
    //Add a new model to a project: Expects a JSON payload with model details (name,
    //description, etc.). Adds the new model to the project with the specified ID and returns the
    //created model.
    ModelSch.validateAsync(req.body).then((result)=>{
        if(result.error)
        {
            res.status(400).send(result.error.details[0].message);
            return;
        }

        const projectId = req.params.projectID;
        const requestedProject = projects.find((project: Project)=> project.ID === projectId);
        if(requestedProject != undefined)
        {
            result.name = result.name.trim().substring(0,255);
            result.description = result.description.trim().substring(0,1000);
            result.projectID = requestedProject.ID;
            result.ID = Date.now().toString();
            models.push(result);
            res.status(200).json(result);
        }
        else
            res.status(400).json({error: {status: 400, message: "invalid id"}})
    }).catch((error)=>{
        res.status(500).json({ error: 'An error occurred', message: error.message }); //Return the error to the client
    })
})


app.get('*', function(req:Request, res:Response) {
    res.status(404).json({error: "This endpoint doesn't exist"});
});

export default app