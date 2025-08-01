import { useColorScheme } from '@/hooks/useColorScheme';
import { useCalorieStore, UserProfile } from '@/store/calorieStore';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Appearance, Dimensions, Platform, ScrollView, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isTablet = SCREEN_WIDTH >= 768;
const isWeb = Platform.OS === 'web';

export default function SettingsScreen() {
  const [isReady, setIsReady] = useState(false);
  const { userProfile, setUserProfile, calculateTDEE, weightEntries } = useCalorieStore();
  const colorScheme = useColorScheme();
  const [isDark, setIsDark] = useState(colorScheme === 'dark');

  // Ensure component is ready before rendering
  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isReady) {
      setIsDark(colorScheme === 'dark');
    }
  }, [colorScheme, isReady]);

  const toggleTheme = useCallback(() => {
    if (!isReady) return;
    
    const newTheme = isDark ? 'light' : 'dark';
    Appearance.setColorScheme(newTheme);
    setIsDark(!isDark);
  }, [isDark, isReady]);
  
  const [profile, setProfile] = useState<UserProfile>({
    age: userProfile?.age || 30,
    height: userProfile?.height || 170,
    weight: userProfile?.weight || 70,
    activityLevel: userProfile?.activityLevel || 'moderate',
    gender: userProfile?.gender || 'male',
  });

  const activityLevels = useMemo(() => [
    { 
      key: 'sedentary', 
      label: 'Sedentary', 
      description: 'Little to no exercise',
      icon: '🛋️',
      multiplier: 1.2 
    },
    { 
      key: 'light', 
      label: 'Lightly Active', 
      description: 'Light exercise 1-3 days/week',
      icon: '🚶',
      multiplier: 1.375 
    },
    { 
      key: 'moderate', 
      label: 'Moderately Active', 
      description: 'Moderate exercise 3-5 days/week',
      icon: '🏃',
      multiplier: 1.55 
    },
    { 
      key: 'active', 
      label: 'Very Active', 
      description: 'Hard exercise 6-7 days/week',
      icon: '💪',
      multiplier: 1.725 
    },
    { 
      key: 'very_active', 
      label: 'Extremely Active', 
      description: 'Very hard exercise, physical job',
      icon: '🏋️',
      multiplier: 1.9 
    },
  ], []);

  const handleSaveProfile = useCallback(() => {
    if (!isReady) return;
    
    if (profile.age < 10 || profile.age > 120) {
      Alert.alert('Invalid Age', 'Please enter a valid age between 10 and 120');
      return;
    }
    if (profile.height < 100 || profile.height > 250) {
      Alert.alert('Invalid Height', 'Please enter a valid height between 100 and 250 cm');
      return;
    }
    if (profile.weight < 30 || profile.weight > 300) {
      Alert.alert('Invalid Weight', 'Please enter a valid weight between 30 and 300 kg');
      return;
    }

    setUserProfile(profile);
    Alert.alert('✅ Success', 'Profile updated successfully!', [
      { text: 'Great!', style: 'default' }
    ]);
  }, [profile, setUserProfile, isReady]);

  const tdee = useMemo(() => {
    if (!isReady) return null;
    return calculateTDEE();
  }, [calculateTDEE, isReady]);

  const getBMI = useCallback(() => {
    const heightInM = profile.height / 100;
    const bmi = profile.weight / (heightInM * heightInM);
    return bmi.toFixed(1);
  }, [profile.height, profile.weight]);

  const getBMICategory = useCallback(() => {
    const bmi = parseFloat(getBMI());
    if (bmi < 18.5) return { category: 'Underweight', color: 'text-blue-500', emoji: '📉' };
    if (bmi < 25) return { category: 'Normal', color: 'text-emerald-500', emoji: '✅' };
    if (bmi < 30) return { category: 'Overweight', color: 'text-orange-500', emoji: '⚠️' };
    return { category: 'Obese', color: 'text-red-500', emoji: '🚨' };
  }, [getBMI]);

  const getCalorieGoals = useCallback(() => {
    if (!tdee) return null;
    
    return {
      maintain: Math.round(tdee),
      mildLoss: Math.round(tdee - 250), // 0.5 lbs/week
      moderateLoss: Math.round(tdee - 500), // 1 lb/week
      aggressiveLoss: Math.round(tdee - 750), // 1.5 lbs/week
      gain: Math.round(tdee + 500), // 1 lb/week gain
    };
  }, [tdee]);

  const getProfileCompleteness = useCallback(() => {
    const fields = [profile.age > 0, profile.height > 0, profile.weight > 0, profile.gender, profile.activityLevel];
    const completed = fields.filter(Boolean).length;
    return Math.round((completed / fields.length) * 100);
  }, [profile]);

  // Responsive design calculations
  const cardPadding = isTablet ? 'p-8' : 'p-6';
  const headerPadding = isTablet ? 'px-8 pt-12 pb-16' : 'px-6 pt-8 pb-12';
  const fontSize = {
    hero: isTablet ? 'text-6xl' : 'text-5xl',
    title: isTablet ? 'text-3xl' : 'text-2xl',
    stat: isTablet ? 'text-3xl' : 'text-2xl',
  };

  if (!isReady) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-500 dark:text-gray-400 text-lg">Loading settings...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const bmiInfo = getBMICategory();
  const calorieGoals = getCalorieGoals();
  const completeness = getProfileCompleteness();

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: isTablet ? 40 : 20 }}
      >
        {/* Hero Header */}
        <View className={`bg-purple-600 dark:bg-purple-700 ${headerPadding}`}>
          <View className="flex-row items-center justify-between mb-8">
            <View className="flex-1">
              <Text className={`${fontSize.hero} font-black text-white mb-2`}>
                Settings
              </Text>
              <Text className="text-white/90 text-xl font-bold mb-1">
                Personalize your experience
              </Text>
              <Text className="text-white/70 text-base">
                {completeness}% profile complete
              </Text>
            </View>
            
            {/* Profile Completeness Ring */}
            <View className="items-center">
              <View className="bg-white/20 w-20 h-20 rounded-3xl items-center justify-center border border-white/30 mb-2">
                <Text className="text-white text-2xl font-black">
                  {completeness}%
                </Text>
              </View>
              <Text className="text-white/80 text-sm font-semibold text-center">
                Complete
              </Text>
            </View>
          </View>

          {/* Quick Stats Overview */}
          <View className="bg-white/10 rounded-3xl p-6 border border-white/20">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-white text-lg font-bold">Health Overview</Text>
              <Text className={`text-sm font-bold ${bmiInfo.color}`}>
                {bmiInfo.emoji} {bmiInfo.category}
              </Text>
            </View>
            
            <View className="flex-row justify-between">
              <View className="items-center flex-1">
                <Text className="text-2xl font-black text-white mb-1">
                  {getBMI()}
                </Text>
                <Text className="text-white/80 text-sm font-semibold text-center">
                  BMI
                </Text>
              </View>
              
              <View className="items-center flex-1">
                <Text className="text-2xl font-black text-white mb-1">
                  {tdee ? Math.round(tdee / 1000) : '--'}k
                </Text>
                <Text className="text-white/80 text-sm font-semibold text-center">
                  TDEE
                </Text>
              </View>
              
              <View className="items-center flex-1">
                <Text className="text-2xl font-black text-white mb-1">
                  {weightEntries?.length || 0}
                </Text>
                <Text className="text-white/80 text-sm font-semibold text-center">
                  Entries
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View className={`${isTablet ? 'px-8' : 'px-6'} -mt-6`}>
          {/* Profile Section */}
          <View className={`bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 ${cardPadding} mb-6`}>
            <Text className={`${fontSize.title} font-black text-gray-900 dark:text-white mb-6`}>
              Personal Information
            </Text>
            
            <View className="space-y-6">
              {/* Age Input */}
              <View>
                <Text className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase mb-4">
                  Age
                </Text>
                <View className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-6 border-2 border-gray-200 dark:border-gray-600">
                  <View className="flex-row items-center">
                    <View className="w-12 h-12 bg-blue-500 rounded-2xl items-center justify-center mr-4">
                      <Text className="text-white text-xl">🎂</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                        Age in Years
                      </Text>
                      <TextInput
                        value={profile.age.toString()}
                        onChangeText={(value) => setProfile(prev => ({ ...prev, age: parseInt(value) || 0 }))}
                        keyboardType="numeric"
                        placeholder="30"
                        className="text-2xl font-black text-purple-600 dark:text-purple-400 bg-transparent"
                        placeholderTextColor="#9CA3AF"
                      />
                    </View>
                    <Text className="text-sm text-gray-500 dark:text-gray-400 font-semibold">
                      years old
                    </Text>
                  </View>
                </View>
              </View>

              {/* Gender Selection */}
              <View>
                <Text className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase mt-4 mb-2">
                  Gender
                </Text>
                                <View className="flex-row space-x-3 gap-2">
                  <TouchableOpacity
                    onPress={() => setProfile(prev => ({ ...prev, gender: 'male' }))}
                    className={profile.gender === 'male' 
                      ? 'bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-500 rounded-2xl p-5 flex-[0.45]' 
                      : 'bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-2xl p-5 flex-[0.45]'
                    }
                  >
                    <View className="flex-row items-center">
                      <View className="w-10 h-10 bg-blue-500 rounded-xl items-center justify-center mr-3">
                        <Text className="text-white text-lg">👨</Text>
                      </View>
                      <View className="flex-1">
                        <Text className={profile.gender === 'male' 
                          ? 'text-sm font-bold text-purple-600 dark:text-purple-400' 
                          : 'text-sm font-bold text-gray-900 dark:text-white'
                        }>
                          Male
                        </Text>
                      
                      </View>
                      {profile.gender === 'male' && (
                        <View className="w-6 h-6 bg-purple-500 rounded-full items-center justify-center">
                          <Text className="text-white text-xs font-bold">✓</Text>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    onPress={() => setProfile(prev => ({ ...prev, gender: 'female' }))}
                    className={profile.gender === 'female' 
                      ? 'bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-500 rounded-2xl p-5 flex-[0.53]' 
                      : 'bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-2xl p-5 flex-[0.53]'
                    }
                  >
                    <View className="flex-row items-center">
                      <View className="w-10 h-10 bg-pink-500 rounded-xl items-center justify-center mr-3">
                        <Text className="text-white text-lg">👩</Text>
                      </View>
                      <View className="flex-1">
                        <Text className={profile.gender === 'female' 
                          ? 'text-sm font-bold text-purple-600 dark:text-purple-400' 
                          : 'text-sm font-bold text-gray-900 dark:text-white'
                        }>
                          Female
                        </Text>
                      
                      </View>
                      {profile.gender === 'female' && (
                        <View className="w-6 h-6 bg-purple-500 rounded-full items-center justify-center">
                          <Text className="text-white text-xs font-bold">✓</Text>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Height Input */}
              <View>
                <Text className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase mt-4 mb-2">
                  Height
                </Text>
                <View className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-6 border-2 border-gray-200 dark:border-gray-600">
                  <View className="flex-row items-center">
                    <View className="w-12 h-12 bg-emerald-500 rounded-2xl items-center justify-center mr-4">
                      <Text className="text-white text-xl">📏</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                        Height in Centimeters
                      </Text>
                      <TextInput
                        value={profile.height.toString()}
                        onChangeText={(value) => setProfile(prev => ({ ...prev, height: parseInt(value) || 0 }))}
                        keyboardType="numeric"
                        placeholder="170"
                        className="text-2xl font-black text-purple-600 dark:text-purple-400 bg-transparent"
                        placeholderTextColor="#9CA3AF"
                      />
                    </View>
                    <Text className="text-sm text-gray-500 dark:text-gray-400 font-semibold">
                      cm
                    </Text>
                  </View>
                </View>
              </View>

              {/* Weight Input */}
              <View>
                <Text className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase mt-4 mb-2">
                  Weight
                </Text>
                <View className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-6 border-2 border-gray-200 dark:border-gray-600">
                  <View className="flex-row items-center">
                    <View className="w-12 h-12 bg-orange-500 rounded-2xl items-center justify-center mr-4">
                      <Text className="text-white text-xl">⚖️</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                        Weight in Kilograms
                      </Text>
                      <TextInput
                        value={profile.weight.toString()}
                        onChangeText={(value) => setProfile(prev => ({ ...prev, weight: parseInt(value) || 0 }))}
                        keyboardType="numeric"
                        placeholder="70"
                        className="text-2xl font-black text-purple-600 dark:text-purple-400 bg-transparent"
                        placeholderTextColor="#9CA3AF"
                      />
                    </View>
                    <Text className="text-sm text-gray-500 dark:text-gray-400 font-semibold">
                      kg
                    </Text>
                  </View>
                </View>
              </View>

              {/* Activity Level */}
              <View>
                <Text className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase mb-2 mt-4">
                  Activity Level
                </Text>
                <View className="space-y-3">
                  {activityLevels.map((level) => (
                    <TouchableOpacity
                      key={level.key}
                      onPress={() => setProfile(prev => ({ ...prev, activityLevel: level.key as any }))}
                      className={`p-5 rounded-2xl border-2 mb-1.5 ${
                        profile.activityLevel === level.key
                          ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-500'
                          : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                      }`}
                    >
                      <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center flex-1">
                          <Text className="text-2xl mr-4">{level.icon}</Text>
                          <View className="flex-1">
                            <Text className={`text-lg font-bold ${
                              profile.activityLevel === level.key 
                                ? 'text-purple-600 dark:text-purple-400' 
                                : 'text-gray-900 dark:text-white'
                            }`}>
                              {level.label}
                            </Text>
                            <Text className={`text-sm ${
                              profile.activityLevel === level.key 
                                ? 'text-purple-500 dark:text-purple-300' 
                                : 'text-gray-500 dark:text-gray-400'
                            }`}>
                              {level.description}
                            </Text>
                          </View>
                        </View>
                        
                        <View className="items-end">
                          <Text className={`text-sm font-bold ${
                            profile.activityLevel === level.key 
                              ? 'text-purple-600 dark:text-purple-400' 
                              : 'text-gray-500 dark:text-gray-400'
                          }`}>
                            ×{level.multiplier}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Save Button */}
              <TouchableOpacity
                onPress={handleSaveProfile}
                className="bg-purple-500 py-5 rounded-2xl shadow-lg mt-6"
                style={{
                  shadowColor: '#8B5CF6',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                }}
              >
                <Text className="text-white text-xl font-bold text-center">
                  💾 Save Profile
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Health Metrics */}
          <View className={`bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 ${cardPadding} mb-6`}>
            <Text className={`${fontSize.title} font-black text-gray-900 dark:text-white mb-6`}>
              Health Metrics
            </Text>
            
            <View className="space-y-4">
              {/* BMI Card */}
              <View className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-6">
                <View className="flex-row items-center justify-between mb-4">
                  <Text className="text-lg font-bold text-gray-900 dark:text-white">
                    Body Mass Index (BMI)
                  </Text>
                  <Text className="text-3xl">{bmiInfo.emoji}</Text>
                </View>
                
                <View className="flex-row items-end justify-between">
                  <View>
                    <Text className={`text-4xl font-black mb-1 ${bmiInfo.color}`}>
                      {getBMI()}
                    </Text>
                    <Text className="text-gray-500 dark:text-gray-400 text-sm">
                      kg/m²
                    </Text>
                  </View>
                  
                  <View className="items-end">
                    <Text className={`text-xl font-bold ${bmiInfo.color}`}>
                      {bmiInfo.category}
                    </Text>
                    <Text className="text-gray-500 dark:text-gray-400 text-sm">
                      Category
                    </Text>
                  </View>
                </View>
              </View>

              {/* TDEE Card */}
              {tdee && (
                <View className="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-6 border-2 border-emerald-200 dark:border-emerald-700">
                  <View className="flex-row items-center justify-between mb-4">
                    <Text className="text-lg font-bold text-gray-900 dark:text-white">
                      Total Daily Energy Expenditure
                    </Text>
                    <Text className="text-3xl">🔥</Text>
                  </View>
                  
                  <Text className="text-4xl font-black text-emerald-600 dark:text-emerald-400 mb-2">
                    {tdee.toLocaleString()}
                  </Text>
                  <Text className="text-gray-600 dark:text-gray-400">
                    calories per day to maintain current weight
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Calorie Goals */}
          {calorieGoals && (
            <View className={`bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 ${cardPadding} mb-6`}>
              <Text className={`${fontSize.title} font-black text-gray-900 dark:text-white mb-6`}>
                Calorie Goals
              </Text>
              
              <View className="space-y-3">
                {[
                  { key: 'aggressiveLoss', label: 'Aggressive Loss', value: calorieGoals.aggressiveLoss, subtitle: '-1.5 lbs/week', color: 'bg-red-500', emoji: '🔥' },
                  { key: 'moderateLoss', label: 'Moderate Loss', value: calorieGoals.moderateLoss, subtitle: '-1 lb/week', color: 'bg-orange-500', emoji: '📉' },
                  { key: 'mildLoss', label: 'Mild Loss', value: calorieGoals.mildLoss, subtitle: '-0.5 lbs/week', color: 'bg-yellow-500', emoji: '📊' },
                  { key: 'maintain', label: 'Maintain Weight', value: calorieGoals.maintain, subtitle: 'Current weight', color: 'bg-emerald-500', emoji: '⚖️' },
                  { key: 'gain', label: 'Weight Gain', value: calorieGoals.gain, subtitle: '+1 lb/week', color: 'bg-blue-500', emoji: '📈' },
                ].map((goal) => (
                  <View key={goal.key} className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-4">
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center flex-1">
                        <View className={`w-12 h-12 ${goal.color} rounded-2xl items-center justify-center mr-4`}>
                          <Text className="text-white text-xl">{goal.emoji}</Text>
                        </View>
                        <View className="flex-1">
                          <Text className="text-lg font-bold text-gray-900 dark:text-white">
                            {goal.label}
                          </Text>
                          <Text className="text-sm text-gray-500 dark:text-gray-400">
                            {goal.subtitle}
                          </Text>
                        </View>
                      </View>
                      
                      <Text className="text-2xl font-black text-gray-900 dark:text-white">
                        {goal.value.toLocaleString()}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Appearance Section */}
          <View className={`bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 ${cardPadding} mb-8`}>
            <Text className={`${fontSize.title} font-black text-gray-900 dark:text-white mb-6`}>
              Appearance
            </Text>
            
            <View className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-6">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <View className="w-12 h-12 bg-indigo-500 rounded-2xl items-center justify-center mr-4">
                    <Text className="text-white text-xl">{isDark ? '🌙' : '☀️'}</Text>
                  </View>
                  <View>
                    <Text className="text-lg font-bold text-gray-900 dark:text-white">
                      Dark Mode
                    </Text>
                    <Text className="text-sm text-gray-500 dark:text-gray-400">
                      {isDark ? 'Dark theme enabled' : 'Light theme enabled'}
                    </Text>
                  </View>
                </View>
                
                <Switch
                  value={isDark}
                  onValueChange={toggleTheme}
                  trackColor={{ false: '#E5E7EB', true: '#8B5CF6' }}
                  thumbColor={isDark ? '#FFFFFF' : '#FFFFFF'}
                  style={{ transform: [{ scaleX: 1.2 }, { scaleY: 1.2 }] }}
                />
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
} 