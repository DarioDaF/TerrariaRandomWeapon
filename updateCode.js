
/**
 * Code to update state from version to version
 */
/* export */ function statePotentialUpdate(state) {
  if (state.currentStage === undefined) {
    return state; // Empty state
  }

  if (state.trwVersion === undefined) {
    // Pre version state: Terraria 1.4.3
    state.trwVersion = '0.0.1';
    state.terrariaVersion = '1.4.3';
  }

  if (state.terrariaVersion === '1.4.3') {
    const weaponChanges = { 'Fiery Greatsword': 'Volcano' };

    for (const key of Object.keys(state.weaponBlacklist)) {
      if (key in weaponChanges) {
        state.weaponBlacklist[weaponChanges[key]] = state.weaponBlacklist[key];
        delete state.weaponBlacklist[key];
      }
    }
    if (selectedWeapon.name in weaponChanges) {
      selectedWeapon.name = weaponChanges[selectedWeapon.name];
    }
    
    state.terrariaVersion = '1.4.4.7'; // Update completed
  }

  return state;
}
