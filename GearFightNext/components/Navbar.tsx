'use client'

import { useEffect, useState } from 'react'
import {
  useColorMode,
  Switch,
  Flex,
  Button,
  IconButton
} from '@chakra-ui/react'
import { HamburgerIcon, CloseIcon } from '@chakra-ui/icons'
import NextLink from 'next/link'
import NavItem from './NavItem'
import styles from '../app/page.module.css'

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Address, useAccount } from 'wagmi'

import { connect, disconnect } from "@/redux/features/authSlice";
import { useAppDispatch } from "@/redux/hooks";

const MENU_LIST = [
  { text: "Home", href: "/" },
  { text: "World", href: "/world" },
  { text: "Armory", href: "/armory" },
  { text: "About Us", href: "/about" },
];

const Navbar = () => {
  const [display, changeDisplay] = useState('none')
  const [activeSection, setActiveSection] = useState(window.location.pathname);

  {/* Handle user connection and update redux */}
  const dispatch = useAppDispatch();
  useAccount({
    onConnect({ address, connector, isReconnected }) {
      console.log('Connected', { address, connector, isReconnected });
      dispatch(connect(address!))
    },
    onDisconnect() {
      console.log('Disconnected');
      dispatch(disconnect());
    }
  });

  return (
    <Flex 
      align="center"
      justifyContent="space-between"
      width="100%"
      paddingLeft="6%"
      paddingRight="6%"
      className={styles.navbarContainer}
    >
      <p className={styles.logo}>GearFight</p>
        {/* Desktop */}
        <Flex
          display={['none', 'none', 'flex','flex']}
          gap={'10px'}
        >
          {MENU_LIST.map(elem => <NavItem key={elem.text} text={elem.text} href={elem.href} isActive={activeSection === elem.href} setActiveSection={setActiveSection}/>)}
        </Flex>

        <ConnectButton showBalance={{ smallScreen: false, largeScreen: false }} />

        {/* Mobile */}
        <IconButton
          aria-label="Open Menu"
          size="lg"
          mr={2}
          mb={2}
          icon={
            <HamburgerIcon />
          }
          onClick={() => changeDisplay('flex')}
          display={['flex', 'flex', 'none', 'none']}
        />

      {/* Mobile Content */}
      <Flex
        w='100vw'
        display={display}
        bgColor="gray.50"
        zIndex={20}
        h="100vh"
        pos="fixed"
        top="0"
        left="0"
        overflowY="auto"
        flexDir="column"
      >
        <Flex justify="flex-end">
          <IconButton
            mt={2}
            mr={2}
            aria-label="Open Menu"
            size="lg"
            icon={
              <CloseIcon />
            }
            onClick={() => changeDisplay('none')}
          />
        </Flex>

        <Flex
          flexDir="column"
          align="center"
        >
          {MENU_LIST.map(elem => <NavItem key={elem.text} text={elem.text} href={elem.href} isActive={activeSection === elem.href} setActiveSection={setActiveSection}/>)}
        </Flex>
      </Flex>
    </Flex>
  );
};

export default Navbar;