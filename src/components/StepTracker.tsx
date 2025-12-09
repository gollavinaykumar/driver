// src/components/StepTracker.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/AntDesign';

interface StepTrackerProps {
  pickedLoad: boolean;
  nearDrop: boolean;
  tripStatus: string;
}

export default function StepTracker({
  pickedLoad,
  nearDrop,
  tripStatus,
}: StepTrackerProps) {
  const steps = [
    { label: 'Collect Load' },
    { label: 'Trip is in progress' },
    { label: 'Drop Load' },
  ];

  const getStepStatus = (index: number) => {
    if (tripStatus === 'COMPLETED') return 'completed';

    if (index === 0) return pickedLoad ? 'completed' : 'active';
    if (index === 1)
      return pickedLoad && !nearDrop
        ? 'active'
        : nearDrop
        ? 'completed'
        : 'pending';
    if (index === 2) return nearDrop ? 'completed' : 'pending';
    return 'pending';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return { circle: '#10b981', text: '#059669' };
      case 'active':
        return { circle: '#3b82f6', text: '#2563eb' };
      default:
        return { circle: '#e5e7eb', text: '#6b7280' };
    }
  };

  return (
    <View style={styles.container}>
      {steps.map((step, index) => {
        const status = getStepStatus(index);
        const isLast = index === steps.length - 1;
        const colors = getStatusColor(status);

        return (
          <View key={index} style={styles.stepContainer}>
            {/* Step Circle */}
            <View style={styles.stepCircle}>
              <View
                style={[
                  styles.circle,
                  {
                    backgroundColor: colors.circle,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 3,
                    elevation: 3,
                  },
                ]}
              >
                {status === 'completed' ? (
                  <Icon name="checkcircle" size={20} color="#fff" />
                ) : (
                  <Text style={styles.circleText}>{index + 1}</Text>
                )}
              </View>
              <Text
                style={[styles.stepLabel, { color: colors.text }]}
                numberOfLines={2}
              >
                {step.label}
              </Text>
            </View>

            {/* Connector */}
            {!isLast && (
              <View style={styles.connectorContainer}>
                <View style={styles.connectorBackground} />
                <View
                  style={[
                    styles.connectorForeground,
                    {
                      backgroundColor:
                        status === 'completed' ? '#10b981' : 'transparent',
                      width: status === 'completed' ? '100%' : '0%',
                    },
                  ]}
                />
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 24,
    paddingHorizontal: 10,
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  stepCircle: {
    alignItems: 'center',
    width: 48,
    marginLeft: 30,
  },
  circle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  stepLabel: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  connectorContainer: {
    flex: 1,
    height: 4,
    marginHorizontal: 8,
    position: 'relative',
  },
  connectorBackground: {
    height: 4,
    backgroundColor: '#d1d5db',
    borderRadius: 2,
    width: '100%',
  },
  connectorForeground: {
    height: 4,
    borderRadius: 2,
    position: 'absolute',
    top: 0,
    left: 0,
  },
});
