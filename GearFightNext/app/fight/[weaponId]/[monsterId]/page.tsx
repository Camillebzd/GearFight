'use client'

import { useEffect, useState } from 'react';
import styles from '../../../page.module.css'

import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fillMonsterWorld } from '@/redux/features/monsterSlice';

import { fillUserWeapons } from '@/redux/features/weaponSlice';
import Entity from '@/components/Entity';
import Chat from '@/components/Chat';
import AbilityCard from '@/components/AbilityCard';
import { Ability } from '@/scripts/abilities';

export enum PHASES {
  PLAYER_CHOOSE_ABILITY,
  RESOLUTION,
}

export default function Page({params}: {params: {weaponId: string, monsterId: string}}) {
  const monster = useAppSelector((state) => state.monsterReducer.monstersWorld).find(monster => monster.id === parseInt(params.monsterId));
  const weapon = useAppSelector((state) => state.weaponReducer.userWeapons).find(weapon => weapon.id === parseInt(params.weaponId));
  const isConnected = useAppSelector((state) => state.authReducer.isConnected);
  const dispatch = useAppDispatch();
  const [info, setInfo] = useState<string[]>([]);
  const [phase, setPhase] = useState<PHASES>(PHASES.PLAYER_CHOOSE_ABILITY);


  useEffect(() => {
    dispatch(fillMonsterWorld(false));
    dispatch(fillUserWeapons(false));
  }, [isConnected]);

  // gameLoop
  useEffect(() => {

  }, []);

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
  else if (weapon === undefined)
    return (
      <main className={styles.main}>
        <h1 className={styles.pageTitle}>Fight local</h1>
        <p>Weapon data is loading, if it take to much time it's because the weapon may not exist or you don't own it.</p>
      </main>
    );
  // #endregion  

  const useAbility = (ability: Ability) => {
    if (phase !== PHASES.PLAYER_CHOOSE_ABILITY)
      return;
  };

  const phasePrinter = () => {
    if (phase === PHASES.PLAYER_CHOOSE_ABILITY)
      return "Choose an ability";
    else
      return "Wait for the resolve";
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
          </div>
          <div className={styles.abilitiesCointainer}>
            {weapon.abilities.map(ability => <AbilityCard ability={ability}/>)}
          </div>
        </div>
      </div>
    </main>
  );
};