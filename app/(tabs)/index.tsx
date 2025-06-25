import { ThemedText } from '@/components/ThemedText';
import { borderRadius, shadows, spacing, typography } from '@/constants/Theme';
import { useTheme } from '@/hooks/useTheme';
import { healthKitService } from '@/services/HealthKitService';
import { useCalorieStore } from '@/store/calorieStore';
import { formatDate } from '@/utils/dateUtils';
import React, { useEffect, useState } from 'react';
import { Alert, Dimensions, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: screenWidth } = Dimensions.get('window');

export default function HomeScreen() {
  const [calorieInput, setCalorieInput] = useState('');
  const [healthData, setHealthData] = useState<any>(null);
  const theme = useTheme();
  
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

  useEffect(() => {
    // Load health data
    const loadHealthData = async () => {
      const data = healthKitService.getMockHealthData();
      setHealthData(data);
    };
    
    loadHealthData();
  }, []);

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
    if (todayData?.isFasting) return theme.info;
    if (isOverTarget) return theme.error;
    if (progress >= 0.8) return theme.warning;
    return theme.success;
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{ 
          paddingHorizontal: spacing.lg, 
          paddingVertical: spacing.md,
          backgroundColor: theme.surface,
          borderBottomWidth: 1,
          borderBottomColor: theme.borderSecondary,
        }}>
          <ThemedText style={[typography.largeTitle, { color: theme.text, marginBottom: spacing.xs }]}>
            Today
          </ThemedText>
          <ThemedText style={[typography.subheadline, { color: theme.textSecondary }]}>
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </ThemedText>
        </View>

        <View style={{ padding: spacing.lg }}>
          {/* Main Calorie Display */}
          <View style={{ 
            backgroundColor: theme.surface,
            borderRadius: borderRadius.lg,
            padding: spacing.xl,
            marginBottom: spacing.lg,
            ...shadows.md,
          }}>
            <View style={{ alignItems: 'center', marginBottom: spacing.lg }}>
              <ThemedText style={[typography.title1, { color: theme.text, marginBottom: spacing.xs }]}>
                {consumed.toLocaleString()}
              </ThemedText>
              <ThemedText style={[typography.headline, { color: theme.textSecondary }]}>
                of {target.toLocaleString()} calories
              </ThemedText>
            </View>
            
            {/* Progress Ring */}
            <View style={{ alignItems: 'center', marginBottom: spacing.lg }}>
              <View style={{ 
                width: 200, 
                height: 200, 
                borderRadius: 100,
                borderWidth: 20,
                borderColor: theme.surfaceSecondary,
                justifyContent: 'center',
                alignItems: 'center',
                position: 'relative',
              }}>
                <View style={{
                  position: 'absolute',
                  width: 200,
                  height: 200,
                  borderRadius: 100,
                  borderWidth: 20,
                  borderColor: getProgressColor(),
                  borderTopColor: 'transparent',
                  borderRightColor: 'transparent',
                  transform: [{ rotate: `${-90 + (progress * 360)}deg` }],
                }} />
                <ThemedText style={[typography.title2, { color: theme.text }]}>
                  {Math.round(progress * 100)}%
                </ThemedText>
              </View>
            </View>
            
            <View style={{ alignItems: 'center' }}>
              <ThemedText style={[typography.headline, { 
                color: isOverTarget ? theme.error : theme.success,
                marginBottom: spacing.xs,
              }]}>
                {isOverTarget ? `+${Math.abs(remaining)} over` : `${remaining} remaining`}
              </ThemedText>
              {todayData?.isFasting && (
                <View style={{ 
                  backgroundColor: theme.info + '20',
                  paddingHorizontal: spacing.md,
                  paddingVertical: spacing.xs,
                  borderRadius: borderRadius.full,
                }}>
                  <Text style={{ color: theme.info, fontSize: 13, fontWeight: '600' }}>
                    Fasting Day
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Quick Add Calories */}
          <View style={{ 
            backgroundColor: theme.surface,
            borderRadius: borderRadius.lg,
            padding: spacing.lg,
            marginBottom: spacing.lg,
            ...shadows.sm,
          }}>
            <ThemedText style={[typography.title3, { color: theme.text, marginBottom: spacing.md }]}>
              Quick Add
            </ThemedText>
            
            <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md }}>
              {[100, 200, 300, 500].map((amount) => (
                <TouchableOpacity
                  key={amount}
                  onPress={() => handleQuickAdd(amount)}
                  style={{
                    flex: 1,
                    backgroundColor: theme.primary,
                    paddingVertical: spacing.md,
                    borderRadius: borderRadius.md,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: theme.textInverse, fontSize: 16, fontWeight: '600' }}>
                    +{amount}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <View style={{ flexDirection: 'row', gap: spacing.sm }}>
              <TextInput
                value={calorieInput}
                onChangeText={setCalorieInput}
                placeholder="Enter calories"
                keyboardType="numeric"
                style={{
                  flex: 1,
                  borderWidth: 1,
                  borderColor: theme.border,
                  borderRadius: borderRadius.md,
                  paddingHorizontal: spacing.md,
                  paddingVertical: spacing.md,
                  fontSize: 16,
                  color: theme.text,
                  backgroundColor: theme.surfaceSecondary,
                }}
                placeholderTextColor={theme.textSecondary}
              />
              <TouchableOpacity
                onPress={handleAddCalories}
                style={{
                  backgroundColor: theme.success,
                  paddingHorizontal: spacing.lg,
                  paddingVertical: spacing.md,
                  borderRadius: borderRadius.md,
                  justifyContent: 'center',
                }}
              >
                <Text style={{ color: theme.textInverse, fontSize: 16, fontWeight: '600' }}>
                  Add
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Stats Grid */}
          <View style={{ 
            flexDirection: 'row', 
            gap: spacing.md, 
            marginBottom: spacing.lg 
          }}>
            <View style={{ 
              flex: 1,
              backgroundColor: theme.surface,
              borderRadius: borderRadius.lg,
              padding: spacing.lg,
              ...shadows.sm,
            }}>
              <ThemedText style={[typography.footnote, { color: theme.textSecondary, marginBottom: spacing.xs }]}>
                Daily Target
              </ThemedText>
              <ThemedText style={[typography.title2, { color: theme.text }]}>
                {target.toLocaleString()}
              </ThemedText>
            </View>
            
            <View style={{ 
              flex: 1,
              backgroundColor: theme.surface,
              borderRadius: borderRadius.lg,
              padding: spacing.lg,
              ...shadows.sm,
            }}>
              <ThemedText style={[typography.footnote, { color: theme.textSecondary, marginBottom: spacing.xs }]}>
                TDEE
              </ThemedText>
              <ThemedText style={[typography.title2, { color: theme.text }]}>
                {tdee ? tdee.toLocaleString() : '--'}
              </ThemedText>
            </View>
          </View>

          <View style={{ 
            flexDirection: 'row', 
            gap: spacing.md, 
            marginBottom: spacing.lg 
          }}>
            <View style={{ 
              flex: 1,
              backgroundColor: theme.surface,
              borderRadius: borderRadius.lg,
              padding: spacing.lg,
              ...shadows.sm,
            }}>
              <ThemedText style={[typography.footnote, { color: theme.textSecondary, marginBottom: spacing.xs }]}>
                Current Weight
              </ThemedText>
              <ThemedText style={[typography.title2, { color: theme.text }]}>
                {latestWeight ? `${latestWeight} kg` : '--'}
              </ThemedText>
            </View>
            
            <View style={{ 
              flex: 1,
              backgroundColor: theme.surface,
              borderRadius: borderRadius.lg,
              padding: spacing.lg,
              ...shadows.sm,
            }}>
              <ThemedText style={[typography.footnote, { color: theme.textSecondary, marginBottom: spacing.xs }]}>
                Steps Today
              </ThemedText>
              <ThemedText style={[typography.title2, { color: theme.text }]}>
                {healthData?.steps?.toLocaleString() || '--'}
              </ThemedText>
            </View>
          </View>

          {/* Health Integration */}
          <View style={{ 
            backgroundColor: theme.surface,
            borderRadius: borderRadius.lg,
            padding: spacing.lg,
            marginBottom: spacing.lg,
            ...shadows.sm,
          }}>
            <ThemedText style={[typography.title3, { color: theme.text, marginBottom: spacing.md }]}>
              Health Data
            </ThemedText>
            <View style={{ flexDirection: 'row', gap: spacing.md }}>
              <View style={{ flex: 1 }}>
                <ThemedText style={[typography.footnote, { color: theme.textSecondary, marginBottom: spacing.xs }]}>
                  Active Energy
                </ThemedText>
                <ThemedText style={[typography.headline, { color: theme.text }]}>
                  {healthData?.activeEnergy?.toLocaleString() || '--'} cal
                </ThemedText>
              </View>
              <View style={{ flex: 1 }}>
                <ThemedText style={[typography.footnote, { color: theme.textSecondary, marginBottom: spacing.xs }]}>
                  Basal Energy
                </ThemedText>
                <ThemedText style={[typography.headline, { color: theme.text }]}>
                  {healthData?.basalEnergy?.toLocaleString() || '--'} cal
                </ThemedText>
              </View>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={{ 
            backgroundColor: theme.surface,
            borderRadius: borderRadius.lg,
            padding: spacing.lg,
            ...shadows.sm,
          }}>
            <ThemedText style={[typography.title3, { color: theme.text, marginBottom: spacing.md }]}>
              Quick Actions
            </ThemedText>
            <View style={{ flexDirection: 'row', gap: spacing.md }}>
              <TouchableOpacity style={{
                flex: 1,
                backgroundColor: theme.primary,
                paddingVertical: spacing.lg,
                borderRadius: borderRadius.md,
                alignItems: 'center',
              }}>
                <Text style={{ color: theme.textInverse, fontSize: 16, fontWeight: '600' }}>
                  Log Weight
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={{
                flex: 1,
                backgroundColor: theme.success,
                paddingVertical: spacing.lg,
                borderRadius: borderRadius.md,
                alignItems: 'center',
              }}>
                <Text style={{ color: theme.textInverse, fontSize: 16, fontWeight: '600' }}>
                  View Progress
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
