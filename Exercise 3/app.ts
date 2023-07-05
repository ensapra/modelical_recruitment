import { Request, Response } from 'express';
import 'joi-extract-type'
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
