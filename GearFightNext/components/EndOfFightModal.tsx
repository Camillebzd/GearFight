'use client'

import { useAppSelector } from "@/redux/hooks";
import { Button, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Text } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { createContract } from "@/scripts/utils";
import { Notify } from "notiflix";

const EndOfFightModal = ({isOpen, onClose, weaponId, xpQuantity, isWinner}: {isOpen: boolean, onClose: () => void, weaponId: number, xpQuantity: number, isWinner: boolean}) => {
  const address = useAppSelector((state) => state.authReducer.address);
  const router = useRouter();

  const goToWorld = () => {
    router.push('/world');
  };

  const gainXP = async () => {
    if (address.length < 42) {
      Notify.success("Error: you can't gain xp if your address is invalid.");
      return;
    }
    const contract = createContract(address)
    try {
      await contract.gainXP(weaponId, xpQuantity);
      Notify.success(`Your weapon gained ${xpQuantity} xp, wait a minute and you will see it!`);
    } catch {
      Notify.success('An error happened during the the process of gaining experience.');
    }
    goToWorld();
  };

  const resultSentence = () => {
    if (isWinner)
      return `Congratulation for your win, you can gain ${xpQuantity}XP.`;
    else
      return 'You lost...';
  };

  return (
    <Modal closeOnOverlayClick={false} isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>End of fight</ModalHeader>
        {/* <ModalCloseButton /> */}
        <ModalBody>
          <Text>{resultSentence()}</Text>
        </ModalBody>
        <ModalFooter>
          <Button mr={3} onClick={goToWorld}>
            World
          </Button>
          {isWinner && <Button colorScheme='blue' onClick={gainXP}>Gain XP</Button>}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
  }
  
  export default EndOfFightModal;