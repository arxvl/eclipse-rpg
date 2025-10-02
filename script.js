// ---------- DOM references ----------
const classSelectionDiv = document.getElementById("classSelection");
const mainGameDiv = document.getElementById("mainGame");

const infoText = document.getElementById("infoText");
const locationText = document.getElementById("location");
const classText = document.getElementById("classText");
const xpText = document.getElementById("xpText");
const healthText = document.getElementById("healthText");
const maxHealthText = document.getElementById("maxHealth");
const goldText = document.getElementById("goldText");
const potionText = document.getElementById("potionText");
const weaponText = document.getElementById("weaponText");
const armorText = document.getElementById("armorText");
const scoreText = document.getElementById("scoreText");
const killsText = document.getElementById("killsText");

const monsterStats = document.getElementById("monsterStats");
const monsterName = document.getElementById("monsterName");
const monsterHealth = document.getElementById("monsterHealth");
const battleScene = document.getElementById("battleScene");

const playerSprite = document.getElementById("playerSprite");
const monsterSprite = document.getElementById("monsterSprite");

const btn1 = document.getElementById("button1");
const btn2 = document.getElementById("button2");
const btn3 = document.getElementById("button3");
const resetBtn = document.getElementById("resetBtn");
const mainMenuBtn = document.getElementById("mainMenuBtn");

const historyPanel = document.getElementById("history");
const historyLog = document.getElementById("historyLog");
const leaderboardList = document.getElementById("leaderboardList");
const leaderboardResetBtn = document.getElementById("leaderboardResetBtn");
const storeItemsDiv = document.getElementById("storeItems");

// ---------- Game state ----------
let player = {
    className: null,
    maxHealth: 100,
    xp: 0,
    health: 100,
    gold: 50,
    potions: 0,
    weapon: null,
    armor: null,
    kills: 0,
    score: 0
};

let currentMonster = null;
let history = [];

// ---------- Config & data ----------
const potionPrice = 20;
const potionHeal = 30;
const baseAttack = 5;

// Player Stats
const classes = {
    Warrior: { maxHealth: 120, gold: 40, damageBonus: 2, dodgeChance: 0, battleSpriteUrl: "assets/images/warrior-battle.png"},
    Mage:    { maxHealth: 80,  gold: 60, damageBonus: 4, dodgeChance: 0, battleSpriteUrl: "assets/images/wizard-battle.png"},
    Rogue:   { maxHealth: 100, gold: 50, damageBonus: 1, dodgeChance: 0.65, battleSpriteUrl: "assets/images/rouge-battle.png"} 
};

// Monster Stats
const monsters = [
    { id: "m1", name: "Skeleton", health: 30, damage: 10, xp: 10, gold: 30, points: 50, monsterSpriteUrl: "assets/images/skeleton.png"},
    { id: "m2", name: "Goblin", health: 50, damage: 15, xp: 20, gold: 50, points: 80, monsterSpriteUrl: "assets/images/goblin.png"},
    { id: "m3", name: "Orc", health: 120, damage: 25, xp: 40, gold: 100, points: 160, monsterSpriteUrl: "assets/images/orc.png"},
    { id: "m4", name: "Minotaur", health: 280, damage: 40, xp: 80, gold: 200, points: 350, monsterSpriteUrl: "assets/images/minotaur.png"},
    { id: "m5", name: "Dragon", health: 500, damage: 80, xp: 100, gold: 500, points: 1000, monsterSpriteUrl: "assets/images/dragon.png"}
];

// ---------- Utility helpers ----------
function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

function logAction(msg) {
    history.unshift(msg);
    const li = document.createElement("li");
    li.textContent = msg;
    historyLog.prepend(li);

    // cap history length
    if (history.length > 200) {
        history.pop();
        if (historyLog.lastChild) historyLog.removeChild(historyLog.lastChild);
    }
}

