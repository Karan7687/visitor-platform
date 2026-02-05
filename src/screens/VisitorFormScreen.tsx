//visitor
'use client';



import React, { useState, useEffect, useRef } from 'react';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  FlatList,
  TouchableWithoutFeedback,
} from 'react-native';

import { useNavigation, useRoute } from '@react-navigation/native';

import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { RootStackParamList } from '../navigation/AppNavigator';

import CustomAlert from '../components/CustomAlert';



type VisitorFormScreenProps = NativeStackScreenProps<RootStackParamList, 'VisitorForm'>;

interface PhoneSuggestion {
  id: string;
  phone: string;
  full_name: string;
  email?: string;
  organization?: string;
  designation?: string;
  city?: string;
  country?: string;
  match_priority?: number;
}



const API_URL = 'http://192.168.1.3:3000/api/visitors';
const SUGGESTIONS_API_URL = 'http://192.168.1.3:3000/api/visitors'; // For physical device on same WiFi

// Test the API connection
const TEST_API_URL = 'http://192.168.1.3:3000/api/visitors';

// Test data for immediate suggestions
const testSuggestions: PhoneSuggestion[] = [
  {
    id: 'test-1',
    phone: '9876543210',
    full_name: 'John Doe',
    email: 'john@example.com',
    organization: 'Tech Corp',
    designation: 'Software Engineer',
    city: 'Bangalore',
    country: 'India'
  },
  {
    id: 'test-2', 
    phone: '9123456789',
    full_name: 'Jane Smith',
    email: 'jane@example.com',
    organization: 'Design Inc',
    designation: 'UX Designer',
    city: 'Mumbai',
    country: 'India'
  },
  {
    id: 'test-3',
    phone: '9112233445',
    full_name: 'Mike Johnson',
    email: 'mike@example.com',
    organization: 'Startup XYZ',
    designation: 'Product Manager',
    city: 'Delhi',
    country: 'India'
  },
  {
    id: 'test-4',
    phone: '9988776655',
    full_name: 'Sarah Wilson',
    email: 'sarah@example.com',
    organization: 'Marketing Pro',
    designation: 'Marketing Head',
    city: 'Chennai',
    country: 'India'
  }
];





