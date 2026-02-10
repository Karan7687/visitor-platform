  import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';

import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { API_ENDPOINTS } from '../config/api';
import CustomAlert from '../components/CustomAlert';
import * as Keychain from 'react-native-keychain';

type LoginScreenProps = NativeStackScreenProps<RootStackParamList, 'Login'>;

interface LoginCredentials {
  email: string;
  password: string;
}

const LoginScreen: React.FC<LoginScreenProps> = () => {
    const navigation = useNavigation<LoginScreenProps['navigation']>();
    const [credentials, setCredentials] = useState<LoginCredentials>({
      email: '',
      password: '',
    });
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState<{
      visible: boolean;
      title: string;
      message: string;
      type: 'success' | 'error' | 'warning' | 'info';
      animationType?: 'bounce' | 'slide' | 'zoom' | 'confetti' | 'check-with-sparkles' | 'circle-only';
    }>({
      visible: false,
      title: '',
      message: '',
      type: 'info',
    });

    const handleInputChange = (field: keyof LoginCredentials, value: string) => {
      setCredentials(prev => ({
        ...prev,
        [field]: value,
      }));
    };

    const showAlert = (title: string, message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info', animationType?: 'bounce' | 'slide' | 'zoom' | 'confetti' | 'check-with-sparkles' | 'circle-only') => {
      console.log('🚨 showAlert called:', { title, message, type, animationType });
      setAlert({ visible: true, title, message, type, animationType });
    };

    const handleLogin = async () => {
      if (!credentials.email || !credentials.password) {
        showAlert('⚠️ Oops!', 'Please fill in all fields to continue', 'warning', 'zoom');
        return;
      }

      setLoading(true);

      // Add timeout to prevent infinite loading
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      try {
        console.log('Attempting login to:', API_ENDPOINTS.LOGIN);
        
        const response = await fetch(API_ENDPOINTS.LOGIN, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(credentials),
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          
          // Store token securely using Keychain
          if (data.token) {
            console.log('Storing token:', data.token.substring(0, 20) + '...');
            await Keychain.setGenericPassword('userToken', data.token);
            console.log('Token stored successfully');
            
            // Verify it was stored
            const verifyToken = await Keychain.getGenericPassword();
            console.log('Verification - token stored:', verifyToken ? 'yes' : 'no');
          } else {
            console.log('No token received from backend, proceeding without authentication...');
          }
          
          showAlert('✅ Login Successful!', 'Welcome back! Redirecting to visitor form...', 'success', 'check-with-sparkles');
          setTimeout(() => {
            navigation.navigate('VisitorForm', { user: data.user, token: data.token || null });
          }, 3000);
        } else {
          const errorData = await response.json();
          showAlert('🔒 Login Failed', errorData.message || 'Invalid credentials. Please try again.', 'error', 'bounce');
        }
      } catch (error: any) {
        console.error('Login error:', error);
        clearTimeout(timeoutId);
        
        if (error.name === 'AbortError') {
          showAlert('⏰ Timeout', 'Connection timeout. Please check your network and try again.', 'warning');
        } else {
          showAlert('🌐 Network Error', 'Network error. Please make sure the backend server is running.', 'error');
        }
      } finally {
        setLoading(false);
      }
    };

    const handleRegister = () => {
      navigation.navigate('Registration');
    };

    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.formContainer}>
            {/* App Icon */}
            <View style={styles.iconContainer}>
              <View style={styles.icon}>
                <Text style={styles.iconText}>V</Text>
              </View>
            </View>

            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to continue</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={credentials.email}
                onChangeText={(value) => handleInputChange('email', value)}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={[styles.input, styles.passwordInput]}
                value={credentials.password}
                onChangeText={(value) => handleInputChange('password', value)}
                placeholder="Enter your password"
                secureTextEntry={true}
                textContentType="password"
                autoComplete="password"
                importantForAutofill="yes"
                placeholderTextColor="#999"
              />
            </View>

            <TouchableOpacity
              style={[styles.loginButton, loading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Text style={styles.loginButtonText}>
                {loading ? 'Signing In...' : 'Sign In'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.registerLink}
              onPress={handleRegister}
              activeOpacity={0.8}
            >
              <Text style={styles.registerText}>
                Don't have an account? <Text style={styles.createText}>Create one</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
        
        <CustomAlert
          visible={alert.visible}
          title={alert.title}
          message={alert.message}
          type={alert.type}
          animationType={alert.animationType}
          onClose={() => setAlert(prev => ({ ...prev, visible: false }))}
        />
      </KeyboardAvoidingView>
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#f8f9fa',
    },
    scrollContainer: {
      flexGrow: 1,
      justifyContent: 'center',
      padding: 20,
    },
    formContainer: {
      backgroundColor: 'white',
      borderRadius: 16,
      padding: 30,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 8,
    },
    iconContainer: {
      alignItems: 'center',
      marginBottom: 30,
    },
    icon: {
      width: 60,
      height: 60,
      borderRadius: 16,
      backgroundColor: '#007AFF',
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#007AFF',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 4,
    },
    iconText: {
      fontSize: 28,
      fontWeight: 'bold',
      color: 'white',
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: '#1a1a1a',
      textAlign: 'center',
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: '#666',
      textAlign: 'center',
      marginBottom: 30,
    },
    inputContainer: {
      marginBottom: 20,
    },
    label: {
      fontSize: 16,
      fontWeight: '600',
      color: '#333',
      marginBottom: 8,
    },
    input: {
      borderWidth: 1,
      borderColor: '#e1e5e9',
      borderRadius: 12,
      padding: 16,
      fontSize: 16,
      backgroundColor: '#f8f9fa',
      color: '#333',
    },
    passwordInput: {
      color: '#333',
    },
    loginButton: {
      backgroundColor: '#1e3a8a',
      padding: 16,
      borderRadius: 12,
      alignItems: 'center',
      marginTop: 10,
      shadowColor: '#1e3a8a',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 4,
    },
    buttonDisabled: {
      backgroundColor: '#94a3b8',
    },
    loginButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600',
    },
    registerLink: {
      marginTop: 24,
      alignItems: 'center',
    },
    registerText: {
      fontSize: 14,
      color: '#666',
    },
    createText: {
      color: '#007AFF',
      fontWeight: '600',
    },
  });

  export default LoginScreen;