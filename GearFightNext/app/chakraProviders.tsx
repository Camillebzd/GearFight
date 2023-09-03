'use client'

import React from "react";
import { CacheProvider } from '@chakra-ui/next-js'
import { ChakraProvider } from '@chakra-ui/react'

export function ChakraProviders({
    children 
  }: { 
  children: React.ReactNode 
  }) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  return (
    <CacheProvider>
      <ChakraProvider>
        {mounted && children}
      </ChakraProvider>
    </CacheProvider>
  )
}