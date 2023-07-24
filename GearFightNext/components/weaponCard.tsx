'use client'

import { Weapon } from "@/scripts/entities";
import { Card, CardBody, CardFooter, Heading, Stack, Button, Image } from '@chakra-ui/react'

import styles from './Card.module.css'
import { useEffect, useRef, useState } from "react";

import Link from 'next/link'

const WeaponCard = ({weapon}: {weapon: Weapon}) => {
  const [isOver, setIsOver] = useState(false);
  const imageWeapon: any = useRef(null);

  useEffect(() => {
    if (isOver && imageWeapon != null)
      imageWeapon.current.style.transform = "scale(1.2)";
    else if (!isOver && imageWeapon != null)
      imageWeapon.current.style.transform = "scale(1)";
  }, [isOver]);

  return (
    <Link href={`/weapon/${weapon.id}`}>
      <Card className={styles.card} onMouseEnter={() => setIsOver(true)} onMouseLeave={() => setIsOver(false)}>
        <CardBody className={styles.cardBody}>
          <Image
            src={weapon.image}
            alt={`image of weapon named ${weapon.name}`}
            borderRadius='lg'
            className={styles.cardImage}
            ref={imageWeapon}
          />
          <Stack mt='6' spacing='3' >
            <Heading size='md'>{weapon.name}</Heading>
            <p>{weapon.description}</p>
          </Stack>
        </CardBody>
        <CardFooter >
        </CardFooter>
      </Card>
    </Link>
  );
}

export default WeaponCard;