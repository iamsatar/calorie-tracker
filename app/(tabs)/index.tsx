import { ThemedText } from '@/components/ThemedText';
import { useCalorieStore } from '@/store/calorieStore';
import { formatDate } from '@/utils/dateUtils';
import React, { useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const [calorieInput, setCalorieInput] = useState('');
  const { 
    getDailyCalories, 
    addDailyCalories, 
    updateDailyCalories,
    calculateTDEE,
    getLatestWeight 
  } = useCalorieStore();
  
  const today = formatDate(new Date());
  const todayData = getDailyCalories(today);
  const tdee = calculateTDEE();
  const latestWeight = getLatestWeight();
  
  const target = todayData?.target || 2000;
  const consumed = todayData?.consumed || 0;
  const remaining = target - consumed;
  const progress = Math.min(consumed / target, 1);
  const isOverTarget = consumed > target;

  const handleAddCalories = () => {
    const calories = parseInt(calorieInput);
    if (isNaN(calories) || calories <= 0) {
      Alert.alert('Invalid Input', 'Please enter a valid number of calories');
      return;
    }

    const newConsumed = consumed + calories;
    if (todayData) {
      updateDailyCalories(today, { consumed: newConsumed });
    } else {
      addDailyCalories(today, target, newConsumed);
    }
    setCalorieInput('');
  };

  const handleQuickAdd = (amount: number) => {
    const newConsumed = consumed + amount;
    if (todayData) {
      updateDailyCalories(today, { consumed: newConsumed });
    } else {
      addDailyCalories(today, target, newConsumed);
    }
  };

  const getProgressColor = () => {
    if (todayData?.isFasting) return 'bg-blue-500';
    if (isOverTarget) return 'bg-red-500';
    if (progress >= 0.8) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <ThemedText className="text-2xl font-bold mb-1">Today&apos;s Calories</ThemedText>
          <ThemedText className="text-gray-600 dark:text-gray-400">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </ThemedText>
        </View>

        {/* Main Calorie Display */}
        <View className="p-4">
          <View className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-4 shadow-sm">
            <View className="flex-row justify-between items-center mb-4">
              <ThemedText className="text-3xl font-bold">
                {consumed.toLocaleString()}
              </ThemedText>
              <ThemedText className="text-lg text-gray-500">
                / {target.toLocaleString()}
              </ThemedText>
            </View>
            
            {/* Progress Bar */}
            <View className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-4">
              <View 
                className={`h-full ${getProgressColor()}`}
                style={{ width: `${progress * 100}%` }}
              />
            </View>
            
            <View className="flex-row justify-between items-center">
              <ThemedText className={`text-lg font-semibold ${
                isOverTarget ? 'text-red-600' : 'text-green-600'
              }`}>
                {isOverTarget ? `+${Math.abs(remaining)} over` : `${remaining} remaining`}
              </ThemedText>
              {todayData?.isFasting && (
                <View className="bg-blue-100 dark:bg-blue-900 px-3 py-1 rounded-full">
                  <Text className="text-blue-700 dark:text-blue-300 font-medium">
                    Fasting Day
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Quick Add Calories */}
          <View className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-4 shadow-sm">
            <ThemedText className="text-lg font-semibold mb-3">Quick Add Calories</ThemedText>
            
            <View className="flex-row space-x-2 mb-3">
              {[100, 200, 300, 500].map((amount) => (
                <TouchableOpacity
                  key={amount}
                  onPress={() => handleQuickAdd(amount)}
                  className="flex-1 bg-blue-500 py-2 rounded-lg"
                >
                  <Text className="text-white text-center font-medium">+{amount}</Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <View className="flex-row space-x-2">
              <TextInput
                value={calorieInput}
                onChangeText={setCalorieInput}
                placeholder="Enter calories"
                keyboardType="numeric"
                className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white"
                placeholderTextColor="#9CA3AF"
              />
              <TouchableOpacity
                onPress={handleAddCalories}
                className="bg-green-500 px-4 py-2 rounded-lg"
              >
                <Text className="text-white font-medium">Add</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Stats Cards */}
          <View className="flex-row space-x-3 mb-4">
            <View className="flex-1 bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
              <ThemedText className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Daily Target
              </ThemedText>
              <ThemedText className="text-xl font-bold">
                {target.toLocaleString()}
              </ThemedText>
            </View>
            
            <View className="flex-1 bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
              <ThemedText className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                TDEE
              </ThemedText>
              <ThemedText className="text-xl font-bold">
                {tdee ? tdee.toLocaleString() : '--'}
              </ThemedText>
            </View>
            
            <View className="flex-1 bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
              <ThemedText className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Current Weight
              </ThemedText>
              <ThemedText className="text-xl font-bold">
                {latestWeight ? `${latestWeight} kg` : '--'}
              </ThemedText>
            </View>
          </View>

          {/* Quick Actions */}
          <View className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
            <ThemedText className="text-lg font-semibold mb-3">Quick Actions</ThemedText>
            <View className="flex-row space-x-3">
              <TouchableOpacity className="flex-1 bg-blue-500 py-3 rounded-lg">
                <Text className="text-white text-center font-medium">Log Weight</Text>
              </TouchableOpacity>
              <TouchableOpacity className="flex-1 bg-green-500 py-3 rounded-lg">
                <Text className="text-white text-center font-medium">View Progress</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
