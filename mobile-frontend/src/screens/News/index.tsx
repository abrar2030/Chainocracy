import { View, StyleSheet, Text, ScrollView, TouchableOpacity } from 'react-native';
import theme from 'src/theme';
import { useAuth } from 'src/context/AuthContext';
import axios from 'src/api/axios';
import { Video, ResizeMode } from 'expo-av';

export default function News() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Election News</Text>
        <Text style={styles.subtitle}>Stay updated with the latest election information</Text>
      </View>
      
      <View style={styles.newsCard}>
        <Text style={styles.newsTitle}>Presidential Debate Highlights</Text>
        <Text style={styles.newsDate}>April 15, 2025</Text>
        <Text style={styles.newsContent}>
          The presidential candidates engaged in a heated debate last night, discussing key issues including 
          economic policies, healthcare reform, and foreign relations. Analysts suggest that Candidate A 
          performed strongly on economic questions, while Candidate B showed expertise in foreign policy matters.
        </Text>
        <TouchableOpacity style={styles.readMoreButton}>
          <Text style={styles.readMoreText}>Read More</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.newsCard}>
        <Text style={styles.newsTitle}>Voter Registration Deadline Approaching</Text>
        <Text style={styles.newsDate}>April 10, 2025</Text>
        <Text style={styles.newsContent}>
          The deadline for voter registration is April 30, 2025. All eligible citizens are encouraged to 
          register through the mobile app or visit their local election office. Remember to bring valid 
          identification documents when registering in person.
        </Text>
        <TouchableOpacity style={styles.readMoreButton}>
          <Text style={styles.readMoreText}>Read More</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.newsCard}>
        <Text style={styles.newsTitle}>New Polling Locations Announced</Text>
        <Text style={styles.newsDate}>April 5, 2025</Text>
        <Text style={styles.newsContent}>
          The Election Commission has announced several new polling locations to accommodate the increased 
          number of registered voters. The new locations include community centers, schools, and public 
          libraries across all districts. Check the app for your assigned polling station.
        </Text>
        <TouchableOpacity style={styles.readMoreButton}>
          <Text style={styles.readMoreText}>Read More</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: 20,
    backgroundColor: theme.colors.primary,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  newsCard: {
    backgroundColor: '#fff',
    margin: 15,
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  newsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 5,
  },
  newsDate: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 10,
  },
  newsContent: {
    fontSize: 14,
    color: theme.colors.text,
    lineHeight: 20,
    marginBottom: 15,
  },
  readMoreButton: {
    alignSelf: 'flex-end',
  },
  readMoreText: {
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
});
