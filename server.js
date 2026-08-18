import express from "express";
import { router } from "./routes.js";
import { logger } from "./middlewares.js";

const server = express();

server.use(express.json(), logger, router);

const port = process.env.PORT || 3000;
server.listen(port, () => console.log(`http://localhost:${port}`));
