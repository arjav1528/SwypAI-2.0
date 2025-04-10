import { StyleSheet, Text, TextInput, View, TouchableOpacity, ScrollView, Dimensions, Platform, FlatList, Animated } from 'react-native'
import React, { useState, useEffect, useRef } from 'react'
import { GradientText } from '@/components/SplashScreen'
import { Ionicons, MaterialIcons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const { width, height } = Dimensions.get('window')

type MaterialIconName = React.ComponentProps<typeof MaterialIcons>['name'];
type FontAwesome5IconName = React.ComponentProps<typeof FontAwesome5>['name'];
type MaterialCommunityIconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];
type IoniconsIconName = React.ComponentProps<typeof Ionicons>['name'];

const GENRES = [
  { id: 1, name: 'Humor', icon: 'grin-squint' as FontAwesome5IconName, iconType: 'fontawesome5' as const },
  { id: 2, name: 'Thriller', icon: 'flash-on' as MaterialIconName, iconType: 'material' as const },
  { id: 3, name: 'Horror', icon: 'ghost' as FontAwesome5IconName, iconType: 'fontawesome5' as const },
  { id: 4, name: 'Wholesome', icon: 'heart' as IoniconsIconName, iconType: 'ionicons' as const },
  { id: 5, name: 'Love', icon: 'heart-multiple' as MaterialCommunityIconName, iconType: 'materialcommunity' as const },
  { id: 6, name: 'Reflections', icon: 'self-improvement' as MaterialIconName, iconType: 'material' as const },
  { id: 7, name: 'Roast Me', icon: 'fire' as FontAwesome5IconName, iconType: 'fontawesome5' as const },
  { id: 8, name: 'Mixed Bag', icon: 'ios-albums' as IoniconsIconName, iconType: 'ionicons' as const },
]

const GENDER_OPTIONS = [
  { id: 'male', label: 'Male' },
  { id: 'female', label: 'Female' },
  { id: 'nonbinary', label: 'Non-Binary' },
  { id: 'prefer_not', label: 'Prefer not to say' },
]

