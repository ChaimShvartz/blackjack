import playersRepo from "./repositorues/players.repo.js";

export async function authentication(req, res, next) {
    const playerId = req.headers["x-player-id"];    
    const player = await playersRepo.getPlayer(playerId);
    if (!player) return res.status(401).end();
    req.player = player;
    next();
}

export function logger(req, _res, next) {
    console.log(req.method, "->", req.url);
    next();
}

export function exceptionHandler(err, _req, res, _next) {
    const { status, message } = Object.assign(
        { status: 500, message: "Internal Server Error" },
        err,
    );
    res.status(status).json({status, message});
}
