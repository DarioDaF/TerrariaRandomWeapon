
/**
 * @typedef ElementWDynamicText
 * @property {HTMLParagraphElement} element
 * @property {String} originalText
 */

/** @type {ElementWDynamicText} */
const currentStage = {
  element: null,
  originalText: "",
  current: -1
}

/** @type {ElementWDynamicText} */
const availWeapons = {
  element: null,
  originalText: ""
}

/** @type {ElementWDynamicText} */
const randomWeaponPrompt = {
  element: null,
  parent: null,
  originalText: "",
  current: null
}

/** @type {ElementWDynamicText} */
const selectedWeapon = {
  element: null,
  originalText: "",
  name: null
};

const weaponList = {
  element: null,
  buttons: [ ]
}

let weaponBlacklist = {};

let data = {};
/**
 * Gets all available weapons at the specified stage with the specified blacklist
 * @param {Number} [stageI] - The stage's index
 * @param {Object<String, Boolean>} [blacklist] - The weapons' blacklist
 * @returns {String[]} An array that contains all available weapons' name
 */
function getAvailableWeapons(stageI = 0, blacklist = weaponBlacklist) {
  const weapons = [];
  /** @type {String[]} */
  const stages = data.stages;
  stageI = Math.min(Math.max(stageI, 0), stages.length);
  for (let i = 0; i <= stageI; i++) {
    weapons.push(...stages[i].weapons);
  }
  return weapons.filter(v => !blacklist[v]);
}

/**
 * Returns the name of the specified stage
 * @param {Number} [stageI] - The stage's index
 * @returns {String} The name of the specified stage
 */
function getStageName(stageI = 0) {
  return data.stages[Math.min(Math.max(stageI, 0), data.stages.length - 1)].name;
}

/**
 * Picks a random weapon that is available at the specified stage with the specified blacklist
 * @param {Number} [stageI] - The stage's index
 * @param {Object<String, Boolean>} [blacklist] - The weapons' blacklist
 * @returns {String} The name of a randomly picked weapon
 */
function pickRandomWeapon(stageI = 0, blacklist = weaponBlacklist) {
  const availWeapons = getAvailableWeapons(stageI, blacklist);
  return availWeapons[Math.floor(Math.random() * availWeapons.length)];
}

/**
 * Goes to the next stage
 */
function nextStage() {
  populateWeaponList();
  currentStage.current = Math.min(Math.max(++currentStage.current, 0), data.stages.length - 1);
}

/**
 * Goes back to the previous stage
 */
function previousStage() {
  populateWeaponList();
  currentStage.current = Math.min(Math.max(--currentStage.current, 0), data.stages.length - 1);
}

/**
 * Called when "getRandomWeapon" button is pressed
 */
function getRandomWeaponPressed() {
  randomWeaponPrompt.parent.classList.remove("hidden");
  
  const selWeapon = pickRandomWeapon(currentStage.current);
  randomWeaponPrompt.current = selWeapon;
  randomWeaponPrompt.element.innerText = randomWeaponPrompt.originalText.replace("%SELECTED_WEAPON%", selWeapon);
}

/**
 * Populates the list of weapons and creates all needed elements
 */
function populateWeaponList() {
  if (weaponList.element.classList.contains("hidden")) {
    return;
  }

  while (weaponList.element.lastElementChild !== null) {
    weaponList.element.removeChild(weaponList.element.lastElementChild);
  }
  
  weaponList.buttons = [ ];

  const allWeapons = getAvailableWeapons(currentStage.current, { });
  allWeapons.sort();
  allWeapons.forEach(name => {
    const button = document.createElement("button");
    button.id = `blacklistButton_${name}`;
    button.classList.add("defaultButton", "weaponListButton", "left");

    const label = document.createElement("label");
    label.innerText = "";
    label.classList.add("defaultText", "weaponListLabel");
    label.htmlFor = button.id;

    button.onclick = (b, ev, sync = false) => {
      if (!sync) { weaponBlacklist[name] = !weaponBlacklist[name]; }

      const newButtonText = weaponBlacklist[name] ? "W" : "B";
      if (button.innerText !== newButtonText) {
        button.innerText = newButtonText;
      }

      const newLabelHTML = `<span style="color: ${selectedWeapon.name === name ? "blue" : weaponBlacklist[name] ? "red" : "green"}">${name}</span>`;
      if (label.innerHTML !== newLabelHTML) {
        label.innerHTML = newLabelHTML;
      }
    }

    button.onclick(undefined, undefined, true);

    weaponList.element.appendChild(button);
    weaponList.element.appendChild(label);
    weaponList.element.appendChild(document.createElement("br"));

    weaponList.buttons.push(button);
  });
}

