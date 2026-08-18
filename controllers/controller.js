import playersRepo from "../repositorues/players.repo.js";
import roundsRepo from "../repositorues/rounds.repo.js";

export  function createPlayer() {
    const chips = process.env.STARTING_CHIPS;
    const newPlayer = {
        chips,
        createdAt: new Date().toLocaleDateString("he-IL"),
    };
    return newPlayer;
}
