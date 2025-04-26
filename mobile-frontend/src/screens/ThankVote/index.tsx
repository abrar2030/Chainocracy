import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import theme from 'src/theme';
import { StatusBar } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useEffect, useState } from 'react';

export default function ThankVote() {
  const [copied, setCopied] = useState(false);
  const transactionId = "tx_123456789abcdef";

  const copyToClipboard = async () => {
    await Clipboard.setStringAsync(transactionId);
    setCopied(true);
  };

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => {
        setCopied(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Text style={styles.title}>Thank You!</Text>
      <Text style={styles.subtitle}>Your vote has been recorded</Text>
      
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Transaction Details</Text>
        <Text style={styles.label}>Transaction ID:</Text>
        <View style={styles.transactionContainer}>
          <Text style={styles.transactionId}>{transactionId}</Text>
          <TouchableOpacity onPress={copyToClipboard} style={styles.copyButton}>
            <Text style={styles.copyButtonText}>{copied ? "Copied!" : "Copy"}</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.info}>
          Your vote has been securely recorded on the blockchain. You can use this 
          transaction ID to verify your vote at any time.
        </Text>
      </View>
      
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Return to Home</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.colors.success,
    marginTop: 60,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: theme.colors.textSecondary,
    marginBottom: 40,
  },
  card: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 5,
  },
  transactionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
  },
  transactionId: {
    fontSize: 14,
    color: theme.colors.text,
    flex: 1,
  },
  copyButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  copyButtonText: {
    color: '#fff',
    fontSize: 12,
  },
  info: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  button: {
    backgroundColor: theme.colors.primary,
    width: '100%',
    height: 50,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
