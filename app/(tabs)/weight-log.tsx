import { ThemedText } from '@/components/ThemedText';
import { useCalorieStore } from '@/store/calorieStore';
import { formatDate } from '@/utils/dateUtils';
import React, { useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function WeightLogScreen() {
  const [weightInput, setWeightInput] = useState('');
  const { weightEntries, addWeightEntry, getLatestWeight } = useCalorieStore();
  
  const latestWeight = getLatestWeight();
  const today = formatDate(new Date());

  const handleAddWeight = () => {
    const weight = parseFloat(weightInput);
    if (isNaN(weight) || weight <= 0) {
      Alert.alert('Invalid Input', 'Please enter a valid weight');
      return;
    }

    addWeightEntry(today, weight);
    setWeightInput('');
    Alert.alert('Success', 'Weight logged successfully!');
  };

  const handleQuickLog = (weight: number) => {
    addWeightEntry(today, weight);
    Alert.alert('Success', `Weight logged: ${weight} kg`);
  };

  const sortedEntries = weightEntries
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 30); // Last 30 entries

  const getWeightChange = () => {
    if (weightEntries.length < 2) return null;
    
    const sorted = weightEntries.sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    const first = sorted[0];
    const last = sorted[sorted.length - 1];
    const change = last.weight - first.weight;
    
    return {
      change: Math.abs(change),
      isLoss: change < 0,
      percentage: ((change / first.weight) * 100).toFixed(1),
    };
  };

  const weightChange = getWeightChange();

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <ThemedText className="text-2xl font-bold mb-1">Weight Tracker</ThemedText>
          <ThemedText className="text-gray-600 dark:text-gray-400">
            Log and track your weight progress
          </ThemedText>
        </View>

        <View className="p-4">
          {/* Current Weight Display */}
          <View className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-4 shadow-sm">
            <ThemedText className="text-lg font-semibold mb-2">Current Weight</ThemedText>
            <ThemedText className="text-4xl font-bold text-blue-600 mb-2">
              {latestWeight ? `${latestWeight} kg` : '--'}
            </ThemedText>
            {weightChange && (
              <View className="flex-row items-center">
                <ThemedText className={`text-lg font-medium ${
                  weightChange.isLoss ? 'text-green-600' : 'text-red-600'
                }`}>
                  {weightChange.isLoss ? '↓' : '↑'} {weightChange.change.toFixed(1)} kg
                </ThemedText>
                <ThemedText className="text-sm text-gray-500 ml-2">
                  ({weightChange.percentage}%)
                </ThemedText>
              </View>
            )}
          </View>

          {/* Quick Log */}
          <View className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-4 shadow-sm">
            <ThemedText className="text-lg font-semibold mb-3">Quick Log Weight</ThemedText>
            
            <View className="flex-row space-x-2 mb-3">
              {[50, 60, 70, 80, 90, 100].map((weight) => (
                <TouchableOpacity
                  key={weight}
                  onPress={() => handleQuickLog(weight)}
                  className="flex-1 bg-blue-500 py-2 rounded-lg"
                >
                  <Text className="text-white text-center font-medium">{weight}</Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <View className="flex-row space-x-2">
              <TextInput
                value={weightInput}
                onChangeText={setWeightInput}
                placeholder="Enter weight (kg)"
                keyboardType="numeric"
                className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white"
                placeholderTextColor="#9CA3AF"
              />
              <TouchableOpacity
                onPress={handleAddWeight}
                className="bg-green-500 px-4 py-2 rounded-lg"
              >
                <Text className="text-white font-medium">Log</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Weight History */}
          <View className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
            <ThemedText className="text-lg font-semibold mb-3">Weight History</ThemedText>
            
            {sortedEntries.length === 0 ? (
              <View className="py-8 text-center">
                <ThemedText className="text-gray-500 dark:text-gray-400 mb-2">
                  No weight entries yet
                </ThemedText>
                <ThemedText className="text-sm text-gray-400 dark:text-gray-500">
                  Log your first weight to start tracking
                </ThemedText>
              </View>
            ) : (
              <View className="space-y-2">
                {sortedEntries.map((entry, index) => {
                  const prevEntry = sortedEntries[index + 1];
                  const change = prevEntry ? entry.weight - prevEntry.weight : 0;
                  
                  return (
                    <View key={entry.date} className="flex-row justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700">
                      <View>
                        <ThemedText className="font-medium">
                          {new Date(entry.date).toLocaleDateString('en-US', { 
                            weekday: 'short', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </ThemedText>
                        <ThemedText className="text-sm text-gray-500">
                          {entry.weight} kg
                        </ThemedText>
                      </View>
                      
                      {change !== 0 && (
                        <View className="flex-row items-center">
                          <ThemedText className={`text-sm font-medium ${
                            change < 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {change < 0 ? '↓' : '↑'} {Math.abs(change).toFixed(1)}
                          </ThemedText>
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            )}
          </View>

          {/* Stats Summary */}
          {weightEntries.length > 0 && (
            <View className="bg-white dark:bg-gray-800 rounded-xl p-4 mt-4 shadow-sm">
              <ThemedText className="text-lg font-semibold mb-3">Stats Summary</ThemedText>
              <View className="flex-row justify-between">
                <View>
                  <ThemedText className="text-sm text-gray-600 dark:text-gray-400">Total Entries</ThemedText>
                  <ThemedText className="text-xl font-bold">
                    {weightEntries.length}
                  </ThemedText>
                </View>
                <View>
                  <ThemedText className="text-sm text-gray-600 dark:text-gray-400">Average</ThemedText>
                  <ThemedText className="text-xl font-bold">
                    {(weightEntries.reduce((sum, entry) => sum + entry.weight, 0) / weightEntries.length).toFixed(1)} kg
                  </ThemedText>
                </View>
                <View>
                  <ThemedText className="text-sm text-gray-600 dark:text-gray-400">Lowest</ThemedText>
                  <ThemedText className="text-xl font-bold text-green-600">
                    {Math.min(...weightEntries.map(e => e.weight)).toFixed(1)} kg
                  </ThemedText>
                </View>
                <View>
                  <ThemedText className="text-sm text-gray-600 dark:text-gray-400">Highest</ThemedText>
                  <ThemedText className="text-xl font-bold text-red-600">
                    {Math.max(...weightEntries.map(e => e.weight)).toFixed(1)} kg
                  </ThemedText>
                </View>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
} 