export default function CompleteProfileScreen() {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  
  const [screenDimensions, setScreenDimensions] = useState({ width, height })
  const [selectedGenres, setSelectedGenres] = useState<number[]>([])
  const [selectedGender, setSelectedGender] = useState<string | null>(null)
  const [age, setAge] = useState('')
  const [ageError, setAgeError] = useState('')
  const [genreError, setGenreError] = useState('')
  
  // Create an animated scale value for each genre and gender option
  const genreScales = useRef(GENRES.map(() => new Animated.Value(1))).current
  const genderScales = useRef(GENDER_OPTIONS.map(() => new Animated.Value(1))).current

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenDimensions({ width: window.width, height: window.height })
    })
    
    return () => subscription?.remove()
  }, [])

  const isSmallDevice = screenDimensions.height < 700

  const toggleGenre = (id: number, index: number) => {
    setGenreError('')
    const isSelected = selectedGenres.includes(id)
    
    // Trigger scale animation
    Animated.sequence([
      Animated.timing(genreScales[index], {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true
      }),
      Animated.spring(genreScales[index], {
        toValue: isSelected ? 1 : 1.05,
        friction: 3,
        tension: 40,
        useNativeDriver: true
      })
    ]).start(() => {
      if (!isSelected) {
        // After selection animation, return to normal size with a slight delay
        setTimeout(() => {
          Animated.spring(genreScales[index], {
            toValue: 1,
            friction: 3,
            tension: 40,
            useNativeDriver: true
          }).start()
        }, 1500)
      }
    })
    
    if (isSelected) {
      setSelectedGenres(selectedGenres.filter(genreId => genreId !== id))
    } else {
      setSelectedGenres([...selectedGenres, id])
    }
  }

  const selectGender = (id: string, index: number) => {
    // Trigger scale animation for the selected gender
    Animated.sequence([
      Animated.timing(genderScales[index], {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true
      }),
      Animated.spring(genderScales[index], {
        toValue: selectedGender === id ? 1 : 1.05,
        friction: 3,
        tension: 40,
        useNativeDriver: true
      })
    ]).start(() => {
      if (selectedGender !== id) {
        // After selection animation, return to normal size with a slight delay
        setTimeout(() => {
          Animated.spring(genderScales[index], {
            toValue: 1,
            friction: 3,
            tension: 40,
            useNativeDriver: true
          }).start()
        }, 1500)
      }
    })
    
    setSelectedGender(id)
  }

  const renderGenreIcon = (
    icon: MaterialIconName | FontAwesome5IconName | MaterialCommunityIconName | IoniconsIconName, 
    type: string, 
    isSelected: boolean
  ) => {
    const iconColor = isSelected ? '#4c8df5' : '#e0e0e0'
    
    switch(type) {
      case 'material':
        return <MaterialIcons name={icon as MaterialIconName} size={24} color={iconColor} />
      case 'fontawesome5':
        return <FontAwesome5 name={icon as FontAwesome5IconName} size={22} color={iconColor} />
      case 'materialcommunity':
        return <MaterialCommunityIcons name={icon as MaterialCommunityIconName} size={24} color={iconColor} />
      case 'ionicons':
      default:
        return <Ionicons name={icon as IoniconsIconName} size={24} color={iconColor} />
    }
  }

  const handleContinue = () => {
    let isValid = true

    if (!age.trim() || isNaN(Number(age)) || Number(age) < 13 || Number(age) > 100) {
      setAgeError('Please enter a valid age between 13-100')
      isValid = false
    }

    if (selectedGenres.length === 0) {
      setGenreError('Please select at least one genre')
      isValid = false
    }

    if (isValid) {
      // Here would go the API call to save profile information
      // For now, we'll just navigate to the home screen
      router.replace('/')
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
          Complete Your Profile
        </GradientText>
        <Text style={styles.text}>Tell us a bit about yourself to personalize your experience</Text>
        
        <View style={styles.formContainer}>
          <Text style={styles.sectionTitle}>Gender</Text>
          <View style={styles.genderGrid}>
            {GENDER_OPTIONS.map((option, index) => (
              <Animated.View 
                key={option.id}
                style={{ 
                  width: '48%',
                  transform: [{ scale: genderScales[index] }]
                }}
              >
                <TouchableOpacity
                  style={[
                    styles.genderOption,
                    selectedGender === option.id ? styles.genderSelected : {}
                  ]}
                  onPress={() => selectGender(option.id, index)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.genderText,
                      selectedGender === option.id ? styles.genderTextSelected : {}
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
          
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Age</Text>
            <TextInput
              style={[styles.input, ageError ? styles.inputError : null]}
              placeholder="Enter your age"
              placeholderTextColor="grey"
              value={age}
              onChangeText={(text) => {
                setAge(text)
                setAgeError('')
              }}
              keyboardType="number-pad"
            />
            {ageError ? <Text style={styles.errorText}>{ageError}</Text> : null}
          </View>
          
          <Text style={styles.sectionTitle}>Select Your Interests</Text>
          {genreError ? <Text style={styles.errorText}>{genreError}</Text> : null}
          
          <View style={styles.genreGrid}>
            {GENRES.map((genre, index) => {
              const isSelected = selectedGenres.includes(genre.id)
              return (
                <Animated.View 
                  key={genre.id}
                  style={{ 
                    width: '48%',
                    transform: [{ scale: genreScales[index] }]
                  }}
                >
                  <TouchableOpacity
                    style={[
                      styles.genreItem,
                      isSelected ? styles.genreSelected : {}
                    ]}
                    onPress={() => toggleGenre(genre.id, index)}
                    activeOpacity={0.7}
                  >
                    {isSelected && (
                      <View style={styles.checkmark}>
                        <Ionicons name="checkmark" size={16} color="white" />
                      </View>
                    )}
                    <View style={styles.genreIconContainer}>
                      {renderGenreIcon(genre.icon, genre.iconType, isSelected)}
                    </View>
                    <Text
                      style={[
                        styles.genreText,
                        isSelected ? styles.genreTextSelected : {}
                      ]}
                    >
                      {genre.name}
                    </Text>
                  </TouchableOpacity>
                </Animated.View>
              )
            })}
          </View>
          
          <TouchableOpacity 
            style={styles.continueButton} 
            onPress={handleContinue}
            activeOpacity={0.8}
          >
            <LinearGradient 
              colors={['#4c8df5', '#3d7ef1', '#2b6be8']} 
              style={styles.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.buttonText}>Complete Profile</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.skipButton} 
            onPress={() => router.replace('/')}
            activeOpacity={0.6}
          >
            <Text style={styles.skipText}>Skip for now</Text>
          </TouchableOpacity>
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
  sectionTitle: {
    fontSize: Math.min(18, width * 0.05),
    color: 'white',
    fontWeight: '600',
    marginBottom: 12,
    marginTop: 10,
  },
  genderGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  genderOption: {
    width: '100%',
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#111827',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    alignItems: 'center',
    height: 50,
    justifyContent: 'center',
  },
  genderSelected: {
    borderColor: '#4c8df5',
    backgroundColor: 'rgba(76, 141, 245, 0.1)',
  },
  genderText: {
    color: '#e0e0e0',
    fontSize: Math.min(14, width * 0.035),
  },
  genderTextSelected: {
    color: '#4c8df5',
    fontWeight: '600',
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
  genreGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 5,
    marginBottom: 20,
  },
  genreItem: {
    width: '100%',
    padding: 14,
    borderRadius: 10,
    backgroundColor: '#111827',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    alignItems: 'center',
    position: 'relative',
    height: 85,
    justifyContent: 'center',
  },
  genreIconContainer: {
    marginBottom: 8,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  genreSelected: {
    borderColor: '#4c8df5',
    backgroundColor: 'rgba(76, 141, 245, 0.1)',
  },
  checkmark: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4c8df5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  genreText: {
    color: '#e0e0e0',
    fontSize: Math.min(14, width * 0.035),
  },
  genreTextSelected: {
    color: '#4c8df5',
    fontWeight: '600',
  },
  continueButton: {
    width: '100%',
    height: Platform.OS === 'ios' ? height * 0.06 : height * 0.07,
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: height * 0.025,
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
  skipButton: {
    width: '100%',
    alignItems: 'center',
    marginTop: 15,
    paddingVertical: 10,
  },
  skipText: {
    color: '#a0a0a0',
    fontSize: Math.min(14, width * 0.035),
    textDecorationLine: 'underline',
  },
})