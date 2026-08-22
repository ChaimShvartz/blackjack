import { ObjectId } from "mongodb";
import db from "../db.js";

const collection = db.collection("players");

export function createPlayersRepo(collection) {
    async function insertPlayer(player) {
        const { insertedId } = await collection.insertOne(player);
        return insertedId.toString();
    }

    async function getPlayer(playerId) {
        const { _id, ...rest } = await collection.findOne({_id: new ObjectId(playerId)}) || {};
        if(!_id) return
        return { id: _id.toString(), ...rest };
    }

    async function updateChips(playerId, amount) {
        const { chips } = await collection.findOneAndUpdate(
            { _id: new ObjectId(playerId) },
            { $inc: { chips: amount } },
            { returnDocument: "after" },
        );
        return chips;
    }
    return { insertPlayer, updateChips, getPlayer };
}

const playersRepo = createPlayersRepo(collection);
export default playersRepo;