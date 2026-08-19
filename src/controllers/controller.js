import playersRepo from "../repositorues/players.repo.js";
import roundsRepo from "../repositorues/rounds.repo.js";
import {
    getHandTotal,
    rafflePairCards,
    raffleCard,
} from "../services/service.js";

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
    const playerCards = rafflePairCards();
    const dealerCards = rafflePairCards();

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

export async function hit(req, res) {
    const { chips } = req.player;
    const playerId = req.player.id;
    const round = await validateHasRound(playerId);
    const {id} = round

    const newCard = raffleCard();
    let curRound = await roundsRepo.addCard(id, { playerCards: newCard });
    const { playerCards} = curRound;

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
    // let chips;

    let curRound = await validateHasRound(playerId);
    const { playerCards, id, bet } = curRound;
    let {dealerCards} = curRound
    

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
    dealerCards = curRound.dealerCards
    if (payout) chips = await playersRepo.updateChips(playerId, payout);

    res.json({
        playerCards,
        dealerCards,
        playerTotal,
        dealerTotal,
        status,
        chips,
    });

    // if (dealerTotal > 21) {
    //     curRound = await roundsRepo.updateStatus(id, "dealer_bust");
    //     chips = await playersRepo.updateChips(playerId, bet * 2);
    // } else {
    //     if (dealerTotal > playerTotal) {
    //         curRound = await roundsRepo.updateStatus(id, "dealer_win");
    //     } else if (playerTotal > dealerTotal) {
    //         curRound = await roundsRepo.updateStatus(id, "player_win");
    //         chips = await playersRepo.updateChips(playerId, bet * 2);
    //     } else {
    //         curRound = roundsRepo.updateStatus(id, "push");
    //         chips = await playersRepo.updateChips(playerId, bet);
    //     }
    // }

    // if(dealerTotal > pl)
}

async function playDealerTurn(roundId, cards) {
    let handTotal;
    while (!handTotal || handTotal < 17) {
        handTotal = getHandTotal(cards);
        if (handTotal < 17) {
            const newCard = raffleCard();
            const round = await roundsRepo.addCard(roundId, {dealerCards: newCard});
            cards = round.dealerCards
            console.log(cards);
            
        }
    }
    return handTotal;
}

function ThrowHttpException(status, message) {
    const err = Object.assign(new Error(), { status, message });
    throw err;
}

async function validateHasRound(playerId) {
    const round = await roundsRepo.getRoundByPlayerId(playerId);
    if (!round) ThrowHttpException(404, "Not found");
    return round;
}
