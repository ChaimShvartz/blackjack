import playersRepo from "../repositorues/players.repo.js";
import roundsRepo from "../repositorues/rounds.repo.js";

export async function createPlayer(_req, res) {
    const chips = process.env.STARTING_CHIPS;
    const newPlayer = {
        chips,
        createdAt: new Date().toLocaleDateString("he-IL"),
    };
    const playerId = await playersRepo.insertPlayer(newPlayer);
    res.status(201).json({ playerId, chips });
}

export async function createRound(req, res) {}

export async function getRound(/**@type {Request}) */ req, res) {
    const playerId = req.headers["x-player-id"];
    const round = await roundsRepo.getRoundByPlayerId(playerId);
    if (round) {
        const { playerId, ...rest } = round;
        res.json(rest);
    } else {
        res.json({ round: null });
    }
}
