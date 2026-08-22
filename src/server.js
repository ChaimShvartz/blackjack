import express from "express";
import cors from "cors";
import { router } from "./routes.js";
import { exceptionHandler, logger } from "./middlewares.js";

const server = express();

server.use(cors(), express.json(), logger, router, exceptionHandler);

const port = process.env.PORT || 3000;
server.listen(port, () => console.log(`http://localhost:${port}`));
