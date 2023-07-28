import { useEffect, useState } from "react";
import { Monster, MonsterData, Weapon, WeaponData, WeaponType } from "./entities";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { MonsterDataSerilizable, fillMonstersWorldData } from "@/redux/features/monsterSlice";
import { fillStoreAbilities, fillStoreAbilitiesPromised } from "@/redux/features/abilitySlice";
import { Ability } from "./abilities";
import { AttributeOnNFT, WeaponNFT, fillUserWeapons } from "@/redux/features/weaponSlice";

function createMonsters(monstersData: MonsterDataSerilizable[], abilities: Ability[]) {
  let monsters: Monster[] = [];
  monstersData.forEach(monsterData => {
    let monsterAbilities: Ability[] = [];
    monsterData.abilities.forEach(abilityId => {
      let realAbility = abilities.find(ability => ability.id === abilityId);
      if (realAbility)
        monsterAbilities.push(realAbility);
      else
        console.log("Error: a monster data id doesn't have a supported ability.");
    });
    monsters.push(new Monster({
      id: monsterData.id,
      name: monsterData.name,
      image: monsterData.image,
      description: monsterData.description,
      difficulty: monsterData.difficulty,
      level: monsterData.level,
      health: monsterData.health,
      speed: monsterData.speed,
      mind: monsterData.mind,
      sharpDmg: monsterData.sharpDmg,
      bluntDmg: monsterData.bluntDmg,
      burnDmg: monsterData.burnDmg,
      sharpRes: monsterData.sharpRes,
      bluntRes: monsterData.bluntRes,
      burnRes: monsterData.burnRes,
      handling: monsterData.handling,
      pierce: monsterData.pierce,
      guard: monsterData.guard,
      lethality: monsterData.lethality,
      stage: 1,
      abilities: monsterAbilities
    }));
  });
  return monsters;
}

export function useMonstersWorld(forceFill: boolean = false) {
  const [monsters, setMonsters] = useState<Monster[]>([]);
  const monstersData = useAppSelector((state) => state.monsterReducer.monstersWorld);
  const abilities = useAbilities(false); // care to not update from weapon slice or this will trigger here
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fillMonstersWorldData(forceFill));
  }, []);

  useEffect(() => {
    if (monstersData.length < 1 || abilities.length < 1)
      return;
    let dataToSet: Monster[] = createMonsters(monstersData, abilities);
    setMonsters(dataToSet);
  }, [monstersData, abilities]);

  return monsters;
}

function getGearAttributeInfo(attributes: AttributeOnNFT[], trait_type: string): string | string[] | WeaponType {
  for (let i = 0; i < attributes.length; i++) {
    if (attributes[i].trait_type === trait_type)
      return attributes[i].value;
  }
  return "";
}

function createWeapon(weaponsDataNFT: WeaponNFT, abilities: Ability[]) {
  let weaponAbilities: (Ability | undefined)[] = [];
  let weaponAbilitiesNames = getGearAttributeInfo(weaponsDataNFT.attributes, "Spells");
  if (Array.isArray(weaponAbilitiesNames))
    weaponAbilitiesNames.forEach((abilityName) => {
      weaponAbilities.push(abilities.find((abilitie) => abilitie.name === abilityName));
    });
  let data: WeaponData = {
    name: weaponsDataNFT.name,
    id: parseInt(weaponsDataNFT.tokenId),
    description: weaponsDataNFT.description,
    image: weaponsDataNFT.image,
    level: parseInt(getGearAttributeInfo(weaponsDataNFT.attributes, "Level") as string),
    stage: parseInt(getGearAttributeInfo(weaponsDataNFT.attributes, "Stage") as string),
    health: parseInt(getGearAttributeInfo(weaponsDataNFT.attributes, "Health") as string),
    speed: parseInt(getGearAttributeInfo(weaponsDataNFT.attributes, "Speed") as string),
    mind: parseInt(getGearAttributeInfo(weaponsDataNFT.attributes, "Mind") as string),
    sharpDmg: parseInt(getGearAttributeInfo(weaponsDataNFT.attributes, "Sharp Damage") as string),
    bluntDmg: parseInt(getGearAttributeInfo(weaponsDataNFT.attributes, "Blunt Damage") as string),
    burnDmg: parseInt(getGearAttributeInfo(weaponsDataNFT.attributes, "Burn Damage") as string),
    sharpRes: parseInt(getGearAttributeInfo(weaponsDataNFT.attributes, "Sharp Resistance") as string),
    bluntRes: parseInt(getGearAttributeInfo(weaponsDataNFT.attributes, "Blunt Resistance") as string),
    burnRes: parseInt(getGearAttributeInfo(weaponsDataNFT.attributes, "Burn Resistance") as string),
    pierce: parseInt(getGearAttributeInfo(weaponsDataNFT.attributes, "Pierce") as string),
    handling: parseInt(getGearAttributeInfo(weaponsDataNFT.attributes, "Handling") as string),
    guard: parseInt(getGearAttributeInfo(weaponsDataNFT.attributes, "Guard") as string),
    lethality: parseInt(getGearAttributeInfo(weaponsDataNFT.attributes, "Lethality") as string),
    abilities: weaponAbilities as Ability[],
    xp: parseInt(getGearAttributeInfo(weaponsDataNFT.attributes, "Experience") as string),
    weaponType: getGearAttributeInfo(weaponsDataNFT.attributes, "Weapon Type") as WeaponType,
  };
  return new Weapon(data);
}

export function useUserWeapons(forceFill: boolean = false) {
  const [weapons, setWeapons] = useState<Weapon[]>([]);
  const isConnected = useAppSelector((state) => state.authReducer.isConnected);
  const weaponsDataNFT = useAppSelector((state) => state.weaponReducer.userWeapons);
  const abilities = useAbilities(false); // care to not update from monster slice or this will trigger here
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!isConnected || (weaponsDataNFT.length > 0 && !forceFill)) {
      return;
    }
    dispatch(fillUserWeapons(forceFill));
  }, [isConnected, weaponsDataNFT]);

  useEffect(() => {
    if (weaponsDataNFT.length < 1 || abilities.length < 1)
      return;
    let dataToSet: Weapon[] = weaponsDataNFT.map(weaponDataNFT => createWeapon(weaponDataNFT, abilities));
    setWeapons(dataToSet);
  }, [weaponsDataNFT, abilities]);

  return weapons;
}

export function useAbilities(forceFill: boolean = false) {
  const [abilities, setAbilities] = useState<Ability[]>([]);
  const abilitiesData = useAppSelector((state) => state.abilityReducer.abilities);
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fillStoreAbilities(forceFill));
  }, []);

  useEffect(() => {
    if (abilitiesData.length < 1)
      return;
    let dataToSet: Ability[] = abilitiesData.map(abilityData => new Ability(abilityData));
    setAbilities(dataToSet);
  }, [abilitiesData]);

  return abilities;
}