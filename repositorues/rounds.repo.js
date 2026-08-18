import { ObjectId } from "mongodb";
import db from "../db.js";

const collection = db.collection("rounds");

export function createRoundsRepo() {
    async function insertRound(round) {
        const { insertedId } = await collection.insertOne(round);
        return insertedId.toString();
    }

    async function getRoundByPlayerId(playerId) {
        return collection.findOne({ playerId, status: "inProgress" });
    }

    async function addCard(roundId, obj) {
        const res = await collection.findOneAndUpdate(
            { _id: new ObjectId(roundId) },
            { $push: obj },
            { returnDocument: "after" },
        );
        return res;
    }

    async function addCardToPlayer(roundId, card) {
        const { playerCards } = await addCard(roundId, { playerCards: card });
        return playerCards;
    }

    async function addCardToDealer(roundId, card) {
        const { dealerCards } = addCard(roundId, { dealerCards: card });
        return dealerCards;
    }

    function updateStatus(roundId, status) {
        collection.updateOne({_id: new ObjectId(roundId)}, {$set:{status}})
    }
    return { insertRound, addCardToPlayer, addCardToDealer, getRoundByPlayerId, updateStatus };
}

const demo = createRoundsRepo()
// await demo.insertRound({playerId: 5, status: 'inProgress'})


console.log(await demo.updateStatus('6a84542fa8a9154b18821144', 'test'))