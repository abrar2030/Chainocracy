import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export function HeaderElection() {
  return (
    <View style={styles.container}>
      <View style={styles.flagContainer}>
        <View style={styles.flagStripe1}></View>
        <View style={styles.flagStripe2}></View>
        <View style={styles.flagStripe3}></View>
      </View>
      <Text style={styles.title}>Chainocracy</Text>
      <Text style={styles.subtitle}>Blockchain-based Voting System</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    padding: 15,
    backgroundColor: '#f8f8f8',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  flagContainer: {
    width: 60,
    height: 40,
    marginBottom: 10,
    flexDirection: 'row',
    overflow: 'hidden',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  flagStripe1: {
    flex: 1,
    backgroundColor: '#0057B7',
  },
  flagStripe2: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  flagStripe3: {
    flex: 1,
    backgroundColor: '#D62612',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
});
