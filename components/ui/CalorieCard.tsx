import { ThemedText } from '@/components/ThemedText';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface CalorieCardProps {
  date: string;
  target: number;
  consumed: number;
  isFasting?: boolean;
  isToday?: boolean;
  onPress?: () => void;
}

export const CalorieCard: React.FC<CalorieCardProps> = ({
  date,
  target,
  consumed,
  isFasting = false,
  isToday = false,
  onPress,
}) => {
  const remaining = target - consumed;
  const progress = Math.min(consumed / target, 1);
  const isOverTarget = consumed > target;
  
  const getProgressColor = () => {
    if (isFasting) return 'bg-blue-500';
    if (isOverTarget) return 'bg-red-500';
    if (progress >= 0.8) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStatusText = () => {
    if (isFasting) return 'Fasting';
    if (isOverTarget) return 'Over';
    if (remaining <= 0) return 'Done';
    return `${remaining}`;
  };

  const getStatusColor = () => {
    if (isFasting) return 'text-blue-600';
    if (isOverTarget) return 'text-red-600';
    if (remaining <= 0) return 'text-green-600';
    return 'text-gray-600';
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      className={`p-3 rounded-xl border ${
        isToday ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700'
      } ${isFasting ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-white dark:bg-gray-800'}`}
    >
      <View className="flex-row justify-between items-center mb-2">
        <ThemedText className="text-xs font-medium">
          {new Date(date).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })}
        </ThemedText>
        {isToday && (
          <View className="bg-blue-500 px-1 py-0.5 rounded-full">
            <Text className="text-white text-xs font-medium">Today</Text>
          </View>
        )}
      </View>

      <View className="mb-2">
        <View className="flex-row justify-between items-center mb-1">
          <ThemedText className="text-sm font-bold">
            {consumed.toLocaleString()}
          </ThemedText>
          <ThemedText className="text-xs text-gray-500">
            / {target.toLocaleString()}
          </ThemedText>
        </View>
        
        {/* Progress bar */}
        <View className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <View 
            className={`h-full ${getProgressColor()}`}
            style={{ width: `${progress * 100}%` }}
          />
        </View>
      </View>

      <View className="flex-row justify-between items-center">
        <ThemedText className={`text-xs font-medium ${getStatusColor()}`}>
          {getStatusText()}
        </ThemedText>
        {isFasting && (
          <View className="bg-blue-100 dark:bg-blue-900 px-1 py-0.5 rounded-full">
            <Text className="text-blue-700 dark:text-blue-300 text-xs font-medium">
              Fast
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}; 