'use client'

import { MutableRefObject, useEffect, useRef, useState } from 'react';
import styles from '@/app/page.module.css';

import { useAppSelector } from "@/redux/hooks";
import Entity from '@/components/Entity';
import Chat from '@/components/Chat';
import AbilityCard from '@/components/AbilityCard';
import { Ability } from '@/scripts/abilities';
import { Monster, Weapon } from '@/scripts/entities';
import { Action, END_OF_TURN } from '@/scripts/actions';
import { resolveActions } from '@/scripts/fight';
import { useDisclosure } from '@chakra-ui/react';
import EndOfFightModal from '@/components/EndOfFightModal';
import { useMonstersWorld, useUserWeapons, useWeaponDeck } from '@/scripts/customHooks';
import SelectFluxesModal from '@/components/SelectFluxesModal';
import { HAND_SIZE } from '@/scripts/systemValues';
import { useSearchParams } from 'next/navigation'

export enum PHASES {
  PLAYER_CHOOSE_ABILITY,
  PLAYER_CHOOSE_ABILITY_COMBO,
  RESOLUTION,
}

export default function Page() {
  const searchParams = useSearchParams()
  const monsterData = useMonstersWorld(false).find(monster => monster.id === parseInt(searchParams.get('monsterid') as string))?.clone();
  const weaponData = useUserWeapons(false).find(weapon => weapon.id === parseInt(searchParams.get('weaponid') as string))?.clone();
  const weaponDeck = useWeaponDeck(parseInt(searchParams.get('weaponid') as string));
  const [monster, setMonster] = useState<Monster | null>(null);
  const [weapon, setWeapon] = useState<Weapon | null>(null);
  const isConnected = useAppSelector((state) => state.authReducer.isConnected);
  
  const endOfFightModal = useDisclosure();
  const fluxeModal = useDisclosure();
  let abilitySelected = useRef<Ability | null>(null);
  let won = useRef(false);

  const [info, setInfo] = useState<string[]>([]);
  const [phase, setPhase] = useState<PHASES>(PHASES.PLAYER_CHOOSE_ABILITY);
  const [turn, setTurn] = useState(1);
  let isMonsterCombo = useRef(false);
  let isPlayerCombo = useRef(false);
  let actions: MutableRefObject<Action[]> = useRef([]);

  // set entities
  useEffect(() => {
    if (!monsterData)
      return;
    if (!monster) {
      monsterData.setLogger(setInfo);
      setMonster(monsterData);
    }
  }, [monsterData, monster]);

  useEffect(() => {
    if (!weaponData || !weaponDeck || weaponDeck.length < 1)
      return;
    if (!weapon) {
      weaponData.setLogger(setInfo);
      // ------ TEST TO REMOVE ------
      // const deck: Ability[] = [];
      // for (let i = 0; i < weaponData.abilities.length; i++) {
      //   const objectToCopy = weaponData.abilities[i];
      //   for (let j = 0; j < 3; j++) {
      //     deck.push(objectToCopy.clone());
      //   }
      // }
      // weaponData.fillDeck(deck);
      weaponData.fillDeck(weaponDeck);
      // ----------------------------
      setWeapon(weaponData);
    }
  }, [weaponData, weapon, weaponDeck]);

  // gameLoop (local)
  useEffect(() => {
    if (!monster || !weapon) {
      return;
    }
    setInfo((currentInfo) => [...currentInfo, `--------- TURN ${turn} ---------`]);
    // draw card if needed
    if (weapon?.deck != null && weapon.deck.length === 0)
      weapon.refillDeckFromDiscard();
    while (weapon.hand.length < HAND_SIZE) {
      weapon.drawOneRandomFromDeck();
      setInfo((currentInfo) => [...currentInfo, `player draw 1 ability.`]);
    }
    if (monster.isEntityAbleToPlay()) {
      let monsterAction = monster.launchRandomAbility(weapon, isMonsterCombo.current);
      if (monsterAction)
        actions.current.push(monsterAction);
    }
    if (!weapon.isEntityAbleToPlay())
      resolveLoop();
    return () => {actions.current = []; }
  }, [monster, weapon, turn]);

  // #region Loading returns
  if (monster === undefined && weapon === undefined)
    return (
      <main className={styles.main}>
        <h1 className={styles.pageTitle}>Fight local</h1>
        <p>Loading data...</p>
      </main>
    );
  else if (monster === undefined)
    return (
      <main className={styles.main}>
        <h1 className={styles.pageTitle}>Fight local</h1>
        <p>Monster data is loading, if it take to much time it's because the monster may not exist.</p>
      </main>
    );
  else if (weapon === undefined || !isConnected)
    return (
      <main className={styles.main}>
        <h1 className={styles.pageTitle}>Fight local</h1>
        <p>Weapon data is loading, if it takes to much time it's because the weapon may not exist, you're not connected or you don't own it .</p>
      </main>
    );
  // #endregion  

  const resolveLoop = () => {
    while (actions.current.length > 0) {
      setPhase(PHASES.RESOLUTION);
      let ret = resolveActions(actions.current);
      switch (ret) {
        case END_OF_TURN.PLAYER_COMBO:
          isPlayerCombo.current = true;
          actions.current = actions.current.filter((action) => {return action.hasBeenDone === false});
          setPhase(PHASES.PLAYER_CHOOSE_ABILITY_COMBO);
          return;
        case END_OF_TURN.MONSTER_COMBO:
          let monsterAction = monster!.launchRandomAbility(weapon!, isMonsterCombo.current);
          if (monsterAction)
            actions.current.push(monsterAction);
          break;
        case END_OF_TURN.PLAYER_DIED:
          console.log("PLAYER died");
          won.current = false;
          endOfFightModal.onOpen();
          return;
        case END_OF_TURN.MONSTER_DIED:
          console.log("MONSTER died");
          won.current = true;
          endOfFightModal.onOpen();
          return;
        case END_OF_TURN.NORMAL:
        default:
          setPhase(PHASES.PLAYER_CHOOSE_ABILITY);
          isMonsterCombo.current = false;
          isPlayerCombo.current = false;
          break;
      }
      actions.current = actions.current.filter((action) => {return action.hasBeenDone === false});
    }
    // TODO manage this in an "end of turn"
    // TODO the faster apply first ?
    if (!weapon!.applyDecayingModifier()) {
      // die of dots
      console.log("PLAYER died");
      won.current = false;
      endOfFightModal.onOpen();
    }
    if (!monster!.applyDecayingModifier()) {
      // die of dots
      console.log("MONSTER died");
      won.current = true;
      endOfFightModal.onOpen();
    }
    weapon!.resetRulesOnAction();
    monster!.resetRulesOnAction();
    setTurn((actualTurn) => actualTurn + 1);
  };

  const useAbility = (ability: Ability, fluxesUsed: number = 0) => {
    if (phase !== PHASES.PLAYER_CHOOSE_ABILITY && !weapon?.isEntityAbleToPlay())
      return;
    actions.current.push(new Action({caster: weapon!, ability: ability, target: monster!, hasBeenDone: false, isCombo: isPlayerCombo.current, fluxesUsed: fluxesUsed, info: setInfo}));
    weapon?.discardFromHand(ability);
    console.log(actions);
    // resolve
    resolveLoop();
  };

  const useAbilityModal = (fluxeSelected: number) => {
    if (abilitySelected.current) {
      weapon?.useFluxes(fluxeSelected);
      useAbility(abilitySelected.current, fluxeSelected);
      abilitySelected.current = null;
    }
    fluxeModal.onClose();
  };

  const onAbilityClick = (abilityClicked: Ability) => {
    if (abilityClicked.isMagical) {
      if (weapon!.fluxes < 1)
        return;
      abilitySelected.current = abilityClicked;
      fluxeModal.onOpen();
    }
    else 
      useAbility(abilityClicked, 0);
  };

  const phasePrinter = () => {
    switch(phase) {
      case PHASES.PLAYER_CHOOSE_ABILITY:
        return "Choose an ability";
      case PHASES.PLAYER_CHOOSE_ABILITY_COMBO:
        return "Choose an ability for the COMBO";
      case PHASES.RESOLUTION:
        return "Wait for the resolve";
      default:
        return "Error";
    }
  }

  return (
    <main className={styles.main}>
      <h1 className={styles.pageTitle}>Fight local</h1>
      <div className={styles.mainFightContainer}>
        <div className={styles.fightersContainer}>
          <div>
            <Entity 
              entity={weapon}
              isModifiersOnRight={true}
            />
          </div>
          <div>
            <Entity 
              entity={monster}
              isModifiersOnRight={false}
            />
          </div>
        </div>
        <div className={styles.bottomFightContainer}>
          <div className={styles.infoChatContainer}>
            <Chat lignes={info}/>
          </div>
          <div className={styles.phasePrinter}>
            <p>{phasePrinter()}</p>
            <p>Actual turn: {turn}</p>
            <p>deck: {weapon?.deck.length}</p>
            <p>discard: {weapon?.discard.length}</p>
          </div>
          <div className={styles.abilitiesCointainer}>
            {/* {weapon?.abilities.map(ability => <AbilityCard key={ability.id} onClick={() => onAbilityClick(ability)} ability={ability}/>)} */}
            {weapon?.hand.map(ability => <AbilityCard key={ability.idInDeck} onClick={() => onAbilityClick(ability)} ability={ability}/>)}
          </div>
        </div>
      </div>
      {monster && weapon && <EndOfFightModal isOpen={endOfFightModal.isOpen} onClose={endOfFightModal.onClose} weaponId={weapon!.id} difficulty={monster!.difficulty} isWinner={won.current}/>}
      {monster && weapon && <SelectFluxesModal isOpen={fluxeModal.isOpen} onClose={fluxeModal.onClose} useAbility={useAbilityModal} fluxesAvailables={weapon.fluxes}/>}
    </main>
  );
};