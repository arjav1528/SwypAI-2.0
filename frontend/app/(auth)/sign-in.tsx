import { StyleSheet, Text, TextInput, View, TouchableOpacity, Image, ScrollView, Dimensions, Platform } from 'react-native'
import React, { useState, useEffect } from 'react'
import { GradientText } from '@/components/SplashScreen'
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

const Page = () => {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [screenDimensions, setScreenDimensions] = useState({ width, height });

  // Handle screen rotation or dimension changes
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenDimensions({ width: window.width, height: window.height });
    });
    
    return () => subscription?.remove();
  }, []);

  const isSmallDevice = screenDimensions.height < 700;

  return (
    <ScrollView 
      style={styles.scrollContainer}
      contentContainerStyle={[
        styles.scrollContent,
        { paddingTop: insets.top, paddingBottom: insets.bottom + 20 }
      ]}
    >
      <View style={styles.container}>
        <View style={styles.divider} />
        <GradientText style={[styles.gradientText, isSmallDevice && styles.smallText]}>
          Welcome back to Swyp
        </GradientText>
        <Text style={styles.text}>Sign in to continue your personalized experience</Text>
        
        <View style={styles.formContainer}>
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Email</Text>
            <TextInput
             style={styles.input}
             placeholder="Enter your email" 
             placeholderTextColor="grey"
             value={email}
             onChange={(e) => setEmail(e.nativeEvent.text)}
             keyboardType="email-address"
             autoCapitalize="none"
             />
          </View>
          
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
               style={styles.passwordInput}
               placeholder="Enter your password" 
               placeholderTextColor="grey"
               value={password}
               onChange={(e) => setPassword(e.nativeEvent.text)}
               secureTextEntry={!showPassword}
               autoCapitalize="none"
              />
              <TouchableOpacity 
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons 
                  name={showPassword ? 'eye-off' : 'eye'} 
                  size={24} 
                  color="white"
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.signInButton}>
            <LinearGradient 
              colors={['#4c8df5', '#3d7ef1', '#2b6be8']} 
              style={styles.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.buttonText}>Sign In</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <View style={styles.orContainer}>
            <View style={styles.orLine} />
            <Text style={styles.orText}>OR</Text>
            <View style={styles.orLine} />
          </View>
          
          <View style={styles.socialContainer}>
            <TouchableOpacity style={styles.socialButton}>
              <FontAwesome name="google" size={20} color="white" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.replace('/sign-up')}>
              <Text style={styles.signupLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView> 
  )
}

export default Page

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: 'black',
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: 'black',
    paddingHorizontal: width * 0.05, // 5% of screen width
    paddingVertical: height * 0.02, // 2% of screen height
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  divider: {
    marginTop: Platform.OS === 'ios' ? height * 0.04 : height * 0.02,
    marginBottom: height * 0.03,
    height: 3,
    width: '100%',
    backgroundColor: 'white',
  },
  gradientText: {
    fontSize: Math.min(30, width * 0.08), // Responsive font size
    fontWeight: 'bold',
    marginBottom: 10,
  },
  smallText: {
    fontSize: Math.min(26, width * 0.07), // Smaller font for small devices
  },
  text: {
    fontSize: Math.min(15, width * 0.04),
    color: '#e0e0e0',
    marginBottom: height * 0.03,
  },
  formContainer: {
    width: '100%',
    marginTop: height * 0.01,
  },
  inputWrapper: {
    width: '100%',
    marginBottom: height * 0.02,
  },
  label: {
    fontSize: Math.min(15, width * 0.04),
    color: '#a0a0a0',
    marginBottom: 8,
  },
  input: {
    height: Platform.OS === 'ios' ? height * 0.06 : height * 0.07,
    width: '100%',
    borderRadius: 10,
    backgroundColor: '#111827',
    paddingLeft: 15,
    color: 'white',
    fontSize: Math.min(16, width * 0.04),
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: Platform.OS === 'ios' ? height * 0.06 : height * 0.07,
    borderRadius: 10,
    backgroundColor: '#111827',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  passwordInput: {
    flex: 1,
    height: '100%',
    paddingLeft: 15,
    color: 'white',
    fontSize: Math.min(16, width * 0.04),
  },
  eyeIcon: {
    padding: 10,
    position: 'absolute',
    right: 5,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginVertical: 10,
  },
  forgotPasswordText: {
    color: '#4c8df5',
    fontSize: Math.min(14, width * 0.035),
  },
  signInButton: {
    width: '100%',
    height: Platform.OS === 'ios' ? height * 0.06 : height * 0.07,
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  gradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: Math.min(16, width * 0.04),
    fontWeight: 'bold',
  },
  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: height * 0.025,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#444',
  },
  orText: {
    color: '#aaa',
    paddingHorizontal: 10,
    fontSize: Math.min(14, width * 0.035),
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: height * 0.03,
  },
  socialButton: {
    width: width * 0.12,
    height: width * 0.12,
    borderRadius: width * 0.06,
    backgroundColor: '#222',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
    borderWidth: 1,
    borderColor: '#444',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: height * 0.02,
  },
  signupText: {
    color: '#e0e0e0',
    fontSize: Math.min(14, width * 0.035),
  },
  signupLink: {
    color: '#4c8df5',
    fontSize: Math.min(14, width * 0.035),
    fontWeight: 'bold',
  }
})