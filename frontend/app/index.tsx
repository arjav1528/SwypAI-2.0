import React, { useEffect, useState } from 'react';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { Redirect, useRouter } from 'expo-router';
import { Text, View, StyleSheet, SafeAreaView, ActivityIndicator, Image } from 'react-native';
import SplashScreen from '@/components/SplashScreen';


const Page = () => {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    if (isLoaded) {
      const timer = setTimeout(() => {
        if (!isSignedIn) {
          router.replace('/(auth)/sign-in');
        } else {
          setShowSplash(false);
        }
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [isLoaded, isSignedIn, router]);

  if (showSplash || !isLoaded) {
    return <SplashScreen />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Welcome {user?.firstName}!</Text>
        <Text style={styles.subtitle}>You are signed in.</Text>
      </View>
    </SafeAreaView>
    
  );
};

export default Page;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
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
    color: 'black',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    marginBottom: 30,
  },
  // New splash screen styles
  
});
