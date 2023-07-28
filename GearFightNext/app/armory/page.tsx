'use client'

import styles from '../page.module.css';
import { useAppSelector } from '@/redux/hooks';
import WeaponList from '@/components/WeaponList';
import { useUserWeapons } from '@/scripts/customHooks';

export default function Page() {
  const isConnected = useAppSelector((state) => state.authReducer.isConnected);
  const userWeapons = useUserWeapons(false);

  return (
    <main className={styles.main}>
      <h1 className={styles.pageTitle}>Armory</h1>
      {!isConnected ? 
        (<p>You have to connect your wallet to interact here.</p>)
        :      
        <div>
          <WeaponList weapons={userWeapons} />
        </div>
      }
    </main>
  );
};