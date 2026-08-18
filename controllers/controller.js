import playersRepo from "../repositorues/players.repo.js";
import roundsRepo from "../repositorues/rounds.repo.js";
import { raffle2Cards } from "../services/service.js";

export async function createPlayer(_req, res) {
    const chips = +process.env.STARTING_CHIPS;
    const newPlayer = {
        chips,
        createdAt: new Date().toLocaleDateString("he-IL"),
    };
    const playerId = await playersRepo.insertPlayer(newPlayer);
    res.status(201).json({ playerId, chips });
}

export async function createRound(req, res) {
    const { bet } = req.body;
    const playerId = req.player.id;

    if (bet <= 0 || bet > req.player.chips)
        ThrowHttpException(400, "Bad Request");

    if (await roundsRepo.getRoundByPlayerId(playerId))
        ThrowHttpException(409, "Conflict");

    const chips = await playersRepo.updateChips(playerId, -bet);
    const playerCards = raffle2Cards();
    const dealerCards = raffle2Cards();

    const round = {
        playerId,
        bet,
        playerCards,
        dealerCards,
        status: "in_progress",
        createdAt: new Date().toLocaleDateString("he-IL"),
    };
    const roundId = await roundsRepo.insertRound(round);
    res.status(201).json({
        roundId,
        playerCards,
        dealerUpCard: dealerCards[0],
        chips,
    });
}

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

function ThrowHttpException(status, message) {
    const err = Object.assign(new Error(), { status, message });
    throw err;
}