export default function VisitorFormScreen({ navigation }: VisitorFormScreenProps) {

  const route = useRoute();

  const { user } = route.params as { user: any };



  const [phone, setPhone] = useState('');

  const [fullName, setFullName] = useState('');

  const [email, setEmail] = useState('');

  const [organization, setOrganization] = useState('');

  const [designation, setDesignation] = useState('');

  const [city, setCity] = useState('');

  const [country, setCountry] = useState('');

  const [interests, setInterests] = useState('');

  const [notes, setNotes] = useState('');

  const [followUpDate, setFollowUpDate] = useState('');

  const [loading, setLoading] = useState(false);

  const [checkingPhone, setCheckingPhone] = useState(false);

  const [phoneChecked, setPhoneChecked] = useState(false);

  const [suggestions, setSuggestions] = useState<PhoneSuggestion[]>([]);

  const [showSuggestions, setShowSuggestions] = useState(false);

  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const [showInterestsDropdown, setShowInterestsDropdown] = useState(false);

  const interestsOptions = ['HOT', 'WARM', 'COLD'];

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

  const showAlert = (title: string, message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info', animationType?: 'bounce' | 'slide' | 'zoom' | 'confetti' | 'check-with-sparkles' | 'circle-only') => {
    setAlert({ visible: true, title, message, type, animationType });
  };

  const debounceTimerRef = useRef<number | null>(null);

  const fetchPhoneSuggestions = async (query: string) => {
    console.log('fetchPhoneSuggestions called with:', query);
    
    if (!query || query.length < 1) {
      console.log('Empty query, clearing suggestions');
      setSuggestions([]);
      setShowSuggestions(false);
      setLoadingSuggestions(false);
      return;
    }

    setLoadingSuggestions(true);
    
    try {
      const url = `${SUGGESTIONS_API_URL}/phone-suggestions/${encodeURIComponent(query.trim())}`;
      console.log('Fetching suggestions from:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Raw suggestions response data:', data);

      if (data.suggestions && Array.isArray(data.suggestions) && data.suggestions.length > 0) {
        // Convert string suggestions to PhoneSuggestion objects
        const phoneSuggestions: PhoneSuggestion[] = data.suggestions.map((suggestion: string, index: number) => {
          // Parse format like "3333333333(John Doe)"
          const match = suggestion.match(/^(\d+)\((.*)\)$/);
          if (match) {
            const fullName = match[2] || 'Unknown';
            const firstName = fullName.split(' ')[0]; // Get only first name
            return {
              id: `db-${index}`,
              phone: match[1],
              full_name: firstName, // Only first name
              match_priority: 1
            };
          } else {
            // Fallback if format is different
            return {
              id: `db-${index}`,
              phone: suggestion,
              full_name: 'Unknown',
              match_priority: 1
            };
          }
        });
        
        console.log('Processed phone suggestions:', phoneSuggestions);
        setSuggestions(phoneSuggestions);
        setShowSuggestions(true);
      } else {
        console.log('No suggestions found in database');
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (error) {
      console.log('Backend suggestions error:', error);
      console.log('Error details:', JSON.stringify(error, null, 2));
      
      // Don't use fallback test data - show real error
      setSuggestions([]);
      setShowSuggestions(false);
      
      // Optional: Show error message to user
      if (query.length >= 2) { // Only show error after typing at least 2 digits
        console.log('Network error - unable to fetch suggestions');
      }
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handlePhoneChange = (text: string) => {
    console.log('Phone input changed:', text);
    setPhone(text);
    setPhoneChecked(false); // Reset check status when phone changes

    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Debounce the search to avoid too many API calls
    debounceTimerRef.current = setTimeout(() => {
      fetchPhoneSuggestions(text);
    }, 200); // 200ms delay for real-time experience
  };

  const handleSuggestionPress = async (suggestion: PhoneSuggestion) => {
    console.log('Suggestion selected:', suggestion);
    
    try {
      // Fetch complete visitor details from database
      const url = `${SUGGESTIONS_API_URL}/check-phone/${suggestion.phone.trim()}`;
      console.log('Fetching complete visitor details from:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Visitor details response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Visitor details response data:', data);

        if (data.visitor && data.exists) {
          // Auto-fill with complete visitor details from database
          setFullName(data.visitor.full_name || '');
          setEmail(data.visitor.email || '');
          setOrganization(data.visitor.organization || '');
          setDesignation(data.visitor.designation || '');
          setCity(data.visitor.city || '');
          setCountry(data.visitor.country || '');
          setPhone(data.visitor.phone || suggestion.phone || '');
          setInterests(''); // Keep empty as requested
          setNotes(''); // Keep empty as requested
          
          setPhoneChecked(true);
          setShowSuggestions(false);
          setSuggestions([]);
          
          showAlert('✅ Perfect!', 'Complete visitor details auto-filled from database!', 'success', 'circle-only');
        } else {
          // Fallback to suggestion data if not found in database
          setFullName(suggestion.full_name || '');
          setEmail(suggestion.email || '');
          setOrganization(suggestion.organization || '');
          setDesignation(suggestion.designation || '');
          setCity(suggestion.city || '');
          setCountry(suggestion.country || '');
          setPhone(suggestion.phone || '');
          setInterests('');
          setNotes('');
          
          setPhoneChecked(true);
          setShowSuggestions(false);
          setSuggestions([]);
          
          showAlert('✅ Great!', 'Visitor details auto-filled!', 'success', 'circle-only');
        }
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.log('Error fetching visitor details:', error);
      
      // Fallback to suggestion data if API call fails
      setFullName(suggestion.full_name || '');
      setEmail(suggestion.email || '');
      setOrganization(suggestion.organization || '');
      setDesignation(suggestion.designation || '');
      setCity(suggestion.city || '');
      setCountry(suggestion.country || '');
      setPhone(suggestion.phone || '');
      setInterests('');
      setNotes('');
      
      setPhoneChecked(true);
      setShowSuggestions(false);
      setSuggestions([]);
      
      showAlert('✅ Auto-filled!', 'Visitor details auto-filled!', 'success', 'circle-only');
    }
  };

  const handleOutsidePress = () => {
    setShowSuggestions(false);
  };

  const handleScroll = () => {
    setShowSuggestions(false);
    setShowInterestsDropdown(false);
  };

  const handleInterestsSelect = (option: string) => {
    setInterests(option);
    setShowInterestsDropdown(false);
  };

  const handleInterestsDropdownToggle = () => {
    setShowInterestsDropdown(!showInterestsDropdown);
    setShowSuggestions(false); // Close phone suggestions when opening interests dropdown
  };

  const handleDateChange = (text: string) => {
    // Auto-format YYYY-MM-DD
    let formatted = text.replace(/[^\d]/g, ''); // Remove non-digits
    
    if (formatted.length >= 5) {
      formatted = formatted.slice(0, 4) + '-' + formatted.slice(4);
    }
    if (formatted.length >= 8) {
      formatted = formatted.slice(0, 7) + '-' + formatted.slice(7, 11);
    }
    
    setFollowUpDate(formatted);
  };

  const handleQuickDateSelect = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    setFollowUpDate(`${year}-${month}-${day}`);
  };

  // Exact date processing logic from web admin
  const processLeadData = (data: any) => {
    return {
      ...data,
      follow_up_date: data.follow_up_date 
        ? data.follow_up_date.split('T')[0]  // Convert ISO to YYYY-MM-DD
        : null
    };
  };

  // Function to normalize date for API
  const normalizeDateForAPI = (dateInput: string) => {
    if (!dateInput || dateInput.trim() === '') {
      return null;
    }
    
    // Handle different mobile date formats
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) {
      return dateInput; // Return as-is if invalid date
    }
    
    // Return in YYYY-MM-DD format (ISO date without time)
    return date.toISOString().split('T')[0];
  };

  
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);



  const checkPhoneNumber = async () => {

    if (!phone.trim() || phone.length < 10) {

      showAlert('📱 Invalid Phone', 'Please enter a valid phone number', 'error', 'bounce');

      return;

    }



    setCheckingPhone(true);

    try {

      console.log('Checking phone:', phone.trim());

      const url = `${SUGGESTIONS_API_URL}/check-phone/${phone.trim()}`;

      console.log('Request URL:', url);

      

      const response = await fetch(url, {

        method: 'GET',

        headers: {

          'Content-Type': 'application/json',

        },

      });



      console.log('Response status:', response.status);

      const data = await response.json();

      console.log('Response data:', data);



      if (response.status === 200 && data.visitor) {

        // Auto-fill visitor details

        setFullName(data.visitor.full_name || '');

        setEmail(data.visitor.email || '');

        setOrganization(data.visitor.organization || '');

        setDesignation(data.visitor.designation || '');

        setCity(data.visitor.city || '');

        setCountry(data.visitor.country || '');

        // Keep interests and notes blank as requested

        setInterests('');

        setNotes('');

        

        setPhoneChecked(true);

        showAlert('✅ Found!', 'Visitor details found and auto-filled!', 'success', 'slide');

      } else {

        // Clear all fields except phone

        setFullName('');

        setEmail('');

        setOrganization('');

        setDesignation('');

        setCity('');

        setCountry('');

        setInterests('');

        setNotes('');

        setPhoneChecked(true);

        showAlert('✅ Not Found', 'No existing visitor found. Please register new visitor.', 'info', 'bounce');

      }

    } catch (error: any) {

      console.error('Error checking phone:', error);

      showAlert('🔥 Network Error', `Failed to check phone: ${error.message}`, 'error', 'bounce');

    } finally {

      setCheckingPhone(false);

    }

  };



  const checkVisitorExists = async (phone: string) => {
    try {
      const response = await fetch(`${API_URL}/exists/${phone}`);
      const data = await response.json();

      console.log('Visitor exists check result:', data);

      return response.ok && data?.exists === true;
    } catch (error) {
      console.log('Error checking visitor existence:', error);
      return false;
    }
  };



  const handleSubmit = async () => {

  if (!fullName.trim() || !phone.trim() || !interests) {

    showAlert('⚠️ Missing Info', 'Full Name, Phone, and Interests are required', 'warning');

    return;

  }

  // Validate follow-up date
  if (!followUpDate || followUpDate.trim() === '') {
    showAlert('📅 Date Required', 'Follow-up date is required', 'warning');
    return;
  }

  console.log('=== SUBMISSION DEBUG ===');
  console.log('Follow-up date state:', followUpDate);
  console.log('Follow-up date length:', followUpDate.length);
  console.log('Follow-up date trimmed:', followUpDate.trim());
  console.log('Is empty string?', followUpDate.trim() === '');
  console.log('========================');

  // Test API connectivity before submission
  console.log('🔍 Testing API connectivity...');
  try {
    const testResponse = await fetch(`${API_URL}/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    console.log('🔍 Health check status:', testResponse.status);
    console.log('🔍 Health check ok:', testResponse.ok);
  } catch (testError) {
    console.error('❌ API connectivity test failed:', testError);
    showAlert('🔌 Connection Failed', 'Cannot connect to server. Please check your connection.', 'error');
    return;
  }



  setLoading(true);



  try {

    // ✅ STEP 1: Check if visitor already exists

    const exists = await checkVisitorExists(phone);



    if (exists) {

      showAlert(
        '🔄 Already Registered',
        'This visitor is already registered. Please check the details or contact support.',
        'warning'
      );

      setLoading(false);

      return; // ⛔ STOP here — no POST call

    }



    // ✅ STEP 2: Safe to create new visitor - Using exact web admin logic
    const leadData = {
      full_name: fullName,
      email: email.trim() || null,
      phone,
      organization: organization.trim() || null,
      designation: designation.trim() || null,
      city: city.trim() || null,
      country: country.trim() || null,
      interests: interests.trim() || null,
      notes: notes.trim() || null,
      follow_up_date: followUpDate, // Send as YYYY-MM-DD format like web admin
      employee_id: user.id,
    };
    
    // Process data using exact web admin logic
    const processedData = processLeadData(leadData);
    
    console.log('Mobile lead data (raw):', JSON.stringify(leadData, null, 2));
    console.log('Mobile lead data (processed):', JSON.stringify(processedData, null, 2));
    console.log('API URL:', API_URL);

    const response = await fetch(API_URL, {

      method: 'POST',

      headers: {

        'Content-Type': 'application/json',

      },

      body: JSON.stringify(processedData),

    });

    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);
    
    const data = await response.json();
    console.log('Response data:', data);



    if (response.status === 201) {

      showAlert('✅ Visitor Registered!', 'New visitor has been successfully added to the system!', 'success', 'check-with-sparkles');

      setFullName('');

      setEmail('');

      setPhone('');

      setOrganization('');

      setDesignation('');

      setCity('');

      setCountry('');

      setInterests('');

      setNotes('');

      setFollowUpDate('');

    } else {

      showAlert('❌ Registration Failed', data.error || 'Registration failed', 'error');

    }

  } catch (error: any) {
    console.error('❌ Submission error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('❌ Error details:', {
      message: errorMessage,
      stack: error.stack,
      url: API_URL,
      timestamp: new Date().toISOString()
    });
    showAlert('🔥 Network Error', `Failed to connect: ${errorMessage}. Please check if backend is running on ${API_URL}`, 'error', 'bounce');
  } finally {
    setLoading(false);
  }

};





  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <View style={styles.header}>
          <View style={styles.logoBox}>
            <Text style={styles.logo}>+</Text>
          </View>
          <Text style={styles.title}>Visitor Registration</Text>
          <View style={styles.userInfo}>
            <Text style={styles.userLabel}>Registered by</Text>
            <Text style={styles.userName}>{user.full_name}</Text>
          </View>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📱 Phone Verification</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Phone Number *</Text>
              <TouchableWithoutFeedback onPress={handleOutsidePress}>
                <View style={styles.phoneInputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter visitor's phone number"
                    value={phone}
                    onChangeText={handlePhoneChange}
                    keyboardType="phone-pad"
                    placeholderTextColor="#9ca3af"
                    onFocus={() => {
                      if (suggestions.length > 0) {
                        setShowSuggestions(true);
                      }
                    }}
                  />

                  {phoneChecked && (
                    <Text style={styles.checkedIndicator}>Visitor verified</Text>
                  )}
                </View>
              </TouchableWithoutFeedback>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>👤 Visitor Information</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Full Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter visitor's full name"
                value={fullName}
                onChangeText={setFullName}
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter visitor's email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#9ca3af"
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Professional Details</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Organization</Text>
              <TextInput
                style={styles.input}
                placeholder="Company name"
                value={organization}
                onChangeText={setOrganization}
                placeholderTextColor="#d1d5db"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Designation</Text>
              <TextInput
                style={styles.input}
                placeholder="Job title"
                value={designation}
                onChangeText={setDesignation}
                placeholderTextColor="#d1d5db"
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location</Text>
            
            <View style={styles.row}>
              <View style={[styles.inputContainer, styles.halfWidth]}>
                <Text style={styles.inputLabel}>City</Text>
                <TextInput
                  style={styles.input}
                  placeholder="New York"
                  value={city}
                  onChangeText={setCity}
                  placeholderTextColor="#d1d5db"
                />
              </View>

              <View style={[styles.inputContainer, styles.halfWidth]}>
                <Text style={styles.inputLabel}>Country</Text>
                <TextInput
                  style={styles.input}
                  placeholder="USA"
                  value={country}
                  onChangeText={setCountry}
                  placeholderTextColor="#d1d5db"
                />
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Additional Information</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Interests *</Text>
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={handleInterestsDropdownToggle}
                activeOpacity={0.7}
              >
                <Text style={[styles.dropdownText, !interests && { color: '#9ca3af' }]}>
                  {interests || 'Select interest level...'}
                </Text>
                <Text style={styles.dropdownArrow}>▼</Text>
              </TouchableOpacity>
              
              {showInterestsDropdown && (
                <View style={styles.dropdownContainer}>
                  {interestsOptions.map((option) => (
                    <TouchableOpacity
                      key={option}
                      style={styles.dropdownOption}
                      onPress={() => handleInterestsSelect(option)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.dropdownOptionText}>{option}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Notes</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Any additional information"
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={3}
                placeholderTextColor="#d1d5db"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Follow-up Date *</Text>
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                value={followUpDate}
                onChangeText={handleDateChange}
                keyboardType="numeric"
                maxLength={10}
                placeholderTextColor="#9ca3af"
              />
              <View style={styles.quickDateButtons}>
                <TouchableOpacity
                  style={styles.quickDateButton}
                  onPress={() => handleQuickDateSelect(1)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.quickDateButtonText}>Tomorrow</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.quickDateButton}
                  onPress={() => handleQuickDateSelect(7)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.quickDateButtonText}>Next Week</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.quickDateButton}
                  onPress={() => handleQuickDateSelect(30)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.quickDateButtonText}>Next Month</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.9}
          >
            <Text style={styles.submitButtonText}>
              {loading ? 'Registering Visitor...' : 'Register Visitor'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.logoutButton}
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.8}
          >
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Floating Suggestions Overlay */}
      {showSuggestions && (
        <TouchableWithoutFeedback onPress={handleOutsidePress}>
          <View style={styles.overlayContainer}>
            <View style={styles.suggestionsContainer}>
              {loadingSuggestions ? (
                <View style={styles.suggestionItem}>
                  <Text style={styles.moreText}>Loading...</Text>
                </View>
              ) : (
                <ScrollView 
                  style={{ maxHeight: 220 }}
                  showsVerticalScrollIndicator={true}
                >
                  {suggestions.slice(0, 4).map((item, index) => {
                    const isExactMatch = item.match_priority === 1;
                    return (
                      <TouchableOpacity
                        key={item.id}
                        style={[
                          styles.suggestionItem,
                          index === 0 && styles.firstSuggestionItem,
                          index === Math.min(suggestions.length - 1, 3) && styles.lastSuggestionItem,
                          isExactMatch && styles.exactMatchItem
                        ]}
                        onPress={() => handleSuggestionPress(item)}
                        activeOpacity={0.3}
                        pressRetentionOffset={{ top: 20, bottom: 20, left: 20, right: 20 }}
                      >
                        <Text style={styles.phoneText}>{item.phone}</Text>
                        <Text style={styles.nameText}>{item.full_name}</Text>
                      </TouchableOpacity>
                    );
                  })}
                  {suggestions.length > 4 && (
                    <View style={styles.listFooter}>
                      <Text style={styles.moreText}>
                        {suggestions.length - 4} more matches available
                      </Text>
                    </View>
                  )}
                </ScrollView>
              )}
            </View>
          </View>
        </TouchableWithoutFeedback>
      )}
      
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

}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafb',
  },

  scrollContainer: {
    flexGrow: 1,
    padding: 16,
    paddingTop: 18,
  },

  /* ================= HEADER ================= */

  header: {
    alignItems: 'center',
    marginBottom: 26,
    paddingHorizontal: 6,
  },

  logoBox: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 7,
    elevation: 5,
  },

  logo: {
    fontSize: 30,
    color: '#ffffff',
    fontWeight: '800',
  },

  title: {
    fontSize: 27,
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: 13,
    letterSpacing: -0.7,
  },

  userInfo: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 10,
    marginTop: 11,
    borderWidth: 1,
    borderColor: '#e0e7ff',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },

  userLabel: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '600',
    letterSpacing: 0.2,
  },

  userName: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '800',
    letterSpacing: -0.2,
    marginTop: 2,
  },

  /* ================= FORM ================= */

  formContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 13,
    padding: 19,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f0f4f8',
  },

  section: {
    marginBottom: 22,
  },

  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: 13,
    letterSpacing: -0.2,
  },

  inputContainer: {
    marginBottom: 15,
  },

  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 6,
    letterSpacing: -0.1,
  },

  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 9,
    paddingHorizontal: 13,
    paddingVertical: 11,
    fontSize: 15,
    color: '#1f2937',
    fontWeight: '500',
  },

  phoneInputWrapper: {
    position: 'relative',
  },

  /* ================= AUTOCOMPLETE ================= */

  overlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9998,
  },

  suggestionsContainer: {
    position: 'absolute',
    top: 240,
    left: 16,
    right: 16,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 10,
    zIndex: 9999,
    maxHeight: 220,
  },

  suggestionItem: {
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    backgroundColor: '#ffffff',
  },

  firstSuggestionItem: {
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },

  lastSuggestionItem: {
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    borderBottomWidth: 0,
  },

  phoneText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1f2937',
    letterSpacing: 0.1,
  },

  nameText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#6b7280',
    marginTop: 2,
  },

  exactMatchItem: {
    backgroundColor: '#f0f4f8',
  },

  listFooter: {
    paddingVertical: 7,
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },

  moreText: {
    fontSize: 11,
    color: '#9ca3af',
  },

  /* ================= DROPDOWN ================= */

  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 9,
    paddingHorizontal: 13,
    paddingVertical: 11,
    minHeight: 48,
  },

  dropdownText: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '500',
  },

  dropdownArrow: {
    fontSize: 10,
    color: '#9ca3af',
    fontWeight: '800',
  },

  dropdownContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 9,
    marginTop: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 7,
    elevation: 4,
    zIndex: 1000,
  },

  dropdownOption: {
    paddingVertical: 10,
    paddingHorizontal: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    backgroundColor: '#ffffff',
  },

  dropdownOptionText: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '500',
  },

  /* ================= STATUS ================= */

  checkedIndicator: {
    color: '#10b981',
    fontSize: 10,
    fontWeight: '800',
    marginTop: 5,
  },

  /* ================= TEXT AREAS ================= */

  textArea: {
    height: 88,
    textAlignVertical: 'top',
    paddingVertical: 10,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  halfWidth: {
    width: '48%',
  },

  /* ================= QUICK DATE BUTTONS ================= */

  quickDateButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 9,
    gap: 7,
  },

  quickDateButton: {
    flex: 1,
    backgroundColor: '#f0f4f8',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 9,
    alignItems: 'center',
  },

  quickDateButtonText: {
    fontSize: 10,
    color: '#4b5563',
    fontWeight: '800',
  },

  /* ================= BUTTONS ================= */

  submitButton: {
    backgroundColor: '#2563eb',
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 26,
    marginBottom: 11,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.23,
    shadowRadius: 8,
    elevation: 4,
  },

  submitButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: -0.2,
  },

  buttonDisabled: {
    opacity: 0.65,
  },

  logoutButton: {
    alignItems: 'center',
    marginTop: 8,
    backgroundColor: '#f9fafb',
    paddingVertical: 11,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },

  logoutButtonText: {
    color: '#6b7280',
    fontSize: 14,
    fontWeight: '700',
  },
});


