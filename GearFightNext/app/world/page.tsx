'use client'

import { useEffect, useState } from 'react';
import styles from '../page.module.css'

import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fillMonsterWorld } from '@/redux/features/monsterSlice';

import MonsterList from '@/components/MonsterList';

export default function Page() {
  // const [monsters, setMonsters] = useState<Monster[]>([]);
  const monsters = useAppSelector((state) => state.monsterReducer.monstersWorld);
  const dispatch = useAppDispatch();

  useEffect(() => {
    // async function setup() {
    //   let jsonData: MonsterData[] = JSON.parse(JSON.stringify((await import('@/data/monsters/base.json')).default));
    //   let monstersData: Monster[] = jsonData.map((monster: MonsterData) => new Monster(monster));
    //   setMonsters(monstersData);
    // }
    // setup();
    dispatch(fillMonsterWorld(true));
  }, []);

  return (
    <main className={styles.main}>
      <h1 className={styles.pageTitle}>World</h1>
      <h2 className={styles.pageSubtitle}>Monsters</h2>
      {monsters.length === 0 ? 
        <p>Monsters loading...</p> : 
        <MonsterList monsters={monsters}/>
      }
      <h2 className={styles.pageSubtitle}>Dungeons</h2>
    </main>
  );
};