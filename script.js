
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
const pickedWeaponPrompt = {
  element: null,
  parent: null,
  originalText: "",
  current: null,
  currentlySelElement: null
}

const weaponBlacklist = {};

let data = {};
/**
 * @param {Number} [stageI]
 * @param {Object<String, Boolean>} [blacklist]
 * @returns {String[]}
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
 * @param {Number} [stageI]
 * @returns {String}
 */
function getStageName(stageI = 0) {
  return data.stages[Math.min(Math.max(stageI, 0), data.stages.length - 1)].name;
}

/**
 * @param {Number} [stageI]
 * @param {Object<String, Boolean>} [blacklist]
 * @returns {String}
 */
function pickRandomWeapon(stageI = 0, blacklist = weaponBlacklist) {
  const availWeapons = getAvailableWeapons(stageI, blacklist);
  return availWeapons[Math.floor(Math.random() * availWeapons.length)];
}

function updateMainView() {
  currentStage.element.innerText = currentStage.originalText.replace(
    "%CURRENT_STAGE%", `${getStageName(currentStage.current)} (${currentStage.current + 1}/${data.stages.length})`
  );
  pickedWeaponPrompt.currentlySelElement.innerText = pickedWeaponPrompt.cSEOriginalText.replace("%CURRENT_WEAPON%", pickedWeaponPrompt.current === null ? "None" : pickedWeaponPrompt.current);
  availWeapons.element.innerText = availWeapons.originalText.replace("%WEAPON_COUNT%", getAvailableWeapons(currentStage.current, weaponBlacklist).length);
}

function nextStage() {
  populateWeaponList();
  currentStage.current = Math.min(Math.max(++currentStage.current, 0), data.stages.length - 1);
  updateMainView();
}

function previousStage() {
  populateWeaponList();
  currentStage.current = Math.min(Math.max(--currentStage.current, 0), data.stages.length - 1);
  updateMainView();
}

function getRandomWeaponPressed() {
  pickedWeaponPrompt.parent.classList.remove("hidden");
  
  const selWeapon = pickRandomWeapon(currentStage.current);
  pickedWeaponPrompt.current = selWeapon;
  pickedWeaponPrompt.element.innerText = pickedWeaponPrompt.originalText.replace("%SELECTED_WEAPON%", selWeapon);
}

function populateWeaponList() {
  /** @type {HTMLDivElement} */
  const wList = document.getElementById("weaponList");
  if (wList.classList.contains("hidden")) {
    return;
  }

  while (wList.lastElementChild !== null) {
    wList.removeChild(wList.lastElementChild);
  }

  getAvailableWeapons(currentStage.current, { }).forEach(name => {
    const button = document.createElement("button");
    button.id = `blacklistButton_${name}`;
    button.classList.add("defaultButton");

    const label = document.createElement("label");
    label.innerText = name;
    label.classList.add("defaultText");
    label.htmlFor = button.id;

    button.onclick = (b, ev, sync = false) => {
      if (!sync) { weaponBlacklist[name] = !weaponBlacklist[name]; }
      button.innerText = weaponBlacklist[name] ? "WHITELIST" : "BLACKLIST";
      updateMainView();
    }

    button.onclick(undefined, undefined, true);

    wList.appendChild(label);
    wList.appendChild(button);
    wList.appendChild(document.createElement("br"));
  });
}

function toggleWeaponList() {
  /** @type {HTMLDivElement} */
  const wList = document.getElementById("weaponList");
  wList.classList.toggle("hidden");

  if (!wList.classList.contains("hidden")) {
    populateWeaponList();
  }
}

function acceptRandomWeapon(addToBlacklist = false) {
  pickedWeaponPrompt.parent.classList.add("hidden");
  if (addToBlacklist) {
    weaponBlacklist[pickedWeaponPrompt.current] = true;

    const buttonToSync = document.getElementById(`blacklistButton_${pickedWeaponPrompt.current}`);
    buttonToSync.onclick(undefined, undefined, true);
  }
  updateMainView();
}

function rejectRandomWeapon(addToBlacklist = false) {
  pickedWeaponPrompt.parent.classList.add("hidden");
  if (addToBlacklist) {
    weaponBlacklist[pickedWeaponPrompt.current] = true;

    const buttonToSync = document.getElementById(`blacklistButton_${pickedWeaponPrompt.current}`);
    buttonToSync.onclick(undefined, undefined, true);
  }
  pickedWeaponPrompt.current = null;
  updateMainView();
}

window.addEventListener("load", async () => {
  currentStage.element = document.getElementById("currentStage");
  currentStage.originalText = currentStage.element.innerText;
  
  availWeapons.element = document.getElementById("availWeapons");
  availWeapons.originalText = availWeapons.element.innerText;

  pickedWeaponPrompt.element = document.getElementById("selectedWeapon");
  pickedWeaponPrompt.originalText = pickedWeaponPrompt.element.innerText;
  pickedWeaponPrompt.parent = document.getElementById("chosenWeaponPrompt");

  pickedWeaponPrompt.currentlySelElement = document.getElementById("currentlyAcceptedWeapon");
  pickedWeaponPrompt.cSEOriginalText = pickedWeaponPrompt.currentlySelElement.innerText;

  data = await (await fetch("data.json")).json();

  nextStage();
})
