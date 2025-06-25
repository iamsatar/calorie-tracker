import { ThemedText } from '@/components/ThemedText';
import { useCalorieStore, UserProfile } from '@/store/calorieStore';
import React, { useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SettingsScreen() {
  const { userProfile, setUserProfile, calculateTDEE } = useCalorieStore();
  
  const [profile, setProfile] = useState<UserProfile>({
    age: userProfile?.age || 30,
    height: userProfile?.height || 170,
    weight: userProfile?.weight || 70,
    activityLevel: userProfile?.activityLevel || 'moderate',
    gender: userProfile?.gender || 'male',
  });

  const activityLevels = [
    { key: 'sedentary', label: 'Sedentary' },
    { key: 'light', label: 'Lightly active' },
    { key: 'moderate', label: 'Moderately active' },
    { key: 'active', label: 'Very active' },
    { key: 'very_active', label: 'Extremely active' },
  ];

  const handleSaveProfile = () => {
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
    Alert.alert('Success', 'Profile updated successfully!');
  };

  const tdee = calculateTDEE();

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <ThemedText className="text-2xl font-bold mb-1">Settings</ThemedText>
          <ThemedText className="text-gray-600 dark:text-gray-400">
            Manage your profile and preferences
          </ThemedText>
        </View>

        <View className="p-4">
          {/* Profile Section */}
          <View className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-4 shadow-sm">
            <ThemedText className="text-lg font-semibold mb-3">Profile</ThemedText>
            
            <View className="space-y-3">
              <View>
                <ThemedText className="text-sm text-gray-600 dark:text-gray-400 mb-1">Age</ThemedText>
                <TextInput
                  value={profile.age.toString()}
                  onChangeText={(value) => setProfile(prev => ({ ...prev, age: parseInt(value) || 0 }))}
                  keyboardType="numeric"
                  placeholder="30"
                  className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View>
                <ThemedText className="text-sm text-gray-600 dark:text-gray-400 mb-1">Height (cm)</ThemedText>
                <TextInput
                  value={profile.height.toString()}
                  onChangeText={(value) => setProfile(prev => ({ ...prev, height: parseInt(value) || 0 }))}
                  keyboardType="numeric"
                  placeholder="170"
                  className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View>
                <ThemedText className="text-sm text-gray-600 dark:text-gray-400 mb-1">Weight (kg)</ThemedText>
                <TextInput
                  value={profile.weight.toString()}
                  onChangeText={(value) => setProfile(prev => ({ ...prev, weight: parseInt(value) || 0 }))}
                  keyboardType="numeric"
                  placeholder="70"
                  className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View>
                <ThemedText className="text-sm text-gray-600 dark:text-gray-400 mb-1">Gender</ThemedText>
                <View className="flex-row space-x-2">
                  <TouchableOpacity
                    onPress={() => setProfile(prev => ({ ...prev, gender: 'male' }))}
                    className={`flex-1 py-2 rounded-lg border ${
                      profile.gender === 'male' 
                        ? 'bg-blue-500 border-blue-500' 
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    <Text className={`text-center font-medium ${
                      profile.gender === 'male' ? 'text-white' : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      Male
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setProfile(prev => ({ ...prev, gender: 'female' }))}
                    className={`flex-1 py-2 rounded-lg border ${
                      profile.gender === 'female' 
                        ? 'bg-blue-500 border-blue-500' 
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    <Text className={`text-center font-medium ${
                      profile.gender === 'female' ? 'text-white' : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      Female
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View>
                <ThemedText className="text-sm text-gray-600 dark:text-gray-400 mb-1">Activity Level</ThemedText>
                {activityLevels.map((level) => (
                  <TouchableOpacity
                    key={level.key}
                    onPress={() => setProfile(prev => ({ ...prev, activityLevel: level.key as any }))}
                    className={`p-3 rounded-lg border mb-2 ${
                      profile.activityLevel === level.key
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    <ThemedText className={`font-medium ${
                      profile.activityLevel === level.key ? 'text-blue-600' : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {level.label}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                onPress={handleSaveProfile}
                className="bg-blue-500 py-3 rounded-lg mt-4"
              >
                <Text className="text-white text-center font-medium">Save Profile</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* TDEE Display */}
          {tdee && (
            <View className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
              <ThemedText className="text-lg font-semibold mb-2">Your TDEE</ThemedText>
              <ThemedText className="text-3xl font-bold text-green-600 mb-2">
                {tdee.toLocaleString()} calories/day
              </ThemedText>
              <ThemedText className="text-sm text-gray-600 dark:text-gray-400">
                This is your Total Daily Energy Expenditure based on your profile
              </ThemedText>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
} 