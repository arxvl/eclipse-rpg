// Add this function anywhere in your script.js
function toggleStoreSection(sectionId) {
    const content = document.getElementById(sectionId);
    if (content) {
        // Toggle the 'hidden' class to show/hide the content
        content.classList.toggle('hidden-content');
    }
}

function populateStore() {
    storeItemsDiv.innerHTML = "";

    const playerClass = player.className || "Warrior";
    const items = classStore[playerClass];
    const currentGold = player.gold;
    
    // Create the wrapper for all accordion items
    const storeAccordion = document.createElement("div");
    storeAccordion.id = "storeAccordion";
    storeItemsDiv.appendChild(storeAccordion);
    
    // Helper function to create the collapsible section
    const createCollapsibleSection = (title, type, contentHtml, isExpanded = false) => {
        const sectionWrapper = document.createElement("div");
        sectionWrapper.className = "accordion-section";
        
        const header = document.createElement("div");
        header.className = "accordion-header";
        header.innerHTML = `<h3>${title}</h3><span class="indicator">${isExpanded ? '&#9660;' : '&#9658;'}</span>`;
        header.onclick = () => {
            toggleStoreSection(`${type}Content`);
            // Update the arrow indicator after toggling
            header.querySelector('.indicator').innerHTML = document.getElementById(`${type}Content`).classList.contains('hidden-content') ? '&#9658;' : '&#9660;';
        };
        
        const content = document.createElement("div");
        content.id = `${type}Content`;
        content.className = "accordion-content" + (isExpanded ? '' : ' hidden-content');
        content.innerHTML = contentHtml;

        sectionWrapper.appendChild(header);
        sectionWrapper.appendChild(content);
        storeAccordion.appendChild(sectionWrapper);
    };

    // ----------------------------------------------------
    // --- Healing Section ---
    let healingContentHtml = `<div class="store-item">
        <div><strong>Potion</strong> (Heals ${potionHeal} HP)<div class="price">Price: ${potionPrice}g</div></div>
        <button class="buy-btn" data-type="potion">Buy Potion</button>
        <button class="use-btn">Use Potion</button>
    </div>`;
    createCollapsibleSection("Healing Items", "healing", healingContentHtml, true); // Start open

    // --- Weapons Section ---
    let weaponsContentHtml = ``;
    items.weapons.forEach(w => {
        weaponsContentHtml += `<div class="store-item">
            <div><strong>${w.name}</strong> (Attack +${w.attack})<div class="price">Price: ${w.price}g</div></div>
            <button class="buy-btn" data-type="weapon" data-id="${w.id}">Buy & Equip</button>
        </div>`;
    });
    createCollapsibleSection(`Weapons (for ${playerClass})`, "weapons", weaponsContentHtml);
    
    // --- Armors Section ---
    let armorContentHtml = ``;
    items.armors.forEach(a => {
        armorContentHtml += `<div class="store-item">
            <div><strong>${a.name}</strong> (Defense ${a.defense})<div class="price">Price: ${a.price}g</div></div>
            <button class="buy-btn" data-type="armor" data-id="${a.id}">Buy & Equip</button>
        </div>`;
    });
    createCollapsibleSection(`Armors (for ${playerClass})`, "armors", armorContentHtml);
    // ----------------------------------------------------


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

    // CRITICAL FIX: Attach event listeners AFTER all elements are created
    attachStoreButtonListeners(); 
}