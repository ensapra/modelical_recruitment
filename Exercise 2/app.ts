import { Request, Response } from 'express';
import express from 'express';
import joi from "joi";
import 'joi-extract-type'
import { Model } from './models/model';
import { Project } from './models/project';
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

//Initialization of the server
var app = express();
app.use(express.urlencoded())
app.use(express.json());
app.listen(3000, () => {
 console.log("Server running on port 3000");
});

var projects: Project[] = []

//MODEL ENDPOINTS
app.get("/models", (req: Request, res: Response)=>{
    //Returns an array of all models in the collection.
    const finalModels: Model[] = [];
    Promise.all(projects.map((project: Project)=>{
        return project.models;
    })).then((models: Model[][])=>{
        models.map((model: Model[])=>{
            finalModels.push(...model);
        })
        res.status(200).json(finalModels);
    }).catch((error)=>{
        console.error("There has been an error ", error);
        res.status(500).json({ error: 'An error occurred', message: error.message }); //Return the error to the client
    })
})

app.get("/models/:modelID", (req: Request, res: Response)=>{
    //Returns the model with the specified ID.
    const modelID = req.params.id;
    const requestedModel = projects.find((project: Project)=>{
        project.models.find((model: Model)=>{
            model.ID === modelID;
        })
    })

    if(requestedModel != null)
        res.status(200).json(requestedModel);
    else
        res.status(400).json({error: {status: 400, message: "invalid id"}})
})

app.put("/models/:modelID", (req: Request, res: Response)=>{
    //Update an existing model: Expects a JSON payload with updated model details. Updates the
    //model with the specified ID and returns the updated model.
    const modelID = req.params.id;
    ModelSch.validateAsync(req.body).then((result)=>{
            if(result.error)
            {
                res.status(400).send(result.error.details[0].message);
                return;
            }

            projects.find((project: Project)=>{
            const requestedModel = project.models.find((model: Model)=>{
                model.ID === modelID;
            })
                
            if(!requestedModel) res.status(400).send({error: {status: 400, message: "invalid id"}})
            else{
                requestedModel.name = result.name;
                requestedModel.description = result.description;
                requestedModel.verticesCount = result.verticesCount;
                res.status(200).send(requestedModel);
            }
        })
    }).catch((error)=>{
        res.status(500).json({ error: 'An error occurred', message: error.message }); //Return the error to the client
    })
})

app.delete("/model/:modelID", (req: Request, res: Response)=>{
    //Deletes the model with the specified ID.
    var notFoundModel: Boolean = true
    const modelID = req.params.id;
    projects.find((project: Project)=>{
        if(project.models.find((model: Model) => model.ID === modelID))
        {
            project.models = project.models.filter((m: Model)=> m.ID !== modelID);
            notFoundModel = false;
            res.status(200).json({message: "Successfully deleted project with id: "+ modelID});
        }
    })

    if(notFoundModel != null)
        res.status(400).json({error: {status: 400, message: "invalid id"}})
})



//PROJECT ENDPOINTS
app.get("/projects", (req: Request, res: Response)=>{
    //Returns an array of all projects in the collection.
    res.status(200).json(projects);
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
                  
        projects.push(result);
        res.status(200).send(result);
    }).catch((error)=>{
        res.status(500).json({ error: 'An error occurred', message: error.message }); //Return the error to the client
    })
    
})

app.get("/projects/:projectID", (req: Request, res: Response)=>{
    //Returns the project with the specified ID.
    const projectid = req.params.projectID;
    const requestedProject = projects.find((project: Project)=> project.ID === projectid);
    if(requestedProject != null)
        res.status(200).json(requestedProject);
    else
        res.status(400).json({error: {status: 400, message: "invalid id"}})
})

app.put("/projects/:projectID", (req: Request, res: Response)=>{
    //Update an existing project: Expects a JSON payload with updated project details. Updates the project with the specified ID and returns the updated project.
    const projectId = req.params.projectID;
    ProjectSch.validateAsync(req.body).then((result)=>{
        if(result.error)
        {
            res.status(400).send(result.error.details[0].message);
            return;
        }

        const requestedProject = projects.find((project: Project)=> project.ID === projectId);
        if(!requestedProject) res.status(400).send({error: {status: 400, message: "invalid id"}})
        else{
            requestedProject.description = result.description;
            requestedProject.modelCount = result.modelCount;
            requestedProject.models = result.models;
            requestedProject.name = result.name;
            requestedProject.totalVertexCount = result.totalVertexCount;
            res.status(200).send(requestedProject);
        }
    })

})

app.delete("/projects/:projectID", (req: Request, res: Response)=>{
    //Deletes the project with the specified ID.
    const id = req.params.projectID;
    if(projects.find((project: Project) => project.ID == id))
    {
        projects = projects.filter((project: Project)=> project.ID !== id);
        res.status(200).json({message: "Successfully deleted project with id: "+ id});
    }
    else
        res.status(400).json({error: {status: 400, message: "invalid id"}})
})

app.get("/project/:projectID/models/", (req: Request, res: Response)=>{
    //Returns an array of all models belonging to the project with the specified ID.
    const projectId = req.params.projectID;
    const requestedProject = projects.find((project: Project)=> project.ID === projectId);
    if(requestedProject != undefined)
        res.status(200).json(requestedProject.models);
    else
        res.status(400).json({error: {status: 400, message: "invalid id"}})
    
})

app.post("/project/:projectID/models", (req: Request, res: Response)=>{
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
            requestedProject.models.push(result);
            res.status(200).json(result);
        }
        else
            res.status(400).json({error: {status: 400, message: "invalid id"}})
    })
})


app.get('*', function(req:Request, res:Response) {
    res.status(404).json({error: "This endpoint doesn't exist"});
});