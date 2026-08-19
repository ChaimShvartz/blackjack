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

export function getHandTotal(cards) {
    let aces = countAces(cards);
    let handTotal = getTotal(cards);
    if (handTotal > 21) {
        for (; aces > 0 && handTotal > 21; aces--) {
            handTotal -= 10;
            // if (handTotal <= 21) break;
        }
    }
    return handTotal;
}

function countAces(cards) {
    return cards.reduce((acc, { rank }) => acc + (rank === "A"), 0);
}

function getTotal(cards) {
    return cards.reduce((acc, { rank }) => {
        const value = ["J", "Q", "K"].includes(rank)
            ? 10
            : rank === "A"
              ? 11
              : +rank;
        return acc + value;
    }, 0);
}

