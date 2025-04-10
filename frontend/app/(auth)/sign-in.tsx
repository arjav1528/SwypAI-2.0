import { StyleSheet, Text, TextInput, View, TouchableOpacity, ScrollView, Dimensions, Platform, Linking, ActivityIndicator, Animated } from 'react-native'
import React, { useState, useEffect, useCallback, useRef } from 'react'
import { GradientText } from '@/components/SplashScreen'
import * as WebBrowser from 'expo-web-browser'
import * as AuthSession from 'expo-auth-session'
import { Ionicons, FontAwesome } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useSignIn, useSSO } from '@clerk/clerk-expo'

const { width, height } = Dimensions.get('window')


export const useWarmUpBrowser = () => {
  useEffect(() => {
    void WebBrowser.warmUpAsync()
    return () => {
      void WebBrowser.coolDownAsync()
    }
  }, [])
}

WebBrowser.maybeCompleteAuthSession()

export default function SignInScreen() {
  useWarmUpBrowser()

  const { startSSOFlow } = useSSO()

  const insets = useSafeAreaInsets()
  const { isLoaded, signIn, setActive } = useSignIn()
  const router = useRouter()
  
  const [emailAddress, setEmailAddress] = useState('')
  const [password, setPassword] = useState('')
  
  const [showPassword, setShowPassword] = useState(false)
  const [screenDimensions, setScreenDimensions] = useState({ width, height })
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [generalError, setGeneralError] = useState('')

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const spinnerFadeAnim = useRef(new Animated.Value(0)).current;

  const clearErrors = () => {
    setEmailError('')
    setPasswordError('')
    setGeneralError('')
  }

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenDimensions({ width: window.width, height: window.height })
    })
    
    return () => subscription?.remove()
  }, [])

  const isSmallDevice = screenDimensions.height < 700

  const handleGoogleSignIn = useCallback(async () => {
    if (!isLoaded) {
      setGeneralError('Authentication system is not ready. Please try again.');
      return;
    }
    
    try {
      clearErrors();
      
      setIsGoogleLoading(true);
      
      const { createdSessionId, setActive: ssoSetActive } = await startSSOFlow({
        strategy: 'oauth_google',
        redirectUrl: AuthSession.makeRedirectUri(),
      });

      if (createdSessionId) {
        if (setActive) {  // Add a null check here
          await setActive({ session: createdSessionId });
          router.replace('/');
        } else {
          setGeneralError('Session activation failed. Please try again.');
        }
      } else {
        setGeneralError('Sign in process was not completed.');
      }
    } catch (err: any) {
      console.error('Error during OAuth:', JSON.stringify(err, null, 2));
      
      if (err?.message?.includes('cancelled') || err?.message?.includes('dismiss')) {
        setGeneralError('Sign in was cancelled.');
      } else if (err?.message?.includes('network')) {
        setGeneralError('Network error. Please check your connection and try again.');
      } else if (err?.errors && err.errors.length > 0) {
        setGeneralError(err.errors[0].message || 'Failed to sign in with Google.');
      } else {
        setGeneralError('Failed to sign in with Google. Please try again.');
      }
    } finally {
      setIsGoogleLoading(false);
    }
  }, [startSSOFlow, setActive, router, clearErrors]);

  useEffect(() => {
    if (isGoogleLoading) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(spinnerFadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(spinnerFadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isGoogleLoading]);
  
  const onSignInPress = async () => {
    if (!isLoaded) return
    
    clearErrors()
    
    if (!emailAddress.trim()) {
      setEmailError('Email is required')
      return
    }
    
    if (!password) {
      setPasswordError('Password is required')
      return
    }

    try {
      const result = await signIn.create({
        identifier: emailAddress,
        password,
      })
      
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId })
        router.replace('/')
      } else {
        console.log(JSON.stringify(result, null, 2))
        setGeneralError('Additional steps needed to sign in')
      }
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2))
      
      if (err.errors && err.errors.length > 0) {
        const error = err.errors[0]
        
        if (error.code === 'form_identifier_not_found') {
          setEmailError('No account found with this email')
        } else if (error.code === 'form_password_incorrect') {
          setPasswordError('Incorrect password')
        } else {
          setGeneralError(error.message || 'Failed to sign in')
        }
      } else {
        setGeneralError('An error occurred during sign in')
      }
    }
  }

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
        
        {generalError ? <Text style={styles.errorText}>{generalError}</Text> : null}
        
        <View style={styles.formContainer}>
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Email</Text>
            <TextInput
             style={[styles.input, emailError ? styles.inputError : null]}
             placeholder="Enter your email" 
             placeholderTextColor="grey"
             value={emailAddress}
             onChangeText={(text) => {
              setEmailAddress(text)
              setEmailError('')
              setGeneralError('')
             }}
             keyboardType="email-address"
             autoCapitalize="none"
            />
            {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
          </View>
          
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Password</Text>
            <View style={[styles.passwordContainer, passwordError ? styles.inputError : null]}>
              <TextInput
               style={styles.passwordInput}
               placeholder="Enter your password" 
               placeholderTextColor="grey"
               value={password}
               onChangeText={(text) => {
                setPassword(text)
                setPasswordError('')
                setGeneralError('')
               }}
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
            {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
          </View>

          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.signInButton} onPress={onSignInPress}>
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
            <TouchableOpacity 
              style={[
                styles.socialButton,
                isGoogleLoading ? styles.socialButtonLoading : null
              ]} 
              onPress={handleGoogleSignIn}
              disabled={isGoogleLoading}
            >
              {isGoogleLoading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <FontAwesome name="google" size={20} color="white" />
              )}
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
    paddingHorizontal: width * 0.05,
    paddingVertical: height * 0.02,
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
    fontSize: Math.min(30, width * 0.08),
    fontWeight: 'bold',
    marginBottom: 10,
  },
  smallText: {
    fontSize: Math.min(26, width * 0.07),
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
  inputError: {
    borderColor: '#FF6B6B',
    borderWidth: 1,
  },
  errorText: {
    color: '#FF6B6B',
    marginTop: 5,
    fontSize: Math.min(12, width * 0.03),
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
  socialButtonLoading: {
    backgroundColor: '#333',
    borderColor: '#4c8df5',
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