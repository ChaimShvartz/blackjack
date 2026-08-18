import { Router } from "express";
import playersRepo from "./repositorues/players.repo.js";
import roundsRepo from "./repositorues/rounds.repo.js";
import {
    createPlayer,
    createRound,
    getRound,
} from "./controllers/controller.js";
import { authentication } from "./middlewares.js";

export const router = Router();

router.get("/", (req, res) => {
    res.sendFile(process.cwd() + "/index.html");
});

router.post("/start-game", createPlayer);
router.post("/start-round", authentication, createRound);
router.post("/hit", (req, res) => {});
router.post("/stand", (req, res) => {});
router.get("/my-round", getRound);
