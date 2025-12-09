// src/components/VehicleCard.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Vehicle {
  registrationNumber: string;
  make: string;
  model: string;
}

interface VehicleCardProps {
  vehicle: Vehicle | null;
}

export default function VehicleCard({ vehicle }: VehicleCardProps) {
  if (!vehicle) {
    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Vehicle Details</Text>
        <Text style={styles.noDataText}>No vehicle information available</Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Vehicle Details</Text>
      <View style={styles.cardContent}>
        <Text style={styles.infoText}>
          Registration No: {vehicle.registrationNumber}
        </Text>
        <Text style={styles.infoText}>Make: {vehicle.make}</Text>
        <Text style={styles.infoText}>Model: {vehicle.model}</Text>
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
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  cardContent: {
    gap: 6,
  },
  infoText: {
    fontSize: 14,
    color: '#1f2937',
  },
  noDataText: {
    fontSize: 14,
    color: '#6b7280',
    fontStyle: 'italic',
  },
});