function updateUI() {
    classText.textContent = player.className || "—";
    xpText.textContent = player.xp;
    healthText.textContent = player.health;
    maxHealth.textContent = player.maxHealth;
    goldText.textContent = player.gold;
    potionText.textContent = player.potions;
    weaponText.textContent = player.weapon ? `${player.weapon.name} (+${player.weapon.attack})` : "None";
    armorText.textContent = player.armor ? `${player.armor.name} (def ${player.armor.defense})` : "None";
    scoreText.textContent = player.score;
    killsText.textContent = player.kills;
}

// ---------- Starter selection ----------
document.querySelectorAll(".class-btn").forEach(btn=>{
    btn.addEventListener("click", () => {
        const className = btn.dataset.class;
        chooseClass(className);
    });
});

function chooseClass(className) {
    const cls = classes[className];
    if (!cls) return;
    player.className = className;
    player.maxHealth = cls.maxHealth;
    player.health = cls.maxHealth;
    player.gold = cls.gold;
    player.xp = 0;
    player.potions = 0;
    player.weapon = null;
    player.armor = null;
    player.kills = 0;
    player.score = 0;
    history = [];
    historyLog.innerHTML = "";

    classSelectionDiv.classList.add("hidden");
    mainGameDiv.classList.remove("hidden");
    historyPanel.classList.remove("hidden");

    logAction(`You selected ${className}.`);
    updateUI();
    attachMainControls();
    renderLeaderboard();
}

// ---------- Main controls & reset ----------
function attachMainControls() {
    // Default "navigation" controls
    btn1.textContent = "Go to store";
    btn2.textContent = "Go to cave";
    btn3.textContent = "Fight dragon";

    btn1.onclick = goToStore;
    btn2.onclick = goToCave;
    btn3.onclick = fightDragon;

    resetBtn.textContent = "Reset Game";
    resetBtn.onclick = () => {
        const ok = confirm("Are you sure you want to reset the game? This will clear your current run (leaderboard will remain).");
        if (ok) resetGame();
    };

    mainMenuBtn.textContent = "Main Menu"; 
    mainMenuBtn.onclick = goToMainMenu;
}

const classStore = {
    Warrior: {
        weapons: [
            { id: "w1", name: "Iron Sword", price: 60, attack: 15 },
            { id: "w2", name: "Steel Sword", price: 120, attack: 35 },
            { id: "w3", name: "Eclipse Blade", price: 330, attack: 70 },
        ],
        armors: [
            { id: "a1", name: "Leather Armor", price: 50, defense: 15 },
            { id: "a2", name: "Chainmail", price: 110, defense: 30 },
            { id: "a3", name: "Full Eclipse Plate", price: 380, defense: 50},
        ]
    },
    Mage: {
        weapons: [
            { id: "w4", name: "Wooden Staff", price: 50, attack: 25 },
            { id: "w5", name: "Quarterstaff", price: 150, attack: 50 },
            { id: "w6", name: "Scepter of Final Shadow", price: 400, attack: 120 },
        ],
        armors: [
            { id: "a4", name: "Starlight Weave Hood", price: 40, defense: 10 },
            { id: "a5", name: "Dark Magic Cloak", price: 100, defense: 20 },
            { id: "a6", name: "Robe of Celestial Night", price: 350, defense: 40 },
        ]
    },
    Rogue: {
        weapons: [
            { id: "w7", name: "Dagger", price: 40, attack: 12 },
            { id: "w8", name: "Twin Daggers", price: 120, attack: 30 },
            { id: "w9", name: "The Moon Eater Dagger", price: 220, attack: 60 },
        ],
        armors: [
            { id: "a7", name: "Leather Vest", price: 45, defense: 12 },
            { id: "a8", name: "Shadow Cloak", price: 110, defense: 25 },
            { id: "a9", name: "Dark Nightingale Armor", price: 280, defense: 46 },
        ]
    }
};

// ---------- Store ----------
function goToStore() {
    locationText.textContent = "Store";
    infoText.textContent = "Welcome to the store. Buy potions, weapons and armors below.";
    storeItemsDiv.classList.remove("hidden");
    monsterStats.classList.add("hidden");
    battleScene.classList.add("hidden");
    
    // Clear the three main action buttons while in the store
    btn1.textContent = "—";
    btn2.textContent = "—";
    btn3.textContent = "—";
    btn1.onclick = null;
    btn2.onclick = null;
    btn3.onclick = null;

    populateStore();
}

