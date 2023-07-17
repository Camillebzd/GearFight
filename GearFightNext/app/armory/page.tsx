'use client'

// import { fillUserWeapons } from '@/redux/features/weaponSlice';
import styles from '../page.module.css';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { useEffect } from 'react';
import { fillStoreAbilities } from '@/redux/features/abilitySlice';
import WeaponList from '@/components/weaponList';
import { fillUserWeapons } from '@/redux/features/weaponSlice';

export default function Page() {
  const dispatch = useAppDispatch();
  const isConnected = useAppSelector((state) => state.authReducer.isConnected);
  // const userWeapons = useAppSelector((state) => state.monsterReducer?.monstersWorld);
  // console.log("WOOOOWW: ", userWeapons);

  useEffect(() => {
    dispatch(fillUserWeapons());
  }, [isConnected]);

  return (
    <main className={styles.main}>
      <h1 className={styles.pageTitle}>Armory</h1>
      {!isConnected ? 
        (<p>You have to connect your wallet to interact here.</p>)
        :      
        <div>
          {/* <WeaponList weapons={userWeapons} /> */}
        </div>
      }
    </main>
  );
};