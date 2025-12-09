// App.tsx
import 'react-native-gesture-handler';
import React, { useState } from 'react';
import { StatusBar, View } from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { SocketProvider } from './src/utils/SocketContext';
import SplashScreen from './src/components/SplashScreen';

function MainApp() {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        flex: 1,
        paddingTop: insets.top,
        backgroundColor: 'black',
      }}
    >
      <SocketProvider>
        <AppNavigator />
      </SocketProvider>
    </View>
  );
}

export default function App() {
  const [isSplashVisible, setIsSplashVisible] = useState(true);

  const handleSplashComplete = () => {
    setIsSplashVisible(false);
  };

  if (isSplashVisible) {
    return (
      <SafeAreaProvider>
        <StatusBar hidden />
        <SplashScreen onAnimationComplete={handleSplashComplete} />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor="black" />
      <MainApp />
    </SafeAreaProvider>
  );
}
