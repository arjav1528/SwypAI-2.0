import { Redirect, Stack } from 'expo-router'
import { useAuth } from '@clerk/clerk-expo'
import { useEffect, useState } from 'react'
import { View } from 'react-native'

export default function AuthRoutesLayout() {
  const { isSignedIn } = useAuth()
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    // Mark component as ready after first render
    setIsReady(true)
  }, [])

  // Prevent any redirects until the component is ready
  if (!isReady) {
    return <View style={{ flex: 1, backgroundColor: 'white' }} />
  }

  if (isSignedIn) {
    return <Redirect href={'/'} />
  }

  return <Stack screenOptions={{ headerShown: false }} />
}