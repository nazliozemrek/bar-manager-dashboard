// WelcomeScreen.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function WelcomeScreen({ onContinue }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Bar Manager</Text>
      <TouchableOpacity style={styles.button} onPress={onContinue}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    justifyContent: 'center',
    alignItems: 'center'
  },
  title: {
    color: '#00BFFF',
    fontSize: 26,
    marginBottom: 20,
    fontWeight: 'bold'
  },
  button: {
    backgroundColor: '#00BFFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold'
  }
});