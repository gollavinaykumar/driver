// src/screens/ProfileScreen.tsx
import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDriverStore } from '../store/DriverStore';
import { useVehicleStore } from '../store/VehicleStore';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { getDriverById } from '../services/apiService';
import { getUserData } from '../utils/getUserData';
import { logger } from '../utils/logger';

import { SocketContext } from '../utils/SocketContext';

interface ProfileScreenProps {
  updateUserToken: (token: string | null) => void;
}

export default function ProfileScreen({ updateUserToken }: ProfileScreenProps) {
  const driver = useDriverStore(state => state.driver);
  const vehicle = useVehicleStore(state => state.getVehicle());
  const setDriver = useDriverStore(state => state.setDriver);
  const [loading, setLoading] = useState(!driver);

  const socketContext = useContext(SocketContext);
  const socket = socketContext?.socket;

  useEffect(() => {
    const loadDriverData = async () => {
      if (driver) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const userData = await getUserData();
        if (userData?.userId) {
          const driverData = await getDriverById(userData.userId);
          setDriver(driverData);
        }
      } catch (error) {
        logger.error('Error loading driver data:', error);
        Alert.alert('Error', 'Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    loadDriverData();
  }, [driver, setDriver]);

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            await AsyncStorage.removeItem('authToken');
            await AsyncStorage.removeItem('userData');
            updateUserToken(null);
            socket?.disconnect();
            logger.log('Logout successful');
          } catch (error) {
            logger.error('Error during logout:', error);
            Alert.alert('Error', 'Failed to logout');
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  if (!driver) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Unable to load profile data</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={async () => {
            setLoading(true);
            try {
              const userData = await getUserData();
              if (userData?.userId) {
                const driverData = await getDriverById(userData.userId);
                setDriver(driverData);
              }
            } catch (err) {
              logger.error('Error reloading driver:', err);
              Alert.alert('Error', 'Failed to load profile');
            } finally {
              setLoading(false);
            }
          }}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Card */}
      <View style={styles.card}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            {driver.image ? (
              <Image source={{ uri: driver.image }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {driver.name?.charAt(0) || 'D'}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.name}>{driver.name || 'Driver User'}</Text>
            <Text style={styles.email}>
              {driver.email || 'driver@example.com'}
            </Text>

            {/* Status Tags */}
            <View style={styles.tagsContainer}>
              <View
                style={[
                  styles.tag,
                  driver.isDriverVerified
                    ? styles.verifiedTag
                    : styles.unverifiedTag,
                ]}
              >
                <Text style={styles.tagText}>
                  {driver.isDriverVerified ? 'Verified ' : 'Not Verified '}
                </Text>
              </View>
              {driver.isDriverActive && (
                <View style={[styles.tag, styles.activeTag]}>
                  <Text style={styles.tagText}>Active</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Contact & Info Section */}
        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Ionicons name="call-outline" size={20} color="#6b7280" />
              <Text style={styles.infoText} numberOfLines={1}>
                {driver.phone || 'Not provided'}
              </Text>
            </View>

            {driver.contact2 && (
              <View style={styles.infoItem}>
                <Ionicons name="call-outline" size={20} color="#6b7280" />
                <Text style={styles.infoText} numberOfLines={1}>
                  {driver.contact2}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Icon name="badge" size={20} color="#6b7280" />
              <Text style={styles.infoText}>
                {driver.licenseUrl
                  ? 'License uploaded '
                  : 'No license provided'}
              </Text>
            </View>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="location-outline" size={20} color="#6b7280" />
            <Text style={styles.infoText} numberOfLines={1}>
              {driver.currentLocation?.address || 'Location not set'}
            </Text>
          </View>
        </View>

        {/* Vehicle Information */}
        {driver.vehicleId && vehicle && (
          <View style={styles.vehicleSection}>
            <View style={styles.sectionHeader}>
              <FontAwesome5 name="truck" size={18} color="#374151" />
              <Text style={styles.sectionTitle}>Vehicle Details</Text>
            </View>

            <View style={styles.vehicleDetails}>
              <View style={styles.vehicleRow}>
                <Text style={styles.vehicleLabel}>Vehicle:</Text>
                <Text style={styles.vehicleValue}>
                  {vehicle.model || 'N/A'}
                </Text>
              </View>
              <View style={styles.vehicleRow}>
                <Text style={styles.vehicleLabel}>Type:</Text>
                <Text style={styles.vehicleValue}>{vehicle.make || 'N/A'}</Text>
              </View>
              <View style={styles.vehicleRow}>
                <Text style={styles.vehicleLabel}>Capacity:</Text>
                <Text style={styles.vehicleValue}>
                  {vehicle.capacity || 'N/A'} Tons
                </Text>
              </View>
              <View style={styles.vehicleRow}>
                <Text style={styles.vehicleLabel}>Registration:</Text>
                <Text style={styles.vehicleValue}>
                  {vehicle.registrationNumber || 'N/A'}
                </Text>
              </View>
            </View>
          </View>
        )}
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="#fff" />
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  errorText: {
    fontSize: 16,
    color: '#dc2626',
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  verifiedTag: {
    backgroundColor: '#d1fae5',
  },
  unverifiedTag: {
    backgroundColor: '#fee2e2',
  },
  activeTag: {
    backgroundColor: '#dbeafe',
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
  },
  infoSection: {
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 20,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  infoItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  vehicleSection: {
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  vehicleDetails: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
  },
  vehicleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  vehicleLabel: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  vehicleValue: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '600',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#dc2626',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
