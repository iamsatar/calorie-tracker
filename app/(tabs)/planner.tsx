import { ThemedText } from '@/components/ThemedText';
import { WeeklyCalendar } from '@/components/ui/WeeklyCalendar';
import { useCalorieStore } from '@/store/calorieStore';
import { formatDate, getCurrentWeekStart } from '@/utils/dateUtils';
import React, { useCallback, useState } from 'react';
import { Alert, Dimensions, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function PlannerScreen() {
  const [showPatternModal, setShowPatternModal] = useState(false);
  const [showCalorieModal, setShowCalorieModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [tempCalories, setTempCalories] = useState('2000');
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
    getDailyCalories,
    deleteWeeklyPattern
  } = useCalorieStore();

  const handleSavePattern = useCallback(() => {
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
    setPatternCalories({
      monday: '2000',
      tuesday: '2000',
      wednesday: '2000',
      thursday: '2000',
      friday: '2000',
      saturday: '2500',
      sunday: '2500',
    });
    
    Alert.alert('Success', `Pattern "${patternName}" saved successfully!`);
  }, [patternName, patternCalories, addWeeklyPattern]);

  const handleApplyPattern = useCallback((patternId: string, patternName: string) => {
    Alert.alert(
      'Apply Pattern',
      `Apply "${patternName}" to current week?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Apply',
          onPress: () => {
            const weekStart = getCurrentWeekStart();
            applyWeeklyPattern(patternId, weekStart);
            Alert.alert('Success', `"${patternName}" applied to current week!`);
          }
        }
      ]
    );
  }, [applyWeeklyPattern]);

  const handleDeletePattern = useCallback((patternId: string, patternName: string) => {
    Alert.alert(
      'Delete Pattern',
      `Delete "${patternName}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteWeeklyPattern(patternId)
        }
      ]
    );
  }, [deleteWeeklyPattern]);

  const handleDayPress = useCallback((date: string) => {
    const dayData = getDailyCalories(date);
    const currentTarget = dayData?.target || 2000;
    
    setSelectedDate(date);
    setTempCalories(currentTarget.toString());
    setShowCalorieModal(true);
  }, [getDailyCalories]);

  const handleSaveCalories = useCallback(() => {
    const newTarget = parseInt(tempCalories) || 2000;
    const dayData = getDailyCalories(selectedDate);
    
    if (dayData) {
      updateDailyCalories(selectedDate, { target: newTarget });
    } else {
      addDailyCalories(selectedDate, newTarget, 0, newTarget <= 1000);
    }
    
    setShowCalorieModal(false);
    Alert.alert('Success', `Target set to ${newTarget.toLocaleString()} calories`);
  }, [selectedDate, tempCalories, getDailyCalories, updateDailyCalories, addDailyCalories]);

  const handleQuickAction = useCallback((actionType: 'normal' | 'fasting') => {
    const weekStart = getCurrentWeekStart();
    
    if (actionType === 'normal') {
      // Set all days to 2000 calories
      for (let i = 0; i < 7; i++) {
        const date = new Date(weekStart);
        date.setDate(date.getDate() + i);
        const dateStr = formatDate(date);
        addDailyCalories(dateStr, 2000, 0);
      }
      Alert.alert('Success', 'Set all days to 2,000 calories');
    } else {
      // Set Monday and Thursday as fasting days
      const fastingDays = [0, 3]; // Monday and Thursday
      for (let i = 0; i < 7; i++) {
        const date = new Date(weekStart);
        date.setDate(date.getDate() + i);
        const dateStr = formatDate(date);
        const isFasting = fastingDays.includes(i);
        addDailyCalories(dateStr, isFasting ? 1000 : 2500, 0, isFasting);
      }
      Alert.alert('Success', 'Applied 5:2 fasting pattern');
    }
  }, [addDailyCalories]);

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
      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {/* Header */}
        <View className="px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <ThemedText className="text-2xl font-bold mb-1">Weekly Planner</ThemedText>
          <ThemedText className="text-gray-600 dark:text-gray-400">
            Plan your calorie targets and fasting days
          </ThemedText>
        </View>

        {/* Weekly Calendar */}
        <View className="p-4">
          <WeeklyCalendar onDayPress={handleDayPress} />
        </View>

        {/* Quick Actions */}
        <View className="px-4 mb-6">
          <View className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
            <ThemedText className="text-lg font-semibold mb-4">Quick Actions</ThemedText>
            <View className="space-y-3">
              <TouchableOpacity 
                className="bg-blue-500 py-3 rounded-lg items-center active:bg-blue-600"
                onPress={() => handleQuickAction('normal')}
                accessibilityLabel="Set all days to 2000 calories"
                accessibilityRole="button"
              >
                <Text className="text-white text-base font-semibold">
                  Set All Days to 2,000
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                className="bg-purple-500 py-3 rounded-lg items-center active:bg-purple-600"
                onPress={() => handleQuickAction('fasting')}
                accessibilityLabel="Apply 5:2 intermittent fasting pattern"
                accessibilityRole="button"
              >
                <Text className="text-white text-base font-semibold">
                  Apply 5:2 Fasting
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Saved Patterns */}
        <View className="px-4">
          <View className="flex-row justify-between items-center mb-4">
            <ThemedText className="text-xl font-bold">Saved Patterns</ThemedText>
            <TouchableOpacity
              onPress={() => setShowPatternModal(true)}
              className="bg-blue-500 px-4 py-2 rounded-lg active:bg-blue-600"
              accessibilityLabel="Create new pattern"
              accessibilityRole="button"
            >
              <Text className="text-white text-sm font-semibold">New Pattern</Text>
            </TouchableOpacity>
          </View>

          {weeklyPatterns.length === 0 ? (
            <View className="bg-white dark:bg-gray-800 rounded-xl p-8 items-center shadow-sm">
              <View className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full items-center justify-center mb-4">
                <Text className="text-2xl">📅</Text>
              </View>
              <ThemedText className="text-lg font-semibold mb-2">No saved patterns yet</ThemedText>
              <ThemedText className="text-gray-600 dark:text-gray-400 text-center">
                Create a pattern to quickly apply weekly calorie targets
              </ThemedText>
            </View>
          ) : (
            <View className="space-y-4">
              {weeklyPatterns.map((pattern) => (
                <View key={pattern.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
                  <View className="flex-row justify-between items-center mb-4">
                    <ThemedText className="text-lg font-semibold flex-1">{pattern.name}</ThemedText>
                    <View className="flex-row space-x-2">
                      <TouchableOpacity
                        onPress={() => handleApplyPattern(pattern.id, pattern.name)}
                        className="bg-green-500 px-3 py-1 rounded-md active:bg-green-600"
                        accessibilityLabel={`Apply ${pattern.name} pattern`}
                        accessibilityRole="button"
                      >
                        <Text className="text-white text-xs font-semibold">Apply</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleDeletePattern(pattern.id, pattern.name)}
                        className="bg-red-500 px-3 py-1 rounded-md active:bg-red-600"
                        accessibilityLabel={`Delete ${pattern.name} pattern`}
                        accessibilityRole="button"
                      >
                        <Text className="text-white text-xs font-semibold">Delete</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  
                  <View className="flex-row flex-wrap gap-2">
                    {dayNames.map(({ key, label }) => (
                      <View key={key} className="bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-lg min-w-[80px] items-center">
                        <Text className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                          {label.slice(0, 3)}
                        </Text>
                        <Text className="text-sm font-semibold text-gray-900 dark:text-white">
                          {pattern.days[key]?.toLocaleString() || '2,000'}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Calorie Input Modal */}
      <Modal
        visible={showCalorieModal}
        animationType="slide"
        presentationStyle="pageSheet"
        transparent={false}
      >
        <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
          <View className="px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <View className="flex-row justify-between items-center">
              <TouchableOpacity onPress={() => setShowCalorieModal(false)}>
                <Text className="text-blue-500 text-base font-semibold">Cancel</Text>
              </TouchableOpacity>
              <ThemedText className="text-lg font-semibold">Set Calorie Target</ThemedText>
              <TouchableOpacity onPress={handleSaveCalories}>
                <Text className="text-blue-500 text-base font-semibold">Save</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View className="p-4">
            <View className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <ThemedText className="text-lg font-semibold mb-2">
                {selectedDate ? new Date(selectedDate).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric' 
                }) : ''}
              </ThemedText>
              <ThemedText className="text-gray-600 dark:text-gray-400 mb-6">
                Enter your calorie target for this day
              </ThemedText>
              
              <TextInput
                value={tempCalories}
                onChangeText={setTempCalories}
                keyboardType="numeric"
                placeholder="2000"
                className="border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-lg text-center bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholderTextColor="#9CA3AF"
                selectTextOnFocus
                autoFocus
              />
              
              <View className="flex-row justify-center mt-6 space-x-4">
                <TouchableOpacity
                  onPress={() => setTempCalories('1000')}
                  className="bg-orange-500 px-4 py-2 rounded-lg active:bg-orange-600"
                >
                  <Text className="text-white font-semibold">Fasting (1,000)</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setTempCalories('2000')}
                  className="bg-blue-500 px-4 py-2 rounded-lg active:bg-blue-600"
                >
                  <Text className="text-white font-semibold">Normal (2,000)</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Pattern Creation Modal */}
      <Modal
        visible={showPatternModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
          <View className="px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <View className="flex-row justify-between items-center">
              <TouchableOpacity onPress={() => setShowPatternModal(false)}>
                <Text className="text-blue-500 text-base font-semibold">Cancel</Text>
              </TouchableOpacity>
              <ThemedText className="text-lg font-semibold">New Pattern</ThemedText>
              <TouchableOpacity onPress={handleSavePattern}>
                <Text className="text-blue-500 text-base font-semibold">Save</Text>
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView className="flex-1 p-4" contentContainerStyle={{ paddingBottom: 32 }}>
            <View className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm mb-4">
              <ThemedText className="text-lg font-semibold mb-3">Pattern Name</ThemedText>
              <TextInput
                value={patternName}
                onChangeText={setPatternName}
                placeholder="e.g., 5:2 Fasting, Weekend Splurge"
                className="border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-base bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
              <ThemedText className="text-lg font-semibold mb-4">Daily Targets</ThemedText>
              {dayNames.map(({ key, label }) => (
                <View key={key} className="flex-row justify-between items-center py-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                  <ThemedText className="text-base">{label}</ThemedText>
                  <TextInput
                    value={patternCalories[key as keyof typeof patternCalories]}
                    onChangeText={(value) => 
                      setPatternCalories(prev => ({ ...prev, [key]: value }))
                    }
                    keyboardType="numeric"
                    placeholder="2000"
                    className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 w-24 text-center text-base bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
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