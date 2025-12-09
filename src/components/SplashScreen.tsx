// src/components/SplashScreen.tsx
import React from 'react';
import { View, Image, StyleSheet, Animated } from 'react-native';

interface SplashScreenProps {
  onAnimationComplete: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onAnimationComplete }) => {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.delay(2000),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onAnimationComplete();
    });
  }, [fadeAnim, onAnimationComplete]);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.logoContainer}>
        <Image
          source={require('../assets/images/goodseva-logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        {/* <Animated.Text style={[styles.appName, { opacity: fadeAnim }]}>
          GoodSeva
        </Animated.Text> */}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007bff',
  },
});

export default SplashScreen;
