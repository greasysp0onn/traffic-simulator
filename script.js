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

// Rush hour cooldown (seconds)
let rushCooldown = 0;
const RUSH_DURATION = 15;    // seconds
const RUSH_COOLDOWN_MAX = 60; // seconds

// Assistant ideas (will be shown in Settings -> Ideas & Roadmap)
const assistantIdeas = [
    { title: "Animated Traffic Lights", desc: "Add animated lights above the click button that change color and give small bonuses when perfectly timed." },
    { title: "Districts", desc: "Unlock new districts (Downtown, Suburbs, Industrial) with different base incomes and unique upgrades." },
    { title: "Vehicle Types", desc: "Introduce Trucks, Buses, Emergency Vehicles. Each yields different rewards and multipliers." },
    { title: "Mayor Skill Tree", desc: "Spend Mayor Points on a skill tree for permanent bonuses (faster autos, cheaper upgrades, bigger rush hours)." },
    { title: "Timed Events", desc: "Special limited events (Festivals, Accidents) that modify income temporarily and offer unique rewards." },
    { title: "Visual Upgrade Shop", desc: "Buy skins for your dashboard, officers, and traffic lights to show off progress." },
    { title: "Cloud Saves & Leaderboards", desc: "Integrate cloud save and global leaderboard to compete with other mayors." },
];

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
        lastSaveTime: Date.now(),
        rushCooldown
    }));
    showToast("Game saved");
}

function loadGame() {
    let save = JSON.parse(localStorage.getItem("trafficClickerSave"));
    if (save) {
        carsManaged = save.carsManaged || 0;
        trafficPower = save.trafficPower || 1;
        officers = save.officers || 0;
        lightUpgradeCost = save.lightUpgradeCost || 10;
        officerCost = save.officerCost || 50;
        mayorRank = save.mayorRank || 0;
        prestigeMultiplier = save.prestigeMultiplier || 1;
        achievements = save.achievements || [];
        lastSaveTime = save.lastSaveTime || Date.now();
        rushCooldown = save.rushCooldown || 0;

        // Offline earnings (bounded)
        let secondsOffline = Math.floor((Date.now() - lastSaveTime) / 1000);
        if (secondsOffline > 0) {
            let offlineGain = Math.min(secondsOffline, 3600) * officers * prestigeMultiplier; // cap offline to 1 hour
            carsManaged += offlineGain;
            if (offlineGain > 0) showToast(`Offline: +${Math.floor(offlineGain)} cars`);
        }
    }
    updateUI();
    renderIdeas();
}

// ================= UI =================

function updateUI() {
    safeSetText("coins", Math.floor(carsManaged));
    safeSetText("cpc", trafficPower);
    safeSetText("auto", officers);
    safeSetText("clickCost", lightUpgradeCost);
    safeSetText("autoCost", officerCost);
    safeSetText("mayorRank", mayorRank);
    safeSetText("multiplier", prestigeMultiplier.toFixed(2));
    updateRushUI();
    renderAchievements();
}

function safeSetText(id, text) {
    const el = document.getElementById(id);
    if (el) el.innerText = text;
}

// floating +X animation near the clicked button
function floatingText(text, clientX, clientY) {
    const container = document.getElementById("floatingContainer");
    if (!container) return;
    const node = document.createElement("div");
    node.className = "floatingText";
    node.innerText = text;
    node.style.left = clientX + "px";
    node.style.top = clientY + "px";
    container.appendChild(node);
    setTimeout(() => { node.remove(); }, 1000);
}

// tiny toast using floating text near top-right
function showToast(msg) {
    const container = document.getElementById("floatingContainer");
    if (!container) return;
    const node = document.createElement("div");
    node.className = "floatingText";
    node.style.left = (window.innerWidth - 120) + "px";
    node.style.top = "40px";
    node.style.background = "rgba(0,0,0,0.8)";
    node.style.color = "#9be7ff";
    node.style.fontSize = "13px";
    node.style.padding = "6px 10px";
    node.innerText = msg;
    container.appendChild(node);
    setTimeout(() => { node.remove(); }, 1500);
}

// ================= GAMEPLAY =================

function clickCoin(event) {
    // support being called from button with event or from code without event
    let clientX = (event && event.clientX) ? event.clientX : (window.innerWidth / 2);
    let clientY = (event && event.clientY) ? event.clientY : (window.innerHeight / 2);
    const gain = trafficPower * prestigeMultiplier;
    carsManaged += gain;
    floatingText("+" + Math.floor(gain), clientX, clientY);
    checkAchievements();
    updateUI();
    saveGame();
}

// allow click button to pass event
document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("clickButton");
    if (btn) {
        btn.addEventListener("click", (e) => clickCoin(e));
    }
});

function buyUpgrade(type) {
    if (type === "click" && carsManaged >= lightUpgradeCost) {
        carsManaged -= lightUpgradeCost;
        trafficPower++;
        lightUpgradeCost = Math.floor(lightUpgradeCost * 1.5);
    } else if (type === "click") {
        showToast("Not enough cars");
    }

    if (type === "auto" && carsManaged >= officerCost) {
        carsManaged -= officerCost;
        officers++;
        officerCost = Math.floor(officerCost * 1.7);
    } else if (type === "auto" && carsManaged < officerCost) {
        // feedback handled above
    }

    updateUI();
    saveGame();
}

