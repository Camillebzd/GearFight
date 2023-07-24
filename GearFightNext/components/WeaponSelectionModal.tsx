'use client'

import { fillUserWeapons } from "@/redux/features/weaponSlice";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { Button, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import WeaponCardHorizontal from "./WeaponCardHorizontal";
import { useRouter } from "next/navigation";



const WeaponSelectionModal = ({isOpen, onClose, monsterId}: {isOpen: boolean, onClose: () => void, monsterId: number}) => {
  const dispatch = useAppDispatch();
  const userWeapons = useAppSelector((state) => state.weaponReducer.userWeapons);
  const [weaponSelectedID, setWeaponSelectedID] = useState(-1);
  const router = useRouter();

  useEffect(() => {
    dispatch(fillUserWeapons(false));
  }, []);

  const goFight = () => {
    if (weaponSelectedID < 0)
      return;
    router.push(`/fight/${weaponSelectedID}/${monsterId}`);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Choose a weapon</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {userWeapons.map(weapon => {
            return <WeaponCardHorizontal onClick={() => setWeaponSelectedID(weapon.id)} weapon={weapon} isSelected={weaponSelectedID === weapon.id}/>
          })}
        </ModalBody>
        <ModalFooter>
          <Button colorScheme='red' mr={3} onClick={onClose}>
            Close
          </Button>
          <Button colorScheme='blue' onClick={goFight}>Fight</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
  }
  
  export default WeaponSelectionModal;