
function removeAllChildren($el) {
  let $child;
  while($child = $el.lastElementChild) {
    $el.removeChild($child);
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  // Operations to do after populating web page (DOM)

  // Capture DOM object references
  const $stages = document.getElementById('stages');
  const $weapons = document.getElementById('weapons');

  // Fetch data from json
  const data = await (await fetch('data.json')).json();

  function reloadWeaponList(maxStageNumber) {
    removeAllChildren($weapons); // Clear list
    const validWeapons = [];
    for(let stageNumber = 0; stageNumber <= maxStageNumber; ++stageNumber) {
      validWeapons.push(...data.stages[stageNumber].weapons);
    }
    for(let weapon of validWeapons.sort()) {
      // Create weapon list entry
      const $li = document.createElement('li');
      $li.innerText = weapon;
      $weapons.append($li);
    }
  }

  //const weapons = new Set(data.stages.flatMap(stage => stage.weapons));

  for(let stageNumber in data.stages) {
    // Create drop down options
    const $option = document.createElement('option');
    $option.value = stageNumber;
    $option.innerText = data.stages[stageNumber].name;
    $stages.append($option);
  }

  // Events
  $stages.addEventListener('change', () => {
    reloadWeaponList($stages.value);
  });
  $stages.dispatchEvent(new Event('change')); // Update for the first time

});
