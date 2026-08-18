import { Router } from "express";
import playersRepo from "./repositorues/players.repo.js";
import roundsRepo from "./repositorues/rounds.repo.js";
import { createPlayer } from "./controllers/controller.js";
export const router = Router();

router.get("/", (req, res) => {
    res.sendFile(process.cwd() + "/index.html");
});

router.post("/start-game", async (req, res) => {
    const newPlayer = createPlayer();
    const playerId = await playersRepo.insertPlayer(newPlayer);
    const { chips } = newPlayer;
    res.status(201).json({ playerId, chips });
});
router.post("/hit", (req, res) => {});
router.post("/stand", (req, res) => {});
router.get("/my-round", (req, res) => {});