/**
 * Updates all elements on the page with the right information
 */
function updateElements() {
  currentStage.element.innerText = currentStage.originalText.replace(
    "%CURRENT_STAGE%", `${getStageName(currentStage.current)} (${currentStage.current + 1}/${data.stages.length})`
  );
  
  selectedWeapon.element.innerText = selectedWeapon.originalText.replace(
    "%CURRENT_WEAPON%", selectedWeapon.name === null || selectedWeapon.name === undefined ? "None" : selectedWeapon.name
  );
  
  availWeapons.element.innerText = availWeapons.originalText.replace(
    "%WEAPON_COUNT%", getAvailableWeapons(currentStage.current, weaponBlacklist).length
  );
  
  if (!weaponList.element.classList.contains("hidden")) {
    weaponList.buttons.forEach(
      b => b.onclick(undefined, undefined, true)
    );
  }

  requestAnimationFrame(updateElements);
}

/**
 * Toggles weapon list's visibility
 */
function toggleWeaponList() {
  weaponList.element.classList.toggle("hidden");

  if (!weaponList.element.classList.contains("hidden")) {
    populateWeaponList();
  }
}

/**
 * Accepts the currently random picked weapon
 * @param {Boolean} addToBlacklist - Whether or not to add the weapon to the blacklist
 */
function acceptRandomWeapon(addToBlacklist = false) {
  randomWeaponPrompt.parent.classList.add("hidden");
  selectedWeapon.name = randomWeaponPrompt.current;
  if (addToBlacklist) {
    weaponBlacklist[selectedWeapon.name] = true;
  }
}

/**
 * Rejects the currently random picked weapon
 * @param {Boolean} addToBlacklist - Whether or not to add the weapon to the blacklist
 */
function rejectRandomWeapon(addToBlacklist = false) {
  randomWeaponPrompt.parent.classList.add("hidden");
  selectedWeapon.name = null;
  if (addToBlacklist) {
    weaponBlacklist[randomWeaponPrompt.current] = true;
  }
}

/**
 * Saves the current state to localStorage
 */
function saveToLocal() {
  localStorage.clear();
  localStorage.setItem("weaponBlacklist", JSON.stringify(weaponBlacklist));
  localStorage.setItem("selectedWeapon", selectedWeapon.name);
  localStorage.setItem("currentStage", currentStage.current);
}

/**
 * Loads a saved state from localStorage
 */
function loadFromLocal() {
  const wBlacklist = localStorage.getItem("weaponBlacklist");
  if (wBlacklist === null) {
    weaponBlacklist = { };
  } else {
    try {
      weaponBlacklist = JSON.parse(wBlacklist);
    } catch (error) {
      localStorage.removeItem("weaponBlacklist");
      console.log("There was an error while parsing weapon blacklist and it was resetted!");
      console.error(error);
    }
  }
  
  const sWeapon = localStorage.getItem("selectedWeapon");
  selectedWeapon.name = sWeapon;

  const cStage = Number(localStorage.getItem("currentStage"));
  if (Number.isNaN(cStage)) {
    currentStage.current = 0;
  } else {
    currentStage.current = localStorage.getItem("currentStage");
  }
}

window.addEventListener("load", async () => {
  currentStage.element = document.getElementById("currentStage");
  currentStage.originalText = currentStage.element.innerText;
  
  availWeapons.element = document.getElementById("availWeapons");
  availWeapons.originalText = availWeapons.element.innerText;

  randomWeaponPrompt.element = document.getElementById("randomlySelectedWeapon");
  randomWeaponPrompt.originalText = randomWeaponPrompt.element.innerText;
  randomWeaponPrompt.parent = document.getElementById("chosenWeaponPrompt");

  selectedWeapon.element = document.getElementById("selectedWeapon");
  selectedWeapon.originalText = selectedWeapon.element.innerText;

  /** @type {HTMLDivElement} */
  weaponList.element = document.getElementById("weaponList");

  data = await (await fetch("data.json")).json();

  const creditsDiv = document.getElementById("credits");
  creditsDiv.innerText = creditsDiv.innerText.replace("%DATA_PROVIDER%", data.$meta.author);

  nextStage();
  updateElements();
})
