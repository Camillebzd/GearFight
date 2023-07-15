'use client'

import { Monster } from "@/scripts/entities";
import { Card, CardBody, CardFooter, Heading, Stack, Button, Image } from '@chakra-ui/react'
import DifficultyBadge from "./DifficultyBadge";

import styles from './Card.module.css'
import { useEffect, useRef, useState } from "react";

const MonsterCard = ({monster}: {monster: Monster}) => {
  const [isOver, setIsOver] = useState(false);
  const imageMonster: any = useRef(null);

  useEffect(() => {
    if (isOver && imageMonster != null)
      imageMonster.current.style.transform = "scale(1.2)";
    else if (!isOver && imageMonster != null)
      imageMonster.current.style.transform = "scale(1)";
  }, [isOver]);

  return (
    <Card className={styles.card} onMouseEnter={() => setIsOver(true)} onMouseLeave={() => setIsOver(false)}>
      <CardBody className={styles.cardBody}>
        <Image
          src={`/img/monsters/${monster.image}`}
          alt={`image of a ${monster.name}`}
          borderRadius='lg'
          className={styles.cardImage}
          ref={imageMonster}
        />
        <Stack mt='6' spacing='3' >
          <Heading size='md'>{monster.name}</Heading>
          <p style={{justifySelf: 'flex-end'}}>
            Difficulty: <DifficultyBadge difficulty={monster.difficulty}/>
          </p>
        </Stack>
      </CardBody>
      <CardFooter >
        {isOver && 
          (<Button position='absolute' top='89%' right='40%' size='sm' colorScheme='blue'>
            Fight
          </Button>)
        }
      </CardFooter>
    </Card>
  );
}

export default MonsterCard;