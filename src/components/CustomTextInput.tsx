// src/components/CustomTextInput.tsx
import React from 'react';
import { TextInput, StyleSheet, TextInputProps } from 'react-native';

interface CustomTextInputProps extends TextInputProps {
  variant?: 'default' | 'multiline';
}

const CustomTextInput: React.FC<CustomTextInputProps> = ({ 
  style, 
  variant = 'default',
  ...props 
}) => {
  const inputStyle = variant === 'multiline' ? styles.multilineInput : styles.input;
  
  return (
    <TextInput
      style={[inputStyle, style]}
      placeholderTextColor="#94a3b8"
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  input: {
    height: 50,
    borderColor: '#cbd5e1',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    backgroundColor: 'white',
    color: '#1e293b',
    fontSize: 16,
  },
  multilineInput: {
    minHeight: 80,
    borderColor: '#cbd5e1',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: 'white',
    color: '#1e293b',
    fontSize: 16,
    textAlignVertical: 'top',
  },
});

export default CustomTextInput;