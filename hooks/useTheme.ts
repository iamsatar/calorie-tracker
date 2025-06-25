import { getTheme, ThemeColors } from '@/constants/Theme';
import { useCalorieStore } from '@/store/calorieStore';
import { useColorScheme } from 'react-native';

export const useTheme = (): ThemeColors => {
  const systemColorScheme = useColorScheme();
  const { colorScheme } = useCalorieStore();
  
  return getTheme(colorScheme, systemColorScheme || 'light');
};

export const useColorSchemeManager = () => {
  const { colorScheme, setColorScheme } = useCalorieStore();
  const systemColorScheme = useColorScheme();
  
  const currentTheme = getTheme(colorScheme, systemColorScheme || 'light');
  
  return {
    colorScheme,
    setColorScheme,
    systemColorScheme: systemColorScheme || 'light',
    currentTheme,
  };
}; 