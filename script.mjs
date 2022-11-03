
const TRW_VERSION = '0.0.1';

import { DynamicElement } from './percentTemplate.mjs';
import { statePotentialUpdate } from './updateCode.mjs';

/**
 * @typedef WeaponData
 * @property {String} name
 * @property {String} img
 */

let data = {};

/**
 * Resets the state of the run
 */
function stateReset() {
  const rstState = {
    terrariaVersion: data.terrariaVersion,
    trwVersion: TRW_VERSION,
    currentStage: 0,
    weaponBlacklist: {},
    selectedWeapon: null,
    enableStageClearPreviousWeapons: true,
    sortWeapons: 'availabilityAndName',
    openWeaponList: false
  };
  return rstState;
}

let state = stateReset();

function toggleStageClear() {
  state.enableStageClearPreviousWeapons = !state.enableStageClearPreviousWeapons;
  stateChanged();
}

function stateChanged() {
  saveToLocal();
  updateElements();
}

const currentStage = new DynamicElement();
const availWeapons = new DynamicElement();
const optWeaponList = new DynamicElement();
const optStageClear = new DynamicElement();

const randomWeaponPrompt = Object.assign(
  new DynamicElement(null, {}, true),
  {
    /** @type {WeaponData} */
    current: null
  }
);

const selectedWeapon = new DynamicElement(null, {}, true);

const weaponList = {
  /** @type {HTMLDivElement} */
  element: null
}

function lexOrder(a1, a2) {
  const l = Math.min(a1.length, a2.length);
  for(let i = 0; i < l; ++i) {
    if (a1[i] < a2[i]) {
      return -1;
    } else if (a1[i] > a2[i]) {
      return 1;
    }
  }
  if (a1.length < a2.length) {
    return -1;
  } else if (a1.length > a2.length) {
    return 1;
  } else {
    return 0;
  }
}

const SORTMODES = {
  'name': {
    label: 'Name',
    cmpFn: (w1, w2) => lexOrder([w1.name], [w2.name])
  },
  'availability': {
    label: 'Availability',
    cmpFn: (w1, w2) => lexOrder([!!state.weaponBlacklist[w1.name]], [!!state.weaponBlacklist[w2.name]])
  },
  'availabilityAndName': {
    label: 'Availability and Name',
    cmpFn: (w1, w2) => lexOrder([!!state.weaponBlacklist[w1.name], w1.name], [!!state.weaponBlacklist[w2.name], w2.name])
  }
};

/**
 * Gets all available weapons at the specified stage with the specified blacklist
 * @param {Number} [stageI] - The stage's index
 * @param {Object<String, Boolean>} [blacklist] - The weapons' blacklist
 * @returns {WeaponData[]} An array that contains all available weapons
 */
