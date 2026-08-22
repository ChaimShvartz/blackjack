import { Router } from "express";
import playersRepo from "./repositories/players.repo.js";
import roundsRepo from "./repositories/rounds.repo.js";
import {
    createPlayer,
    createRound,
    getRound,
    hit,
    stand,
} from "./controller.js";
import { authentication } from "./middlewares.js";

export const router = Router();

router.get("/", (req, res) => {
    res.sendFile(process.cwd() + "/public/index.html");
});

router.post("/start-game", createPlayer);
router.post("/start-round", authentication, createRound);
router.post("/hit", authentication, hit);
router.post("/stand", authentication, stand);
router.get("/my-round",authentication, getRound);
