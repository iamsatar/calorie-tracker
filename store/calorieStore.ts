import { ColorScheme } from '@/constants/Theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface UserProfile {
  age: number;
  height: number; // in cm
  weight: number; // in kg
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  gender: 'male' | 'female';
}

export interface DailyCalories {
  date: string; // YYYY-MM-DD format
  target: number;
  consumed: number;
  isFasting: boolean;
}

export interface WeightEntry {
  date: string; // YYYY-MM-DD format
  weight: number; // in kg
}

export interface WeeklyPattern {
  id: string;
  name: string;
  days: {
    [key: string]: number; // day name -> calories
  };
}

interface CalorieStore {
  // Theme management
  colorScheme: ColorScheme;
  setColorScheme: (scheme: ColorScheme) => void;
  
  // User profile
  userProfile: UserProfile | null;
  setUserProfile: (profile: UserProfile) => void;
  
  // Daily calories tracking
  dailyCalories: DailyCalories[];
  addDailyCalories: (date: string, target: number, consumed: number, isFasting?: boolean) => void;
  updateDailyCalories: (date: string, updates: Partial<Omit<DailyCalories, 'date'>>) => void;
  getDailyCalories: (date: string) => DailyCalories | undefined;
  
  // Weight tracking
  weightEntries: WeightEntry[];
  addWeightEntry: (date: string, weight: number) => void;
  getLatestWeight: () => number | null;
  
  // Weekly patterns
  weeklyPatterns: WeeklyPattern[];
  addWeeklyPattern: (pattern: WeeklyPattern) => void;
  updateWeeklyPattern: (id: string, updates: Partial<WeeklyPattern>) => void;
  deleteWeeklyPattern: (id: string) => void;
  applyWeeklyPattern: (patternId: string, startDate: string) => void;
  
  // TDEE calculation
  calculateTDEE: () => number | null;
  
  // Progress calculations
  getWeeklyDeficit: (startDate: string) => number;
  getEstimatedFatLoss: (startDate: string) => number; // in kg
}

const activityMultipliers = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

export const useCalorieStore = create<CalorieStore>()(
  persist(
    (set, get) => ({
      // Theme management
      colorScheme: 'system',
      setColorScheme: (scheme) => set({ colorScheme: scheme }),
      
      // User profile
      userProfile: null,
      setUserProfile: (profile) => set({ userProfile: profile }),
      
      // Daily calories tracking
      dailyCalories: [],
      addDailyCalories: (date, target, consumed, isFasting = false) => {
        const existing = get().dailyCalories.find(d => d.date === date);
        if (existing) {
          get().updateDailyCalories(date, { target, consumed, isFasting });
        } else {
          set((state) => ({
            dailyCalories: [...state.dailyCalories, { date, target, consumed, isFasting }]
          }));
        }
      },
      updateDailyCalories: (date, updates) => {
        set((state) => ({
          dailyCalories: state.dailyCalories.map(d => 
            d.date === date ? { ...d, ...updates } : d
          )
        }));
      },
      getDailyCalories: (date) => {
        return get().dailyCalories.find(d => d.date === date);
      },
      
      // Weight tracking
      weightEntries: [],
      addWeightEntry: (date, weight) => {
        const existing = get().weightEntries.find(w => w.date === date);
        if (existing) {
          set((state) => ({
            weightEntries: state.weightEntries.map(w => 
              w.date === date ? { date, weight } : w
            )
          }));
        } else {
          set((state) => ({
            weightEntries: [...state.weightEntries, { date, weight }]
          }));
        }
      },
      getLatestWeight: () => {
        const entries = get().weightEntries;
        if (entries.length === 0) return null;
        return entries[entries.length - 1].weight;
      },
      
      // Weekly patterns
      weeklyPatterns: [],
      addWeeklyPattern: (pattern) => {
        set((state) => ({
          weeklyPatterns: [...state.weeklyPatterns, pattern]
        }));
      },
      updateWeeklyPattern: (id, updates) => {
        set((state) => ({
          weeklyPatterns: state.weeklyPatterns.map(p => 
            p.id === id ? { ...p, ...updates } : p
          )
        }));
      },
      deleteWeeklyPattern: (id) => {
        set((state) => ({
          weeklyPatterns: state.weeklyPatterns.filter(p => p.id !== id)
        }));
      },
      applyWeeklyPattern: (patternId, startDate) => {
        const pattern = get().weeklyPatterns.find(p => p.id === patternId);
        if (!pattern) return;
        
        const start = new Date(startDate);
        const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        
        // Apply pattern for the next 7 days
        for (let i = 0; i < 7; i++) {
          const date = new Date(start);
          date.setDate(start.getDate() + i);
          const dayName = dayNames[date.getDay()];
          const target = pattern.days[dayName] || 2000;
          
          const dateStr = date.toISOString().split('T')[0];
          get().addDailyCalories(dateStr, target, 0, target <= 1000);
        }
      },
      
      // TDEE calculation
      calculateTDEE: () => {
        const profile = get().userProfile;
        if (!profile) return null;
        
        // Mifflin-St Jeor Equation
        let bmr;
        if (profile.gender === 'male') {
          bmr = 10 * profile.weight + 6.25 * profile.height - 5 * profile.age + 5;
        } else {
          bmr = 10 * profile.weight + 6.25 * profile.height - 5 * profile.age - 161;
        }
        
        return Math.round(bmr * activityMultipliers[profile.activityLevel]);
      },
      
      // Progress calculations
      getWeeklyDeficit: (startDate) => {
        const tdee = get().calculateTDEE();
        if (!tdee) return 0;
        
        const start = new Date(startDate);
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        
        const weeklyCalories = get().dailyCalories
          .filter(d => {
            const date = new Date(d.date);
            return date >= start && date <= end;
          })
          .reduce((sum, d) => sum + d.consumed, 0);
        
        const weeklyTDEE = tdee * 7;
        return weeklyTDEE - weeklyCalories;
      },
      
      getEstimatedFatLoss: (startDate) => {
        const deficit = get().getWeeklyDeficit(startDate);
        // 1 kg of fat = 7700 calories
        return deficit / 7700;
      },
    }),
    {
      name: 'calorie-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
); 