function populateStore() {
    storeItemsDiv.innerHTML = "";

    const playerClass = player.className || "Warrior";
    const items = classStore[playerClass];
    const currentGold = player.gold;

    // --- Healing Section ---
    const healingSection = document.createElement("div");
    healingSection.className = "store-section";
    healingSection.innerHTML = `<h3>Healing <br>Items</h3>`;
    storeItemsDiv.appendChild(healingSection);

    const potionDiv = document.createElement("div");
    potionDiv.className = "store-item";
    potionDiv.innerHTML = `<div><strong>Potion</strong><div class="heal">Heals: ${potionHeal} HP</div><div class="price">Price: ${potionPrice}g</div></div>
    <button class="buy-btn" data-type="potion">Buy Potion</button>
    <button class="use-btn">Use Potion</button>`; 
    healingSection.appendChild(potionDiv);

    // --- Weapons Section ---
    const weaponsSection = document.createElement("div");
    weaponsSection.className = "store-section";
    weaponsSection.innerHTML = `<h3>Weapons<br>(for ${playerClass})</h3>`;
    storeItemsDiv.appendChild(weaponsSection);

    items.weapons.forEach(w => {
        const d = document.createElement("div");
        d.className = "store-item";
        d.innerHTML = `<div><strong>${w.name}</strong><div class="attack">Attack: ${w.attack}</div><div class="price">Price: ${w.price}g</div></div>
            <button class="buy-btn" data-type="weapon" data-id="${w.id}">Buy & Equip</button>`; 
        weaponsSection.appendChild(d); 
    });

    // --- Armors Section ---
    const armorSection = document.createElement("div");
    armorSection.className = "store-section";
    armorSection.innerHTML = `<h3>Armors<br>(for ${playerClass})</h3>`;
    storeItemsDiv.appendChild(armorSection);

    items.armors.forEach(a => {
        const d = document.createElement("div");
        d.className = "store-item";
        d.innerHTML = `<div><strong>${a.name}</strong> <div class="defense">Defense: ${a.defense}</div><div class="price">Price: ${a.price}g</div></div>
            <button class="buy-btn" data-type="armor" data-id="${a.id}">Buy & Equip</button>`; 
        armorSection.appendChild(d); 
    });

    // --- Back Button ---
    const backDiv = document.createElement("div");
    backDiv.className = "store-item";
    backDiv.style.gridColumn = "1 / -1"; 
    backDiv.innerHTML = `<button id="storeLeaveBtn">Leave Store</button>`;
    storeItemsDiv.appendChild(backDiv);

    document.getElementById("storeLeaveBtn").onclick = () => {
        storeItemsDiv.innerHTML = "";
        storeItemsDiv.classList.add("hidden");
        resetToTown();
    };

    attachStoreButtonListeners(); 
}

function attachStoreButtonListeners() {
    storeItemsDiv.querySelectorAll(".buy-btn").forEach(button => {
        button.addEventListener("click", () => {
            const type = button.dataset.type;
            const id = button.dataset.id;
            handleBuy(type, id); 
        });
    });

    storeItemsDiv.querySelectorAll(".use-btn").forEach(button => {
        button.addEventListener("click", () => {
            usePotionFromStore();
        });
    });
}

function handleBuy(type, id) {
    if (type === "potion") {
        buyPotion();
        populateStore(); 
        return;
    }

    const playerClass = player.className || "Warrior";
    const items = classStore[playerClass];
    let item = null;

    if (type === "weapon") {
        item = items.weapons.find(w => w.id === id); 
    } else if (type === "armor") {
        item = items.armors.find(a => a.id === id); 
    }
    
    // Item must exist
    if (!item) return; 

    // Affordability Check 
    if (player.gold < item.price) {
        logAction(`Not enough gold to buy ${item.name}.`);
        infoText.textContent = `Not enough gold for ${item.name}.`;
        
        return; 
    }

    // If affordable, proceed with purchase and UI update
    if (type === "weapon") {
        purchaseWeapon(item); 
    } else if (type === "armor") {
        purchaseArmor(item);
    }

    populateStore(); 
}

