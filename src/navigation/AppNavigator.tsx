// src/navigation/AppNavigator.tsx
import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ActivityIndicator, View, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import LoginScreen from '../screens/LoginScreen';
import TabNavigator from './TabNavigator';

import Header from '../components/Header';
import { getSocket } from '../utils/socket';

// Define your root stack param list
export type RootStackParamList = {
  Login: undefined;
  Main: undefined;
  TabNavigator: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState<string | null>(null);

  const updateUserToken = (token: string | null) => {
    setUserToken(token);
  };

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        console.log('Token found on app start:', token);
        setUserToken(token);
      } catch (error) {
        console.error('Error checking login status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkLoginStatus();
  }, []);

  // When userToken changes, attach it to socket and connect
  useEffect(() => {
    const socket = getSocket();
    if (userToken) {
      socket.auth = { token: userToken }; // raw token, no Bearer
      if (!socket.connected) {
        socket.connect();
      }
    } else {
      if (socket.connected) {
        socket.disconnect();
      }
    }
  }, [userToken]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={{ marginTop: 10 }}>Loading...</Text>
      </View>
    );
  }

  console.log('Rendering navigator with userToken:', userToken);

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        {userToken ? (
          <Stack.Screen name="TabNavigator">
            {props => (
              <>
                <Header />
                <TabNavigator {...props} updateUserToken={updateUserToken} />
              </>
            )}
          </Stack.Screen>
        ) : (
          <Stack.Screen name="Login">
            {props => (
              <>
                <LoginScreen {...props} updateUserToken={updateUserToken} />
              </>
            )}
          </Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
