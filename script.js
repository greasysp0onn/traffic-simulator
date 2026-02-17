let coins = 0;
let coinsPerClick = 1;
let autoClickers = 0;

let clickUpgradeCost = 10;
let autoUpgradeCost = 50;

function saveGame() {
    localStorage.setItem("clickerSave", JSON.stringify({
        coins,
        coinsPerClick,
        autoClickers,
        clickUpgradeCost,
        autoUpgradeCost
    }));
}

function loadGame() {
    let save = JSON.parse(localStorage.getItem("clickerSave"));
    if (save) {
        coins = save.coins;
        coinsPerClick = save.coinsPerClick;
        autoClickers = save.autoClickers;
        clickUpgradeCost = save.clickUpgradeCost;
        autoUpgradeCost = save.autoUpgradeCost;
    }
    updateUI();
}

function updateUI() {
    document.getElementById("coins").innerText = coins;
    document.getElementById("cpc").innerText = coinsPerClick;
    document.getElementById("auto").innerText = autoClickers;
    document.getElementById("clickCost").innerText = clickUpgradeCost;
    document.getElementById("autoCost").innerText = autoUpgradeCost;
}

function clickCoin() {
    coins += coinsPerClick;
    updateUI();
    saveGame();
}

function buyUpgrade(type) {
    if (type === "click" && coins >= clickUpgradeCost) {
        coins -= clickUpgradeCost;
        coinsPerClick++;
        clickUpgradeCost = Math.floor(clickUpgradeCost * 1.5);
    }

    if (type === "auto" && coins >= autoUpgradeCost) {
        coins -= autoUpgradeCost;
        autoClickers++;
        autoUpgradeCost = Math.floor(autoUpgradeCost * 1.7);
    }

    updateUI();
    saveGame();
}

function autoClickLoop() {
    coins += autoClickers;
    updateUI();
    saveGame();
}

setInterval(autoClickLoop, 1000);

function startGame() {
    document.getElementById("mainMenu").classList.add("hidden");
    document.getElementById("gameScreen").classList.remove("hidden");
}

function openSettings() {
    document.getElementById("mainMenu").classList.add("hidden");
    document.getElementById("settingsScreen").classList.remove("hidden");
}

function goToMenu() {
    document.getElementById("gameScreen").classList.add("hidden");
    document.getElementById("settingsScreen").classList.add("hidden");
    document.getElementById("mainMenu").classList.remove("hidden");
}

function resetGame() {
    localStorage.removeItem("clickerSave");
    coins = 0;
    coinsPerClick = 1;
    autoClickers = 0;
    clickUpgradeCost = 10;
    autoUpgradeCost = 50;
    updateUI();
}

loadGame();
