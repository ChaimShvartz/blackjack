const RANKS = [
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "J",
    "Q",
    "K",
    "A",
];
const SUITS = ["hearts", "diamonds", "clubs", "spades"];

export function rafflePairCards() {
    const cards = [];
    for (let i = 0; i < 2; i++) {
        cards.push(raffleCard());
    }
    return cards;
}

export function raffleCard() {
    const randomNumber = Math.random();
    const rankPosition = Math.floor(randomNumber * RANKS.length);
    const suitPosition = Math.floor(randomNumber * SUITS.length);
    return { rank: RANKS[rankPosition], suit: SUITS[suitPosition] };
}
