import React from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Generate points along an S-curve
const generateRoadPoints = (count) => {
  const points = [];
  const centerX = SCREEN_WIDTH / 2;
  const amplitude = SCREEN_WIDTH * 0.25;
  const startY = 30;
  const stepY = 85;

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

export default function MemoryRoad({ memories, onCirclePress }) {
  const circleCount = Math.max(memories.length, 8);
  const points = generateRoadPoints(circleCount);
  const pathD = generateSmoothPath(points);
  const totalHeight = points.length * 85 + 60;

  // Circle sizes - vary them for visual interest
  const circleSizes = [38, 44, 36, 48, 40, 42, 35, 46, 38, 44];

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
          stroke="#E0D8F0"
          strokeWidth={3}
          fill="none"
          strokeDasharray="8,6"
          opacity={0.5}
        />
      </Svg>

      {/* Purple circles (stepping stones) */}
      {points.map((point, index) => {
        const size = circleSizes[index % circleSizes.length];
        const hasMemory = index < memories.length;
        const opacity = hasMemory ? 0.55 : 0.25;

        return (
          <TouchableOpacity
            key={index}
            style={[
              styles.circle,
              {
                width: size,
                height: size,
                borderRadius: size / 2,
                left: point.x - size / 2,
                top: point.y - size / 2,
                opacity,
                backgroundColor: hasMemory ? '#C5B9E8' : '#DDD6EE',
              },
            ]}
            onPress={() => hasMemory && onCirclePress(memories[index], index)}
            activeOpacity={hasMemory ? 0.6 : 1}
            disabled={!hasMemory}
          />
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
  circle: {
    position: 'absolute',
  },
});
