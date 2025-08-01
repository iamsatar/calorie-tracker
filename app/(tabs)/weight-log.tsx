import { NumericKeyboard } from '@/components/ui/NumericKeyboard';
import { useCalorieStore } from '@/store/calorieStore';
import { formatDate } from '@/utils/dateUtils';
import React, { useCallback, useMemo, useState } from 'react';
import { Alert, Dimensions, Modal, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const isTablet = SCREEN_WIDTH >= 768;
const isWeb = Platform.OS === 'web';

export default function WeightLogScreen() {
  const [weightInput, setWeightInput] = useState('');
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'all'>('month');
  const { weightEntries, addWeightEntry, getLatestWeight } = useCalorieStore();
  
  const latestWeight = getLatestWeight();
  const today = formatDate(new Date());

  // Memoized calculations for performance
  const sortedEntries = useMemo(() => {
    return weightEntries
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, selectedTimeframe === 'week' ? 7 : selectedTimeframe === 'month' ? 30 : 50);
  }, [weightEntries, selectedTimeframe]);

  const weightStats = useMemo(() => {
    if (weightEntries.length < 2) return null;
    
    const sorted = [...weightEntries].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    const first = sorted[0];
    const last = sorted[sorted.length - 1];
    const change = last.weight - first.weight;
    const average = weightEntries.reduce((sum, entry) => sum + entry.weight, 0) / weightEntries.length;
    const min = Math.min(...weightEntries.map(e => e.weight));
    const max = Math.max(...weightEntries.map(e => e.weight));
    
    return {
      change: Math.abs(change),
      isLoss: change < 0,
      percentage: ((change / first.weight) * 100).toFixed(1),
      average: average.toFixed(1),
      min: min.toFixed(1),
      max: max.toFixed(1),
      totalEntries: weightEntries.length,
      streak: calculateStreak(),
    };
  }, [weightEntries]);

  const calculateStreak = useCallback(() => {
    if (weightEntries.length === 0) return 0;
    
    const sortedByDate = [...weightEntries].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < sortedByDate.length; i++) {
      const entryDate = new Date(sortedByDate[i].date);
      const daysDiff = Math.floor((today.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === i) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  }, [weightEntries]);

  const getWeightTrend = useMemo(() => {
    if (weightEntries.length < 3) return null;
    
    const recent = sortedEntries.slice(0, 5);
    const weights = recent.map(e => e.weight);
    
    const trend = weights.reduce((acc, weight, index) => {
      if (index === 0) return acc;
      return acc + (weight - weights[index - 1]);
    }, 0) / (weights.length - 1);
    
    if (trend < -0.1) return 'decreasing';
    if (trend > 0.1) return 'increasing';
    return 'stable';
  }, [sortedEntries, weightEntries.length]);

  const handleAddWeight = useCallback((weight?: number) => {
    const weightValue = weight || parseFloat(weightInput);
    if (isNaN(weightValue) || weightValue <= 0 || weightValue > 500) {
      Alert.alert('Invalid Input', 'Please enter a valid weight between 1-500 kg');
      return;
    }

    addWeightEntry(today, weightValue);
    setWeightInput('');
    setShowWeightModal(false);
    
    // Success feedback with haptics on mobile
    if (Platform.OS !== 'web') {
      // Haptic feedback would go here
    }
    
    Alert.alert('✅ Success', `Weight logged: ${weightValue} kg`, [
      { text: 'Great!', style: 'default' }
    ]);
  }, [weightInput, today, addWeightEntry]);

  const handleNumberPress = useCallback((num: string) => {
    if (weightInput.includes('.') && num === '.') return;
    if (weightInput.length < 6) {
      setWeightInput(prev => prev + num);
    }
  }, [weightInput]);

  const handleBackspace = useCallback(() => {
    setWeightInput(prev => prev.slice(0, -1));
  }, []);

  const handleClear = useCallback(() => {
    setWeightInput('');
  }, []);

  const getTrendEmoji = () => {
    if (!getWeightTrend) return '📊';
    if (getWeightTrend === 'decreasing') return '📉';
    if (getWeightTrend === 'increasing') return '📈';
    return '➡️';
  };

  const getTrendMessage = () => {
    if (!getWeightTrend) return 'Keep logging to see trends';
    if (getWeightTrend === 'decreasing') return 'Excellent progress! 🎉';
    if (getWeightTrend === 'increasing') return 'Stay focused on your goals 💪';
    return 'Maintaining steady progress ⚖️';
  };

  const getTrendColor = () => {
    if (!getWeightTrend) return 'text-blue-500';
    if (getWeightTrend === 'decreasing') return 'text-emerald-500';
    if (getWeightTrend === 'increasing') return 'text-orange-500';
    return 'text-blue-500';
  };

  const getMotivationalMessage = () => {
    if (!weightStats) return "Start your journey today! 🚀";
    
    if (weightStats.streak >= 7) return `Amazing ${weightStats.streak}-day streak! 🔥`;
    if (weightStats.streak >= 3) return `Great ${weightStats.streak}-day streak! Keep going! 💪`;
    if (weightStats.isLoss && weightStats.change >= 1) return `You&apos;ve lost ${weightStats.change}kg! Outstanding! 🎉`;
         if (weightStats.totalEntries >= 30) return `${weightStats.totalEntries} entries logged! You&apos;re dedicated! ⭐`;
    return "Every entry counts! Keep tracking! 📈";
  };

  // Responsive design calculations
  const cardPadding = isTablet ? 'p-8' : 'p-6';
  const headerPadding = isTablet ? 'px-8 pt-12 pb-16' : 'px-6 pt-8 pb-12';
  const quickButtonSize = isTablet ? 'h-20' : 'h-16';
  const fontSize = {
    hero: isTablet ? 'text-6xl' : 'text-5xl',
    title: isTablet ? 'text-3xl' : 'text-2xl',
    stat: isTablet ? 'text-3xl' : 'text-2xl',
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: isTablet ? 40 : 20 }}
      >
        {/* Hero Header with Gradient Effect */}
        <View className={`bg-indigo-600 dark:bg-indigo-700 ${headerPadding}`}>
          <View className="flex-row items-center justify-between mb-8">
            <View className="flex-1">
              <Text className={`${fontSize.hero} font-black text-white mb-2`}>
                {latestWeight ? `${latestWeight}` : '--'}
              </Text>
              <Text className="text-white/90 text-xl font-bold mb-1">
                {latestWeight ? 'kg current weight' : 'Ready to start tracking?'}
              </Text>
              <Text className="text-white/70 text-base">
                {getMotivationalMessage()}
              </Text>
            </View>
            
            {/* Trend Indicator */}
            <View className="items-center">
              <View className="bg-white/20 w-20 h-20 rounded-3xl items-center justify-center border border-white/30 mb-2">
                <Text className="text-4xl">{getTrendEmoji()}</Text>
              </View>
              <Text className="text-white/80 text-sm font-semibold text-center">
                Trend
              </Text>
            </View>
          </View>

          {/* Stats Overview */}
          {weightStats && (
            <View className="bg-white/10 rounded-3xl p-6 border border-white/20">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-white text-lg font-bold">Progress Overview</Text>
                <Text className={`text-sm font-bold ${getTrendColor()}`}>
                  {getTrendMessage()}
                </Text>
              </View>
              
              <View className="flex-row justify-between">
                <View className="items-center flex-1">
                  <Text className="text-2xl font-black text-white mb-1">
                    {weightStats.change}
                  </Text>
                  <Text className="text-white/80 text-sm font-semibold text-center">
                    kg {weightStats.isLoss ? 'lost' : 'gained'}
                  </Text>
                </View>
                
                <View className="items-center flex-1">
                  <Text className="text-2xl font-black text-white mb-1">
                    {weightStats.streak}
                  </Text>
                  <Text className="text-white/80 text-sm font-semibold text-center">
                    day streak
                  </Text>
                </View>
                
                <View className="items-center flex-1">
                  <Text className="text-2xl font-black text-white mb-1">
                    {weightStats.totalEntries}
                  </Text>
                  <Text className="text-white/80 text-sm font-semibold text-center">
                    total logs
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>

        <View className={`${isTablet ? 'px-8' : 'px-6'} -mt-6`}>
          {/* Advanced Trend Analysis Card */}
          <View className={`bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 ${cardPadding} mb-6`}>
            <View className="flex-row items-center justify-between mb-6">
              <View className="flex-1">
                <Text className={`${fontSize.title} font-black mb-2 ${getTrendColor()}`}>
                  {getTrendMessage()}
                </Text>
                <Text className="text-gray-600 dark:text-gray-400 text-base">
                  Based on your recent entries and patterns
                </Text>
              </View>
              <View className="bg-indigo-100 dark:bg-indigo-900/30 w-20 h-20 rounded-3xl items-center justify-center">
                <Text className="text-4xl">{getTrendEmoji()}</Text>
              </View>
            </View>
            
            {/* Progress Visualization */}
            {weightStats && (
              <View className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-4">
                <View className="flex-row justify-between items-center">
                  <View className="items-center">
                    <Text className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-1">START</Text>
                    <Text className="text-lg font-black text-gray-900 dark:text-white">
                      {weightEntries.length > 0 ? 
                        [...weightEntries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0].weight 
                        : '--'
                      }
                    </Text>
                  </View>
                  
                  <View className="flex-1 mx-4">
                    <View className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                      <View 
                        className={`h-full rounded-full ${
                          weightStats.isLoss ? 'bg-emerald-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${Math.min(Math.abs(parseFloat(weightStats.percentage)), 100)}%` }}
                      />
                    </View>
                    <Text className="text-center text-sm font-bold text-gray-600 dark:text-gray-400 mt-1">
                      {weightStats.percentage}% change
                    </Text>
                  </View>
                  
                  <View className="items-center">
                    <Text className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-1">CURRENT</Text>
                    <Text className="text-lg font-black text-gray-900 dark:text-white">
                      {latestWeight || '--'}
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </View>

          {/* Enhanced Quick Log Section */}
          <View className={`bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 ${cardPadding} mb-6`}>
            <Text className={`${fontSize.title} font-black text-gray-900 dark:text-white mb-6`}>
              Log Today&apos;s Weight
            </Text>
            
            {/* Smart Weight Suggestions */}
            <View className="mb-6">
              <Text className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Smart Suggestions
              </Text>
              <View className={`flex-row flex-wrap ${isTablet ? 'justify-between' : 'justify-between'}`}>
                {(() => {
                  const baseWeights = latestWeight ? 
                    [latestWeight - 1, latestWeight - 0.5, latestWeight, latestWeight + 0.5, latestWeight + 1, latestWeight + 2] :
                    [50, 60, 70, 80, 90, 100];
                  
                  return baseWeights.map((weight, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => handleAddWeight(weight)}
                      className={`bg-indigo-500 rounded-2xl shadow-lg mb-3 ${quickButtonSize} ${
                        isTablet ? 'w-[15%]' : 'w-[30%]'
                      }`}
                      style={{ 
                        minHeight: isTablet ? 80 : 64,
                        shadowColor: '#6366F1',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.3,
                        shadowRadius: 8,
                      }}
                    >
                      <View className="flex-1 items-center justify-center">
                        <Text className={`text-white font-black ${isTablet ? 'text-xl' : 'text-lg'}`}>
                          {weight % 1 === 0 ? weight.toFixed(0) : weight.toFixed(1)}
                        </Text>
                        <Text className="text-white/80 text-xs font-semibold">
                          kg
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ));
                })()}
              </View>
            </View>
            
            {/* Custom Input Button */}
            <TouchableOpacity
              onPress={() => setShowWeightModal(true)}
              className="bg-emerald-500 rounded-2xl p-5 shadow-lg"
              style={{
                shadowColor: '#10B981',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
              }}
            >
              <Text className="text-white text-xl font-bold text-center">
                ⌨️ Enter Custom Weight
              </Text>
            </TouchableOpacity>
          </View>

          {/* Timeframe Selector */}
          <View className={`bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 ${cardPadding} mb-6`}>
            <Text className={`${fontSize.title} font-black text-gray-900 dark:text-white mb-4`}>
              Weight History
            </Text>
            
            <View className="flex-row bg-gray-100 dark:bg-gray-700 rounded-2xl p-1 mb-6">
              {(['week', 'month', 'all'] as const).map((timeframe) => (
                <TouchableOpacity
                  key={timeframe}
                  onPress={() => setSelectedTimeframe(timeframe)}
                  className={`flex-1 py-3 rounded-xl ${
                    selectedTimeframe === timeframe
                      ? 'bg-indigo-500 shadow-lg'
                      : 'bg-transparent'
                  }`}
                >
                  <Text className={`text-center font-bold capitalize ${
                    selectedTimeframe === timeframe
                      ? 'text-white'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}>
                    {timeframe === 'all' ? 'All Time' : `Past ${timeframe}`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            {sortedEntries.length === 0 ? (
              <View className="py-16 items-center">
                <View className="bg-gray-100 dark:bg-gray-700 w-24 h-24 rounded-3xl items-center justify-center mb-6">
                  <Text className="text-5xl">⚖️</Text>
                </View>
                <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  No entries yet
                </Text>
                <Text className="text-gray-500 dark:text-gray-400 text-center text-base leading-relaxed">
                  Start tracking your weight to see your progress over time and unlock insights
                </Text>
              </View>
            ) : (
              <View className="space-y-3">
                {sortedEntries.map((entry, index) => {
                  const prevEntry = sortedEntries[index + 1];
                  const change = prevEntry ? entry.weight - prevEntry.weight : 0;
                  const isToday = entry.date === today;
                  const daysSinceEntry = Math.floor((new Date().getTime() - new Date(entry.date).getTime()) / (1000 * 60 * 60 * 24));
                  
                  return (
                    <View key={entry.date} className={`rounded-2xl p-5 border-2 ${
                      isToday 
                        ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-700' 
                        : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                    }`}>
                      <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center flex-1">
                          <View className={`w-5 h-5 rounded mr-4 ${
                            isToday ? 'bg-indigo-500' : 'bg-gray-400'
                          }`} />
                          <View className="flex-1">
                            <Text className={`text-xl font-bold ${
                              isToday ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-900 dark:text-white'
                            }`}>
                              {isToday ? 'Today' : new Date(entry.date).toLocaleDateString('en-US', { 
                                weekday: 'short', 
                                month: 'short', 
                                day: 'numeric' 
                              })}
                            </Text>
                            <Text className="text-sm text-gray-500 dark:text-gray-400">
                              {daysSinceEntry === 0 ? 'Today' : 
                               daysSinceEntry === 1 ? 'Yesterday' : 
                               `${daysSinceEntry} days ago`}
                            </Text>
                          </View>
                        </View>
                        
                        <View className="items-end">
                          <Text className={`text-3xl font-black ${
                            isToday ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-900 dark:text-white'
                          }`}>
                            {entry.weight}
                          </Text>
                          <Text className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                            kg
                          </Text>
                          {change !== 0 && (
                            <Text className={`text-sm font-bold ${
                              change < 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                            }`}>
                              {change < 0 ? '↓' : '↑'} {Math.abs(change).toFixed(1)} kg
                            </Text>
                          )}
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </View>

          {/* Enhanced Statistics */}
          {weightStats && (
            <View className={`bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 ${cardPadding} mb-8`}>
              <Text className={`${fontSize.title} font-black text-gray-900 dark:text-white mb-8`}>
                Detailed Statistics
              </Text>
              
              <View className="space-y-6">
                <View className="flex-row justify-between">
                  <View className="items-center flex-1">
                    <View className="bg-blue-100 dark:bg-blue-900/30 w-20 h-20 rounded-3xl items-center justify-center mb-4">
                      <Text className="text-blue-600 dark:text-blue-400 text-3xl">📊</Text>
                    </View>
                    <Text className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">
                      Average Weight
                    </Text>
                    <Text className={`${fontSize.stat} font-black text-gray-900 dark:text-white`}>
                      {weightStats.average}
                    </Text>
                    <Text className="text-sm text-gray-500 dark:text-gray-400">
                      kg
                    </Text>
                  </View>
                  
                  <View className="items-center flex-1">
                    <View className="bg-emerald-100 dark:bg-emerald-900/30 w-20 h-20 rounded-3xl items-center justify-center mb-4">
                      <Text className="text-emerald-600 dark:text-emerald-400 text-3xl">📉</Text>
                    </View>
                    <Text className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">
                      Lowest Weight
                    </Text>
                    <Text className={`${fontSize.stat} font-black text-emerald-600 dark:text-emerald-400`}>
                      {weightStats.min}
                    </Text>
                    <Text className="text-sm text-gray-500 dark:text-gray-400">
                      kg
                    </Text>
                  </View>
                  
                  <View className="items-center flex-1">
                    <View className="bg-red-100 dark:bg-red-900/30 w-20 h-20 rounded-3xl items-center justify-center mb-4">
                      <Text className="text-red-600 dark:text-red-400 text-3xl">📈</Text>
                    </View>
                    <Text className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">
                      Highest Weight
                    </Text>
                    <Text className={`${fontSize.stat} font-black text-red-600 dark:text-red-400`}>
                      {weightStats.max}
                    </Text>
                    <Text className="text-sm text-gray-500 dark:text-gray-400">
                      kg
                    </Text>
                  </View>
                </View>
                
                {/* Additional Stats Row */}
                <View className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-6">
                  <View className="flex-row justify-between items-center">
                    <View className="items-center flex-1">
                      <Text className="text-2xl font-black text-purple-600 dark:text-purple-400 mb-1">
                        {weightStats.streak}
                      </Text>
                      <Text className="text-sm font-bold text-gray-600 dark:text-gray-400 text-center">
                        Day Streak
                      </Text>
                    </View>
                    
                    <View className="items-center flex-1">
                      <Text className="text-2xl font-black text-blue-600 dark:text-blue-400 mb-1">
                        {weightStats.totalEntries}
                      </Text>
                      <Text className="text-sm font-bold text-gray-600 dark:text-gray-400 text-center">
                        Total Entries
                      </Text>
                    </View>
                    
                    <View className="items-center flex-1">
                      <Text className={`text-2xl font-black mb-1 ${
                        weightStats.isLoss ? 'text-emerald-600 dark:text-emerald-400' : 'text-orange-600 dark:text-orange-400'
                      }`}>
                        {weightStats.percentage}%
                      </Text>
                      <Text className="text-sm font-bold text-gray-600 dark:text-gray-400 text-center">
                        Total Change
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Enhanced Custom Weight Input Modal */}
      <Modal
        visible={showWeightModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowWeightModal(false)}
      >
        <View className="flex-1 bg-black/60 justify-end">
          <View className="bg-white dark:bg-gray-800 rounded-t-3xl overflow-hidden"
                style={{ maxHeight: SCREEN_HEIGHT * 0.8 }}>
            <View className="p-8 border-b border-gray-200 dark:border-gray-700">
              <View className="w-16 h-1 bg-gray-300 dark:bg-gray-600 rounded-full self-center mb-8" />
              
              <Text className={`${fontSize.title} font-black text-gray-900 dark:text-white mb-8 text-center`}>
                Enter Your Weight
              </Text>
              
              {/* Enhanced Display Input */}
              <View className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:bg-gray-700 rounded-3xl p-8 mb-8">
                <Text className="text-6xl font-black text-gray-900 dark:text-white text-center mb-2">
                  {weightInput || '0'}
                </Text>
                <Text className="text-gray-500 dark:text-gray-400 text-center text-lg font-semibold">
                  kilograms
                </Text>
                
                {/* Weight Validation Indicator */}
                {weightInput && (
                  <View className="mt-4">
                    {parseFloat(weightInput) > 0 && parseFloat(weightInput) <= 500 ? (
                      <Text className="text-emerald-600 dark:text-emerald-400 text-center font-semibold">
                        ✅ Valid weight range
                      </Text>
                    ) : (
                      <Text className="text-red-600 dark:text-red-400 text-center font-semibold">
                        ⚠️ Please enter a weight between 1-500 kg
                      </Text>
                    )}
                  </View>
                )}
              </View>
              
              <View className="flex-row space-x-4">
                <TouchableOpacity
                  onPress={() => setShowWeightModal(false)}
                  className="bg-gray-200 dark:bg-gray-700 rounded-2xl p-5 flex-1"
                >
                  <Text className="text-gray-900 dark:text-white text-xl font-bold text-center">
                    Cancel
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  onPress={() => handleAddWeight()}
                  className={`rounded-2xl p-5 flex-1 ${
                    weightInput && parseFloat(weightInput) > 0 && parseFloat(weightInput) <= 500
                      ? 'bg-emerald-500' 
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                  disabled={!weightInput || parseFloat(weightInput) <= 0 || parseFloat(weightInput) > 500}
                >
                  <Text className={`text-xl font-bold text-center ${
                    weightInput && parseFloat(weightInput) > 0 && parseFloat(weightInput) <= 500
                      ? 'text-white' 
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    🎯 Log Weight
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            
            {/* Custom Numeric Keyboard with Enhanced Design */}
            <View className="bg-gray-50 dark:bg-gray-800">
              <NumericKeyboard
                onNumberPress={handleNumberPress}
                onBackspace={handleBackspace}
                onClear={handleClear}
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
} 