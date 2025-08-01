import { useCalorieStore } from '@/store/calorieStore';
import { addDays, getCurrentWeekStart } from '@/utils/dateUtils';
import React, { useState } from 'react';
import { Dimensions, ScrollView, Text, View, useColorScheme } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { SafeAreaView } from 'react-native-safe-area-context';

const screenWidth = Dimensions.get('window').width;

interface WeeklyDataItem {
  week: string;
  deficit: number;
  fatLoss: number;
}

export default function ProgressScreen() {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('week');
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  
  const { 
    weightEntries, 
    dailyCalories, 
    getWeeklyDeficit, 
    getEstimatedFatLoss,
    calculateTDEE,
    getLatestWeight 
  } = useCalorieStore();
  
  const tdee = calculateTDEE();
  const currentWeekStart = getCurrentWeekStart();
  const weeklyDeficit = getWeeklyDeficit(currentWeekStart);
  const estimatedFatLoss = getEstimatedFatLoss(currentWeekStart);
  const latestWeight = getLatestWeight();

  // Calculate progress metrics
  const totalWeightLoss = weightEntries.length > 1 
    ? weightEntries[0].weight - (latestWeight || 0)
    : 0;

  const avgDeficit = Math.round(weeklyDeficit / 7);

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
      color: (opacity = 1) => `rgba(139, 92, 246, ${opacity})`,
      strokeWidth: 3,
    }],
  };

  // Prepare weekly calorie data
  const weeklyData: WeeklyDataItem[] = [];
  for (let i = 0; i < 4; i++) {
    const weekStart = addDays(currentWeekStart, -7 * i);
    const deficit = getWeeklyDeficit(weekStart);
    const fatLoss = getEstimatedFatLoss(weekStart);
    
    weeklyData.unshift({
      week: `W${4 - i}`,
      deficit: Math.round(deficit),
      fatLoss: Math.round(fatLoss * 1000) / 1000,
    });
  }

  const calorieChartData = {
    labels: weeklyData.map(d => d.week),
    datasets: [{
      data: weeklyData.map(d => Math.abs(d.deficit)),
      color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
      strokeWidth: 3,
    }],
  };

  const getProgressStatus = () => {
    if (totalWeightLoss > 2) return { text: "Excellent Progress!", color: "text-emerald-500", emoji: "🎯" };
    if (totalWeightLoss > 1) return { text: "Great Progress!", color: "text-blue-500", emoji: "💪" };
    if (totalWeightLoss > 0) return { text: "Good Start!", color: "text-yellow-500", emoji: "⚡" };
    return { text: "Keep Going!", color: "text-purple-500", emoji: "🌟" };
  };

  const status = getProgressStatus();

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Hero Header */}
        <View className="bg-purple-600 dark:bg-purple-700 px-6 pt-8 pb-12">
          <View className="flex-row items-center justify-between mb-6">
            <View>
              <Text className="text-3xl font-black text-white mb-1">
                Progress
              </Text>
              <Text className="text-white/80 text-base font-medium">
                Your fitness journey insights
              </Text>
            </View>
            <View className="bg-white/20 px-4 py-2 rounded-2xl border border-white/30">
              <Text className="text-white text-sm font-bold">
                {status.emoji}
              </Text>
            </View>
          </View>

          {/* Progress Overview Card */}
          <View className="bg-white/10 rounded-3xl p-6 border border-white/20">
            <View className="items-center mb-6">
              <Text className="text-4xl font-black text-white mb-2">
                {Math.abs(totalWeightLoss).toFixed(1)} kg
              </Text>
              <Text className="text-white/80 text-lg font-semibold">
                {totalWeightLoss >= 0 ? 'Total Weight Lost' : 'Weight Gained'}
              </Text>
            </View>

            <View className="flex-row justify-between">
              <View className="items-center flex-1">
                <Text className="text-2xl font-black text-white mb-1">
                  {Math.abs(avgDeficit)}
                </Text>
                <Text className="text-white/80 text-sm font-semibold text-center">
                  Daily Deficit
                </Text>
              </View>
              
              <View className="items-center flex-1">
                <Text className="text-2xl font-black text-white mb-1">
                  {estimatedFatLoss.toFixed(2)}
                </Text>
                <Text className="text-white/80 text-sm font-semibold text-center">
                  Weekly Loss (kg)
                </Text>
              </View>
              
              <View className="items-center flex-1">
                <Text className="text-2xl font-black text-white mb-1">
                  {tdee ? Math.round(tdee / 1000) : '--'}k
                </Text>
                <Text className="text-white/80 text-sm font-semibold text-center">
                  Daily TDEE
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View className="px-6 -mt-6">
          {/* Status Card */}
          <View className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 p-6 mb-6">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className={`text-2xl font-black ${status.color} mb-1`}>
                  {status.text}
                </Text>
                <Text className="text-gray-600 dark:text-gray-400">
                  Keep up the amazing work!
                </Text>
              </View>
              <View className="bg-purple-100 dark:bg-purple-900/30 w-16 h-16 rounded-2xl items-center justify-center">
                <Text className="text-3xl">{status.emoji}</Text>
              </View>
            </View>
          </View>

          {/* Quick Stats - Stacked Vertically */}
          <View className="space-y-4 mb-6">
            <View className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 p-6">
              <View className="flex-row items-center">
                <View className="bg-emerald-100 dark:bg-emerald-900/30 w-16 h-16 rounded-2xl items-center justify-center mr-4">
                  <Text className="text-emerald-600 dark:text-emerald-400 text-3xl">📉</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">
                    This Week&apos;s Deficit
                  </Text>
                  <Text className="text-3xl font-black text-gray-900 dark:text-white">
                    {Math.abs(weeklyDeficit / 1000).toFixed(1)}k calories
                  </Text>
                  <Text className="text-sm text-gray-500 dark:text-gray-400">
                    {Math.abs(avgDeficit)} per day average
                  </Text>
                </View>
              </View>
            </View>
            
            <View className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 p-6 my-3">
              <View className="flex-row items-center">
                <View className="bg-blue-100 dark:bg-blue-900/30 w-16 h-16 rounded-2xl items-center justify-center mr-4">
                  <Text className="text-blue-600 dark:text-blue-400 text-3xl">⚖️</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">
                    Current Weight
                  </Text>
                  <Text className="text-3xl font-black text-gray-900 dark:text-white">
                    {latestWeight ? `${latestWeight.toFixed(1)} kg` : '-- kg'}
                  </Text>
                  <Text className="text-sm text-gray-500 dark:text-gray-400">
                    {totalWeightLoss >= 0 ? `${totalWeightLoss.toFixed(1)}kg lost total` : `${Math.abs(totalWeightLoss).toFixed(1)}kg gained`}
                  </Text>
                </View>
              </View>
            </View>
            
            <View className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 p-6">
              <View className="flex-row items-center">
                <View className="bg-purple-100 dark:bg-purple-900/30 w-16 h-16 rounded-2xl items-center justify-center mr-4">
                  <Text className="text-purple-600 dark:text-purple-400 text-3xl">🔥</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">
                    Consistency Streak
                  </Text>
                  <Text className="text-3xl font-black text-gray-900 dark:text-white">
                    7 days
                  </Text>
                  <Text className="text-sm text-gray-500 dark:text-gray-400">
                    Keep the momentum going!
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Weight Trend Chart - Enhanced */}
          {weightData.length > 1 && (
            <View className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 p-6 mb-6">
              {/* Header with Period Selection */}
              <View className="flex-row items-center justify-between mb-6">
                <View>
                  <Text className="text-2xl font-black text-gray-900 dark:text-white mb-1">
                    Weight Progress
                  </Text>
                  <Text className="text-gray-500 dark:text-gray-400 text-sm">
                    Track your weight journey over time
                  </Text>
                </View>
                <View className="bg-purple-50 dark:bg-purple-900/20 px-4 py-2 rounded-2xl border border-purple-200 dark:border-purple-700">
                  <Text className="text-purple-600 dark:text-purple-400 text-sm font-bold">
                    📈 {weightData.length} entries
                  </Text>
                </View>
              </View>

              {/* Weight Summary Stats */}
              <View className="flex-row justify-between mb-6">
                <View className="flex-1 bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4 mr-2 border border-blue-100 dark:border-blue-800">
                  <Text className="text-blue-600 dark:text-blue-400 text-xs font-bold uppercase mb-1">
                    Current
                  </Text>
                  <Text className="text-2xl font-black text-blue-700 dark:text-blue-300">
                    {latestWeight?.toFixed(1) || '--'} kg
                  </Text>
                </View>
                
                <View className="flex-1 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-4 mx-1 border border-emerald-100 dark:border-emerald-800">
                  <Text className="text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase mb-1">
                    Change
                  </Text>
                  <Text className={`text-2xl font-black ${totalWeightLoss >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
                    {totalWeightLoss >= 0 ? '-' : '+'}{Math.abs(totalWeightLoss).toFixed(1)} kg
                  </Text>
                </View>

                <View className="flex-1 bg-purple-50 dark:bg-purple-900/20 rounded-2xl p-4 ml-2 border border-purple-100 dark:border-purple-800">
                  <Text className="text-purple-600 dark:text-purple-400 text-xs font-bold uppercase mb-1">
                    Goal
                  </Text>
                  <Text className="text-2xl font-black text-purple-700 dark:text-purple-300">
                    {weightEntries.length > 0 ? (weightEntries[0].weight - 10).toFixed(1) : '--'} kg
                  </Text>
                </View>
              </View>
              
              {/* Enhanced Chart Container */}
              <View className={`rounded-3xl p-6 pl-3 overflow-hidden ${isDarkMode ? 'border border-gray-600' : ''}`}>
                <LineChart
                  data={weightChartData}
                  width={screenWidth - 112} // Adjusted for padding
                  height={240} // Increased height
                  chartConfig={{
                    backgroundColor: 'transparent',
                    backgroundGradientFrom: 'transparent',
                    backgroundGradientTo: 'transparent',
                    decimalPlaces: 1,
                    color: (opacity = 1) => `rgba(139, 92, 246, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
                    style: {
                      borderRadius: 24,
                    },
                    propsForDots: {
                      r: '6',
                      strokeWidth: '3',
                      stroke: '#ffffff',
                      fill: '#8b5cf6',
                    },
                    propsForBackgroundLines: {
                      strokeDasharray: '5,5',
                      stroke: '#d1d5db',
                      strokeWidth: 1,
                      strokeOpacity: 0.5,
                    },
                    fillShadowGradient: '#8b5cf6',
                    fillShadowGradientOpacity: 0.1,
                    fillShadowGradientFrom: '#8b5cf6',
                    fillShadowGradientFromOpacity: 0.2,
                    fillShadowGradientTo: '#8b5cf6',
                    fillShadowGradientToOpacity: 0.0,
                  }}
                  bezier
                  withShadow
                  withInnerLines
                  withOuterLines
                  withVerticalLines
                  withHorizontalLines
                  style={{
                    borderRadius: 24,
                    marginVertical: 8,
                  }}
                />
                
                {/* Enhanced Chart Legend */}
                <View className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
                  {/* Legend Title */}
                  <Text className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                    Chart Legend
                  </Text>
                  
                  {/* Legend Items Grid */}
                  <View className="flex-row flex-wrap justify-between">
                    {/* Weight Trend Line */}
                    <View className="flex-row items-center mb-3 w-[48%]">
                      <View className="w-4 h-[3px] bg-purple-500 rounded-full mr-3"></View>
                      <View className="flex-1">
                        <Text className="text-gray-700 dark:text-gray-300 text-sm font-semibold">
                          Weight Trend
                        </Text>
                        <Text className="text-gray-500 dark:text-gray-400 text-xs">
                          Daily measurements
                        </Text>
                      </View>
                    </View>
                    
                    {/* Data Points */}
                    <View className="flex-row items-center mb-3 w-[48%]">
                      <View className="w-4 h-4 bg-purple-500 rounded-full border-2 border-white mr-3 shadow-sm"></View>
                      <View className="flex-1">
                        <Text className="text-gray-700 dark:text-gray-300 text-sm font-semibold">
                          Data Points
                        </Text>
                        <Text className="text-gray-500 dark:text-gray-400 text-xs">
                          Recorded weights
                        </Text>
                      </View>
                    </View>
                    
                    {/* Trend Fill */}
                    <View className="flex-row items-center mb-3 w-[48%]">
                      <View className="w-4 h-4 bg-purple-200 dark:bg-purple-800 rounded mr-3 opacity-60"></View>
                      <View className="flex-1">
                        <Text className="text-gray-700 dark:text-gray-300 text-sm font-semibold">
                          Trend Area
                        </Text>
                        <Text className="text-gray-500 dark:text-gray-400 text-xs">
                          Progress visualization
                        </Text>
                      </View>
                    </View>
                    
                    {/* Grid Lines */}
                    <View className="flex-row items-center mb-3 w-[48%]">
                      <View className="w-4 h-[1px] border-t border-dashed border-gray-400 mr-3"></View>
                      <View className="flex-1">
                        <Text className="text-gray-700 dark:text-gray-300 text-sm font-semibold">
                          Grid Lines
                        </Text>
                        <Text className="text-gray-500 dark:text-gray-400 text-xs">
                          Reference guides
                        </Text>
                      </View>
                    </View>
                  </View>
                  
                  {/* Chart Info Footer */}
                  <View className="flex-row justify-between items-center mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                    <View className="flex-row items-center">
                      <View className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></View>
                      <Text className="text-gray-600 dark:text-gray-400 text-sm">
                        {weightData.length} entries tracked
                      </Text>
                    </View>
                    <View className="flex-row items-center">
                      <View className="w-2 h-2 bg-blue-500 rounded-full mr-2"></View>
                      <Text className="text-gray-500 dark:text-gray-400 text-xs">
                        Updated {new Date().toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </Text>
                    </View>
                  </View>
                  
                  {/* Quick Stats Summary */}
                  <View className="mt-4 bg-gray-50 dark:bg-gray-700 rounded-2xl p-4">
                    <View className="flex-row justify-between">
                      <View className="items-center flex-1">
                        <Text className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">
                          Range
                        </Text>
                        <Text className="text-lg font-black text-gray-900 dark:text-white">
                          {weightData.length > 1 ? 
                            `${Math.min(...weightData.map(w => w.weight)).toFixed(1)} - ${Math.max(...weightData.map(w => w.weight)).toFixed(1)} kg`
                            : '--'
                          }
                        </Text>
                      </View>
                      
                      <View className="w-px bg-gray-200 dark:bg-gray-600 mx-4"></View>
                      
                      <View className="items-center flex-1">
                        <Text className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">
                          Trend
                        </Text>
                        <View className="flex-row items-center">
                          <Text className={`text-lg font-black ${
                            totalWeightLoss > 0 ? 'text-emerald-500' : 
                            totalWeightLoss < 0 ? 'text-red-500' : 'text-gray-500'
                          }`}>
                            {totalWeightLoss > 0 ? '↓' : totalWeightLoss < 0 ? '↑' : '→'}
                          </Text>
                          <Text className="text-lg font-black text-gray-900 dark:text-white ml-1">
                            {totalWeightLoss === 0 ? 'Stable' : 
                             totalWeightLoss > 0 ? 'Losing' : 'Gaining'}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
              </View>

              {/* Progress Insights */}
              <View className="mt-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-2xl border border-purple-100 dark:border-purple-800">
                <View className="flex-row items-center mb-2">
                  <Text className="text-lg mr-2">📊</Text>
                  <Text className="text-purple-700 dark:text-purple-300 font-bold">
                    Progress Insight
                  </Text>
                </View>
                <Text className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                  {totalWeightLoss > 0 
                    ? `Great progress! You&apos;ve lost ${totalWeightLoss.toFixed(1)} kg. Keep up the consistent effort to reach your goal.`
                    : totalWeightLoss < 0
                    ? `You&apos;ve gained ${Math.abs(totalWeightLoss).toFixed(1)} kg. Consider reviewing your calorie intake and activity levels.`
                    : 'Your weight has remained stable. Adjust your plan if you have specific goals in mind.'
                  }
                </Text>
              </View>
            </View>
          )}

          {/* Weekly Deficit Visualization - Enhanced */}
          <View className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 p-6 mb-6">
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-2xl font-black text-gray-900 dark:text-white">
                Weekly Progress
              </Text>
              <View className="bg-emerald-100 dark:bg-emerald-900/30 px-3 py-1 rounded-full">
                <Text className="text-emerald-600 dark:text-emerald-400 text-sm font-bold">
                  4 Weeks
                </Text>
              </View>
            </View>
            
            {/* Custom Modern Bar Chart */}
            <View className="bg-gray-50 dark:bg-gray-700 rounded-3xl p-6 mb-6">
              <View className="flex-row items-end justify-between" style={{ height: 200 }}>
                {weeklyData.map((week, index) => {
                  const maxDeficit = Math.max(...weeklyData.map(w => Math.abs(w.deficit)));
                  const barHeight = maxDeficit > 0 ? (Math.abs(week.deficit) / maxDeficit) * 160 : 0;
                  const isCurrentWeek = week.week === 'W4';
                  const isHighest = Math.abs(week.deficit) === maxDeficit;
                  
                  return (
                    <View key={index} className="items-center flex-1 mx-1">
                      {/* Value Label on Top */}
                      <View className="mb-2 min-h-[24px] justify-end">
                        {barHeight > 20 && (
                          <Text className={`text-sm font-bold text-center ${
                            isCurrentWeek ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-600 dark:text-gray-300'
                          }`}>
                            {(Math.abs(week.deficit) / 1000).toFixed(1)}k
                          </Text>
                        )}
                      </View>
                      
                      {/* Bar Container */}
                      <View className="relative w-full items-center">
                        {/* Animated Bar */}
                        <View 
                          className={`w-full rounded-t-2xl shadow-lg ${
                            isCurrentWeek 
                              ? 'bg-emerald-500' 
                              : isHighest
                                ? 'bg-blue-500'
                                : 'bg-gray-400'
                          }`}
                          style={{ 
                            height: Math.max(barHeight, 8), // Minimum height for visibility
                            shadowColor: isCurrentWeek ? '#10B981' : '#6B7280',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.3,
                            shadowRadius: 4,
                          }}
                        >
                          {/* Highlight Effect */}
                          <View 
                            className="absolute top-0 left-1 right-1 h-2 bg-white/30 rounded-t-xl"
                          />
                          
                          {/* Achievement Badge for Highest */}
                          {isHighest && (
                            <View className="absolute -top-2 -right-1">
                              <View className="bg-yellow-400 w-4 h-4 rounded-full items-center justify-center">
                                <Text className="text-xs">⭐</Text>
                              </View>
                            </View>
                          )}
                        </View>
                        
                        {/* Base Line */}
                        <View className="w-full h-1 bg-gray-300 dark:bg-gray-600 rounded-b-sm" />
                      </View>
                      
                      {/* Week Label */}
                      <Text className={`text-sm font-bold mt-3 ${
                        isCurrentWeek ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {isCurrentWeek ? 'Now' : week.week}
                      </Text>
                      
                      {/* Fat Loss Indicator */}
                      <Text className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        -{week.fatLoss.toFixed(1)}kg
                      </Text>
                    </View>
                  );
                })}
              </View>
              
              {/* Chart Legend */}
              <View className="flex-row justify-center mt-4 space-x-4">
                <View className="flex-row items-center">
                  <View className="w-3 h-3 bg-emerald-500 rounded mr-2" />
                  <Text className="text-xs text-gray-600 dark:text-gray-400">Current Week</Text>
                </View>
                <View className="flex-row items-center">
                  <View className="w-3 h-3 bg-blue-500 rounded mr-2" />
                  <Text className="text-xs text-gray-600 dark:text-gray-400">Best Week</Text>
                </View>
              </View>
            </View>
            
            {/* Weekly Summary Cards */}
            <View className="space-y-3">
              <Text className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                Detailed Breakdown
              </Text>
              
              {weeklyData.map((week, index) => {
                const isCurrentWeek = week.week === 'W4';
                const isHighest = Math.abs(week.deficit) === Math.max(...weeklyData.map(w => Math.abs(w.deficit)));
                
                return (
                  <View key={index} className={`rounded-2xl p-4 border-2  mb-3 ${
                    isCurrentWeek 
                      ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-700' 
                      : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                  }`}>
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center">
                        <View className={`w-4 h-4 rounded mr-3 ${
                          isCurrentWeek ? 'bg-emerald-500' : isHighest ? 'bg-blue-500' : 'bg-gray-400'
                        }`} />
                        <View>
                          <Text className={`text-lg font-bold ${
                            isCurrentWeek ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-900 dark:text-white'
                          }`}>
                            {isCurrentWeek ? 'This Week' : `Week ${index + 1}`}
                            {isHighest && <Text className="text-yellow-500"> ⭐</Text>}
                          </Text>
                          <Text className="text-sm text-gray-500 dark:text-gray-400">
                            {Math.abs(week.deficit / 7).toFixed(0)} cal/day average
                          </Text>
                        </View>
                      </View>
                      
                      <View className="items-end">
                        <Text className={`text-2xl font-black ${
                          isCurrentWeek ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-900 dark:text-white'
                        }`}>
                          -{(Math.abs(week.deficit) / 1000).toFixed(1)}k
                        </Text>
                        <Text className="text-sm text-gray-500 dark:text-gray-400">
                          {week.fatLoss.toFixed(2)} kg loss
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Achievement Cards */}
          <View className="flex-row justify-between mb-6">
            <View className="bg-yellow-500 rounded-3xl shadow-xl p-6 flex-1 mr-3">
              <View className="items-center">
                <Text className="text-4xl mb-2">🏆</Text>
                <Text className="text-white text-lg font-bold text-center">
                  Consistency
                </Text>
                <Text className="text-white/80 text-sm text-center">
                  7 day streak!
                </Text>
              </View>
            </View>
            
            <View className="bg-pink-500 rounded-3xl shadow-xl p-6 flex-1 ml-3">
              <View className="items-center">
                <Text className="text-4xl mb-2">🎯</Text>
                <Text className="text-white text-lg font-bold text-center">
                  Goal Crusher
                </Text>
                <Text className="text-white/80 text-sm text-center">
                  Weekly target hit!
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
} 