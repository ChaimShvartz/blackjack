import playersRepo from "./repositories/players.repo.js";
import roundsRepo from "./repositories/rounds.repo.js";
import {
    getHandTotal,
    rafflePairCards,
    raffleCard,
} from "./services.js";

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
    let {chips} = req.player

    if (bet <= 0) ThrowHttpException(400, "ההימור חייב להיות חיובי");
    if (bet > chips)
        ThrowHttpException(400, `יש לך רק ${req.player.chips}`);
    if (await roundsRepo.getRoundByPlayerId(playerId))
        ThrowHttpException(409, "conflict");

    chips = await playersRepo.updateChips(playerId, -bet);
    const playerCards = rafflePairCards();
    const dealerCards = rafflePairCards();

    const round = {
        playerId,
        bet: +bet,
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
    const {id, chips} = req.player
    const round = await roundsRepo.getRoundByPlayerId(id);
    
    if (round) {
        const { playerId, dealerCards, ...rest } = round;
        res.json({ dealerUpCard: dealerCards[0], ...rest });
    } else {
        res.json({ round: null, chips});
    }
}

export async function hit(req, res) {
    const { chips } = req.player;
    const playerId = req.player.id;
    const {id} = await validateHasRound(playerId);

    const newCard = raffleCard();
    let curRound = await roundsRepo.addCard(id, { playerCards: newCard });
    const { playerCards } = curRound;

    const playerTotal = getHandTotal(playerCards);
    if (playerTotal > 21) {
        curRound = await roundsRepo.updateStatus(id, "player_bust");
    }
    const { status } = curRound;

    res.json({ playerCards, playerTotal, status, chips });
}

export async function stand(req, res) {
    const playerId = req.player.id;
    let { chips } = req.player;
    let curRound = await validateHasRound(playerId);

    const { playerCards, id, bet } = curRound;
    let { dealerCards } = curRound;

    const dealerTotal = await playDealerTurn(id, dealerCards);
    const playerTotal = getHandTotal(playerCards);

    let status, payout;
    if (dealerTotal > 21) {
        status = "dealer_bust";
        payout = bet * 2;
    } else {
        if (dealerTotal > playerTotal) {
            status = "dealer_win";
        } else if (playerTotal > dealerTotal) {
            status = "player_win";
            payout = bet * 2;
        } else {
            status = "push";
            payout = bet;
        }
    }
    curRound = await roundsRepo.updateStatus(id, status);
    dealerCards = curRound.dealerCards;
    if (payout) chips = await playersRepo.updateChips(playerId, payout);

    res.json({
        playerCards,
        dealerCards,
        playerTotal,
        dealerTotal,
        status,
        chips,
    });


}

async function playDealerTurn(roundId, cards) {
    let handTotal;
    while (!handTotal || handTotal < 17) {
        handTotal = getHandTotal(cards);
        if (handTotal < 17) {
            const newCard = raffleCard();
            const {dealerCards} = await roundsRepo.addCard(roundId, {
                dealerCards: newCard,
            });
            cards = dealerCards;
        }
    }
    return handTotal;
}

function ThrowHttpException(status, message) {
    throw Object.assign(new Error(), { status, message });
}

async function validateHasRound(playerId) {
    const round = await roundsRepo.getRoundByPlayerId(playerId);
    if (!round) ThrowHttpException(404, "Not found");
    return round;
}
