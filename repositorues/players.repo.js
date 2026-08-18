import { ObjectId } from "mongodb";
import db from "../db.js";

const collection = db.collection("players");

export function createPlayersRepo(collection) {
    async function insertPlayer(player) {
        const { insertedId } = await collection.insertOne(player);
        return insertedId.toString();
    }

    async function getChips(playerId) {
        const { chips } =
            (await collection.findOne({ _id: new ObjectId(playerId) })) || {};
        return chips;
    }

    async function updsateChips(playerId, bet) {
        const { chips } = await collection.findOneAndUpdate(
            { _id: new ObjectId(playerId) },
            { $inc: { chips: -bet } },
            { returnDocument: "after" },
        );
        return chips;
    }
    return { insertPlayer, updsateChips, getChips };
}

const playersRepo = createPlayersRepo(collection);
export default playersRepo;
