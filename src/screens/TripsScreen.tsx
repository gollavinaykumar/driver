import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';

import { Trip } from '../types/TripInterface';
import { Load } from '../types/loadInterface';
import { useVehicleStore } from '../store/VehicleStore';
import { getTripsByVehicleId } from '../services/apiService';

export default function TripsScreen() {
  const vehicle = useVehicleStore(state => state.getVehicle());
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loads, setLoads] = useState<Load[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  console.log('📌 Current Vehicle:', vehicle);

  const fetchData = useCallback(async () => {
    if (!vehicle?.id) return;
    try {
      const allTrips = await getTripsByVehicleId(vehicle.id);
      setTrips(allTrips.trips || []);
      setLoads(allTrips.loads || []);
    } catch (err) {
      console.error('Error fetching trips:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [vehicle?.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const getLoad = (loadId: string) => loads.find(l => l.id === loadId);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return { bg: '#d97706', text: '#ffffff' };
      case 'IN_PROGRESS':
        return { bg: '#2563eb', text: '#ffffff' };
      case 'COMPLETED':
        return { bg: '#059669', text: '#ffffff' };
      default:
        return { bg: '#dc2626', text: '#ffffff' };
    }
  };

  const formatDate = (dateStr?: string) =>
    dateStr ? new Date(dateStr).toLocaleDateString() : 'Not set';

  if (loading) {
    if (vehicle == null) {
      setLoading(false);
    }
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading trips...</Text>
      </View>
    );
  }

  if (!trips.length || vehicle?.id === undefined) {
    return (
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.emptyContainer}
      >
        <View style={styles.emptyState}>
          <Text style={styles.emoji}>🚛</Text>
          <Text style={styles.emptyTitle}>No trips yet</Text>
          <Text style={styles.emptyText}>
            Your trip history will appear here once you start completing
            deliveries
          </Text>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Your Vehicle Trips</Text>
        <Text style={styles.subtitle}>
          {trips.length} trip{trips.length > 1 ? 's' : ''} found
        </Text>
      </View>

      <View style={styles.tripsList}>
        {trips.map(trip => {
          const load = getLoad(trip.loadId);
          if (!load) return null;

          const statusColors = getStatusColor(trip.status);

          return (
            <View key={trip.id} style={styles.tripCard}>
              <View style={styles.tripHeader}>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: statusColors.bg },
                  ]}
                >
                  <Text
                    style={[styles.statusText, { color: statusColors.text }]}
                  >
                    {trip.status.replace('_', ' ')}
                  </Text>
                </View>
                <View style={styles.dateBadge}>
                  <Text style={styles.dateText}>
                    {formatDate(load.createdAt)}
                  </Text>
                </View>
              </View>

              {/* Route information */}
              <View style={styles.routeSection}>
                <View style={styles.route}>
                  <View style={styles.cityPair}>
                    <Text style={styles.originCity}>{load.origin.city}</Text>
                    <Text style={styles.arrow}>→</Text>
                    <Text style={styles.destinationCity}>
                      {load.destination.city}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Dates timeline */}
              <View style={styles.datesSection}>
                <View style={styles.dateRow}>
                  <Text style={styles.dateLabel}>Pickup:</Text>
                  <Text style={styles.dateValue}>
                    {formatDate(load.pickupWindowStart)}
                  </Text>
                </View>
                <View style={styles.dateRow}>
                  <Text style={styles.dateLabel}>Delivery:</Text>
                  <Text style={styles.dateValue}>
                    {formatDate(load.deliveryWindowEnd)}
                  </Text>
                </View>
              </View>

              {/* Additional info */}
              <View style={styles.footer}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Distance:</Text>
                  <Text style={styles.infoValue}>
                    {trip?.distance || 'N/A'} Kms
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Cargo:</Text>
                  <Text style={styles.infoValue}>
                    {load.cargoType || 'General'}
                  </Text>
                </View>
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  tripsList: {
    padding: 16,
  },
  tripCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
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
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  dateBadge: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  dateText: {
    fontSize: 12,
    color: '#1e40af',
    fontWeight: '500',
  },
  routeSection: {
    marginBottom: 16,
  },
  route: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cityPair: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  originCity: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  arrow: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6b7280',
    marginHorizontal: 8,
  },
  destinationCity: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  datesSection: {
    marginBottom: 16,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateLabel: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  dateValue: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '600',
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  infoValue: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: '#fff',
    borderRadius: 20,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
});
