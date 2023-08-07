'use client'

import { useAppSelector } from "@/redux/hooks";
import { Button, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Text } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { createContract } from "@/scripts/utils";
import { Notify } from "notiflix";

// ALEMBIC TEST

// import { AlembicWallet, Web3AuthAdapter, AlembicProvider, BurnerWalletAdaptor } from "@alembic/account-abstraction-sdk";
// import contractABI from "@/abi/GearFactory.json";

// const ALEMBIC_API_KEY = (process.env.NEXT_PUBLIC_ALEMBIC_API_KEY) as string;
// const APP_WEB3AUTH_CLIENT_ID = (process.env.NEXT_PUBLIC_APP_WEB3AUTH_CLIENT_ID) as string;
// const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as string;

// const web3AuthAdapter = new Web3AuthAdapter({
//   clientId: APP_WEB3AUTH_CLIENT_ID,
//   web3AuthNetwork: 'testnet',
//   chainConfig: {
//     chainNamespace: 'eip155',
//     chainId: '0x13881' // hex of 80001, mumbai testnet
//   }
// })

// const wallet = new AlembicWallet({
//   authAdapter: web3AuthAdapter,
//   apiKey: ALEMBIC_API_KEY,
// });

// const provider = new AlembicProvider(wallet);

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
    const contract = await createContract(address)
    // await wallet.connect();
    // console.log("address: " + wallet.getAddress());

    // const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI.abi, provider.getSigner());
    try {
      await contract.gainXP(weaponId, xpQuantity);
      Notify.success(`Your weapon gained ${xpQuantity} xp, wait a minute and you will see it!`);
    } catch (e){
      console.log(e);
      Notify.failure('An error happened during the the process of gaining experience.');
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