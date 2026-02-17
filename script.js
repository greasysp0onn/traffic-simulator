let carsManaged = 0;
let trafficPower = 1;
let officers = 0;

let lightUpgradeCost = 10;
let officerCost = 50;

let mayorRank = 0;
let prestigeMultiplier = 1;

let achievements = [];

let lastSaveTime = Date.now();
let rushHourActive = false;

// ================= SAVE / LOAD =================

function saveGame() {
    localStorage.setItem("trafficClickerSave", JSON.stringify({
        carsManaged,
        trafficPower,
        officers,
        lightUpgradeCost,
        officerCost,
        mayorRank,
        prestigeMultiplier,
        achievements,
        lastSaveTime: Date.now()
    }));
}

function loadGame() {
    let save = JSON.parse(localStorage.getItem("trafficClickerSave"));
    if (save) {
        carsManaged = save.carsManaged;
        trafficPower = save.trafficPower;
        officers = save.officers;
        lightUpgradeCost = save.lightUpgradeCost;
        officerCost = save.officerCost;
        mayorRank = save.mayorRank || 0;
        prestigeMultiplier = save.prestigeMultiplier || 1;
        achievements = save.achievements || [];
        lastSaveTime = save.lastSaveTime || Date.now();

        // Offline earnings
        let secondsOffline = Math.floor((Date.now() - lastSaveTime) / 1000);
        let offlineGain = secondsOffline * officers;
        carsManaged += offlineGain;
    }
    updateUI();
}

// ================= UI =================

function updateUI() {
    document.getElementById("coins").innerText = Math.floor(carsManaged);
    document.getElementById("cpc").innerText = trafficPower;
    document.getElementById("auto").innerText = officers;

    document.getElementById("clickCost").innerText = lightUpgradeCost;
    document.getElementById("autoCost").innerText = officerCost;

    if (document.getElementById("mayorRank"))
        document.getElementById("mayorRank").innerText = mayorRank;

    if (document.getElementById("multiplier"))
        document.getElementById("multiplier").innerText = prestigeMultiplier.toFixed(2);
}

// ================= GAMEPLAY =================

function clickCoin() {
    carsManaged += trafficPower * prestigeMultiplier;
    checkAchievements();
    updateUI();
    saveGame();
}

function buyUpgrade(type) {
    if (type === "click" && carsManaged >= lightUpgradeCost) {
        carsManaged -= lightUpgradeCost;
        trafficPower++;
        lightUpgradeCost = Math.floor(lightUpgradeCost * 1.5);
    }

    if (type === "auto" && carsManaged >= officerCost) {
        carsManaged -= officerCost;
        officers++;
        officerCost = Math.floor(officerCost * 1.7);
    }

    updateUI();
    saveGame();
}

function autoLoop() {
    carsManaged += officers * prestigeMultiplier;
    updateUI();
    saveGame();
}
setInterval(autoLoop, 1000);

// ================= PRESTIGE =================

function prestige() {
    if (carsManaged >= 10000) {
        mayorRank++;
        prestigeMultiplier += 0.25;

        carsManaged = 0;
        trafficPower = 1;
        officers = 0;
        lightUpgradeCost = 10;
        officerCost = 50;

        alert("You became Mayor Rank " + mayorRank + "!");
        updateUI();
        saveGame();
    } else {
        alert("You need 10,000 Cars Managed to become Mayor!");
    }
}

// ================= ACHIEVEMENTS =================

function checkAchievements() {
    if (carsManaged >= 100 && !achievements.includes("100")) {
        achievements.push("100");
        alert("Achievement Unlocked: Small Town Controller!");
    }

    if (carsManaged >= 1000 && !achievements.includes("1000")) {
        achievements.push("1000");
        alert("Achievement Unlocked: City Manager!");
    }

    if (carsManaged >= 10000 && !achievements.includes("10000")) {
        achievements.push("10000");
        alert("Achievement Unlocked: Traffic Legend!");
    }
}

// ================= RUSH HOUR =================

function triggerRushHour() {
    if (!rushHourActive) {
        rushHourActive = true;
        prestigeMultiplier *= 2;

        alert("Rush Hour! Income doubled for 15 seconds!");

        setTimeout(() => {
            prestigeMultiplier /= 2;
            rushHourActive = false;
        }, 15000);
    }
}

setInterval(() => {
    if (Math.random() < 0.05) {
        triggerRushHour();
    }
}, 10000);

// ================= NAVIGATION =================

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
    localStorage.removeItem("trafficClickerSave");
    location.reload();
}

loadGame();