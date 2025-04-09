import { StyleSheet, Text, TextInput, View, TouchableOpacity, ScrollView, Dimensions, Platform } from 'react-native'
import React, { useState, useEffect } from 'react'
import { GradientText } from '@/components/SplashScreen'
import { Ionicons, FontAwesome } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useSignUp } from '@clerk/clerk-expo'

const { width, height } = Dimensions.get('window')

export default function SignUpScreen() {
  const insets = useSafeAreaInsets()
  const { isLoaded, signUp, setActive } = useSignUp()
  const router = useRouter()
  
  // Form state
  const [emailAddress, setEmailAddress] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [pendingVerification, setPendingVerification] = useState(false)
  const [code, setCode] = useState('')
  
  // UI state
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [screenDimensions, setScreenDimensions] = useState({ width, height })
  
  // Error handling state
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [codeError, setCodeError] = useState('')
  const [generalError, setGeneralError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  // Clear errors on input change
  const clearErrors = () => {
    setEmailError('')
    setPasswordError('')
    setGeneralError('')
  }

  // Handle screen rotation or dimension changes
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenDimensions({ width: window.width, height: window.height })
    })
    
    return () => subscription?.remove()
  }, [])

  const isSmallDevice = screenDimensions.height < 700

  // Handle submission of sign-up form
  const onSignUpPress = async () => {
    if (!isLoaded) return
    
    // Clear previous errors
    clearErrors()
    setSuccessMessage('')
    
    // Client-side validations
    if (!emailAddress.trim()) {
      setEmailError('Email is required')
      return
    }
    
    if (!password) {
      setPasswordError('Password is required')
      return
    }
    
    if (password !== confirmPassword) {
      setPasswordError("Passwords don't match")
      return
    }
    
    if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters')
      return
    }

    // Start sign-up process using email and password provided
    try {
      await signUp.create({
        emailAddress,
        password,
      })

      // Send user an email with verification code
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })

      // Set 'pendingVerification' to true to display second form
      // and capture OTP code
      setPendingVerification(true)
      setSuccessMessage('Verification code sent to your email')
    } catch (err: any) {  // Add ": any" here
      // Handle Clerk errors
      console.error(JSON.stringify(err, null, 2))
      
      // Check for specific error types and show appropriate message
      if (err.errors && err.errors.length > 0) {
        const error = err.errors[0]
        
        if (error.code === 'form_identifier_exists') {
          setEmailError('This email is already registered')
        } else if (error.code === 'form_password_pwned') {
          setPasswordError('This password has been compromised. Please choose a more secure password')
        } else if (error.code === 'form_password_weak') {
          setPasswordError('Password is too weak. Include numbers, symbols, and mixed case letters')
        } else {
          setGeneralError(error.message || 'An error occurred during sign up')
        }
      } else {
        setGeneralError('An error occurred. Please try again')
      }
    }
  }

  // Handle submission of verification form
  const onVerifyPress = async () => {
    if (!isLoaded) return
    setCodeError('')
    
    if (!code.trim()) {
      setCodeError('Verification code is required')
      return
    }

    try {
      // Use the code the user provided to attempt verification
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      })

      // If verification was completed, set the session to active
      // and redirect the user
      if (signUpAttempt.status === 'complete') {
        await setActive({ session: signUpAttempt.createdSessionId })
        router.replace('/')
      } else {
        console.error(JSON.stringify(signUpAttempt, null, 2))
        setCodeError('Verification failed. Please try again')
      }
    } catch (err: any) {  // Add ": any" here
      console.error(JSON.stringify(err, null, 2))
      
      // Parse verification errors
      if (err.errors && err.errors.length > 0) {
        const error = err.errors[0]
        
        if (error.code === 'verification_failed') {
          setCodeError('Incorrect verification code')
        } else {
          setCodeError(error.message || 'Verification failed. Please try again')
        }
      } else {
        setCodeError('An error occurred during verification')
      }
    }
  }

  if (pendingVerification) {
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
            Verify your email
          </GradientText>
          <Text style={styles.text}>Enter the verification code sent to your email</Text>
          
          {successMessage ? <Text style={styles.successMessage}>{successMessage}</Text> : null}
          
          <View style={styles.formContainer}>
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Verification Code</Text>
              <TextInput
                style={[styles.input, codeError ? styles.inputError : null]}
                placeholder="Enter verification code" 
                placeholderTextColor="grey"
                value={code}
                onChangeText={(text) => {
                  setCode(text)
                  setCodeError('')
                }}
                keyboardType="number-pad"
                autoCapitalize="none"
              />
              {codeError ? <Text style={styles.errorText}>{codeError}</Text> : null}
            </View>
            
            <TouchableOpacity style={styles.resendCode} onPress={async () => {
              try {
                await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
                setSuccessMessage('Verification code resent to your email');
              } catch (err: any) {  // Add ": any" here
                setCodeError('Failed to resend code. Please try again');
              }
            }}>
              <Text style={styles.resendCodeText}>Didn't receive code? Resend</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.signUpButton} onPress={onVerifyPress}>
              <LinearGradient 
                colors={['#4c8df5', '#3d7ef1', '#2b6be8']} 
                style={styles.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.buttonText}>Verify Email</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    )
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
          Join Swyp
        </GradientText>
        <Text style={styles.text}>Create an account to start your journey</Text>
        
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
                placeholder="Create a password" 
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
          </View>
          
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Confirm Password</Text>
            <View style={[styles.passwordContainer, passwordError ? styles.inputError : null]}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Confirm your password" 
                placeholderTextColor="grey"
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text)
                  setPasswordError('')
                  setGeneralError('')
                }}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity 
                style={styles.eyeIcon}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Ionicons 
                  name={showConfirmPassword ? 'eye-off' : 'eye'} 
                  size={24} 
                  color="white"
                />
              </TouchableOpacity>
            </View>
            {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
          </View>

          <Text style={styles.termsText}>
            By signing up, you agree to our{' '}
            <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
            <Text style={styles.termsLink}>Privacy Policy</Text>
          </Text>
          
          <TouchableOpacity style={styles.signUpButton} onPress={onSignUpPress}>
            <LinearGradient 
              colors={['#4c8df5', '#3d7ef1', '#2b6be8']} 
              style={styles.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.buttonText}>Create Account</Text>
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
          
          <View style={styles.signinContainer}>
            <Text style={styles.signinText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.replace('/sign-in')}>
              <Text style={styles.signinLink}>Sign In</Text>
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
  inputError: {
    borderColor: '#FF6B6B',
    borderWidth: 1,
  },
  errorText: {
    color: '#FF6B6B',
    marginTop: 5,
    fontSize: Math.min(12, width * 0.03),
  },
  successMessage: {
    color: '#4BB543',
    marginBottom: 10,
    fontSize: Math.min(14, width * 0.035),
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
  termsText: {
    color: '#a0a0a0',
    fontSize: Math.min(12, width * 0.03),
    textAlign: 'center',
    marginBottom: height * 0.02,
    lineHeight: 18,
  },
  termsLink: {
    color: '#4c8df5',
  },
  signUpButton: {
    width: '100%',
    height: Platform.OS === 'ios' ? height * 0.06 : height * 0.07,
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: height * 0.015,
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
    marginBottom: height * 0.02,
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
  signinContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: height * 0.02,
    marginBottom: height * 0.04,
  },
  signinText: {
    color: '#e0e0e0',
    fontSize: Math.min(14, width * 0.035),
  },
  signinLink: {
    color: '#4c8df5',
    fontSize: Math.min(14, width * 0.035),
    fontWeight: 'bold',
  },
  // Resend code link style
  resendCode: {
    alignSelf: 'flex-end',
    marginVertical: 10,
  },
  resendCodeText: {
    color: '#4c8df5',
    fontSize: Math.min(14, width * 0.035),
    fontWeight: '500',
  }
})