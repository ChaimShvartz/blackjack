import playersRepo from "./repositorues/players.repo.js";

export async function authentication(req, res, next) {
    const playerId = req.headers["x-player-id"];
    const player = await playersRepo.getPlayer(playerId);
    if (!player) res.status(401).end();
    req.player = player
    next()
}

export async function logger(req, _res, next){
    console.log(req.method, '->', req.url);
    next()
}