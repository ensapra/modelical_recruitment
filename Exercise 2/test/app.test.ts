import { array, object, string } from 'joi'
import app from '../app'
import request from 'supertest'
import supertest from 'supertest';
import { models, projects } from './data';

const fakeIncompleteProject = {
    name: "An incomplete name",
    description: "An incomplete description",
};

const fakeCompleteProject = {
    name: "A complete name",
    description: "A complete description",
    models: [{
        name: "A model name",
        description: "A model description",
        verticesCount: 2
    }]
};
const fakeModel = {
    name: "A new name",
    description: "A new description",
    verticesCount: 65
}

const invalidItem = {
    invalidParam: "An invalid thing",
    name: 3,
}

const invalidID: number = -1;

beforeEach(() => {
    // Reset the server's state by clearing the projects and models arrays
    projects.length = 0;
    models.length = 0;
});

describe("GET /projects", ()=>{
    it('should return all the projects on the database', async()=>{
        const res = await request(app)
            .get('/projects')
            .send();
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual([]) 

        const newProject = await request(app)
            .post('/projects')
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .send(fakeCompleteProject);
        
        const newRequest = await request(app)
            .get('/projects')
            .send();
        expect(newRequest.statusCode).toEqual(200);
        expect(newRequest.body).toHaveLength(1);
        expect(newRequest.headers['content-type']).toEqual(expect.stringContaining("json"))
        expect(newRequest.body).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    ID: newProject.body.ID
                })]))
    });
})

describe("POST /projects", ()=>{
    it('should return error without a project', async()=>{
        const res = await request(app)
            .post('/projects')
            .send();
        expect(res.statusCode).toEqual(500);
    })
    it('should not accept invalid projects', async ()=>{
        const res = await request(app)
            .post('/projects')
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .send(invalidItem);
        expect(res.statusCode).toEqual(500);
    });
    it('should return a valid project', async ()=>{
        const res = await request(app)
            .post('/projects')
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .send(fakeCompleteProject);
        expect(res.statusCode).toEqual(200);
        expect(res.body.name).toEqual(fakeCompleteProject.name);
        expect(res.body.description).toEqual(fakeCompleteProject.description);
    });
    it('should be added to the list of projects', async()=>{
        const res = await request(app)
            .post('/projects')
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .send(fakeCompleteProject);
        const projects = await request(app)
            .get('/projects')
            .send();
        expect(res.statusCode).toEqual(200);
        expect(projects.body).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ID: res.body.ID})]))
    })
    it('should add the models', async()=>{
        const res = await request(app)
            .post('/projects')
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .send(fakeCompleteProject);
        const models = await request(app)
            .get('/models')
            .send();
        expect(res.statusCode).toEqual(200);
        expect(res.body.models).not.toEqual(
            expect.arrayContaining([
                expect.not.objectContaining({
                    projectID: res.body.ID
                })]));
        expect(models.body).toEqual(
            expect.arrayContaining([
                expect.objectContaining({projectID: res.body.ID})]))
    })

    it('should handle project with maximum allowed characters', async () => {
        const project = {
            name: 'A'.repeat(255), // Maximum allowed characters for name
            description: 'B'.repeat(1000), // Maximum allowed characters for description
        };

        const res = await request(app)
            .post('/projects')
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .send(project);

        expect(res.statusCode).toBe(200);
        expect(res.body.name).toEqual(project.name);
        expect(res.body.description).toEqual(project.description);
    });

    it('should handle project with special characters, leading/trailing whitespaces, or empty values', async () => {
        const project = {
            name: '!@#$%^&*()_+{}|:"<>?~`-=[];\',./\\', // Special characters
            description: '   Trimmed Description   ', // Leading/trailing whitespaces
        };

        const res = await request(app)
            .post('/projects')
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .send(project);

        expect(res.statusCode).toBe(200);
        expect(res.body.name).toEqual(project.name.trim());
        expect(res.body.description).toEqual(project.description.trim());
    });

    it('should handle project with very long name or description', async () => {
        const project = {
            name: 'A'.repeat(10000), // Very long name
            description: 'B'.repeat(10000), // Very long description
        };

        const res = await request(app)
            .post('/projects')
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .send(project);

        expect(res.statusCode).toBe(200);
        expect(res.body.name).toEqual(project.name.substring(0, 255));
        expect(res.body.description).toEqual(project.description.substring(0, 1000));
    });
})

