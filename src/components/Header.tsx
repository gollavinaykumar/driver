import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { useDriverStore } from '../store/DriverStore';
import Icon from 'react-native-vector-icons/MaterialIcons';

const Header = () => {
  const driver = useDriverStore(state => state.driver);

  // Fallback data if driver is not available
  const driverName = driver?.name || 'Driver';
  const driverImage = driver?.image;
  const isDriverVerified = driver?.isDriverVerified;

  const handleProfilePress = () => {
    // Navigate to profile screen or show profile modal
    console.log('Profile pressed');
  };

  return (
    <View style={styles.header}>
      <StatusBar backgroundColor="#3b82f6" barStyle="light-content" />

      <View style={styles.logoContainer}>
        <Image
          source={require('../assets/images/goodseva-logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* Right Side - Driver Info with Login/Profile Button */}
      <TouchableOpacity
        style={styles.profileButton}
        onPress={handleProfilePress}
        activeOpacity={0.7}
      >
        {driver && (
          // Show driver info when logged in
          <View style={styles.driverContainer}>
            <View style={styles.driverInfo}>
              <Text style={styles.driverName} numberOfLines={1}>
                {driverName}
              </Text>
              <View style={styles.statusContainer}>
                <Text style={styles.driverLabel}>Driver</Text>
                {isDriverVerified && (
                  <View style={styles.verifiedBadge}>
                    <Icon name="verified" size={12} color="#fff" />
                  </View>
                )}
              </View>
            </View>
            <View style={styles.avatarContainer}>
              {driverImage ? (
                <Image
                  source={{ uri: driverImage }}
                  style={styles.driverImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>
                    {driverName.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
              <View style={styles.onlineIndicator} />
            </View>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    height: 70,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  logoContainer: {
    flex: 1,
  },
  logo: {
    width: 120,
    height: 35,
  },
  profileButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  driverContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  driverInfo: {
    alignItems: 'flex-end',
    marginRight: 10,
    maxWidth: 120,
  },
  driverName: {
    color: '#1f2937',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  driverLabel: {
    color: '#6b7280',
    fontSize: 11,
    fontWeight: '500',
  },
  verifiedBadge: {
    backgroundColor: '#10b981',
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
  },
  driverImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#3b82f6',
  },
  avatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#dbeafe',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10b981',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  loginContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  loginText: {
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default Header;
