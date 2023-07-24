'use client'

import styles from '@/app/page.module.css'

import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { useParams } from 'next/navigation'
import { useEffect } from 'react';
import { Box, Button, ButtonGroup, Image } from '@chakra-ui/react'
import { fillUserWeapons, refreshOwnedTokenMetadata } from '@/redux/features/weaponSlice';
import { createContract, getWeaponStatsForLevelUp } from '@/scripts/utils';
import { Notify } from 'notiflix/build/notiflix-notify-aio';

export default function Page() {
  const route = useParams();
  const weapon = useAppSelector((state) => state.weaponReducer.userWeapons).find(weapon => weapon.id === parseInt(route.id));
  const address = useAppSelector((state) => state.authReducer.address);
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fillUserWeapons(false));
  }, [address]);

  const levelUp = async () => {
    if (address.length < 0 || !weapon)
      return;
    const contract = createContract(address);
    let weaponStats = await getWeaponStatsForLevelUp(weapon.weaponType);
    console.log(weaponStats);
    try {
      await contract.levelUp(weapon.id, weaponStats);
      Notify.success('Your weapon gained a level, wait a minute and click on refresh to see it!');
    } catch {
      Notify.failure('An error happened during the level up process...');
    }
  };

  const stageUp = async () => {

  };

  const manualRefresh = async () => {
    if (weapon)
      dispatch(refreshOwnedTokenMetadata(weapon.id));
  };

  if (weapon === undefined)
    return (
      <main className={styles.main}>
        <p>Loading data...</p>
        <p>If it takes too much time it means:</p>
        <ol type="1" >
          <li>This is not your weapon / you're not connected</li>
          <li>The weapon doesn't exist</li>
          <li>An internal problem happened</li>
        </ol>
      </main>
    );

  return (
    <main className={styles.main}>
      <h1 className={styles.pageTitle}>{weapon.name}</h1>
      <Box height="256px" width="256px">
        <Image
          src={weapon.image}
          alt={`image of ${weapon.name}`}
          borderRadius='lg'
        />
      </Box>
      <div>
        <p>{weapon.description}</p>
        <p>Health: {weapon.stats.health}</p>
        <p>Speed: {weapon.stats.speed}</p>
        <p>Sharp damage: {weapon.stats.sharpDmg}</p>
        <p>Blunt damage: {weapon.stats.bluntDmg}</p>
        <p>Burn damage: {weapon.stats.burnDmg}</p>
        <p>Sharp resistance: {weapon.stats.sharpRes}</p>
        <p>Blunt resistance: {weapon.stats.bluntRes}</p>
        <p>Burn resistance: {weapon.stats.burnRes}</p>
        <p>Mind: {weapon.stats.mind}</p>
        <p>Guard: {weapon.stats.guard}</p>
        <p>Handling: {weapon.stats.handling}</p>
        <p>Pierce: {weapon.stats.pierce}</p>
        <p>XP: {weapon.xp}</p>
        <p>Level: {weapon.level}</p>
        <p>Stage: {weapon.stage}</p>
      </div>
      <ButtonGroup>
        <Button onClick={levelUp}>
          Level up
        </Button>
        <Button onClick={stageUp}>
          Stage up
        </Button>
        <Button onClick={manualRefresh}>
          Refresh Metadata
        </Button>
      </ButtonGroup>
    </main>
  );
}