describe("GET /projects/:projectID", ()=>{
    describe("if the id doesn't exist", ()=>{
        it('should return an invalid ID error', async()=>{
            const res = await request(app)
                .get('/projects/'+invalidID)
                .send();
            expect(res.statusCode).toBe(400);
        }); 
    })

    describe("if the id exists", () => {
        it("should return the project details for the given ID", async () => {
            const createRes = await request(app)
                .post("/projects")
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")
                .send(fakeCompleteProject);

            const projectID = createRes.body.ID;

            const getRes = await request(app)
                .get("/projects/" + projectID)
                .send();

            expect(getRes.statusCode).toEqual(200);
            expect(getRes.body.ID).toEqual(projectID);
            expect(getRes.body.name).toEqual(fakeCompleteProject.name);
            expect(getRes.body.description).toEqual(fakeCompleteProject.description);
        });
    });    
})

describe("PUT /projects/:projectID", ()=>{
    describe("if the id doesn't exist", ()=>{
        it('should return an invalid ID error', async()=>{
            const res = await request(app)
                .put('/projects/'+invalidID)
                .send(fakeCompleteProject);
            expect(res.statusCode).toBe(400);
        })
    })
    describe("if the id exists", ()=>{
        it('should update the project and add the required models to the list', async()=>{
            const res = await request(app)
                .post('/projects')
                .set('Content-Type', 'application/json')
                .set('Accept', 'application/json')
                .send(fakeIncompleteProject);

            const update = await request(app)
                .put('/projects/'+res.body.ID)
                .set('Content-Type', 'application/json')
                .set('Accept', 'application/json')
                .send(fakeCompleteProject);
            expect(update.statusCode).toEqual(200);
            expect(res.body.ID).toEqual(update.body.ID);
            expect(update.body.name).toEqual(fakeCompleteProject.name);
            expect(update.body.description).toEqual(fakeCompleteProject.description);
            expect(update.body.models).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({projectID: update.body.ID})
                ]));

            const allProjects = await request(app)
                .get('/projects')
                .send();
            expect(allProjects.body).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                    ID: update.body.ID,
                    name: fakeCompleteProject.name,
                    description: fakeCompleteProject.description})]))
            expect(allProjects.body).not.toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                    ID: res.body.ID,
                    name: fakeIncompleteProject.name,
                    description: fakeIncompleteProject.description})]))   
            
            const allModels = await request(app)
                .get('/models')
                .send();
            expect(allModels.body).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({projectID: update.body.ID})
                ]))
        });
        it('should handle updating a project with maximum allowed characters', async () => {
            const updatedProject = {
                name: 'A'.repeat(255), // Maximum allowed characters for name
                description: 'B'.repeat(1000), // Maximum allowed characters for description
            };
            const res = await request(app)
                .post('/projects')
                .set('Content-Type', 'application/json')
                .set('Accept', 'application/json')
                .send(fakeIncompleteProject);

            const response = await request(app)
                .put(`/projects/`+res.body.ID)
                .set('Content-Type', 'application/json')
                .set('Accept', 'application/json')
                .send(updatedProject);

            expect(response.statusCode).toBe(200);
            expect(response.body.name).toEqual(updatedProject.name);
            expect(response.body.description).toEqual(updatedProject.description);
        });

        it('should handle updating a project with special characters, leading/trailing whitespaces, or empty values', async () => {
            const updatedProject = {
                name: '!@#$%^&*()_+{}|:"<>?~`-=[];\',./\\', // Special characters
                description: '   Trimmed Description   ', // Leading/trailing whitespaces
            };
            
            const res = await request(app)
                .post('/projects')
                .set('Content-Type', 'application/json')
                .set('Accept', 'application/json')
                .send(fakeIncompleteProject);

            const response = await request(app)
                .put(`/projects/`+res.body.ID)
                .set('Content-Type', 'application/json')
                .set('Accept', 'application/json')
                .send(updatedProject);

            expect(response.statusCode).toBe(200);
            expect(response.body.name).toEqual(updatedProject.name.trim());
            expect(response.body.description).toEqual(updatedProject.description.trim());
        });

        it('should handle updating a project with very long name or description', async () => {
            const updatedProject = {
                name: 'A'.repeat(10000), // Very long name
                description: 'B'.repeat(10000), // Very long description
            };
            const res = await request(app)
                .post('/projects')
                .set('Content-Type', 'application/json')
                .set('Accept', 'application/json')
                .send(fakeIncompleteProject);

            const response = await request(app)
                .put(`/projects/`+res.body.ID)
                .set('Content-Type', 'application/json')
                .set('Accept', 'application/json')
                .send(updatedProject);

            expect(response.statusCode).toBe(200);
            expect(response.body.name).toEqual(updatedProject.name.substring(0, 255));
            expect(response.body.description).toEqual(updatedProject.description.substring(0, 1000));
        });

        it('should handle updating a project with invalid properties or properties of incorrect data types', async () => {
            const updatedProject = {
                invalidProperty: 'Invalid',
                name: 123, // Should be a string
                description: 123, // Should be a string
            };

            const res = await request(app)
                .post('/projects')
                .set('Content-Type', 'application/json')
                .set('Accept', 'application/json')
                .send(fakeIncompleteProject);

            const response = await request(app)
                .put(`/projects/`+res.body.id)
                .set('Content-Type', 'application/json')
                .set('Accept', 'application/json')
                .send(updatedProject);

            expect(response.statusCode).toBe(500);
        });
    })
})

