
/**
 * @typedef ElementWDynamicText
 * @property {HTMLParagraphElement} element
 * @property {String} originalText
 */

/**
 * @typedef WeaponData
 * @property {String} name
 * @property {String} img
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
  selected: null
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
 * @returns {WeaponData[]} An array that contains all available weapons
 */
function getAvailableWeapons(stageI = 0, blacklist = weaponBlacklist) {
  const weapons = [];
  /** @type {String[]} */
  const stages = data.stages;
  stageI = Math.min(Math.max(stageI, 0), stages.length);
  for (let i = 0; i <= stageI; i++) {
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
 * Creates a new HTML string from the specified weapon
 * @param {WeaponData} weapon - The weapon to create the HTML string from
 * @returns {String} The HTML for the specified weapon
 */
function createWeaponHTML(weapon) {
  if (weapon === null || weapon === undefined) {
    return "None";
  }

  return `<img class="selectedWeaponImage" src="${weapon.img === undefined ? "" : weapon.img}"> ${weapon.name}`;
}

/**
 * Called when "getRandomWeapon" button is pressed
 */
function getRandomWeaponPressed() {
  randomWeaponPrompt.parent.classList.remove("hidden");
  
  const selWeapon = pickRandomWeapon(currentStage.current);
  randomWeaponPrompt.current = selWeapon;
  randomWeaponPrompt.element.innerHTML = randomWeaponPrompt.originalText.replace("%SELECTED_WEAPON%", createWeaponHTML(selWeapon));
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
  allWeapons.sort((a, b) => { return a.name > b.name ? 1 : -1; });
  allWeapons.forEach(weapon => {
    const name = weapon.name;
    const div = document.createElement("div");

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

      const newLabelHTML = `<span style="color: ${selectedWeapon.selected !== null && selectedWeapon.selected.name === name ? "blue" : weaponBlacklist[name] ? "red" : "green"}">${createWeaponHTML(weapon)}</span>`;
      if (label.innerHTML !== newLabelHTML) {
        label.innerHTML = newLabelHTML;
      }
    }

    button.onclick(undefined, undefined, true);

    div.appendChild(button);
    div.appendChild(label);

    weaponList.element.appendChild(div);

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
  
  const selWeaponHTML = selectedWeapon.originalText.replace("%CURRENT_WEAPON%", createWeaponHTML(selectedWeapon.selected));
  if (selWeaponHTML !== selectedWeapon.element.innerHTML) {
    selectedWeapon.element.innerHTML = selWeaponHTML;
  }
  
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
  selectedWeapon.selected = randomWeaponPrompt.current;
  if (addToBlacklist) {
    weaponBlacklist[selectedWeapon.selected.name] = true;
  }
}

/**
 * Rejects the currently random picked weapon
 * @param {Boolean} addToBlacklist - Whether or not to add the weapon to the blacklist
 */
function rejectRandomWeapon(addToBlacklist = false) {
  randomWeaponPrompt.parent.classList.add("hidden");
  selectedWeapon = null;
  if (addToBlacklist) {
    weaponBlacklist[randomWeaponPrompt.current.name] = true;
  }
}

/**
 * Saves the current state to localStorage
 */
function saveToLocal() {
  localStorage.clear();
  localStorage.setItem("weaponBlacklist", JSON.stringify(weaponBlacklist));
  localStorage.setItem("selectedWeapon", JSON.stringify(selectedWeapon.selected));
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
      console.log("There was an error while parsing weapon blacklist and it was reset!");
      console.error(error);
    }
  }
  
  const sWeapon = localStorage.getItem("selectedWeapon");
  try {
    selectedWeapon.selected = JSON.parse(sWeapon);
  } catch (error) {
    localStorage.removeItem("selectedWeapon");
    console.log("There was an error while parsing selected weapon and it was reset!");
    console.error(error);
  }

  const cStage = Number(localStorage.getItem("currentStage"));
  if (Number.isNaN(cStage)) {
    currentStage.current = 0;
  } else {
    currentStage.current = cStage;
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
  selectedWeapon.imgElement = document.getElementById("selectedWeaponImage");
  selectedWeapon.originalText = selectedWeapon.element.innerText;

  /** @type {HTMLDivElement} */
  weaponList.element = document.getElementById("weaponList");

  data = await (await fetch("data.json")).json();

  const creditsDiv = document.getElementById("credits");
  creditsDiv.innerText = creditsDiv.innerText.replace("%DATA_PROVIDER%", data.$meta.author);

  nextStage();
  updateElements();
})