function buyPotion() {
    if (player.gold < potionPrice) {
        logAction("Not enough gold to buy potion.");
        infoText.textContent = "You don't have enough gold for a potion.";
        return;
    }
    player.gold -= potionPrice;
    player.potions += 1;

    updateUI();
    logAction(`Bought a potion for ${potionPrice}g.`);
    infoText.textContent = "Potion purchased!";
}

function usePotionFromStore() {
    if (player.potions <= 0) {
        logAction("No potions available.");
        infoText.textContent = "You have no potions.";
        return;
    }
    if (player.health >= player.maxHealth) {
        logAction("Health full — cannot use potion.");
        infoText.textContent = "Health is full. Save the potion.";
        return;
    }
    
    player.potions--;
    player.health = clamp(player.health + potionHeal, 0, player.maxHealth);

    updateUI();
    logAction(`Used potion and healed ${potionHeal} HP.`);
    infoText.textContent = "You used a potion.";
    populateStore(); 
}

function purchaseWeapon(item) {
    player.gold -= item.price;
    player.weapon = { ...item };

    updateUI();
    logAction(`Bought and equipped ${item.name}.`);
    infoText.textContent = `Equipped ${item.name}.`;
}

function purchaseArmor(item) {
    player.gold -= item.price;
    player.armor = { ...item };

    updateUI();
    logAction(`Bought and equipped ${item.name}.`);
    infoText.textContent = `Equipped ${item.name}.`;
}

// ---------- Travel & Battles ----------
function goToCave() {
    storeItemsDiv.classList.add("hidden");
    locationText.textContent = "Cave";
    infoText.textContent = "You venture into the cave...";

    const monster = monsters[Math.floor(Math.random() * 4)];

    startBattle(monster);
}

function fightDragon() {
    startDragonBattle();
}

function startDragonBattle() {
    storeItemsDiv.classList.add("hidden");
    locationText.textContent = "Dragon's Lair";
    infoText.textContent = "You enter the Dragon's Lair...";

    if (monsterSprite) {
        monsterSprite.classList.add("is-dragon");
    }

    startBattle(monsters[4]); 
}

function startBattle(monsterTemplate) {
    if (!monsterTemplate) return;
    currentMonster = JSON.parse(JSON.stringify(monsterTemplate));
    currentMonster.health = clamp(currentMonster.health, 0, currentMonster.health);
    monsterName.textContent = currentMonster.name;
    monsterHealth.textContent = currentMonster.health;
    infoText.textContent = `A wild ${currentMonster.name} appears!`;

    const cls = classes[player.className];
    if (playerSprite && cls && cls.battleSpriteUrl) {
        playerSprite.src = cls.battleSpriteUrl;
    }

    if (monsterSprite && currentMonster.monsterSpriteUrl) {
        monsterSprite.src = currentMonster.monsterSpriteUrl;
    }

    monsterStats.classList.remove("hidden");
    battleScene.classList.remove("hidden");

    btn1.textContent = "Attack";
    btn2.textContent = "Dodge";
    btn3.textContent = "Run";

    btn1.onclick = attackMonster;
    btn2.onclick = dodgeMonster;
    btn3.onclick = runAway;
}

function attackMonster() {
    if (!currentMonster) return;

    const cls = classes[player.className] || { damageBonus: 0 };
    const weaponAtk = player.weapon ? player.weapon.attack : 0;
    const dmg = Math.max(1, Math.floor(Math.random() * 8) + baseAttack + cls.damageBonus + weaponAtk);

    currentMonster.health = clamp(currentMonster.health - dmg, 0, currentMonster.health);
    monsterHealth.textContent = currentMonster.health;
    logAction(`You hit ${currentMonster.name} for ${dmg} damage.`);
    infoText.textContent = `You attack ${currentMonster.name} for ${dmg} damage.`;

    if (currentMonster.health <= 0) {
        handleMonsterDefeat();
    } else {
        setTimeout(() => monsterAttack(false), 300);
    }
}

