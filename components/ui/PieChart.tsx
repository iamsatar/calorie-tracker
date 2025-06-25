import { ThemedText } from '@/components/ThemedText';
import { useTheme } from '@/hooks/useTheme';
import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, View } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';

interface PieChartData {
  value: number;
  color: string;
  label: string;
}

interface PieChartProps {
  data: PieChartData[];
  size?: number;
  strokeWidth?: number;
  showLabels?: boolean;
  showValues?: boolean;
  centerLabel?: string;
}

const { width: screenWidth } = Dimensions.get('window');

export const PieChart: React.FC<PieChartProps> = ({
  data,
  size = screenWidth * 0.8,
  strokeWidth = 60,
  showLabels = true,
  showValues = true,
  centerLabel,
}) => {
  const theme = useTheme();
  const animatedValues = useRef<Animated.Value[]>([]).current;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Initialize animated values
  useEffect(() => {
    animatedValues.length = 0;
    data.forEach(() => {
      animatedValues.push(new Animated.Value(0));
    });
  }, [data]);

  // Animate on mount
  useEffect(() => {
    const animations = animatedValues.map((anim, index) => {
      const total = data.reduce((sum, item) => sum + item.value, 0);
      const percentage = data[index].value / total;
      
      return Animated.timing(anim, {
        toValue: percentage,
        duration: 1000,
        useNativeDriver: false,
      });
    });

    Animated.parallel(animations).start();
  }, [data]);

  const total = data.reduce((sum, item) => sum + item.value, 0);
  let currentAngle = -90; // Start from top

  return (
    <View style={{ alignItems: 'center' }}>
      <View style={{ position: 'relative', width: size, height: size }}>
        <Svg width={size} height={size}>
          <G transform={`translate(${size / 2}, ${size / 2})`}>
            {data.map((item, index) => {
              const percentage = item.value / total;
              const angle = percentage * 360;
              const startAngle = currentAngle;
              const endAngle = currentAngle + angle;
              
              // Calculate arc coordinates
              const x1 = radius * Math.cos((startAngle * Math.PI) / 180);
              const y1 = radius * Math.sin((startAngle * Math.PI) / 180);
              const x2 = radius * Math.cos((endAngle * Math.PI) / 180);
              const y2 = radius * Math.sin((endAngle * Math.PI) / 180);
              
              const largeArcFlag = angle > 180 ? 1 : 0;
              
              const path = [
                `M ${x1} ${y1}`,
                `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                'L 0 0',
                'Z',
              ].join(' ');

              currentAngle += angle;

              return (
                <Circle
                  key={index}
                  cx="0"
                  cy="0"
                  r={radius}
                  fill="none"
                  stroke={item.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${circumference * percentage} ${circumference}`}
                  strokeDashoffset={circumference * (1 - percentage)}
                  strokeLinecap="round"
                  transform={`rotate(${startAngle})`}
                />
              );
            })}
          </G>
        </Svg>
        
        {/* Center label */}
        {centerLabel && (
          <View
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: [{ translateX: -50 }, { translateY: -50 }],
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ThemedText
              style={{
                fontSize: 16,
                fontWeight: '600',
                color: theme.text,
                textAlign: 'center',
              }}
            >
              {centerLabel}
            </ThemedText>
          </View>
        )}
      </View>

      {/* Legend */}
      {showLabels && (
        <View style={{ marginTop: 24, width: '100%' }}>
          {data.map((item, index) => (
            <View
              key={index}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 8,
                paddingHorizontal: 16,
              }}
            >
              <View
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 6,
                  backgroundColor: item.color,
                  marginRight: 12,
                }}
              />
              <View style={{ flex: 1 }}>
                <ThemedText
                  style={{
                    fontSize: 15,
                    fontWeight: '500',
                    color: theme.text,
                  }}
                >
                  {item.label}
                </ThemedText>
                {showValues && (
                  <ThemedText
                    style={{
                      fontSize: 13,
                      color: theme.textSecondary,
                      marginTop: 2,
                    }}
                  >
                    {item.value.toLocaleString()} calories
                  </ThemedText>
                )}
              </View>
              <ThemedText
                style={{
                  fontSize: 15,
                  fontWeight: '600',
                  color: theme.text,
                }}
              >
                {((item.value / total) * 100).toFixed(1)}%
              </ThemedText>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}; 