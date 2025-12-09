// src/components/common/FileUploadButton.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface FileUploadButtonProps {
  file: any | null;
  onPress: () => void;
  onRemove: () => void;
}

export default function FileUploadButton({
  file,
  onPress,
  onRemove,
}: FileUploadButtonProps) {
  return (
    <View style={styles.container}>
      {file ? (
        <View style={styles.fileContainer}>
          <Text style={styles.fileName} numberOfLines={1}>
            {file.name || 'Selected File'}
          </Text>
          <TouchableOpacity onPress={onRemove} style={styles.removeButton}>
            <Icon name="close" size={16} color="#dc2626" />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={styles.uploadButton} onPress={onPress}>
          <Icon name="upload" size={20} color="#3b82f6" />
          <Text style={styles.uploadText}>Click to Upload</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#f9fafb',
  },
  uploadText: {
    marginLeft: 8,
    color: '#3b82f6',
    fontWeight: '500',
  },
  fileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#f9fafb',
  },
  fileName: {
    flex: 1,
    color: '#1f2937',
    marginRight: 8,
  },
  removeButton: {
    padding: 4,
  },
});
