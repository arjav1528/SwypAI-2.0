import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Image, Animated, ActivityIndicator } from 'react-native';
import { useUser } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, FontAwesome, MaterialIcons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useState as useReactState } from 'react';
import { Modal, Pressable } from 'react-native';

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

// Helper function to render genre icons
const renderGenreIcon = (genre: typeof GENRES[0], color: string = '#FFF') => {
  const { icon, iconType } = genre;
  
  switch(iconType) {
    case 'material':
      return <MaterialIcons name={icon as MaterialIconName} size={18} color={color} />;
    case 'fontawesome5':
      return <FontAwesome5 name={icon as FontAwesome5IconName} size={16} color={color} />;
    case 'materialcommunity':
      return <MaterialCommunityIcons name={icon as MaterialCommunityIconName} size={18} color={color} />;
    case 'ionicons':
      return <Ionicons name={icon as IoniconsIconName} size={18} color={color} />;
    default:
      return null;
  }
}

export default function ProfileScreen() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  // Edit states
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedAge, setEditedAge] = useState('');
  const [editedGender, setEditedGender] = useState('');
  const [editedGenres, setEditedGenres] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [genreError, setGenreError] = useState('');
  const genreScales = useRef(GENRES.map(() => new Animated.Value(1))).current;
  const [showGenderDropdown, setShowGenderDropdown] = useReactState(false);

  // Extract user metadata
  const metadata = user?.unsafeMetadata as {
    age?: number;
    gender?: string;
    preferGenres?: string[]; // Changed from genres to preferGenres to match the actual data
  } | undefined;

  // Initialize edit states with current values
  useEffect(() => {
    if (metadata) {
      setEditedAge(metadata.age?.toString() || '');
      setEditedGender(metadata.gender || '');
      setEditedGenres(metadata.preferGenres || []); // Changed from genres to preferGenres
    }
  }, [metadata]);

  if (!isLoaded) {
    return null;
  }

  // Format gender display text
  const formatGender = (gender: string | undefined) => {
    if (!gender) return 'Not specified';
    
    switch(gender) {
      case 'male': return 'Male';
      case 'female': return 'Female';
      case 'non_binary': return 'Non-binary';
      case 'prefer_not': return 'Prefer not to say';
      default: return gender;
    }
  };

  const handleGenderChange = () => {
    setShowGenderDropdown(true);
  };
  
  const genderOptions = [
    { label: 'Male', value: 'male' },
    { label: 'Female', value: 'female' },
    { label: 'Non-binary', value: 'non_binary' },
    { label: 'Prefer not to say', value: 'prefer_not' }
  ];
  
  // Select gender and close dropdown
  const selectGender = (value: string) => {
    setEditedGender(value);
    setShowGenderDropdown(false);
  };

  const toggleGenre = (genreName: string) => {
    setGenreError('');
    
    // Find the genre index to animate it
    const genreIndex = GENRES.findIndex(g => g.name === genreName);
    if (genreIndex === -1) return;
    
    const isSelected = editedGenres.includes(genreName);
    
    // Trigger scale animation
    Animated.sequence([
      Animated.timing(genreScales[genreIndex], {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true
      }),
      Animated.spring(genreScales[genreIndex], {
        toValue: isSelected ? 1 : 1.05,
        friction: 3,
        tension: 40,
        useNativeDriver: true
      })
    ]).start(() => {
      if (!isSelected) {
        // After selection animation, return to normal size with a slight delay
        setTimeout(() => {
          Animated.spring(genreScales[genreIndex], {
            toValue: 1,
            friction: 3,
            tension: 40,
            useNativeDriver: true
          }).start();
        }, 1500);
      }
    });
    
    if (isSelected) {
      setEditedGenres(editedGenres.filter(g => g !== genreName));
    } else {
      setEditedGenres([...editedGenres, genreName]);
    }
  };

  const handleInterestsEdit = () => {
    // When in edit mode, we'll show all genres for direct selection
    // No need for Alert dialogs anymore
    setIsEditMode(true);
  };

  const saveChanges = async () => {
    if (isEditMode) {
      setIsLoading(true); // We'll use this just to disable the button during API call
      try {
        await user?.update({
          unsafeMetadata: {
            age: editedAge ? Number(editedAge) : metadata?.age,
            gender: editedGender || metadata?.gender,
            preferGenres: editedGenres // Changed from genres to preferGenres
          }
        });
        
        // Simply exit edit mode when done
        setIsEditMode(false);
      } catch (error) {
        console.error('Error updating profile:', error);
        Alert.alert('Error', 'Failed to update profile');
      } finally {
        setIsLoading(false);
      }
    } else {
      setIsEditMode(true);
    }
  };

  // Find genre objects from names
  const findGenresByNames = (genreNames: string[] = []) => {
    return genreNames.map(name => 
      GENRES.find(genre => genre.name === name) || { id: 0, name, icon: 'circle' as IoniconsIconName, iconType: 'ionicons' as const }
    );
  };

  const activeGenres = isEditMode 
    ? findGenresByNames(editedGenres)
    : findGenresByNames(metadata?.preferGenres || []); // Changed from genres to preferGenres

  return (
    <ScrollView 
      style={styles.scrollContainer}
      contentContainerStyle={[
        styles.scrollContent,
        { paddingTop: insets.top, paddingBottom: insets.bottom + 20 }
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
          disabled={isEditMode}
        >
          <Ionicons name="arrow-back" size={24} color={isEditMode ? "#555" : "white"} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEditMode ? 'Edit Profile' : 'Your Profile'}</Text>
        <View style={{ width: 24 }} />
      </View>
      
      {/* Profile banner and avatar */}
      <View style={styles.profileBanner}>
        <LinearGradient
          colors={['rgba(76, 141, 245, 0.8)', 'rgba(43, 107, 232, 0.8)']}
          style={styles.bannerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.avatarContainer}>
            {user?.imageUrl ? (
              <Image source={{ uri: user.imageUrl }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>{user?.firstName?.[0] || user?.username?.[0] || '?'}</Text>
              </View>
            )}
          </View>
          <Text style={styles.profileName}>{user?.firstName || user?.username || 'User'}</Text>
          <Text style={styles.profileEmail}>{user?.primaryEmailAddress?.emailAddress}</Text>
        </LinearGradient>
      </View>
      
      <View style={styles.profileContainer}>
        {/* Personal Information */}
        <View style={styles.profileSection}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Ionicons name="person" size={20} color="#4c8df5" style={styles.sectionIcon} />
              <Text style={styles.sectionTitle}>Personal Information</Text>
            </View>
            {!isEditMode && (
              <TouchableOpacity 
                style={styles.sectionEditButton} 
                onPress={() => setIsEditMode(true)}
              >
                <FontAwesome name="pencil" size={16} color="#4c8df5" />
              </TouchableOpacity>
            )}
          </View>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Age</Text>
            <View style={styles.valueContainer}>
              {isEditMode ? (
                <TextInput
                  style={[styles.infoValue, styles.inputEdit]}
                  value={editedAge}
                  onChangeText={setEditedAge}
                  keyboardType="number-pad"
                  placeholder="Enter age"
                  placeholderTextColor="#777"
                />
              ) : (
                <Text style={styles.infoValue}>{metadata?.age || 'Not set'}</Text>
              )}
            </View>
          </View>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Gender</Text>
            <View style={styles.valueContainer}>
              {isEditMode ? (
                <TouchableOpacity 
                  style={styles.genderSelect}
                  onPress={handleGenderChange}
                >
                  <Text style={styles.infoValue}>
                    {formatGender(editedGender)}
                  </Text>
                  <Ionicons name="chevron-down" size={16} color="white" style={{marginLeft: 6}} />
                </TouchableOpacity>
              ) : (
                <Text style={styles.infoValue}>{formatGender(metadata?.gender)}</Text>
              )}
            </View>
          </View>
        </View>
        
        {/* Interests */}
        <View style={styles.profileSection}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Ionicons name="heart" size={20} color="#4c8df5" style={styles.sectionIcon} />
              <Text style={styles.sectionTitle}>Your Interests</Text>
            </View>
            
            {!isEditMode && (
              <TouchableOpacity 
                style={styles.sectionEditButton} 
                onPress={() => setIsEditMode(true)}
              >
                <FontAwesome name="pencil" size={16} color="#4c8df5" />
              </TouchableOpacity>
            )}
          </View>
          
          {isEditMode ? (
            // In edit mode, show a grid of selectable genres similar to complete-profile
            <View style={styles.genreGrid}>
              {GENRES.map((genre, index) => {
                const isSelected = editedGenres.includes(genre.name);
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
                      onPress={() => toggleGenre(genre.name)}
                      activeOpacity={0.7}
                    >
                      {isSelected && (
                        <View style={styles.checkmark}>
                          <Ionicons name="checkmark" size={16} color="white" />
                        </View>
                      )}
                      <View style={styles.genreIconContainer}>
                        {renderGenreIcon(genre, isSelected ? '#4c8df5' : '#e0e0e0')}
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
                );
              })}
            </View>
          ) : (
            // In view mode, show selected genres as tags
            <View style={styles.interestsContainer}>
              {activeGenres.length > 0 ? (
                activeGenres.map((genre, index) => (
                  <View key={index} style={styles.interestTag}>
                    {renderGenreIcon(genre)}
                    <Text style={styles.interestText}>{genre.name}</Text>
                  </View>
                ))
              ) : (
                <View style={styles.noInterestsContainer}>
                  <Ionicons name="heart-dislike-outline" size={24} color="#777" />
                  <Text style={styles.noInterests}>No interests selected</Text>
                </View>
              )}
            </View>
          )}
        </View>
        
        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity 
            style={[
              styles.mainButton,
              isLoading && styles.disabledButton
            ]} 
            onPress={saveChanges}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <LinearGradient 
              colors={isEditMode ? ['#4cd964', '#3cc954', '#2bb342'] : ['#4c8df5', '#3d7ef1', '#2b6be8']} 
              style={styles.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <FontAwesome 
                  name={isEditMode ? "check" : "pencil"} 
                  size={16} 
                  color="white" 
                  style={styles.buttonIcon} 
                />
                <Text style={styles.buttonText}>
                  {isEditMode ? 'Save Changes' : 'Edit Profile'}
                </Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
          
          {isEditMode && (
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={() => {
                // Reset to original values
                if (metadata) {
                  setEditedAge(metadata.age?.toString() || '');
                  setEditedGender(metadata.gender || '');
                  setEditedGenres(metadata.preferGenres || []);
                }
                setIsEditMode(false);
              }}
              activeOpacity={0.7}
              disabled={isLoading}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      <Modal
        transparent={true}
        visible={showGenderDropdown}
        animationType="fade"
        onRequestClose={() => setShowGenderDropdown(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowGenderDropdown(false)}
        >
          <BlurView intensity={30} style={styles.blurOverlay}>
            <Pressable style={styles.dropdownContainer} onPress={e => e.stopPropagation()}>
              <View style={styles.dropdownHeader}>
                <Text style={styles.dropdownTitle}>Select Gender</Text>
                <TouchableOpacity onPress={() => setShowGenderDropdown(false)}>
                  <Ionicons name="close" size={24} color="white" />
                </TouchableOpacity>
              </View>
              
              {genderOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.dropdownItem,
                    editedGender === option.value && styles.dropdownItemSelected
                  ]}
                  onPress={() => selectGender(option.value)}
                >
                  <Text style={[
                    styles.dropdownItemText,
                    editedGender === option.value && styles.dropdownItemTextSelected
                  ]}>
                    {option.label}
                  </Text>
                  {editedGender === option.value && (
                    <Ionicons name="checkmark" size={22} color="#4c8df5" />
                  )}
                </TouchableOpacity>
              ))}
            </Pressable>
          </BlurView>
        </TouchableOpacity>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: '#121212',
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 10,
  },
  backButton: {
    padding: 8,
    backgroundColor: 'rgba(40,40,40,0.5)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  profileBanner: {
    height: 180,
    width: '100%',
    marginBottom: 20,
  },
  bannerGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
    borderWidth: 3,
    borderColor: 'white',
    overflow: 'hidden',
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 30,
    fontWeight: 'bold',
    color: 'white',
  },
  profileName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  profileContainer: {
    paddingHorizontal: 16,
  },
  profileSection: {
    marginBottom: 20,
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionIcon: {
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  sectionEditButton: {
    padding: 8,
    backgroundColor: 'rgba(76, 141, 245, 0.1)',
    borderRadius: 12,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  infoLabel: {
    fontSize: 16,
    color: '#AAAAAA',
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoValue: {
    fontSize: 16,
    color: 'white',
    fontWeight: '500',
  },
  inputEdit: {
    minWidth: 80,
    textAlign: 'right',
    borderBottomWidth: 1,
    borderBottomColor: '#4c8df5',
    paddingBottom: 2,
  },
  genderSelect: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 141, 245, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  interestTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 141, 245, 0.15)',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    margin: 4,
    borderWidth: 1,
    borderColor: 'rgba(76, 141, 245, 0.3)',
  },
  interestText: {
    color: 'white',
    fontSize: 14,
    marginLeft: 6,
  },
  noInterestsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  noInterests: {
    color: '#999',
    fontSize: 16,
    marginTop: 8,
  },
  editInterestsButton: {
    backgroundColor: 'rgba(76, 141, 245, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  editInterests: {
    color: '#4c8df5',
    fontSize: 14,
    fontWeight: '600',
  },
  actionButtonsContainer: {
    marginBottom: 30,
  },
  mainButton: {
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  disabledButton: {
    opacity: 0.7,
  },
  gradient: {
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  genreGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 5,
    marginBottom: 10,
  },
  genreItem: {
    width: '100%',
    padding: 14,
    borderRadius: 10,
    backgroundColor: '#1A1A1A',
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
    fontSize: 14,
  },
  genreTextSelected: {
    color: '#4c8df5',
    fontWeight: '600',
  },
  genreError: {
    color: '#FF6B6B',
    marginTop: 5,
    fontSize: 12,
    marginBottom: 10,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blurOverlay: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  dropdownContainer: {
    width: '85%',
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  dropdownTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  dropdownItemSelected: {
    backgroundColor: 'rgba(76, 141, 245, 0.15)',
  },
  dropdownItemText: {
    fontSize: 16,
    color: 'white',
  },
  dropdownItemTextSelected: {
    fontWeight: 'bold',
    color: '#4c8df5',
  },
  loadingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'white',
    marginHorizontal: 4,
  },
});