function getAvailableWeapons(stageI = 0, blacklist = state.weaponBlacklist) {
  let weapons = [];
  /** @type {String[]} */
  const stages = data.stages;
  stageI = Math.min(Math.max(stageI, 0), stages.length);
  for (let i = 0; i <= stageI; i++) {
    if (state.enableStageClearPreviousWeapons && stages[i].clearPreviousWeapons) {
      weapons = [];
    }
    weapons.push(...stages[i].weapons);
  }
  return weapons.filter(w => !blacklist[w.name]);
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
 * @returns {WeaponData} The name of a randomly picked weapon
 */
function pickRandomWeapon(stageI = 0, blacklist = state.weaponBlacklist) {
  const availWeapons = getAvailableWeapons(stageI, blacklist);
  return availWeapons[Math.floor(Math.random() * availWeapons.length)];
}

/**
 * Goes to the next stage
 */
function nextStage() {
  if (state.currentStage < data.stages.length - 1) {
    ++state.currentStage;
    stateChanged();
  }
}

/**
 * Goes back to the previous stage
 */
function previousStage() {
  if (state.currentStage > 0) {
    --state.currentStage;
    stateChanged();
  }
}

/**
 * Creates a new HTML string from the specified weapon
 * @param {WeaponData} weapon - The weapon to create the HTML string from
 * @returns {String} The HTML for the specified weapon
 */
function createWeaponHTML(weapon) {
  if (weapon === null || weapon === undefined) {
    return "None";
  }

  return `<img class="weaponImage" src="${weapon.img === undefined ? "" : weapon.img}"> ${weapon.name}`;
}

/**
 * Called when "getRandomWeapon" button is pressed
 */
function getRandomWeaponPressed() {
  randomWeaponPrompt.parent.classList.remove("hidden");
  
  const selWeapon = pickRandomWeapon(state.currentStage);
  randomWeaponPrompt.current = selWeapon;
  randomWeaponPrompt.update({ SELECTED_WEAPON: createWeaponHTML(selWeapon) });
}

/**
 * Populates the list of weapons and creates all needed elements
 */
function populateWeaponList() {
  weaponList.element.classList.toggle("hidden", !state.openWeaponList);
  if (!state.openWeaponList) {
    return;
  }

  while (weaponList.element.lastElementChild !== null) {
    weaponList.element.removeChild(weaponList.element.lastElementChild);
  }

  const allWeapons = getAvailableWeapons(state.currentStage, { });
  allWeapons.sort(SORTMODES[state.sortWeapons].cmpFn);
  for (const weapon of allWeapons) {
    const name = weapon.name;
    const div = document.createElement("div");

    const button = document.createElement("button");
    button.id = `blacklistButton_${name}`;
    button.classList.add("defaultButton", "weaponListButton", "left");
    button.innerText = state.weaponBlacklist[name] ? "W" : "B";

    const label = document.createElement("label");
    label.innerHTML = `<span style="color: ${state.selectedWeapon !== null && state.selectedWeapon.name === name ? "blue" : state.weaponBlacklist[name] ? "red" : "white"}">${createWeaponHTML(weapon)}</span>`;
    label.classList.add("defaultText", "weaponListLabel");
    label.htmlFor = button.id;

    button.addEventListener("click", (ev) => {
      state.weaponBlacklist[name] = !state.weaponBlacklist[name];
      stateChanged();
    });

    div.appendChild(button);
    div.appendChild(label);

    weaponList.element.appendChild(div);
  };
}

/**
 * Updates all elements on the page with the right information
 */
function updateElements() {
  currentStage.update({ CURRENT_STAGE: `${getStageName(state.currentStage)} (${state.currentStage + 1}/${data.stages.length})` });
  selectedWeapon.update({ CURRENT_WEAPON: createWeaponHTML(state.selectedWeapon) });
  availWeapons.update({ WEAPON_COUNT: getAvailableWeapons(state.currentStage, state.weaponBlacklist).length });
  optWeaponList.update({ ACTION: state.openWeaponList ? "Close" : "Open" });
  optStageClear.update({ ACTION: state.enableStageClearPreviousWeapons ? "Disable" : "Enable" });

  populateWeaponList();
}

/**
 * Toggles weapon list's visibility
 */
function toggleWeaponList() {
  state.openWeaponList = !state.openWeaponList;
  stateChanged();
}

/**
 * Accepts or rejects the currently random picked weapon
 * @param {Boolean} accept - Whether or not to accept the weapon
 * @param {Boolean} addToBlacklist - Whether or not to add the weapon to the blacklist
 */
function confirmRandomWeapon(accept = true, addToBlacklist = true) {
  randomWeaponPrompt.parent.classList.add("hidden");
  state.selectedWeapon = accept ? randomWeaponPrompt.current : null;
  if (addToBlacklist) {
    state.weaponBlacklist[randomWeaponPrompt.current.name] = true;
  }
  stateChanged();
}

function stateSave() {
  return JSON.stringify(state);
}

/**
 * Saves the current state to localStorage
 */
function saveToLocal() {
  localStorage.clear(); // Needed?
  localStorage.setItem("state", stateSave());
}

/**
 * Saves the current state to localStorage
 */
function saveToFile() {
  const blob = new Blob([stateSave()], {
    type: "application/json"
  });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "TerrariaRandomWeapon.save";
  //document.body.appendChild(a);
  a.click();
  //document.body.removeChild(a);
  URL.revokeObjectURL(a.href);
}

function stateLoad(str) {
  const otherState = statePotentialUpdate(JSON.parse(str) || {});
  state = Object.assign(
    stateReset(),
    otherState
  );
  stateChanged(); // Update datastore I guess???
}

/**
 * Loads a saved state from localStorage
 */
function loadFromLocal() {
  stateLoad(localStorage.getItem("state"));
}

function loadFromFile() {
  const i = document.createElement("input");
  i.type = "file";
  i.accept = ".save"; //"application/json";

  i.addEventListener("change", ev => {
    const file = ev.target.files[0];
    
    const reader = new FileReader();

    // here we tell the reader what to do when it's done reading...
    reader.addEventListener("load", readerEvent => {
      stateLoad(readerEvent.target.result);
    });
    
    reader.readAsText(file, "UTF-8");
  });

  //document.body.appendChild(i);
  i.click();
  //document.body.removeChild(i);
}

window.addEventListener("load", async () => {
  currentStage.element = document.getElementById("currentStage");
  availWeapons.element = document.getElementById("availWeapons");
  randomWeaponPrompt.element = document.getElementById("randomlySelectedWeapon");
  selectedWeapon.element = document.getElementById("selectedWeapon");
  weaponList.element = document.getElementById("weaponList");
  optWeaponList.element = document.getElementById("optWeaponList");
  optStageClear.element = document.getElementById("optStageClear");

  data = await (await fetch("data.json")).json();

  new DynamicElement(
    document.getElementById("credits"),
    { DATA_PROVIDER: data.$meta.author }
  );

  /*
  document.body.onbeforeunload = (ev) => {
    // Show unsaved state
    if (isDirty) {
      ev.preventDefault();
      ev.returnValue = '';
      return '';
    }
  };
  */

  loadFromLocal();
});
