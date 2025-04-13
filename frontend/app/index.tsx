import React, { useEffect, useState } from 'react';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { Redirect, useRouter } from 'expo-router';
import { Text, View, StyleSheet, SafeAreaView, ActivityIndicator } from 'react-native';
import SplashScreen from '@/components/SplashScreen';
import { SignOutButton } from '@/components/SignOutButton';


const Page = () => {
  const { isSignedIn, isLoaded } = useAuth();
  const { user, isLoaded: isUserLoaded } = useUser();
  const router = useRouter();

  // If auth status is not loaded, return null
  if (!isLoaded || !isUserLoaded) {
    return null; // Return empty instead of splash screen
  }

  // If not signed in, redirect to sign-in
  if (!isSignedIn) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  // If signed in but profile not complete
  if (!user?.unsafeMetadata || Object.keys(user.unsafeMetadata).length === 0) {
    return <Redirect href="/complete-profile" />;
  }

  // User is signed in and has complete profile
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Welcome {user?.firstName || 'User'}!</Text>
        <Text style={styles.subtitle}>You are signed in.</Text>
        <SignOutButton />
      </View>
    </SafeAreaView>
  );
};

export default Page;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#e0e0e0',
    marginBottom: 30,
  },
});
