'use client'

import styles from '../page.module.css'

import MonsterList from '@/components/MonsterList';
import { useMonstersWorld } from '@/scripts/customHooks';

export default function Page() {
  const monsters = useMonstersWorld(true);

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