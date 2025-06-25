import { ThemedText } from '@/components/ThemedText';
import { useCalorieStore } from '@/store/calorieStore';
import { addDays, getCurrentWeekStart } from '@/utils/dateUtils';
import React from 'react';
import { Dimensions, ScrollView, View } from 'react-native';
import { BarChart, LineChart } from 'react-native-chart-kit';
import { SafeAreaView } from 'react-native-safe-area-context';

const screenWidth = Dimensions.get('window').width;

export default function ProgressScreen() {
  const { 
    weightEntries, 
    dailyCalories, 
    getWeeklyDeficit, 
    getEstimatedFatLoss,
    calculateTDEE 
  } = useCalorieStore();
  
  const tdee = calculateTDEE();
  const currentWeekStart = getCurrentWeekStart();
  const weeklyDeficit = getWeeklyDeficit(currentWeekStart);
  const estimatedFatLoss = getEstimatedFatLoss(currentWeekStart);

  // Prepare weight chart data
  const weightData = weightEntries
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-14); // Last 14 entries

  const weightChartData = {
    labels: weightData.map(entry => 
      new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    ),
    datasets: [{
      data: weightData.map(entry => entry.weight),
      color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
      strokeWidth: 2,
    }],
  };

  // Prepare weekly calorie data
  const weeklyData = [];
  for (let i = 0; i < 4; i++) {
    const weekStart = addDays(currentWeekStart, -7 * i);
    const deficit = getWeeklyDeficit(weekStart);
    const fatLoss = getEstimatedFatLoss(weekStart);
    
    weeklyData.unshift({
      week: `Week ${4 - i}`,
      deficit: Math.round(deficit),
      fatLoss: Math.round(fatLoss * 1000) / 1000, // Round to 3 decimal places
    });
  }

  const calorieChartData = {
    labels: weeklyData.map(d => d.week),
    datasets: [{
      data: weeklyData.map(d => d.deficit),
      color: (opacity = 1) => `rgba(34, 197, 94, ${opacity})`,
      strokeWidth: 2,
    }],
  };

  const fatLossChartData = {
    labels: weeklyData.map(d => d.week),
    datasets: [{
      data: weeklyData.map(d => d.fatLoss * 1000), // Convert to grams for better visualization
      color: (opacity = 1) => `rgba(168, 85, 247, ${opacity})`,
      strokeWidth: 2,
    }],
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <ThemedText className="text-2xl font-bold mb-1">Progress</ThemedText>
          <ThemedText className="text-gray-600 dark:text-gray-400">
            Track your weight and calorie deficits
          </ThemedText>
        </View>

        <View className="p-4">
          {/* Current Week Summary */}
          <View className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-4 shadow-sm">
            <ThemedText className="text-lg font-semibold mb-3">This Week</ThemedText>
            <View className="flex-row justify-between">
              <View>
                <ThemedText className="text-sm text-gray-600 dark:text-gray-400">Calorie Deficit</ThemedText>
                <ThemedText className="text-xl font-bold text-green-600">
                  {weeklyDeficit.toLocaleString()}
                </ThemedText>
              </View>
              <View>
                <ThemedText className="text-sm text-gray-600 dark:text-gray-400">Est. Fat Loss</ThemedText>
                <ThemedText className="text-xl font-bold text-purple-600">
                  {estimatedFatLoss.toFixed(2)} kg
                </ThemedText>
              </View>
              <View>
                <ThemedText className="text-sm text-gray-600 dark:text-gray-400">Daily TDEE</ThemedText>
                <ThemedText className="text-xl font-bold">
                  {tdee ? tdee.toLocaleString() : '--'}
                </ThemedText>
              </View>
            </View>
          </View>

          {/* Weight Chart */}
          {weightData.length > 1 && (
            <View className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-4 shadow-sm">
              <ThemedText className="text-lg font-semibold mb-3">Weight Trend</ThemedText>
              <LineChart
                data={weightChartData}
                width={screenWidth - 48}
                height={220}
                chartConfig={{
                  backgroundColor: '#ffffff',
                  backgroundGradientFrom: '#ffffff',
                  backgroundGradientTo: '#ffffff',
                  decimalPlaces: 1,
                  color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  style: {
                    borderRadius: 16,
                  },
                  propsForDots: {
                    r: '6',
                    strokeWidth: '2',
                    stroke: '#3b82f6',
                  },
                }}
                bezier
                style={{
                  marginVertical: 8,
                  borderRadius: 16,
                }}
              />
            </View>
          )}

          {/* Weekly Calorie Deficit Chart */}
          <View className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-4 shadow-sm">
            <ThemedText className="text-lg font-semibold mb-3">Weekly Calorie Deficit</ThemedText>
            <BarChart
              data={calorieChartData}
              width={screenWidth - 48}
              height={220}
              yAxisLabel=""
              yAxisSuffix=""
              chartConfig={{
                backgroundColor: '#ffffff',
                backgroundGradientFrom: '#ffffff',
                backgroundGradientTo: '#ffffff',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(34, 197, 94, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
              }}
              style={{
                marginVertical: 8,
                borderRadius: 16,
              }}
            />
          </View>

          {/* Weekly Fat Loss Chart */}
          <View className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-4 shadow-sm">
            <ThemedText className="text-lg font-semibold mb-3">Estimated Fat Loss (grams)</ThemedText>
            <BarChart
              data={fatLossChartData}
              width={screenWidth - 48}
              height={220}
              yAxisLabel=""
              yAxisSuffix="g"
              chartConfig={{
                backgroundColor: '#ffffff',
                backgroundGradientFrom: '#ffffff',
                backgroundGradientTo: '#ffffff',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(168, 85, 247, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
              }}
              style={{
                marginVertical: 8,
                borderRadius: 16,
              }}
            />
          </View>

          {/* Weekly Data Table */}
          <View className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
            <ThemedText className="text-lg font-semibold mb-3">Weekly Summary</ThemedText>
            <View className="space-y-2">
              {weeklyData.map((week, index) => (
                <View key={index} className="flex-row justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                  <ThemedText className="font-medium">{week.week}</ThemedText>
                  <View className="flex-row space-x-4">
                    <ThemedText className="text-sm text-gray-600 dark:text-gray-400">
                      Deficit: {week.deficit.toLocaleString()}
                    </ThemedText>
                    <ThemedText className="text-sm text-gray-600 dark:text-gray-400">
                      Loss: {week.fatLoss.toFixed(2)} kg
                    </ThemedText>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
} 