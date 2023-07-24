'use client'

import styles from '@/app/page.module.css'

import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { useParams } from 'next/navigation'
import { useEffect } from 'react';
import { fillMonsterWorld } from '@/redux/features/monsterSlice';
import { Box, Button, Image, useDisclosure } from '@chakra-ui/react'
import DifficultyBadge from '@/components/DifficultyBadge';
import WeaponSelectionModal from '@/components/WeaponSelectionModal';

export default function Page() {
  const route = useParams();
  const monster = useAppSelector((state) => state.monsterReducer.monstersWorld).find(monster => monster.id === parseInt(route.id));
  const isConnected = useAppSelector((state) => state.authReducer.isConnected);
  const { isOpen, onOpen, onClose } = useDisclosure()
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fillMonsterWorld(false));
  }, []);

  if (monster === undefined)
    return (
      <main className={styles.main}>
        <p>Loading data... If it takes too much time it means the monster doesn't exist.</p>
      </main>
    );

  const fightButton = () => {
    if (isConnected) 
      return (
        <>
          <Button onClick={onOpen}>Fight</Button>
          <WeaponSelectionModal isOpen={isOpen} onClose={onClose} monsterId={monster.id}/>
        </>
      );
    return (
      <p>You can connect your wallet if you want fight this monster.</p>
    );
  }

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
        <p>Health: {monster.stats.health}</p>
        <p>Speed: {monster.stats.speed}</p>
        <p>Sharp damage: {monster.stats.sharpDmg}</p>
        <p>Blunt damage: {monster.stats.bluntDmg}</p>
        <p>Burn damage: {monster.stats.burnDmg}</p>
        <p>Sharp resistance: {monster.stats.sharpRes}</p>
        <p>Blunt resistance: {monster.stats.bluntRes}</p>
        <p>Burn resistance: {monster.stats.burnRes}</p>
        <p>Pierce: {monster.stats.pierce}</p>
        <p>Mind: {monster.stats.mind}</p>
        <p>Guard: {monster.stats.guard}</p>
        <p>Handling: {monster.stats.handling}</p>
        {fightButton()}
      </div>
    </main>
  );
}