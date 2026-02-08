import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Platform } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Category icon mapping
const CATEGORY_ICONS = {
  food: '🍝',
  family: '❤️',
  work: '💼',
  music: '🎵',
  travel: '✈️',
  friendship: '🤝',
  childhood: '🧒',
  nature: '🌿',
  holiday: '🎄',
  school: '📚',
};

// Generate points along an S-curve
const generateRoadPoints = (count) => {
  const points = [];
  const centerX = SCREEN_WIDTH / 2;
  const amplitude = SCREEN_WIDTH * 0.18;
  const startY = 50;
  const stepY = 130;

  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    const x = centerX + amplitude * Math.sin(t * Math.PI * 2.2 + 0.5);
    const y = startY + i * stepY;
    points.push({ x, y });
  }
  return points;
};

// Generate SVG path through points (smooth curve)
const generateSmoothPath = (points) => {
  if (points.length < 2) return '';

  let d = `M ${points[0].x} ${points[0].y}`;

  for (let i = 0; i < points.length - 1; i++) {
    const current = points[i];
    const next = points[i + 1];
    const midY = (current.y + next.y) / 2;

    d += ` C ${current.x} ${midY}, ${next.x} ${midY}, ${next.x} ${next.y}`;
  }

  return d;
};

// 3D circle component - supports blue (senior) and green (family) colors
const Circle3D = ({ size, hasMemory, isFamily, icon, onPress, disabled, style }) => {
  let baseColor, darkColor, lightColor;
  if (!hasMemory) {
    baseColor = '#B8D4E3'; darkColor = '#9BBDD1'; lightColor = '#D6E8F0';
  } else if (isFamily) {
    baseColor = '#5A7A5C'; darkColor = '#4A6A4C'; lightColor = '#7A9A7C';
  } else {
    baseColor = '#2A6F97'; darkColor = '#1E5A7A'; lightColor = '#5A9DBF';
  }

  return (
    <TouchableOpacity
      style={[
        styles.circleOuter,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          ...style,
        },
      ]}
      onPress={onPress}
      activeOpacity={hasMemory ? 0.7 : 1}
      disabled={disabled}
    >
      {/* Bottom shadow layer */}
      <View
        style={[
          styles.circleShadow,
          {
            width: size - 4,
            height: size - 4,
            borderRadius: (size - 4) / 2,
            backgroundColor: darkColor,
          },
        ]}
      />
      {/* Main body */}
      <View
        style={[
          styles.circleBody,
          {
            width: size - 4,
            height: size - 6,
            borderRadius: (size - 4) / 2,
            backgroundColor: baseColor,
            opacity: hasMemory ? 1 : 0.45,
          },
        ]}
      />
      {/* Top highlight (3D shine) */}
      <View
        style={[
          styles.circleHighlight,
          {
            width: size * 0.55,
            height: size * 0.35,
            borderRadius: size * 0.3,
            backgroundColor: lightColor,
            top: size * 0.1,
            left: size * 0.18,
            opacity: hasMemory ? 0.7 : 0.3,
          },
        ]}
      />
      {/* Emoji icon */}
      {hasMemory && (
        <Text style={styles.circleIcon}>{icon}</Text>
      )}
    </TouchableOpacity>
  );
};

export default function MemoryRoad({ memories, onCirclePress }) {
  const circleCount = Math.max(memories.length, 8);
  const points = generateRoadPoints(circleCount);
  const pathD = generateSmoothPath(points);
  const totalHeight = points.length * 130 + 100;

  const circleSize = 76;

  return (
    <View style={[styles.container, { height: totalHeight }]}>
      {/* SVG curved road line */}
      <Svg
        width={SCREEN_WIDTH}
        height={totalHeight}
        style={StyleSheet.absoluteFill}
      >
        <Path
          d={pathD}
          stroke="#B8D4E3"
          strokeWidth={3}
          fill="none"
          strokeDasharray="10,8"
          opacity={0.5}
        />
      </Svg>

      {/* 3D circles - blue for senior memories, green for family-added */}
      {points.map((point, index) => {
        const hasMemory = index < memories.length;
        const memory = hasMemory ? memories[index] : null;
        const icon = memory ? (CATEGORY_ICONS[memory.category] || '💭') : '';
        const isLeftOfCenter = point.x < SCREEN_WIDTH / 2;

        return (
          <View key={index}>
            <Circle3D
              size={circleSize}
              hasMemory={hasMemory}
              isFamily={hasMemory && memory.addedByFamily}
              icon={icon}
              onPress={() => hasMemory && onCirclePress(memory, index)}
              disabled={!hasMemory}
              style={{
                left: point.x - circleSize / 2,
                top: point.y - circleSize / 2,
              }}
            />

            {/* Label next to circle - single line, kept away from edges */}
            {hasMemory && memory.label && (
              <View
                style={[
                  styles.labelContainer,
                  {
                    top: point.y - 12,
                    ...(isLeftOfCenter
                      ? { left: Math.min(point.x + circleSize / 2 + 14, SCREEN_WIDTH - 160) }
                      : { left: Math.max(20, point.x - circleSize / 2 - 160) }),
                  },
                ]}
              >
                <Text style={styles.labelText} numberOfLines={1}>
                  {memory.label}
                </Text>
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH,
    position: 'relative',
  },
  circleOuter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#1E5A7A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 6,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  circleShadow: {
    position: 'absolute',
    bottom: 0,
  },
  circleBody: {
    position: 'absolute',
    top: 0,
  },
  circleHighlight: {
    position: 'absolute',
  },
  circleIcon: {
    fontSize: 30,
    zIndex: 1,
  },
  labelContainer: {
    position: 'absolute',
  },
  labelText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#444',
  },
});
