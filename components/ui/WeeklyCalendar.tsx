import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useCalorieStore } from '@/store/calorieStore';
import { formatDate, getWeekDays, isCurrentDay } from '@/utils/dateUtils';
import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { CalorieCard } from './CalorieCard';

interface WeeklyCalendarProps {
  onDayPress?: (date: string) => void;
}

export const WeeklyCalendar: React.FC<WeeklyCalendarProps> = ({ onDayPress }) => {
  const [selectedWeek, setSelectedWeek] = useState(new Date());
  const { dailyCalories, getDailyCalories } = useCalorieStore();
  
  const weekDays = getWeekDays(selectedWeek);
  
  const getDayData = (date: Date) => {
    const dateStr = formatDate(date);
    const dayData = getDailyCalories(dateStr);
    return {
      date: dateStr,
      target: dayData?.target || 2000,
      consumed: dayData?.consumed || 0,
      isFasting: dayData?.isFasting || false,
    };
  };

  const handlePreviousWeek = () => {
    const newDate = new Date(selectedWeek);
    newDate.setDate(selectedWeek.getDate() - 7);
    setSelectedWeek(newDate);
  };

  const handleNextWeek = () => {
    const newDate = new Date(selectedWeek);
    newDate.setDate(selectedWeek.getDate() + 7);
    setSelectedWeek(newDate);
  };

  const isCurrentWeek = () => {
    const today = new Date();
    const weekStart = new Date(selectedWeek);
    weekStart.setDate(selectedWeek.getDate() - selectedWeek.getDay() + 1);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    
    return today >= weekStart && today <= weekEnd;
  };

  return (
    <ThemedView className="p-4">
      {/* Week Navigation */}
      <View className="flex-row justify-between items-center mb-4">
        <TouchableOpacity
          onPress={handlePreviousWeek}
          className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700"
        >
          <Text className="text-gray-600 dark:text-gray-300">←</Text>
        </TouchableOpacity>
        
        <View className="flex-row items-center">
          <ThemedText className="text-lg font-semibold">
            {selectedWeek.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </ThemedText>
          {isCurrentWeek() && (
            <View className="ml-2 bg-blue-500 px-2 py-1 rounded-full">
              <Text className="text-white text-xs font-medium">Current</Text>
            </View>
          )}
        </View>
        
        <TouchableOpacity
          onPress={handleNextWeek}
          className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700"
        >
          <Text className="text-gray-600 dark:text-gray-300">→</Text>
        </TouchableOpacity>
      </View>

      {/* Week Days */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
        <View className="flex-row space-x-3">
          {weekDays.map((day) => {
            const dayData = getDayData(day);
            const isToday = isCurrentDay(day);
            
            return (
              <View key={dayData.date} className="w-20">
                <CalorieCard
                  date={dayData.date}
                  target={dayData.target}
                  consumed={dayData.consumed}
                  isFasting={dayData.isFasting}
                  isToday={isToday}
                  onPress={() => onDayPress?.(dayData.date)}
                />
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Week Summary */}
      <View className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl">
        <ThemedText className="text-lg font-semibold mb-2">Week Summary</ThemedText>
        <View className="flex-row justify-between">
          <View>
            <ThemedText className="text-sm text-gray-600 dark:text-gray-400">Total Target</ThemedText>
            <ThemedText className="text-lg font-bold">
              {weekDays.reduce((sum, day) => sum + getDayData(day).target, 0).toLocaleString()}
            </ThemedText>
          </View>
          <View>
            <ThemedText className="text-sm text-gray-600 dark:text-gray-400">Total Consumed</ThemedText>
            <ThemedText className="text-lg font-bold">
              {weekDays.reduce((sum, day) => sum + getDayData(day).consumed, 0).toLocaleString()}
            </ThemedText>
          </View>
          <View>
            <ThemedText className="text-sm text-gray-600 dark:text-gray-400">Remaining</ThemedText>
            <ThemedText className="text-lg font-bold text-green-600">
              {weekDays.reduce((sum, day) => {
                const data = getDayData(day);
                return sum + Math.max(0, data.target - data.consumed);
              }, 0).toLocaleString()}
            </ThemedText>
          </View>
        </View>
      </View>
    </ThemedView>
  );
}; 