function autoLoop() {
    const gain = officers * prestigeMultiplier;
    if (gain > 0) {
        carsManaged += gain;
        // spawn a subtle floating text near top-left for autos
        floatingText("+" + Math.floor(gain), 100, 80);
    }
    checkAchievements();
    updateUI();
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

        showToast("Mayor Rank " + mayorRank + " gained!");
        updateUI();
        saveGame();
    } else {
        alert("You need 10,000 Cars Managed to become Mayor!");
    }
}

// ================= ACHIEVEMENTS =================

const allAchievements = [
    { id: "100", title: "Small Town Controller", desc: "Manage 100 cars." },
    { id: "1000", title: "City Manager", desc: "Manage 1,000 cars." },
    { id: "10000", title: "Traffic Legend", desc: "Manage 10,000 cars." },
    { id: "firstOfficer", title: "First Officer Hired", desc: "Hire your first traffic officer." }
];

function checkAchievements() {
    // auto-detect hire
    if (officers >= 1 && !achievements.includes("firstOfficer")) {
        achievements.push("firstOfficer");
        showToast("Achievement: First Officer Hired!");
        alert("Achievement Unlocked: First Officer Hired!");
    }

    if (carsManaged >= 100 && !achievements.includes("100")) {
        achievements.push("100");
        showToast("Achievement: Small Town Controller!");
        alert("Achievement Unlocked: Small Town Controller!");
    }

    if (carsManaged >= 1000 && !achievements.includes("1000")) {
        achievements.push("1000");
        showToast("Achievement: City Manager!");
        alert("Achievement Unlocked: City Manager!");
    }

    if (carsManaged >= 10000 && !achievements.includes("10000")) {
        achievements.push("10000");
        showToast("Achievement: Traffic Legend!");
        alert("Achievement Unlocked: Traffic Legend!");
    }
    saveGame();
}

function renderAchievements() {
    const container = document.getElementById("achievementsContainer");
    if (!container) return;
    container.innerHTML = "";
    allAchievements.forEach(a => {
        const div = document.createElement("div");
        div.className = "achievement";
        const unlocked = achievements.includes(a.id);
        div.innerHTML = `<strong>${a.title}</strong>
                         <div style="opacity:.8; font-size:12px">${a.desc}</div>
                         <div style="margin-top:6px; font-weight:700">${unlocked ? "Unlocked" : "Locked"}</div>`;
        if (unlocked) div.style.border = "2px solid #27ae60";
        container.appendChild(div);
    });
}

function showAchievements() {
    const modal = document.getElementById("achievementsModal");
    if (!modal) return;
    renderAchievements();
    modal.classList.remove("hidden");
}

function closeAchievements() {
    const modal = document.getElementById("achievementsModal");
    if (!modal) return;
    modal.classList.add("hidden");
}

// ================= RUSH HOUR =================

function updateRushUI() {
    const bar = document.getElementById("rushBar");
    const text = document.getElementById("rushText");
    if (!bar || !text) return;
    if (rushCooldown <= 0) {
        bar.style.width = "100%";
        text.innerText = "Ready";
        bar.style.background = "linear-gradient(90deg, #2ecc71, #27ae60)";
    } else {
        const pct = Math.max(0, (1 - (rushCooldown / RUSH_COOLDOWN_MAX))) * 100;
        bar.style.width = pct + "%";
        text.innerText = `Cooldown: ${Math.ceil(rushCooldown)}s`;
        bar.style.background = "linear-gradient(90deg, #f39c12, #e74c3c)";
    }
}

function triggerRushHour() {
    if (rushHourActive || rushCooldown > 0) return;
    rushHourActive = true;
    rushCooldown = RUSH_COOLDOWN_MAX;

    // apply temporary multiplier (doubling)
    prestigeMultiplier *= 2;
    showToast("Rush Hour! Income doubled for 15s");
    updateRushUI();

    setTimeout(() => {
        prestigeMultiplier /= 2;
        rushHourActive = false;
        showToast("Rush Hour ended");
        updateRushUI();
    }, RUSH_DURATION * 1000);
}

// allow manual triggering when ready
function manuallyTriggerRush() {
    if (rushCooldown <= 0) {
        triggerRushHour();
        saveGame();
    } else {
        showToast("Rush Hour on cooldown");
    }
}

// periodically apply random rush events (low chance) if ready
setInterval(() => {
    if (Math.random() < 0.05 && rushCooldown <= 0 && !rushHourActive) {
        triggerRushHour();
        saveGame();
    }
}, 10000);

// countdown cooldown every second
setInterval(() => {
    if (rushCooldown > 0) {
        rushCooldown = Math.max(0, rushCooldown - 1);
        updateRushUI();
    }
}, 1000);

// ================= IDEAS RENDER =================

function renderIdeas() {
    const container = document.getElementById("ideasList");
    if (!container) return;
    container.innerHTML = "";
    assistantIdeas.forEach((it, i) => {
        const el = document.createElement("div");
        el.className = "ideaItem";
        el.innerHTML = `<strong>${it.title}</strong><div style="opacity:.85; margin-top:4px">${it.desc}</div>`;
        container.appendChild(el);
    });
}

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
    if (!confirm("Reset all progress? This cannot be undone.")) return;
    localStorage.removeItem("trafficClickerSave");
    location.reload();
}

window.addEventListener("beforeunload", () => {
    saveGame();
});

loadGame();