describe("DELETE /projects/:projectID", ()=>{
    describe("if the id doesn't exist", ()=>{
        it('should return an invalid ID error', async ()=>{
            const res = await request(app)
                .delete('/projects/'+invalidID)
                .send();
            expect(res.statusCode).toBe(400);
        });
    })
    describe("if the id exists", ()=>{
        it('should delete the project from the database with the related models', async()=>{
            const res = await request(app)
                .post('/projects')
                .set('Content-Type', 'application/json')
                .set('Accept', 'application/json')
                .send(fakeCompleteProject);
            const delet = await request(app)
                .delete('/projects/'+res.body.ID)
            expect(delet.statusCode).toEqual(200);
            
            const allProjects = await request(app)
                .get('/projects')
                .send();

            expect(allProjects.body).not.toEqual(
                expect.arrayContaining([
                    expect.objectContaining({ID: res.body.ID})]))

            const allModels = await request(app)
                .get('/models')
                .send();
                
            expect(allModels.body).not.toEqual(
                expect.arrayContaining([
                    expect.objectContaining({projectID: res.body.ID})]))
        });
    })
})

describe("GET /projects/:projectID/models", ()=>{
    describe("if the id doesn't exist", ()=>{
        it('should return an invalid ID error', async ()=>{
            const res = await request(app)
                .get('/projects/'+invalidID+'/models')
                .send();
            expect(res.statusCode).toBe(400);
        });
    })
    describe("if the id exists", ()=>{
        it('should return an array with the correct models', async()=>{
            const res = await request(app)
                .post('/projects')
                .set('Content-Type', 'application/json')
                .set('Accept', 'application/json')
                .send(fakeCompleteProject);
            const models = await request(app)
                .get('/projects/'+res.body.ID+'/models')
                .send(fakeCompleteProject);
            expect(models.statusCode).toEqual(200);
            expect(models.body).not.toEqual(
                expect.arrayContaining([
                    expect.not.objectContaining({projectID:res.body.ID})
                ])
            )
        })
    })
})


//Implement tests
describe("GET /models", ()=>{
    it('should return all models',async ()=>{
        const res = await request(app)
            .get('/models')
            .send();
        expect(res.statusCode).toEqual(200)
        expect(res.headers['content-type']).toEqual(expect.stringContaining("json"))
        expect(res.body).toEqual([]);

        const NewProject = await request(app)
            .post('/projects')
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .send(fakeCompleteProject);
        
        const newRequest = await request(app)
            .get('/models')
            .send();
        expect(newRequest.statusCode).toEqual(200);
        expect(newRequest.headers['content-type']).toEqual(expect.stringContaining("json"))
        expect(newRequest.body).toHaveLength(1);
        expect(newRequest.body).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    projectID: NewProject.body.ID
                }
                )]))
    });
})

describe("GET /models/:modelID", ()=>{
    describe("if the id doesn't exist", ()=>{
        it('should return an invalid ID error', async()=>{
            const res = await request(app)
                .get('/models/'+invalidID)
                .send();                    
            expect(res.statusCode).toEqual(400);
        });
    })

    describe("if the id exists", ()=>{
        it('should return a valid model', async()=>{
            const res = await request(app)
                .post('/projects')
                .set('Content-Type', 'application/json')
                .set('Accept', 'application/json')
                .send(fakeCompleteProject);
            const modelId = res.body.models[0].ID;
            const model = await request(app)
                .get('/models/'+modelId)
                .send(fakeCompleteProject);
            expect(model.statusCode).toEqual(200);
            expect(model.body.ID).toEqual(modelId);
            expect(model.body.projectID).toEqual(res.body.ID);
        });
    })
})

