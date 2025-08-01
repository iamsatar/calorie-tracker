import { NumericKeyboard } from '@/components/ui/NumericKeyboard';
import { useCalorieStore } from '@/store/calorieStore';
import { formatDate } from '@/utils/dateUtils';
import React, { useState } from 'react';
import { Alert, Dimensions, Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: screenWidth } = Dimensions.get('window');

export default function HomeScreen() {
  const [calorieInput, setCalorieInput] = useState('');
  const [showCalorieModal, setShowCalorieModal] = useState(false);
  
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
  const progressPercentage = Math.round(progress * 100);

  const handleAddCalories = (amount?: number) => {
    const calories = amount || parseInt(calorieInput);
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
    setShowCalorieModal(false);
  };

  const handleNumberPress = (num: string) => {
    if (calorieInput.length < 5) { // Limit to 5 digits max
      setCalorieInput(prev => prev + num);
    }
  };

  const handleBackspace = () => {
    setCalorieInput(prev => prev.slice(0, -1));
  };

  const handleClear = () => {
    setCalorieInput('');
  };

  const getProgressColor = () => {
    if (todayData?.isFasting && progress <= 0.8) return '#8B5CF6'; // Purple for fasting
    if (isOverTarget) return '#EF4444'; // Red for over
    if (progress >= 0.8) return '#F59E0B'; // Yellow for almost there
    return '#10B981'; // Green for good
  };

  const getMotivationalMessage = () => {
    if (todayData?.isFasting) return "🌙 Fasting strong today!";
    if (progress >= 1) return "🎯 Goal crushed! Amazing work!";
    if (progress >= 0.8) return "🔥 Almost there! Keep going!";
    if (progress >= 0.5) return "💪 Great progress today!";
    if (progress >= 0.2) return "⚡ Good start! Keep it up!";
    return "🌟 Ready to fuel your day?";
  };

  const CircularProgress = ({ progress, size = 160 }: { progress: number; size?: number }) => {
    const strokeWidth = 12;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;

    return (
      <View className="items-center justify-center">
        <View 
          style={{ width: size, height: size }}
          className="items-center justify-center"
        >
          {/* Background Circle */}
          <View
            style={{
              position: 'absolute',
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth: strokeWidth,
            }}
            className="border-gray-200 dark:border-gray-700"
          />
          
          {/* Progress Circle */}
          <View
            style={{
              position: 'absolute',
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth: strokeWidth,
              borderColor: getProgressColor(),
              transform: [{ rotate: '-90deg' }],
            }}
            className={`${progress > 0 ? 'opacity-100' : 'opacity-0'}`}
          />
          
          {/* Center Content */}
          <View className="items-center">
            <Text className="text-4xl font-black text-white mb-1">
              {progressPercentage}%
            </Text>
            <Text className="text-sm font-semibold text-white/80">
              Complete
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Hero Header */}
        <View className="bg-purple-600 dark:bg-purple-700 px-6 pt-8 pb-12">
          <View className="flex-row items-center justify-between mb-6">
            <View>
              <Text className="text-3xl font-black text-white mb-1">
                Today
              </Text>
              <Text className="text-white/80 text-base font-medium">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </Text>
            </View>
            <View className="bg-white/20 px-4 py-2 rounded-2xl border border-white/30">
              <Text className="text-white text-sm font-bold">
                {getMotivationalMessage().split(' ')[0]}
              </Text>
            </View>
          </View>

          {/* Main Calorie Display Card */}
          <View className="bg-white/10 rounded-3xl p-6 border border-white/20">
            <View className="items-center mb-6">
              <Text className="text-5xl font-black text-white mb-2">
                {consumed.toLocaleString()}
              </Text>
              <Text className="text-white/80 text-lg font-semibold">
                of {target.toLocaleString()} calories
              </Text>
            </View>

            <CircularProgress progress={progress} />

            <View className="items-center mt-6">
              <Text className="text-white text-lg font-bold mb-2">
                {getMotivationalMessage()}
              </Text>
              <Text className={`text-lg font-bold ${
                isOverTarget ? 'text-red-200' : 'text-emerald-200'
              }`}>
                {isOverTarget ? `+${Math.abs(remaining)} over target` : `${remaining} calories remaining`}
              </Text>
            </View>
          </View>
        </View>

        <View className="px-6 -mt-6">
          {/* Quick Add Section */}
          <View className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 p-6 mb-6">
            <Text className="text-2xl font-black text-gray-900 dark:text-white mb-6">
              Add Calories
            </Text>
            
            {/* Quick Add Buttons */}
            <View className="flex-row justify-between mb-6">
              {[100, 200, 300, 500].map((amount) => (
                <TouchableOpacity
                  key={amount}
                  onPress={() => handleAddCalories(amount)}
                  className="bg-blue-500 rounded-2xl shadow-lg flex-1 mx-1"
                  style={{ aspectRatio: 1 }}
                >
                  <View className="flex-1 items-center justify-center">
                    <Text className="text-white text-2xl font-black mb-1">
                      +{amount}
                    </Text>
                    <Text className="text-white/80 text-xs font-semibold">
                      cal
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
            
            {/* Custom Input */}
            <TouchableOpacity
              onPress={() => setShowCalorieModal(true)}
              className="bg-emerald-500 rounded-2xl p-4 shadow-lg"
            >
              <Text className="text-white text-lg font-bold text-center">
                Add Custom Amount
              </Text>
            </TouchableOpacity>
          </View>

          {/* Stats Grid */}
          <View className="flex-row justify-between mb-6">
            <View className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 p-6 flex-1 mr-3">
              <View className="bg-blue-100 dark:bg-blue-900/30 w-12 h-12 rounded-2xl items-center justify-center mb-4">
                <Text className="text-blue-600 dark:text-blue-400 text-2xl">🎯</Text>
              </View>
              <Text className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">
                Daily Target
              </Text>
              <Text className="text-2xl font-black text-gray-900 dark:text-white">
                {(target / 1000).toFixed(1)}k
              </Text>
            </View>
            
            <View className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 p-6 flex-1 ml-3">
              <View className="bg-purple-100 dark:bg-purple-900/30 w-12 h-12 rounded-2xl items-center justify-center mb-4">
                <Text className="text-purple-600 dark:text-purple-400 text-2xl">⚡</Text>
              </View>
              <Text className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">
                TDEE
              </Text>
              <Text className="text-2xl font-black text-gray-900 dark:text-white">
                {tdee ? `${(tdee / 1000).toFixed(1)}k` : '--'}
              </Text>
            </View>
          </View>

          {/* Health Metrics */}
          <View className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 p-6 mb-6">
            <Text className="text-2xl font-black text-gray-900 dark:text-white mb-6">
              Health Metrics
            </Text>
            
            <View className="flex-row justify-between">
              <View className="items-center flex-1">
                <View className="bg-emerald-100 dark:bg-emerald-900/30 w-16 h-16 rounded-2xl items-center justify-center mb-3">
                  <Text className="text-emerald-600 dark:text-emerald-400 text-2xl">⚖️</Text>
                </View>
                <Text className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">
                  Weight
                </Text>
                <Text className="text-xl font-black text-gray-900 dark:text-white">
                  {latestWeight ? `${latestWeight} kg` : '--'}
                </Text>
              </View>
              
              <View className="items-center flex-1">
                <View className="bg-orange-100 dark:bg-orange-900/30 w-16 h-16 rounded-2xl items-center justify-center mb-3">
                  <Text className="text-orange-600 dark:text-orange-400 text-2xl">👟</Text>
                </View>
                <Text className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">
                  Steps
                </Text>
                <Text className="text-xl font-black text-gray-900 dark:text-white">
                  8.2k
                </Text>
              </View>
              
              <View className="items-center flex-1">
                <View className="bg-red-100 dark:bg-red-900/30 w-16 h-16 rounded-2xl items-center justify-center mb-3">
                  <Text className="text-red-600 dark:text-red-400 text-2xl">❤️</Text>
                </View>
                <Text className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">
                  Heart Rate
                </Text>
                <Text className="text-xl font-black text-gray-900 dark:text-white">
                  72 bpm
                </Text>
              </View>
            </View>
          </View>

          {/* Quick Actions */}
          <View className="flex-row justify-between mb-8">
            <TouchableOpacity className="bg-pink-500 rounded-2xl shadow-lg flex-1 mr-3 p-4">
              <Text className="text-white text-lg font-bold text-center">
                📊 View Progress
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity className="bg-purple-500 rounded-2xl shadow-lg flex-1 ml-3 p-4">
              <Text className="text-white text-lg font-bold text-center">
                ⚖️ Log Weight
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Custom Calorie Input Modal with Numeric Keyboard */}
      <Modal
        visible={showCalorieModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCalorieModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white dark:bg-gray-800 rounded-t-3xl overflow-hidden">
            <View className="p-6 border-b border-gray-200 dark:border-gray-700">
              <View className="w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full self-center mb-6" />
              
              <Text className="text-2xl font-black text-gray-900 dark:text-white mb-6 text-center">
                Add Calories
              </Text>
              
              {/* Display Input */}
              <View className="bg-gray-100 dark:bg-gray-700 rounded-2xl p-6 mb-6">
                <Text className="text-4xl font-black text-gray-900 dark:text-white text-center">
                  {calorieInput || '0'}
                </Text>
                <Text className="text-gray-500 dark:text-gray-400 text-center mt-2">
                  calories
                </Text>
              </View>
              
              <View className="flex-row space-x-3">
                <TouchableOpacity
                  onPress={() => setShowCalorieModal(false)}
                  className="bg-gray-200 dark:bg-gray-700 rounded-2xl p-4 flex-1"
                >
                  <Text className="text-gray-900 dark:text-white text-lg font-bold text-center">
                    Cancel
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  onPress={() => handleAddCalories()}
                  className={`rounded-2xl p-4 flex-1 ${
                    calorieInput ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                  disabled={!calorieInput}
                >
                  <Text className={`text-lg font-bold text-center ${
                    calorieInput ? 'text-white' : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    Add Calories
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            
            {/* Custom Numeric Keyboard */}
            <NumericKeyboard
              onNumberPress={handleNumberPress}
              onBackspace={handleBackspace}
              onClear={handleClear}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
