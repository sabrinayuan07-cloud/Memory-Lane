import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Animated, Easing, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const BLUE_BUBBLE_COLOR = '#C0E2FE';
const GREEN_BUBBLE_COLOR = '#D7E6DA';

const AnimatedBubble = ({ size, top, left, right, bottom, animated, delay = 0, color }) => {
  const translateY = useRef(new Animated.Value(animated ? SCREEN_HEIGHT : 0)).current;
  const animOpacity = useRef(new Animated.Value(animated ? 0 : 0.75)).current;

  useEffect(() => {
    if (animated) {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 1800,
          delay,
          easing: Easing.out(Easing.back(1.1)),
          useNativeDriver: true,
        }),
        Animated.timing(animOpacity, {
          toValue: 0.75,
          duration: 1400,
          delay,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, []);

  return (
    <Animated.View
      style={[
        styles.bubble,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          opacity: animated ? animOpacity : 0.75,
          transform: animated ? [{ translateY }] : [],
          ...(top !== undefined && { top }),
          ...(left !== undefined && { left }),
          ...(right !== undefined && { right }),
          ...(bottom !== undefined && { bottom }),
        },
      ]}
    />
  );
};

// All bubble definitions
const ALL_BUBBLES = [
  { size: 160, top: -45, left: -50, delay: 200 },
  { size: 70, top: 80, left: 20, delay: 450 },
  { size: 130, top: -30, right: -35, delay: 150 },
  { size: 55, top: 75, right: 15, delay: 400 },
  { size: 90, top: '30%', left: -30, delay: 550 },
  { size: 80, top: '28%', right: -25, delay: 500 },
  { size: 140, bottom: 15, left: -45, delay: 300 },
  { size: 60, bottom: 100, left: 40, delay: 500 },
  { size: 110, bottom: -15, right: -30, delay: 250 },
  { size: 50, bottom: 70, right: 25, delay: 450 },
  { size: 100, top: '15%', left: 10, delay: 350 },
  { size: 75, top: '45%', right: 5, delay: 480 },
  { size: 120, bottom: 140, right: -20, delay: 320 },
  { size: 65, bottom: 40, left: 60, delay: 520 },
  { size: 85, top: '55%', left: -20, delay: 420 },
];

export default function Bubbles({ animated = false, forceMixed = false, maxBubbles = 15 }) {
  const [colorMode, setColorMode] = useState('mixed');

  useEffect(() => {
    if (forceMixed) {
      setColorMode('mixed');
      return;
    }

    const checkUserType = async () => {
      try {
        const userType = await AsyncStorage.getItem('userType');
        if (userType === 'family' || userType === 'familyMember') {
          setColorMode('green');
        } else if (userType === 'self') {
          setColorMode('blue');
        } else {
          setColorMode('mixed');
        }
      } catch (error) {
        console.log('Error checking user type:', error);
        setColorMode('mixed');
      }
    };

    checkUserType();
  }, [forceMixed]);

  const getBubbleColor = (index) => {
    if (colorMode === 'blue') return BLUE_BUBBLE_COLOR;
    if (colorMode === 'green') return GREEN_BUBBLE_COLOR;
    return index % 2 === 0 ? BLUE_BUBBLE_COLOR : GREEN_BUBBLE_COLOR;
  };

  const bubblesToRender = ALL_BUBBLES.slice(0, Math.min(maxBubbles, ALL_BUBBLES.length));

  return (
    <View style={styles.container} pointerEvents="none">
      {bubblesToRender.map((b, i) => (
        <AnimatedBubble
          key={i}
          size={b.size}
          top={b.top}
          left={b.left}
          right={b.right}
          bottom={b.bottom}
          animated={animated}
          delay={b.delay}
          color={getBubbleColor(i)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  bubble: {
    position: 'absolute',
  },
});
