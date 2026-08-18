import express from "express";
import { router } from "./routes.js";

const server = express();

server.use(express.json());
server.use((req, res, next) => {
    console.log(req.method, "->", req.url);
    next()
});
server.use(router);

const port = process.env.PORT || 3000;
server.listen(port, () => console.log(`http://localhost:${port}`));
