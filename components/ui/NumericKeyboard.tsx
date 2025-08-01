import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface NumericKeyboardProps {
  onNumberPress: (num: string) => void;
  onBackspace: () => void;
  onClear: () => void;
}

export const NumericKeyboard: React.FC<NumericKeyboardProps> = ({
  onNumberPress,
  onBackspace,
  onClear,
}) => {
  const keys = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['C', '0', '⌫'],
  ];

  const handleKeyPress = (key: string) => {
    if (key === 'C') {
      onClear();
    } else if (key === '⌫') {
      onBackspace();
    } else {
      onNumberPress(key);
    }
  };

  const getKeyStyle = (key: string) => {
    if (key === 'C') {
      return 'bg-red-500';
    } else if (key === '⌫') {
      return 'bg-gray-500';
    } else {
      return 'bg-blue-500';
    }
  };

  return (
    <View className="bg-white dark:bg-gray-800 p-4">
      {keys.map((row, rowIndex) => (
        <View key={rowIndex} className="flex-row justify-between mb-3">
          {row.map((key) => (
            <TouchableOpacity
              key={key}
              onPress={() => handleKeyPress(key)}
              className={`${getKeyStyle(key)} rounded-2xl shadow-lg flex-1 mx-1 h-16 items-center justify-center`}
              activeOpacity={0.7}
            >
              <Text className="text-white text-2xl font-bold">
                {key}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      ))}
    </View>
  );
}; 