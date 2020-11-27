
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

const PICKED_WEAPONS = {};

let data = {};
/**
 * @param {Number} [stageI]
 * @param {Object<String, Boolean>} [blacklist]
 * @returns {String[]}
 */
function getAvailableWeapons(stageI = 0, blacklist = PICKED_WEAPONS) {
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
function pickRandomWeapon(stageI = 0, blacklist = PICKED_WEAPONS) {
  const availWeapons = getAvailableWeapons(stageI, blacklist);
  return availWeapons[Math.floor(Math.random() * availWeapons.length)];
}

function updateParagraphs() {
  currentStage.element.innerText = currentStage.originalText.replace("%CURRENT_STAGE%", getStageName(currentStage.current));
  availWeapons.element.innerText = availWeapons.originalText.replace("%WEAPON_COUNT%", getAvailableWeapons(currentStage.current, PICKED_WEAPONS).length);
}

function nextStage() {
  currentStage.current = Math.min(Math.max(++currentStage.current, 0), data.stages.length - 1);
  updateParagraphs();
}

function previousStage() {
  currentStage.current = Math.min(Math.max(--currentStage.current, 0), data.stages.length - 1);
  updateParagraphs();
}

window.addEventListener("load", async () => {
  currentStage.element = document.getElementById("currentStage");
  currentStage.originalText = currentStage.element.innerText;
  
  availWeapons.element = document.getElementById("availWeapons");
  availWeapons.originalText = availWeapons.element.innerText;

  data = await (await fetch("data.json")).json();

  nextStage();
})