function dodgeMonster() {
    if (!currentMonster) return;

    const cls = classes[player.className] || { dodgeChance: 0 };
    const dodgeRoll = Math.random();
    const dodgeChance = 0.15 + (cls.dodgeChance || 0);
    const succeeded = dodgeRoll < dodgeChance;

    if (succeeded) {
        logAction("You successfully dodged the attack!");
        infoText.textContent = "You avoided the attack!";
        setTimeout(() => monsterAttack(true), 250);
    } else {
        logAction("Dodge failed!");
        infoText.textContent = "You tried to dodge but failed!";
        setTimeout(() => monsterAttack(false), 250);
    }
}

function runAway() {
    logAction("You ran away from battle.");
    infoText.textContent = "You ran back to the town square.";

    resetToTown();
}

function monsterAttack(weakened = false) {
    if (!currentMonster) return;
    
    const monsterBaseDamage = currentMonster.damage; 

    const rangeWidth = 6; 
    const minDamage = monsterBaseDamage - 3;
    
    let rawDamage = Math.floor(Math.random() * rangeWidth) + Math.max(1, minDamage); 

    if (weakened) {
        rawDamage = Math.floor(rawDamage / 2);
    }
    
    const playerDef = player.armor ? player.armor.defense : 0;
    const finalDamage = Math.max(1, rawDamage - playerDef);
    
    player.health = clamp(player.health - finalDamage, 0, player.maxHealth);
    healthText.textContent = player.health;
    
    logAction(`${currentMonster.name} hits you for ${finalDamage} damage.`);
    infoText.textContent += ` ${currentMonster.name} hits you for ${finalDamage} damage!`;

    if (player.health <= 0) {
        handlePlayerDeath();
    }
}

// ---------- Defeat / Death ----------
function handleMonsterDefeat() {
    if (!currentMonster) return;

    player.xp += currentMonster.xp;
    player.gold += currentMonster.gold;
    player.kills += 1;
    player.score += currentMonster.points;

    updateUI();
    logAction(`You defeated ${currentMonster.name}! +${currentMonster.xp} XP, +${currentMonster.gold}g, +${currentMonster.points} pts.`);
    infoText.textContent = `You defeated ${currentMonster.name}!`;

    if (currentMonster.id === "m5") {
        const finalScore = computeFinalScore();
        logAction(`You have defeated the Dragon! Final Score: ${finalScore}`);
        recordToLeaderboard(finalScore);
        infoText.textContent = `You have defeated the Dragon! Final Score: ${finalScore}`;
    }

    currentMonster = null;

    monsterStats.classList.add("hidden");
    battleScene.classList.add("hidden");
    storeItemsDiv.classList.add("hidden");

    resetToTown();
}

function handlePlayerDeath() {
    player.health = 0;
    updateUI();
    logAction("You were defeated!");
    const finalScore = computeFinalScore();
    infoText.textContent = `You were defeated... Final Score: ${finalScore}`;
    recordToLeaderboard(finalScore);

    // Clear Sprites
    if (playerSprite) {
        playerSprite.style.display = "none"; 
        playerSprite.src = ""; 
    }
    
    if (monsterSprite) {
        monsterSprite.style.display = "none";
        monsterSprite.src = "";
        monsterSprite.classList.remove("is-dragon");
    }

    btn1.textContent = "Play Again";
    btn2.textContent = "—";
    btn3.textContent = "—";
    btn1.onclick = quickRestart;
    btn2.onclick = null;
    btn3.onclick = null;
}

function computeFinalScore() {
    return Math.round(player.score + player.xp * 10 + player.gold * 2 + player.health * 2);
}

// ---------- Leaderboard ----------
function recordToLeaderboard(finalScore) {
    const entry = {
        score: finalScore,
        className: player.className || "Unknown",
        xp: player.xp, 
        gold: player.gold, 
        kills: player.kills,
        date: new Date().toLocaleString()
    };

    const key = "rpg_eclipse_leaderboard_v1";
    let lb = JSON.parse(localStorage.getItem(key) || "[]");
    lb.push(entry);
    lb.sort((a,b)=> b.score - a.score);
    lb = lb.slice(0, 10);
    localStorage.setItem(key, JSON.stringify(lb));

    renderLeaderboard();

    logAction(`Score ${finalScore} recorded to leaderboard.`);
}

