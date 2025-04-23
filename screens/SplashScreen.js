// SplashScreen.js
import React from 'react';
import { View, Image, StyleSheet, Text } from 'react-native';
import { MotiView } from 'moti';

export default function SplashScreen() {
  return (
    <View style={styles.container}>
      <MotiView
        from={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'timing', duration: 1000 }}
      >
        <Image source={require('../assets/logo.png')} style={styles.logo} />
        <Text style={styles.title}>Bar Manager</Text>
      </MotiView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20
  },
  title: {
    color: '#00BFFF',
    fontSize: 24,
    fontWeight: 'bold'
  }
});
