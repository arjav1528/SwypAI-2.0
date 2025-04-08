import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';

const GradientText = ({ children, style }: { children: string; style?: any }) => {
  return (
    <MaskedView maskElement={<Text style={[styles.gradientText, style]}>{children}</Text>}>
      <LinearGradient
        colors={['#204cb5', '#3d7ef1']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <Text style={[styles.gradientText, style, { opacity: 0 }]}>{children}</Text>
      </LinearGradient>
    </MaskedView>
  );
};

export default function SplashScreen() {
  return (
    <View style={styles.container}>
      <GradientText style={styles.title}>Swyp AI</GradientText>
      <Text style={styles.subText}>👋∞</Text>
      <Text style={[styles.subText, { fontSize: 25 }]}>Create what you consume</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000', // black background
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradientText: {
    fontSize: 40,
    fontWeight: 'bold',
  },
  title: {
    marginBottom: 16,
  },
  subText: {
    color: '#fff',
    fontSize: 40,
    marginVertical: 4,
  },
});
