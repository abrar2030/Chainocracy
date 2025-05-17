import { View, StyleSheet, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useState } from 'react';
import { TextInput } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import { api } from '../../services/api';

export default function Registration() {
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [address, setAddress] = useState('');
  const [province, setProvince] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const provinces = [
    "Bengo",
    "Benguela",
    "Bié",
    "Cabinda",
    "Cuando Cubango",
    "Cuanza Norte",
    "Cuanza Sul",
    "Cunene",
    "Huambo",
    "Huíla",
    "Luanda",
    "Lunda Norte",
    "Lunda Sul",
    "Malanje",
    "Moxico",
    "Namibe",
    "Uíge",
    "Zaire"
  ];

  const validateForm = () => {
    if (!name || !email || !password || !confirmPassword || !address || !province) {
      Alert.alert('Error', 'Please fill in all fields');
      return false;
    }
    
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }
    
    return true;
  };

  const handleRegistration = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      const response = await api.post('/auth/register', {
        name,
        email,
        password,
        address,
        province
      });
      
      if (response.status === 201) {
        Alert.alert(
          'Success', 
          'Registration successful. Please check your email for verification.',
          [{ text: 'OK', onPress: () => navigation.navigate('Login' as never) }]
        );
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Registration failed. Please try again.';
      Alert.alert('Error', message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join Chainocracy Voting System</Text>
        
        <View style={styles.formContainer}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your full name"
            value={name}
            onChangeText={setName}
          />
          
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
          
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Create a password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          
          <Text style={styles.label}>Confirm Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Confirm your password"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
          
          <Text style={styles.label}>Address</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your address"
            value={address}
            onChangeText={setAddress}
          />
          
          <Text style={styles.label}>Province</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={province}
              onValueChange={(itemValue) => setProvince(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Select your province" value="" />
              {provinces.map((prov, index) => (
                <Picker.Item key={index} label={prov} value={prov} />
              ))}
            </Picker>
          </View>
          
          <TouchableOpacity 
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleRegistration}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? 'Registering...' : 'Register'}
            </Text>
          </TouchableOpacity>
          
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login' as never)}>
              <Text style={styles.loginLink}>Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#555',
    marginBottom: 5,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    marginBottom: 15,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    marginBottom: 15,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  button: {
    backgroundColor: '#2196F3',
    height: 50,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#a0d1f7',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  loginText: {
    color: '#666',
  },
  loginLink: {
    color: '#2196F3',
    fontWeight: 'bold',
    marginLeft: 5,
  },
});
