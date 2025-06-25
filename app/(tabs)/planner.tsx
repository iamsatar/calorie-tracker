import { ThemedText } from '@/components/ThemedText';
import { WeeklyCalendar } from '@/components/ui/WeeklyCalendar';
import { useCalorieStore } from '@/store/calorieStore';
import { getCurrentWeekStart } from '@/utils/dateUtils';
import React, { useState } from 'react';
import { Alert, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PlannerScreen() {
  const [showPatternModal, setShowPatternModal] = useState(false);
  const [patternName, setPatternName] = useState('');
  const [patternCalories, setPatternCalories] = useState({
    monday: '2000',
    tuesday: '2000',
    wednesday: '2000',
    thursday: '2000',
    friday: '2000',
    saturday: '2500',
    sunday: '2500',
  });
  
  const { 
    weeklyPatterns, 
    addWeeklyPattern, 
    applyWeeklyPattern,
    addDailyCalories,
    updateDailyCalories,
    getDailyCalories 
  } = useCalorieStore();

  const handleSavePattern = () => {
    if (!patternName.trim()) {
      Alert.alert('Error', 'Please enter a pattern name');
      return;
    }

    const calories = Object.fromEntries(
      Object.entries(patternCalories).map(([day, cal]) => [day, parseInt(cal) || 2000])
    );

    const newPattern = {
      id: Date.now().toString(),
      name: patternName,
      days: calories,
    };

    addWeeklyPattern(newPattern);
    setShowPatternModal(false);
    setPatternName('');
  };

  const handleApplyPattern = (patternId: string) => {
    const weekStart = getCurrentWeekStart();
    applyWeeklyPattern(patternId, weekStart);
    Alert.alert('Success', 'Weekly pattern applied!');
  };

  const handleDayPress = (date: string) => {
    const dayData = getDailyCalories(date);
    const currentTarget = dayData?.target || 2000;
    
    Alert.prompt(
      'Set Calorie Target',
      `Enter target calories for ${new Date(date).toLocaleDateString()}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Save',
          onPress: (value) => {
            const newTarget = parseInt(value || '2000');
            if (dayData) {
              updateDailyCalories(date, { target: newTarget });
            } else {
              addDailyCalories(date, newTarget, 0, newTarget <= 1000);
            }
          },
        },
      ],
      'plain-text',
      currentTarget.toString()
    );
  };

  const dayNames = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <ThemedText className="text-2xl font-bold mb-1">Weekly Planner</ThemedText>
          <ThemedText className="text-gray-600 dark:text-gray-400">
            Plan your calorie targets and fasting days
          </ThemedText>
        </View>

        {/* Weekly Calendar */}
        <WeeklyCalendar onDayPress={handleDayPress} />

        {/* Saved Patterns */}
        <View className="p-4">
          <View className="flex-row justify-between items-center mb-4">
            <ThemedText className="text-lg font-semibold">Saved Patterns</ThemedText>
            <TouchableOpacity
              onPress={() => setShowPatternModal(true)}
              className="bg-blue-500 px-4 py-2 rounded-lg"
            >
              <Text className="text-white font-medium">New Pattern</Text>
            </TouchableOpacity>
          </View>

          {weeklyPatterns.length === 0 ? (
            <View className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center">
              <ThemedText className="text-gray-500 dark:text-gray-400 mb-2">
                No saved patterns yet
              </ThemedText>
              <ThemedText className="text-sm text-gray-400 dark:text-gray-500">
                Create a pattern to quickly apply weekly calorie targets
              </ThemedText>
            </View>
          ) : (
            <View className="space-y-3">
              {weeklyPatterns.map((pattern) => (
                <View key={pattern.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
                  <View className="flex-row justify-between items-center mb-3">
                    <ThemedText className="text-lg font-semibold">{pattern.name}</ThemedText>
                    <TouchableOpacity
                      onPress={() => handleApplyPattern(pattern.id)}
                      className="bg-green-500 px-3 py-1 rounded-lg"
                    >
                      <Text className="text-white text-sm font-medium">Apply</Text>
                    </TouchableOpacity>
                  </View>
                  
                  <View className="flex-row flex-wrap gap-2">
                    {dayNames.map(({ key, label }) => (
                      <View key={key} className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                        <ThemedText className="text-xs text-gray-600 dark:text-gray-400">
                          {label}
                        </ThemedText>
                        <ThemedText className="text-sm font-medium">
                          {pattern.days[key]?.toLocaleString() || '2000'}
                        </ThemedText>
                      </View>
                    ))}
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Pattern Creation Modal */}
      <Modal
        visible={showPatternModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
          <View className="p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <View className="flex-row justify-between items-center">
              <TouchableOpacity onPress={() => setShowPatternModal(false)}>
                <Text className="text-blue-500 font-medium">Cancel</Text>
              </TouchableOpacity>
              <ThemedText className="text-lg font-semibold">New Pattern</ThemedText>
              <TouchableOpacity onPress={handleSavePattern}>
                <Text className="text-blue-500 font-medium">Save</Text>
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView className="flex-1 p-4">
            <View className="mb-4">
              <ThemedText className="text-lg font-semibold mb-2">Pattern Name</ThemedText>
              <TextInput
                value={patternName}
                onChangeText={setPatternName}
                placeholder="e.g., 5:2 Fasting, Weekend Splurge"
                className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View className="mb-4">
              <ThemedText className="text-lg font-semibold mb-2">Daily Targets</ThemedText>
              {dayNames.map(({ key, label }) => (
                <View key={key} className="flex-row items-center justify-between mb-3">
                  <ThemedText className="text-base">{label}</ThemedText>
                  <TextInput
                    value={patternCalories[key as keyof typeof patternCalories]}
                    onChangeText={(value) => 
                      setPatternCalories(prev => ({ ...prev, [key]: value }))
                    }
                    keyboardType="numeric"
                    placeholder="2000"
                    className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 w-20 text-center text-gray-900 dark:text-white"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              ))}
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
} 