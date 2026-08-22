const API = "http://localhost:3000/";
const CARDS_API = "https://deckofcardsapi.com/static/img/";
const PLAYER_ID_KEY = "X-player-id";

async function createCardElement({ rank, suit } = {}) {
    const queryCard = rank ? (rank === "10" ? "0" : rank) + suit[0] : "back";
    const apiUrl = CARDS_API + queryCard + ".png";

    const cardElement = document.createElement("img");
    cardElement.src = apiUrl;
    cardElement.classList.add("card");
    return cardElement;
}

function getPlayerId() {
    return localStorage.getItem(PLAYER_ID_KEY);
}

function getValidateBet() {
    let bet = document.getElementById("bet-input").value;    
    if (bet === '') return;
    bet = +bet
    const errElement = document.getElementById('invalid-amount-msg')
    
    if (bet <= 0) {
        errElement.textContent = "ההימור חייב להיות חיובי";
        return;
    }
    if (bet > remainChips) {
        errElement.textContent = `נשארו לך רק ${remainChips}`;
        return;
    }
    return bet;
}

function createStatBox(title, content) {
    const box = document.createElement("div");
    box.classList.add("stat-box");
    const titleElement = Object.assign(document.createElement("p"), {
        textContent: title,
    });
    titleElement.classList.add("title");
    const contentElement = Object.assign(document.createElement("h2"), {
        textContent: content,
    });
    contentElement.classList.add("content");

    box.append(titleElement, contentElement);
    return box;
}

async function finishRound(
    status,
    chips,
    playerTotal,
    dealerTotal,
    dealerCards,
) {
    loadResultPage()
    const resultsBox = [];
    resultsBox.push(createStatBox("יתרה:", chips));
    resultsBox.push(createStatBox("סטטוס סיבוב:", status));
    resultsBox.push(createStatBox('סה"כ שחקן:', playerTotal));

    if (dealerTotal) {
        const dealerTotalElement = createStatBox('סה"כ דילר:', dealerTotal);
        resultsBox.push(dealerTotalElement);
        document.getElementById("back-card-dealer").remove();
        const cardsPromises = dealerCards.slice(1).map(createCardElement);
        document
            .getElementById("dealer-cards-container")
            .append(...(await Promise.all(cardsPromises)));
    }

    document.getElementById("header-title").append(...resultsBox);
    remainChips =chips    
    // gameElements.forEach((element) => element.remove());
    // resultElements.forEach((element) => buttonsContainer.append(element));
}

async function stand() {
    const { status, chips, playerTotal, dealerTotal, dealerCards } =
        await fetch(API + "stand", {
            method: "POST",
            headers: { [PLAYER_ID_KEY]: getPlayerId()},
        }).then((res) => res.json());
    finishRound(status, chips, playerTotal, dealerTotal, dealerCards);
}

async function hit() {
    const { playerCards, playerTotal, status, chips } = await fetch(
        API + "hit",
        {
            method: "POST",
            headers: { [PLAYER_ID_KEY]: getPlayerId() },
        },
    ).then((res) => res.json());
    const newElementCard = await createCardElement(playerCards.at(-1));
    document.getElementById("player-cards-container").append(newElementCard);
    if (status === "player_bust") finishRound(status, chips, playerTotal);
}

async function fitGamePage(playerCards, dealerUpCard, bet) {
    const dataPromises = await playerCards.map(createCardElement);
    document
        .getElementById("player-cards-container")
        .append(...(await Promise.all(dataPromises)));

    const dealerCardUpElement = await createCardElement(dealerUpCard);
    const dealerCardDownElement = await createCardElement();
    dealerCardDownElement.id = "back-card-dealer";
    document
        .getElementById("dealer-cards-container")
        .append(dealerCardUpElement, dealerCardDownElement);

    const betElement = document.getElementById("bet");
    betElement.textContent = bet;
}

async function startRound(bet) {
    const playerId = getPlayerId();
    const res = await fetch(API + "start-round", {
        method: "POST",
        headers: {
            "Content-type": "application/json",
            [PLAYER_ID_KEY]: playerId,
        },
        body: JSON.stringify({ bet }),
    }).then((res) => res.json());
    if (res.status === 400)
        return (invalidAmountMsgElement.textContent = `נשארו לך רק ${remainChips}`);
    const { playerCards, dealerUpCard } = res;
    loadGamePage();
    fitGamePage(playerCards, dealerUpCard, bet);
}

