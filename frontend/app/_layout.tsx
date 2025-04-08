import { ClerkProvider } from '@clerk/clerk-expo'
import { tokenCache } from '@clerk/clerk-expo/token-cache'
import { Slot, Stack } from 'expo-router'
import { useEffect, useState } from 'react'
import { View, StyleSheet } from 'react-native'

export default function RootLayout() {
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    // Simulate initialization delay
    setInitialized(true)
  }, [])

  if (!initialized) {
    return <View style={styles.container} />
  }

  return (
    <ClerkProvider tokenCache={tokenCache}>
      <Stack>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="index" options={{ headerShown: false }} />
      </Stack>
    </ClerkProvider>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  }
})