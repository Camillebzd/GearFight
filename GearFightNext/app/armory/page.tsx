'use client'

import styles from '../page.module.css';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { useEffect } from 'react';
import WeaponList from '@/components/WeaponList';

import { fillUserWeapons } from '@/redux/features/weaponSlice';

export default function Page() {
  const dispatch = useAppDispatch();
  const isConnected = useAppSelector((state) => state.authReducer.isConnected);
  const userWeapons = useAppSelector((state) => state.weaponReducer.userWeapons);
  console.log(userWeapons);

  useEffect(() => {
    dispatch(fillUserWeapons(true));
  }, [isConnected]);

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