async function getRound() {
    const { chips, playerCards, dealerUpCard, bet } = await fetch(
        API + "my-round",
        {
            method: "GET",
            headers: { [PLAYER_ID_KEY]: getPlayerId() },
        },
    ).then((res) => res.json());
    return { chips, playerCards, dealerUpCard, bet };
}

async function startNewGame() {
    const { playerId, chips } = await fetch(API + "start-game", {
        method: "POST",
        headers: { "Content-type": "application/json" },
    }).then((res) => res.json());
    return { playerId, chips };
}

function loadOpeningPage() {
    // resultElements.forEach((element) => element.remove());
    const freshOpeningPage = cloneNodes.openingPage.cloneNode(true)
    main.replaceChild(freshOpeningPage, document.getElementById('game-page'));
    document.getElementById('remain-chips').textContent = remainChips;
}

function loadGamePage() {
    const freshGamePage = cloneNodes.gamePage.cloneNode(true);
    main.replaceChild(freshGamePage, document.getElementById('opening-page'));
    // gameElements.forEach((element) => buttonsContainer.append(element));

    // main.replaceChild(cloneNodes.dealerContainer, dealerContainer);
    // main.replaceChild(cloneNodes.playerContainer, playerContainer);
}

function loadResultPage() {
    // main.replaceChild(cloneNodes.resultPage, document.getElementById('gam'));
    // document.querySelectorAll('.game').forEach((element) => element.remove());
    // document.querySelectorAll('.result').forEach((element) => gamePage.append(element));
    
    document.getElementById('buttons-container').replaceChildren(...resultElements)
    // resultElements.forEach((element) => buttonsContainer.append(element));
}

async function initApp() {
    if (!getPlayerId()) {
        const { playerId, chips } = await startNewGame();
        localStorage.setItem(PLAYER_ID_KEY, playerId);
        remainChips = chips;
    } else {
        const { chips, playerCards, dealerUpCard, bet } = await getRound();
        if (chips === undefined) {
            loadGamePage();
            return fitGamePage(playerCards, dealerUpCard, bet);
        }
        remainChips = chips;
    }
    document.getElementById("remain-chips").textContent = remainChips;
}

async function listenToButtons(/**@type {Event} */ event) {
    if (!event.target.closest("button")) return;
    switch (event.target.id) {
        case "send-bet-btn":
            const bet = getValidateBet();
            if (!bet) return;
            return startRound(bet);
        case "hit-btn":
            return hit();
        case "stand-btn":
            return stand();
        case "start-new-round-btn":
            return loadOpeningPage();
        default:
            break;
    }
}
const openingPage = document.getElementById("opening-page");
const gamePage = document.getElementById("game-page");
const gameElements = document.querySelectorAll(".game");
const resultElements = document.querySelectorAll(".result");
const headerTitle = document.getElementById("header-title");

const dealerContainer = document.getElementById("dealer-cards-container");
const playerContainer = document.getElementById("player-cards-container");
const buttonsContainer = document.getElementById("buttons-container");
// const remainChipsElement = document.getElementById("remain-chips");

const cloneNodes = {
    openingPage: openingPage.cloneNode(true),
    gamePage: gamePage.cloneNode(true),
    headerTitle: headerTitle.cloneNode(true),
    playerContainer: playerContainer.cloneNode(true),
    dealerContainer: dealerContainer.cloneNode(true),
    invalidAmountMsgElement: document
        .getElementById("invalid-amount-msg")
        .cloneNode(true),
};
let remainChips;

resultElements.forEach((element) => element.remove());
cloneNodes.gamePage = gamePage.cloneNode(true);
gameElements.forEach((element) => element.remove());
gameElements.forEach((element) => gamePage.append(element));
cloneNodes.resultPage = gamePage.cloneNode(true);

gamePage.remove();

const main = document.querySelector("main");
main.addEventListener("click", listenToButtons);

initApp();
