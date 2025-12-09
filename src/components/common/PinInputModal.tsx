// src/components/common/PinInputModal.tsx
import React from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';

interface PinInputModalProps {
  visible: boolean;
  title: string;
  onClose: () => void;
  onSubmit: () => void;
  pin: string;
  onPinChange: (pin: string) => void;
  pinLabel: string;
  pinHelpText: string;
  showPin: boolean;
  file: any | null;
  onFilePick: () => void;
  onFileRemove: () => void;
  fileLabel: string;
  fileHelpText: string;
  submitText: string;
}

export default function PinInputModal({
  visible,
  title,
  onClose,
  onSubmit,
  pin,
  onPinChange,
  pinLabel,
  pinHelpText,
  showPin,
  submitText,
}: PinInputModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{title}</Text>

          <ScrollView>
            {/* PIN Input */}
            {showPin && (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>{pinLabel} *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter PIN"
                  value={pin}
                  onChangeText={onPinChange}
                  secureTextEntry
                />
                <Text style={styles.helpText}>{pinHelpText}</Text>
              </View>
            )}

            {/* Buttons */}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={onClose}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={onSubmit}
              >
                <Text style={styles.confirmButtonText}>{submitText}</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  helpText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  uploadButton: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#f9fafb',
    alignItems: 'center',
  },
  uploadButtonText: {
    color: '#3b82f6',
    fontWeight: '500',
  },
  removeFileText: {
    color: '#dc2626',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  confirmButton: {
    backgroundColor: '#007bff',
  },
  cancelButtonText: {
    color: '#333',
    fontWeight: '600',
  },
  confirmButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});
