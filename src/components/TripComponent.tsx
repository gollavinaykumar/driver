// src/components/TripComponent.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Load {
  origin: {
    city: string;
    address: string;
  };
  destination: {
    city: string;
    address: string;
  };
  pickupWindowStart: string;
  deliveryWindowEnd: string;
}

interface TripComponentProps {
  load: Load;
  distance: string | null;
  duration: string | null;
  tripStatus: string;
}

export default function TripComponent({
  load,
  distance,
  duration,
  tripStatus,
}: TripComponentProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return '#d97706';
      case 'IN_PROGRESS':
        return '#2563eb';
      case 'COMPLETED':
        return '#059669';
      case 'CANCELLED':
        return '#dc2626';
      default:
        return '#6b7280';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>Trip Details</Text>
        <Text
          style={[styles.statusText, { color: getStatusColor(tripStatus) }]}
        >
          {tripStatus}
        </Text>
      </View>

      <View style={styles.cardContent}>
        <Text style={styles.routeText}>
          {load.origin.city} → {load.destination.city}
        </Text>
        <Text style={styles.secondaryText}>From: {load.origin.address}</Text>
        <Text style={styles.secondaryText}>To: {load.destination.address}</Text>
        <Text style={styles.secondaryText}>
          Load Pickup Date: {formatDate(load.pickupWindowStart)}
        </Text>
        <Text style={styles.secondaryText}>
          Load Drop Date: {formatDate(load.deliveryWindowEnd)}
        </Text>
        <Text style={styles.infoText}>
          Distance: {distance ?? 'Loading...'}
        </Text>
        <Text style={styles.infoText}>
          Estimated Time: {duration ?? 'Loading...'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    paddingBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  cardContent: {
    gap: 6,
  },
  routeText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 4,
  },
  secondaryText: {
    fontSize: 14,
    color: '#6b7280',
  },
  infoText: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '500',
  },
});
