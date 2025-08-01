import { useCalorieStore } from '@/store/calorieStore';
import { formatDate, formatDayName, isCurrentDay } from '@/utils/dateUtils';
import { addWeeks, eachDayOfInterval, endOfWeek, format, startOfWeek, subWeeks } from 'date-fns';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Dimensions, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

interface WeeklyCalendarProps {
  onDayPress?: (date: string) => void;
}

export const WeeklyCalendar: React.FC<WeeklyCalendarProps> = ({ onDayPress }) => {
  const [selectedWeek, setSelectedWeek] = useState(new Date());
  const [isReady, setIsReady] = useState(false);
  const { getDailyCalories } = useCalorieStore();
  
  // Ensure component is ready before rendering
  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Generate full week days (7 days)
  const weekDays = useMemo(() => {
    if (!isReady) return [];
    
    const start = startOfWeek(selectedWeek, { weekStartsOn: 1 }); // Monday start
    const end = endOfWeek(selectedWeek, { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [selectedWeek, isReady]);

  const navigateWeek = useCallback((direction: 'prev' | 'next') => {
    if (!isReady) return;
    
    setSelectedWeek(prevWeek => {
      if (direction === 'prev') {
        return subWeeks(prevWeek, 1);
      } else {
        return addWeeks(prevWeek, 1);
      }
    });
  }, [isReady]);

  const handleDayPress = useCallback((date: Date) => {
    if (!isReady) return;
    
    const dateString = formatDate(date);
    onDayPress?.(dateString);
  }, [onDayPress, isReady]);

  if (!isReady) {
    return (
      <View className="bg-white dark:bg-gray-800 rounded-2xl p-4 mb-4">
        <View className="h-20 items-center justify-center">
          <Text className="text-gray-500 dark:text-gray-400">Loading calendar...</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="bg-white dark:bg-gray-800 rounded-2xl p-4 mb-4">
      {/* Week Navigation */}
      <View className="flex-row items-center justify-between mb-4">
        <TouchableOpacity
          onPress={() => navigateWeek('prev')}
          className="bg-blue-500 w-10 h-10 rounded-full items-center justify-center"
        >
          <Text className="text-white text-lg font-bold">‹</Text>
        </TouchableOpacity>
        
        <Text className="text-lg font-bold text-gray-900 dark:text-white">
          {format(selectedWeek, 'MMM yyyy')}
        </Text>
        
        <TouchableOpacity
          onPress={() => navigateWeek('next')}
          className="bg-blue-500 w-10 h-10 rounded-full items-center justify-center"
        >
          <Text className="text-white text-lg font-bold">›</Text>
        </TouchableOpacity>
      </View>

      {/* Week Days */}
      <View className="flex-row justify-between">
        {weekDays.map((day, index) => {
          const dateString = formatDate(day);
          const dailyCalories = getDailyCalories(dateString) || { target: 0, consumed: 0, isFasting: false };
          const isToday = isCurrentDay(day);
          const progress = dailyCalories.target > 0 ? (dailyCalories.consumed / dailyCalories.target) * 100 : 0;

          return (
            <TouchableOpacity
              key={index}
              onPress={() => handleDayPress(day)}
              className={`flex-1 mx-1 p-3 rounded-xl ${
                isToday
                  ? 'bg-blue-500'
                  : 'bg-gray-100 dark:bg-gray-700'
              }`}
            >
              <Text className={`text-xs font-semibold text-center mb-1 ${
                isToday ? 'text-white' : 'text-gray-600 dark:text-gray-400'
              }`}>
                {formatDayName(day)}
              </Text>
              
              <Text className={`text-lg font-bold text-center mb-2 ${
                isToday ? 'text-white' : 'text-gray-900 dark:text-white'
              }`}>
                {format(day, 'd')}
              </Text>

              {/* Progress Indicator */}
              <View className={`h-1 rounded-full ${
                isToday ? 'bg-white/30' : 'bg-gray-300 dark:bg-gray-600'
              }`}>
                <View
                  className={`h-full rounded-full ${
                    isToday ? 'bg-white' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </View>

              {/* Calorie Info */}
              <Text className={`text-xs text-center mt-1 ${
                isToday ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'
              }`}>
                {dailyCalories.consumed || 0}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}; 