function renderLeaderboard() {
    const key = "rpg_eclipse_leaderboard_v1";

    const lb = JSON.parse(localStorage.getItem(key) || "[]");
    leaderboardList.innerHTML = "";

    lb.forEach(e => {
        const li = document.createElement("li");
        li.textContent = `Score:${e.score} ${e.className} XP:${e.xp} Gold:${e.gold} K:${e.kills} (${e.date})`;
        leaderboardList.appendChild(li);
    });
}

function resetLeaderboard() {
    const confirmed = confirm("Are you sure you want to reset the leaderboard? The records will be removed.");
    
    // Exit function if player cancels the action
    if (!confirmed) {
        logAction("Reset leaderboard cancelled.");
        infoText.textContent = "Adventure continues!";
        return;
    }

    const key = "rpg_eclipse_leaderboard_v1";

    // Clears the item from the browser's local storage
    localStorage.removeItem(key); 
    
    renderLeaderboard();
    
    logAction("Leaderboard has been reset.");
    alert("The leaderboard has been permanently reset for this browser.");
}

// ---------- Reset / restart ----------
function goToMainMenu() {
    // Ask for confirmation before exiting
    const confirmed = confirm("Are you sure you want to go to the Main Menu? Your current run will be lost.");
    
    // Exit function if player cancels the action
    if (!confirmed) {
        logAction("Main Menu exit cancelled.");
        infoText.textContent = "Adventure continues!";
        return;
    }

    // Hide all game elements
    mainGameDiv.classList.add("hidden");
    storeItemsDiv.classList.add("hidden");
    monsterStats.classList.add("hidden");
    battleScene.classList.add("hidden");
    historyPanel.classList.add("hidden");
    
    // Show the class selection menu
    classSelectionDiv.classList.remove("hidden");
    
    // Reset player object to clear run state
    player.className = null; 
    logAction("Returned to class selection menu.");
}

function resetToTown() {
    attachMainControls();

    locationText.textContent = "Town Square";
    storeItemsDiv.classList.add("hidden");

    currentMonster = null;

    monsterStats.classList.add("hidden");
    battleScene.classList.add("hidden");

    // --- Monster Sprite Cleanup and Hiding (Not needed in town) ---
    if (monsterSprite) {
        monsterSprite.src = ""; 
        monsterSprite.classList.remove("is-dragon"); 
    }
    
    // --- Player Sprite Setup (Set to Town Appearance) ---
    if (playerSprite) {
        // Ensure the player sprite is visible
        playerSprite.style.display = "block"; 

        const classData = classes[player.className];
        if (classData && classData.townSpriteUrl) {
            playerSprite.src = classData.townSpriteUrl;
        } else {
            console.error(`Error: Could not find townSpriteUrl for class: ${player.className}`);
            playerSprite.src = "";
        }
    }
}

function resetGame() {
    player.xp = 0;
    player.health = player.maxHealth;
    player.gold = classes[player.className] ? classes[player.className].gold : 50;
    player.potions = 0;
    player.weapon = null;
    player.armor = null;
    player.kills = 0;
    player.score = 0;

    history = [];
    historyLog.innerHTML = "";

    updateUI();
    resetToTown();

    infoText.textContent = "Game reset. Good luck!";

    logAction("Game reset by player.");
}

function quickRestart() {
    player.xp = 0;
    player.health = player.maxHealth;
    player.gold = classes[player.className] ? classes[player.className].gold : 50;
    player.potions = 0;
    player.weapon = null;
    player.armor = null;
    player.kills = 0;
    player.score = 0;

    history = [];
    historyLog.innerHTML = "";

    playerSprite.style.display = "block"; 
    monsterSprite.style.display = "block";

    updateUI();
    resetToTown();

    infoText.textContent = "You passed out and awaken in town. Try again!";

    logAction("Quick restart from death.");
}

// ---------- Init ----------
function init() {
    renderLeaderboard();

    if (leaderboardResetBtn) {
        leaderboardResetBtn.onclick = resetLeaderboard;
    }
}
init();