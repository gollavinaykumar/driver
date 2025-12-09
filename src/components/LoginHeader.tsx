import React from 'react';
import { View, Image, StyleSheet, StatusBar } from 'react-native';

const LoginHeader = () => {
  return (
    <View style={styles.header}>
      <StatusBar backgroundColor="#2c3e50" barStyle="light-content" />

      {/* Left Side - Logo */}
      <View style={styles.logoContainer}>
        <Image
          source={require('../assets/images/goodseva-logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    height: 60,
  },
  logoContainer: {
    flex: 1,
  },
  logo: {
    width: 100,
    height: 30,
  },
});

export default LoginHeader;
