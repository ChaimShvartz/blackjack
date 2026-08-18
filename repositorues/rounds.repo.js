import { ObjectId } from "mongodb";
import db from "../db.js";

const collection = db.collection("rounds");

export function createRoundsRepo(collection) {
    async function insertRound(round) {
        const { insertedId } = await collection.insertOne(round);
        return insertedId.toString();
    }

    async function getRoundByPlayerId(playerId) {
        const {_id, ...rest} = await collection.findOne({ playerId, status: "inProgress" }) || {};   
        if(!_id) return      
        return {id: _id.toString(), ...rest}
    }

    async function addCard(roundId, obj) {
        const doc = await collection.findOneAndUpdate(
            { _id: new ObjectId(roundId) },
            { $push: obj },
            { returnDocument: "after" },
        );
        return doc;
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
        collection.updateOne(
            { _id: new ObjectId(roundId) },
            { $set: { status } },
        );
    }
    return {
        insertRound,
        addCardToPlayer,
        addCardToDealer,
        getRoundByPlayerId,
        updateStatus,
    };
}

const roundsRepo = createRoundsRepo(collection);

export default roundsRepo;
