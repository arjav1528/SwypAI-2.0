import React, { useEffect, useState } from 'react';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { Redirect, useRouter } from 'expo-router';
import { Text, View, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import SplashScreen from '@/components/SplashScreen';
import { SignOutButton } from '@/components/SignOutButton';
import { LinearGradient } from 'expo-linear-gradient';

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
        
        <TouchableOpacity 
          style={styles.profileButton} 
          onPress={() => router.push('/profile')}
          activeOpacity={0.8}
        >
          <LinearGradient 
            colors={['#4c8df5', '#3d7ef1', '#2b6be8']} 
            style={styles.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.buttonText}>View Profile</Text>
          </LinearGradient>
        </TouchableOpacity>
        
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
  profileButton: {
    width: '100%',
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
    marginBottom: 20,
  },
  gradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
