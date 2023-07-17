'use client'

import styles from '@/app/page.module.css'

import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { useParams } from 'next/navigation'
import { useEffect } from 'react';
import { fillMonsterWorld } from '@/redux/features/monsterSlice';
import { Box, Image } from '@chakra-ui/react'
import DifficultyBadge from '@/components/DifficultyBadge';

export default function Page() {
  const route = useParams();
  const monster = useAppSelector((state) => state.monsterReducer.monstersWorld).find(monster => monster.id === parseInt(route.id));
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fillMonsterWorld(false));
  }, []);

  if (monster === undefined)
    return (
      <main className={styles.main}>
        <p>Loading data... If it takes too much time it means the monster doesn't exist.</p> :
      </main>
    );

  return (
    <main className={styles.main}>
      <h1 className={styles.pageTitle}>{monster.name}</h1>
      <Box height="256px" width="256px">
        <Image
          src={`/img/monsters/${monster.image}`}
          alt={`image of a ${monster.name}`}
          borderRadius='lg'
        />
      </Box>
      <div>
        <DifficultyBadge difficulty={monster.difficulty} />
        <p>{monster.description}</p>
        <p>Health: {monster.health}</p>
        <p>Speed: {monster.speed}</p>
        <p>Sharp damage: {monster.sharpDmg}</p>
        <p>Blunt damage: {monster.bluntDmg}</p>
        <p>Burn damage: {monster.burnDmg}</p>
        <p>Sharp resistance: {monster.sharpRes}</p>
        <p>Blunt resistance: {monster.bluntRes}</p>
        <p>Burn resistance: {monster.burnRes}</p>
        <p>Mind: {monster.mind}</p>
        <p>Guard: {monster.guard}</p>
        <p>Handling: {monster.handling}</p>
      </div>
    </main>
  );
}