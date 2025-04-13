import { ClerkLoaded, ClerkProvider } from '@clerk/clerk-expo'
import { tokenCache } from '@clerk/clerk-expo/token-cache'
import { Slot, Stack } from 'expo-router'
import { useEffect, useState } from 'react'
import { View, StyleSheet } from 'react-native'
import SplashScreen from '@/components/SplashScreen'

export default function RootLayout() {
  const [initialized, setInitialized] = useState(false)
  const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;
  if (!publishableKey) {
    throw new Error('Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in .env');
  }

  useEffect(() => {
    // Simulate initialization delay - this is the ONLY place in the app 
    // where we should show the splash screen during initial load
    const timer = setTimeout(() => {
      setInitialized(true)
    }, 1500)
    
    return () => clearTimeout(timer)
  }, [])

  if (!initialized) {
    return <SplashScreen />
  }

  return (
    <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
      <ClerkLoaded>
        <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="complete-profile" />
        </Stack>
      </ClerkLoaded>
    </ClerkProvider>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  }
})