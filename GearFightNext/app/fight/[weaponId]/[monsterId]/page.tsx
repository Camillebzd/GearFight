'use client'

import { useEffect, useRef, useState } from 'react';
import styles from '../../../page.module.css'

import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fillMonsterWorld } from '@/redux/features/monsterSlice';

import { fillUserWeapons } from '@/redux/features/weaponSlice';
import Entity from '@/components/Entity';
import Chat from '@/components/Chat';
import AbilityCard from '@/components/AbilityCard';
import { Ability } from '@/scripts/abilities';
import { Monster, Weapon } from '@/scripts/entities';
import { Action } from '@/scripts/actions';
import { resolveActions } from '@/scripts/fight';

export enum PHASES {
  PLAYER_CHOOSE_ABILITY,
  PLAYER_CHOOSE_ABILITY_COMBO,
  RESOLUTION,
}

export default function Page({params}: {params: {weaponId: string, monsterId: string}}) {
  const monsterData = useAppSelector((state) => state.monsterReducer.monstersWorld).find(monster => monster.id === parseInt(params.monsterId))?.clone();
  const weaponData = useAppSelector((state) => state.weaponReducer.userWeapons).find(weapon => weapon.id === parseInt(params.weaponId))?.clone();
  const [monster, setMonster] = useState<Monster | null>(null);
  const [weapon, setWeapon] = useState<Weapon | null>(null);
  const isConnected = useAppSelector((state) => state.authReducer.isConnected);
  const dispatch = useAppDispatch();
  const [info, setInfo] = useState<string[]>([]);
  const [phase, setPhase] = useState<PHASES>(PHASES.PLAYER_CHOOSE_ABILITY);
  const [turn, setTurn] = useState(1);
  let isMonsterCombo = false;
  let isPlayerCombo = false;
  let actions: Action[] = [];

  // retrieve data of entities
  useEffect(() => {
    dispatch(fillMonsterWorld(false));
    dispatch(fillUserWeapons(false));
  }, [isConnected]);

  // set entities
  useEffect(() => {
    if (!monsterData)
      return;
    if (!monster) {
      monsterData.setLogger(setInfo);
      setMonster(monsterData);
    }
  }, [monsterData, monster]);

  useEffect(() => {
    if (!weaponData)
      return;
    if (!weapon) {
      weaponData.setLogger(setInfo);
      setWeapon(weaponData);
    }
  }, [weaponData, weapon]);

  // gameLoop (local)
  useEffect(() => {
    if (!monster || !weapon) {
      return;
    }
    if (monster.isEntityAbleToPlay()) {
      let monsterAction = monster.launchRandomAbility(weapon, isMonsterCombo);
      if (monsterAction)
        actions.push(monsterAction);
    }
    if (!weapon.isEntityAbleToPlay())
      console.log("Resolve Actions");
    return () => {actions = [];}
  }, [monster, weapon, turn]);

  // #region Loading returns
  if (monster === undefined && weapon === undefined)
    return (
      <main className={styles.main}>
        <h1 className={styles.pageTitle}>Fight local</h1>
        <p>Loading data...</p>
      </main>
    );
  else if (monster === undefined)
    return (
      <main className={styles.main}>
        <h1 className={styles.pageTitle}>Fight local</h1>
        <p>Monster data is loading, if it take to much time it's because the monster may not exist.</p>
      </main>
    );
  else if (weapon === undefined || !isConnected)
    return (
      <main className={styles.main}>
        <h1 className={styles.pageTitle}>Fight local</h1>
        <p>Weapon data is loading, if it takes to much time it's because the weapon may not exist, you're not connected or you don't own it .</p>
      </main>
    );
  // #endregion  

  const useAbility = (ability: Ability) => {
    if (phase !== PHASES.PLAYER_CHOOSE_ABILITY && !weapon?.isEntityAbleToPlay())
      return;
    actions.push(new Action({caster: weapon!, ability: ability, target: monster!, hasBeenDone: false, isCombo: isPlayerCombo, fluxesUsed: 0, info: setInfo}));
    console.log(actions);
    // resolve
    resolveActions(actions);
    actions = [];
    setTurn((actualTurn) => actualTurn + 1);
  };

  const phasePrinter = () => {
    switch(phase) {
      case PHASES.PLAYER_CHOOSE_ABILITY:
        return "Choose an ability";
      case PHASES.PLAYER_CHOOSE_ABILITY_COMBO:
        return "Choose an ability for the COMBO";
      case PHASES.RESOLUTION:
        return "Wait for the resolve";
      default:
        return "Error";
    }
  }

  return (
    <main className={styles.main}>
      <h1 className={styles.pageTitle}>Fight local</h1>
      <div className={styles.mainFightContainer}>
        <div className={styles.fightersContainer}>
          <div>
            <Entity 
              entity={weapon}
              isModifiersOnRight={true}
            />
          </div>
          <div>
            <Entity 
              entity={monster}
              isModifiersOnRight={false}
            />
          </div>
        </div>
        <div className={styles.bottomFightContainer}>
          <div className={styles.infoChatContainer}>
            <Chat lignes={info}/>
          </div>
          <div className={styles.phasePrinter}>
            <p>{phasePrinter()}</p>
            <p>Actual turn: {turn}</p>
          </div>
          <div className={styles.abilitiesCointainer}>
            {weapon?.abilities.map(ability => <AbilityCard onClick={() => useAbility(ability)} ability={ability}/>)}
          </div>
        </div>
      </div>
    </main>
  );
};