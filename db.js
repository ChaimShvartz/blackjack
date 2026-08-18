import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGO_URI);

async function connectToMongo() {
    try {
        await client.connect();
        console.log("Connecting to mongodb...");
    } catch (e) {
        console.error(e);
    }
}

await connectToMongo();
const db = client.db("blackjack");

export default db;
