
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
let selectedWeapon = {
  element: null,
  originalText: "",
  name: null
};

const weaponBlacklist = {};

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
 * Updates things that are always shown
 */
function updateMainView() {
  currentStage.element.innerText = currentStage.originalText.replace(
    "%CURRENT_STAGE%", `${getStageName(currentStage.current)} (${currentStage.current + 1}/${data.stages.length})`
  );
  selectedWeapon.element.innerText = selectedWeapon.originalText.replace("%CURRENT_WEAPON%", selectedWeapon.name === null || selectedWeapon.name === undefined ? "None" : selectedWeapon.name);
  availWeapons.element.innerText = availWeapons.originalText.replace("%WEAPON_COUNT%", getAvailableWeapons(currentStage.current, weaponBlacklist).length);
}

/**
 * Goes to the next stage
 */
function nextStage() {
  populateWeaponList();
  currentStage.current = Math.min(Math.max(++currentStage.current, 0), data.stages.length - 1);
  updateMainView();
}

/**
 * Goes back to the previous stage
 */
function previousStage() {
  populateWeaponList();
  currentStage.current = Math.min(Math.max(--currentStage.current, 0), data.stages.length - 1);
  updateMainView();
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
  /** @type {HTMLDivElement} */
  const wList = document.getElementById("weaponList");
  if (wList.classList.contains("hidden")) {
    return;
  }

  while (wList.lastElementChild !== null) {
    wList.removeChild(wList.lastElementChild);
  }

  const allWeapons = getAvailableWeapons(currentStage.current, { });
  allWeapons.sort();
  allWeapons.forEach(name => {
    const button = document.createElement("button");
    button.id = `blacklistButton_${name}`;
    button.classList.add("defaultButton", "blacklistButton", "left");

    const label = document.createElement("label");
    label.innerText = "";
    label.classList.add("defaultText");
    label.htmlFor = button.id;

    button.onclick = (b, ev, sync = false) => {
      if (!sync) { weaponBlacklist[name] = !weaponBlacklist[name]; }
      button.innerText = weaponBlacklist[name] ? "WHITELIST" : "BLACKLIST";
      label.innerHTML = `<span style="color: ${selectedWeapon.name === name ? "blue" : weaponBlacklist[name] ? "red" : "green"}">${name}</span>`;
      updateMainView();
    }

    button.onclick(undefined, undefined, true);

    wList.appendChild(button);
    wList.appendChild(label);
    wList.appendChild(document.createElement("br"));
  });
}

/**
 * Syncs the specified weapon's button with its weapon's status
 * @param {String} name - The name of the weapon to sync
 */
function syncWeaponButton(name) {
  if (name === null) { return; }
  const buttonToSync = document.getElementById(`blacklistButton_${name}`);
  if (buttonToSync === null) { return; }
  buttonToSync.onclick(undefined, undefined, true);
}

/**
 * Toggles weapon list's visibility
 */
function toggleWeaponList() {
  /** @type {HTMLDivElement} */
  const wList = document.getElementById("weaponList");
  wList.classList.toggle("hidden");

  if (!wList.classList.contains("hidden")) {
    populateWeaponList();
  }
}

/**
 * Accepts the currently random picked weapon
 * @param {Boolean} addToBlacklist - Whether or not to add the weapon to the blacklist
 */
function acceptRandomWeapon(addToBlacklist = false) {
  randomWeaponPrompt.parent.classList.add("hidden");
  const oldWeapon = selectedWeapon.name;
  selectedWeapon.name = randomWeaponPrompt.current;
  if (addToBlacklist) {
    weaponBlacklist[selectedWeapon.name] = true;
  }
  
  syncWeaponButton(selectedWeapon.name);
  syncWeaponButton(oldWeapon);

  updateMainView();
}

/**
 * Rejects the currently random picked weapon
 * @param {Boolean} addToBlacklist - Whether or not to add the weapon to the blacklist
 */
function rejectRandomWeapon(addToBlacklist = false) {
  randomWeaponPrompt.parent.classList.add("hidden");
  const oldWeapon = selectedWeapon.name;
  selectedWeapon.name = null;
  if (addToBlacklist) {
    weaponBlacklist[randomWeaponPrompt.current] = true;
  }
  
  syncWeaponButton(randomWeaponPrompt.current);
  syncWeaponButton(oldWeapon);

  updateMainView();
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

  data = await (await fetch("data.json")).json();

  nextStage();
})
