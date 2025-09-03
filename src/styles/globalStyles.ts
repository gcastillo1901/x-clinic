// src/styles/globalStyles.ts
import { StyleSheet, Platform } from 'react-native';

export const globalStyles = StyleSheet.create({
  // TextInput base styles
  textInput: {
    height: 50,
    borderColor: '#cbd5e1',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    backgroundColor: 'white',
    fontSize: 16,
    color: '#1e293b',
    includeFontPadding: false,
  },
  
  // TextInput multiline
  textInputMultiline: {
    minHeight: 80,
    borderColor: '#cbd5e1',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: 'white',
    fontSize: 16,
    color: '#1e293b',
    includeFontPadding: false,
    textAlignVertical: 'top',
  },

  // Picker container
  pickerContainer: {
    borderColor: '#cbd5e1',
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: 'white',
    overflow: 'hidden',
    height: Platform.OS === 'ios' ? 180 : 50,
  },

  // Picker styles
  picker: {
    height: Platform.OS === 'ios' ? 180 : 50,
    backgroundColor: 'transparent',
    color: '#1e293b',
  },

  // Picker item (iOS)
  pickerItem: {
    height: 180,
    fontSize: 16,
    color: '#1e293b',
  },
});

// Common colors
export const colors = {
  text: '#1e293b',
  placeholder: '#94a3b8',
  border: '#cbd5e1',
  background: 'white',
  primary: '#3b82f6',
  error: '#ef4444',
  success: '#10b981',
  warning: '#f59e0b',
};

// Default TextInput props
export const defaultTextInputProps = {
  placeholderTextColor: colors.placeholder,
  selectionColor: colors.primary,
};