describe("PUT /models/:modelID", ()=>{
    describe("if the id doesn't exist", ()=>{
        it('should return an invalid ID error',async()=>{
            const invalidID: number = -1;
            const res = await request(app)
                .put('/models/'+invalidID)
                .send(fakeModel);                    
            expect(res.statusCode).toEqual(400);
        });
    })

    describe("if the id exists", ()=>{
        it('should modify the model model', async()=>{
            const res = await request(app)
                .post('/projects')
                .set('Content-Type', 'application/json')
                .set('Accept', 'application/json')
                .send(fakeCompleteProject);
            const modelId = res.body.models[0].ID;
            const model = await request(app)
                .put('/models/'+modelId)
                .set('Content-Type', 'application/json')
                .set('Accept', 'application/json')
                .send(fakeModel);
            expect(model.statusCode).toEqual(200);

            expect(model.body.ID).toEqual(res.body.models[0].ID);
            expect(model.body.projectID).toEqual(res.body.ID);
            expect(model.body.name).toEqual(fakeModel.name);
            expect(model.body.description).toEqual(fakeModel.description);
            expect(model.body.verticesCount).toEqual(fakeModel.verticesCount);

            const storedModels = await request(app)
                .get('/models')
                .send();

            expect(storedModels.body).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                    ID: model.body.ID,
                    name: fakeModel.name,
                    description: fakeModel.description,
                    verticesCount: fakeModel.verticesCount,
                })]));
        });
    })
})

describe("DELETE /models/:modelID", ()=>{
    describe("if the id doesn't exist", ()=>{
        it('should return an invalid ID error',async()=>{
            const res = await request(app)
                .get('/models/'+invalidID)
                .send();                    
            expect(res.statusCode).toEqual(400);
        });
    })
    describe("if the id exists", ()=>{
        it('should delete the item from the database', async()=>{
            const res = await request(app)
                .post('/projects')
                .set('Content-Type', 'application/json')
                .set('Accept', 'application/json')
                .send(fakeCompleteProject);
            const modelId = res.body.models[0].ID;
            const delet = await request(app)
                .delete('/models/'+ modelId)
                .send();
            expect(delet.statusCode).toEqual(200);

            const models = await request(app)
                .get('/models')
                .send()
            expect(models.body).not.toEqual(
                expect.arrayContaining([
                    expect.objectContaining({ID:modelId})
                ]))
        })
    })
})

describe("POST /projects/:projectID/models", ()=>{
    describe("if the id doesn't exist", ()=>{
        it('should return an invalid ID error',async()=>{
            const res = await request(app)
                .get('/projects/'+invalidID+'/models')
                .send();                    
            expect(res.statusCode).toEqual(400);
        });
    })
    describe("if the id exists", ()=>{
        it('should make sure the model is valid', async ()=>{
            const res = await request(app)
                .post('/projects')
                .set('Content-Type', 'application/json')
                .set('Accept', 'application/json')
                .send(fakeIncompleteProject);
            const projectID = res.body.ID;
            const modelInvalidPost = await request(app)
                .post('/projects/'+projectID+'/models')
                .set('Content-Type', 'application/json')
                .set('Accept', 'application/json')
                .send(invalidItem);
            expect(modelInvalidPost.statusCode).toEqual(500);
        });

        it('should create a valid model', async ()=>{
            const res = await request(app)
                .post('/projects')
                .set('Content-Type', 'application/json')
                .set('Accept', 'application/json')
                .send(fakeIncompleteProject);
            const projectID = res.body.ID;
            const modelValidPost = await request(app)
                .post('/projects/'+projectID+'/models')
                .set('Content-Type', 'application/json')
                .set('Accept', 'application/json')
                .send(fakeModel);
            expect(modelValidPost.statusCode).toEqual(200);
            expect(modelValidPost.body.projectID).toEqual(projectID);
            expect(modelValidPost.body.name).toEqual(fakeModel.name);
            expect(modelValidPost.body.description).toEqual(fakeModel.description);
            expect(modelValidPost.body.verticesCount).toEqual(fakeModel.verticesCount);

            const allModels = await request(app)
                .get('/models')
                .send();
            
            expect(allModels.body).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        ID:modelValidPost.body.ID, 
                        projectID: modelValidPost.body.projectID
                    })
                ]))
        }); 
    })
})
