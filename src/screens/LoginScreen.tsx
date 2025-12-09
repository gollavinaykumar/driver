import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
  Modal,
  Animated,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { checkUser, requestOtp, verifyOtp } from '../services/apiService';
import { getBackendAPI } from '../utils/getAPI';

interface LoginScreenProps {
  updateUserToken: (token: string | null) => void;
}

type LoginMethod = 'password' | 'otp';

export default function LoginScreen({ updateUserToken }: LoginScreenProps) {
  const [activeTab, setActiveTab] = useState<LoginMethod>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const [tabPosition] = useState(new Animated.Value(0));

  const handleTabPress = (tab: LoginMethod) => {
    setActiveTab(tab);

    Animated.timing(tabPosition, {
      toValue: tab === 'password' ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setLoading(true);

    const API_KEY = getBackendAPI();
    console.log('API_KEY =', API_KEY);
    console.log('Final URL =', `${API_KEY}/login`);
    try {
      const res = await checkUser({
        email,
        password,
      });

      console.log('response from server', res);

      if (res.type === 'DRIVER') {
        updateUserToken(res.token);
      }

      await AsyncStorage.setItem('authToken', res.token);
      await AsyncStorage.setItem('userData', JSON.stringify(res));

      console.log('Login successful, updating user token');
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const validateMobileNumber = (number: string): boolean => {
    const mobileRegex = /^[6-9]\d{9}$/;
    return mobileRegex.test(number);
  };

  const handleSendOtp = async () => {
    const cleanMobile = mobileNumber.replace(/\D/g, '');

    if (!cleanMobile) {
      Alert.alert('Error', 'Please enter mobile number');
      return;
    }

    if (!validateMobileNumber(cleanMobile)) {
      Alert.alert(
        'Error',
        'Please enter a valid 10-digit Indian mobile number',
      );
      return;
    }

    setOtpLoading(true);

    try {
      const response = await requestOtp(mobileNumber);

      console.log('OTP sent successfully:', response);

      setOtpSent(true);
      setShowOtpModal(true);
      Alert.alert('Success', 'OTP sent to your mobile number');
    } catch (error) {
      console.error('Send OTP error:', error);
      Alert.alert('Error', 'Failed to send OTP. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit OTP');
      return;
    }

    setOtpLoading(true);

    try {
      const response = await verifyOtp(mobileNumber, otp);

      console.log('OTP verified successfully:', response);

      if (response.type === 'DRIVER') {
        await AsyncStorage.setItem('authToken', response.token);
        await AsyncStorage.setItem('userData', JSON.stringify(response));
        updateUserToken(response.token);

        setShowOtpModal(false);
        Alert.alert('Success', 'Login successful!');
      } else {
        Alert.alert('Error', 'Invalid OTP. Please try again.');
      }
    } catch (error) {
      console.error('Verify OTP error:', error);
      Alert.alert('Error', 'OTP verification failed. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleMobileChange = (text: string) => {
    const numbersOnly = text.replace(/\D/g, '').slice(0, 10);
    setMobileNumber(numbersOnly);
  };

  const indicatorTranslateX = tabPosition.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 175],
  });

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      {/* Header */}
      <View style={styles.header}>
        <Image
          source={require('../assets/images/goodseva-logo.png')}
          style={styles.companyIcon}
        />
        <Text style={styles.welcomeText}>Welcome Back!</Text>
        <Text style={styles.subtitle}>Sign in to continue your journey</Text>
      </View>

      {/* Tabs Container */}
      <View style={styles.tabsContainer}>
        <View style={styles.tabsHeader}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'password' && styles.activeTab]}
            onPress={() => handleTabPress('password')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'password' && styles.activeTabText,
              ]}
            >
              🔐 Password
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'otp' && styles.activeTab]}
            onPress={() => handleTabPress('otp')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'otp' && styles.activeTabText,
              ]}
            >
              📱 OTP Login
            </Text>
          </TouchableOpacity>
        </View>

        {/* Animated Indicator */}
        <Animated.View
          style={[
            styles.tabIndicator,
            {
              transform: [{ translateX: indicatorTranslateX }],
            },
          ]}
        />
      </View>

      {/* Tab Content */}
      <View style={styles.tabContent}>
        {activeTab === 'password' ? (
          // Password Login Form
          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                editable={!loading}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                editable={!loading}
              />
            </View>

            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.loginButton,
                loading && styles.loginButtonDisabled,
              ]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.loginButtonText}>Sign In</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Mobile Number</Text>
              <View style={styles.mobileInputContainer}>
                <View style={styles.countryCodeContainer}>
                  <Image
                    source={{ uri: 'https://flagcdn.com/w20/in.png' }}
                    style={styles.flagIcon}
                  />
                  <Text style={styles.countryCode}>+91</Text>
                </View>
                <TextInput
                  style={styles.mobileTextInput}
                  placeholder="Enter 10-digit mobile number"
                  value={mobileNumber}
                  onChangeText={handleMobileChange}
                  keyboardType="phone-pad"
                  maxLength={10}
                  editable={!otpLoading}
                />
              </View>
            </View>

            <TouchableOpacity
              style={[styles.otpButton, otpLoading && styles.otpButtonDisabled]}
              onPress={handleSendOtp}
              disabled={otpLoading}
            >
              {otpLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <View style={styles.otpButtonContent}>
                  <Text style={styles.otpButtonText}>
                    {otpSent ? '🔁 Resend OTP' : '📱 Send OTP'}
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            <View style={styles.otpNote}>
              <Text style={styles.otpNoteText}>
                You'll receive a 6-digit OTP on this number
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* OTP Verification Modal */}
      <Modal
        visible={showOtpModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowOtpModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Enter OTP</Text>
              <Text style={styles.modalSubtitle}>
                We've sent a 6-digit OTP to {'\n'}+91{mobileNumber}
              </Text>
            </View>

            <View style={styles.otpInputContainer}>
              <TextInput
                style={styles.otpInput}
                placeholder="000000"
                value={otp}
                onChangeText={setOtp}
                keyboardType="number-pad"
                maxLength={6}
                textAlign="center"
                editable={!otpLoading}
                placeholderTextColor="#9ca3af"
              />
            </View>

            <TouchableOpacity style={styles.resendContainer}>
              <Text style={styles.resendText}>
                Didn't receive OTP?{' '}
                <Text style={styles.resendLink}>Resend</Text>
              </Text>
            </TouchableOpacity>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowOtpModal(false);
                  setOtp('');
                }}
                disabled={otpLoading}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.verifyButton,
                  otpLoading && styles.verifyButtonDisabled,
                ]}
                onPress={handleVerifyOtp}
                disabled={otpLoading}
              >
                {otpLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.verifyButtonText}>Verify & Login</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 20,
  },
  companyIcon: {
    width: 200,
    height: 60,
    marginBottom: 16,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  // Tabs Styles
  tabsContainer: {
    marginBottom: 30,
  },
  tabsHeader: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 4,
    marginBottom: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  activeTabText: {
    color: '#007bff',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: -2,
    left: 4,
    width: 175,
    height: 3,
    backgroundColor: '#007bff',
    borderRadius: 2,
  },
  tabContent: {
    minHeight: 300,
  },
  formContainer: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#1f2937',
  },
  // Mobile Input Styles
  mobileInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  countryCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#f8fafc',
    borderRightWidth: 1,
    borderRightColor: '#d1d5db',
  },
  flagIcon: {
    width: 20,
    height: 15,
    marginRight: 8,
    borderRadius: 2,
  },
  countryCode: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  mobileTextInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: '#1f2937',
  },
  // Button Styles
  loginButton: {
    backgroundColor: '#d52a2aff',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#007bff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonDisabled: {
    backgroundColor: '#93c5fd',
    shadowOpacity: 0,
    elevation: 0,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  otpButton: {
    backgroundColor: '#d52a2aff',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  otpButtonDisabled: {
    backgroundColor: '#a7f3d0',
    shadowOpacity: 0,
    elevation: 0,
  },
  otpButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  otpButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  // Additional Styles
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: -8,
  },
  forgotPasswordText: {
    color: '#007bff',
    fontSize: 14,
    fontWeight: '600',
  },
  otpNote: {
    alignItems: 'center',
    marginTop: -8,
  },
  otpNoteText: {
    color: '#6b7280',
    fontSize: 14,
    textAlign: 'center',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  otpInputContainer: {
    marginBottom: 16,
  },
  otpInput: {
    borderWidth: 2,
    borderColor: '#007bff',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 24,
    backgroundColor: '#fff',
    fontWeight: '700',
    color: '#1f2937',
    letterSpacing: 8,
  },
  resendContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  resendText: {
    fontSize: 14,
    color: '#6b7280',
  },
  resendLink: {
    color: '#007bff',
    fontWeight: '600',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  cancelButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  verifyButton: {
    backgroundColor: '#10b981',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  verifyButtonDisabled: {
    backgroundColor: '#a7f3d0',
    shadowOpacity: 0,
    elevation: 0,
  },
  verifyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
