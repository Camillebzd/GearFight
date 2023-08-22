import { Button } from '@chakra-ui/react'
import { createContract, getAllAbilitiesIdForWeapon, getWeaponStatsForLevelUp, multiplyStatsForLevelUp } from '@/scripts/utils';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import { Weapon } from '@/scripts/entities';

import xpAmountRequired from '@/data/leveling.json';
import { useXpStorage } from '@/scripts/customHooks';
type acceptedLevel = "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "11" | "12";


const RetrieveXpButton = ({weapon, address}: {weapon: Weapon, address: `0x${string}`}) => {
  const [xp, setXp] = useXpStorage(weapon.id);

  const retrieveXp = async () => {
    if (address.length < 0 || !weapon || weapon.level >= 12 || xp < 1)
      return;
    const contract = await createContract(address);
    const nextLevel = (weapon.level + 1).toString() as acceptedLevel;
    let totalXp = weapon.xp + xp;
    if (xpAmountRequired[nextLevel] > totalXp) {
      try {
        await contract.gainXP(weapon.id, xp);
        // console.log(`gain xp on weapon id: ${weapon.id}, xp amout to add: ${xp}`);
        Notify.success('Your weapon gained xp, wait a minute and click on refresh to see it!');
        setXp(0);
      } catch(e) {
        console.log("error: ", e);
        Notify.failure('An error happened during the gain xp process...');
      }
    } else {
      let levelToSet = 1;
      let xpRequired = 0;
      let rest = totalXp;
      for (levelToSet = weapon.level + 1; levelToSet <= 12; levelToSet++) {
        xpRequired += xpAmountRequired[levelToSet.toString() as acceptedLevel];
        if (xpRequired > totalXp)
          break;
        else
          rest -= xpAmountRequired[levelToSet.toString() as acceptedLevel];
      }
      levelToSet -= 1;
      try {
        let weaponStats = await getWeaponStatsForLevelUp(weapon.identity);
        // console.log("avant coef", weaponStats);
        multiplyStatsForLevelUp(weaponStats, levelToSet - weapon.level);
        // console.log("apres coef", weaponStats);
        // abilities
        let alreadyKnownAbilities = weapon.abilities.map(ability => ability.id);
        let allAbilities = await getAllAbilitiesIdForWeapon(weapon.identity, levelToSet);
        let abilitiesToAdd = allAbilities.filter(abilityId => !alreadyKnownAbilities.includes(abilityId));
        // console.log("abilities to add: ", abilitiesToAdd);
        await contract.levelUp(weapon.id, levelToSet, weaponStats, abilitiesToAdd, rest);
        console.log(`levelup on weapon id: ${weapon.id}, level: ${levelToSet}, xp left: ${rest}`);
        Notify.success(`Your weapon gained ${levelToSet - weapon.level} level(s), wait a minute and click on refresh to see it!`);
        setXp(0);
      } catch(e) {
        console.log("error: ", e);
        Notify.failure('An error happened during the level up process...');
      }
    }
  };

  return (
    <Button onClick={retrieveXp}>
      Retrieve {xp} xp
    </Button>
  );
};

export default RetrieveXpButton;