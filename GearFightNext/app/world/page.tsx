'use client'

import { useEffect, useState } from 'react';
import styles from '../page.module.css'

import { Monster, MonsterData } from '@/scripts/entities';

import MonsterList from '@/components/MonsterList';

export default function Page() {
  const [monsters, setMonsters] = useState<Monster[]>([]);

  useEffect(() => {
    async function setup() {
      let jsonData = JSON.parse(JSON.stringify((await import('@/data/monsters/base.json')).default));
      let monstersData: Monster[] = jsonData.map((monster: MonsterData) => new Monster(monster));
      setMonsters(monstersData);
    }
    setup();
  }, []);

  return (
    <main className={styles.main}>
      <h1 className={styles.pageTitle}>World</h1>
      <h2 className={styles.pageSubtitle}>Monsters</h2>
      <MonsterList monsters={monsters}/>
      <h2 className={styles.pageSubtitle}>Dungeons</h2>
    </main>
  );
};