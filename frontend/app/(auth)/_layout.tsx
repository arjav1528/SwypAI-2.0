import { Redirect, Stack } from 'expo-router'
import { useAuth, useUser } from '@clerk/clerk-expo'
import { useEffect, useState } from 'react'
import SplashScreen from '@/components/SplashScreen'

// Just make sure it's loading only when needed
export default function AuthRoutesLayout() {
  const { isSignedIn, isLoaded } = useAuth()
  const { user, isLoaded: isUserLoaded } = useUser()

  // Simply check if we can make redirections based on auth status
  if (isLoaded && isUserLoaded && isSignedIn) {
    if (user?.unsafeMetadata && Object.keys(user.unsafeMetadata).length > 0) {
      return <Redirect href="/" />
    } else {
      return <Redirect href="/complete-profile" />
    }
  }

  // Otherwise, show auth screens - no splash screen here
  return <Stack screenOptions={{ headerShown: false }} />
}