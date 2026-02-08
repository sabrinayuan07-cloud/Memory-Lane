import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing, Dimensions } from 'react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const BUBBLE_COLOR = '#C0E2FE';
const GREEN_BUBBLE_COLOR = '#D7E6DA';

const AnimatedBubble = ({ size, top, left, right, bottom, animated, delay = 0, color = BUBBLE_COLOR }) => {
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

export default function Bubbles({ animated = false, showGreen = false }) {
  return (
    <View style={styles.container} pointerEvents="none">
      {/* Top-left */}
      <AnimatedBubble size={160} top={-45} left={-50} animated={animated} delay={200} />
      <AnimatedBubble size={70} top={80} left={20} animated={animated} delay={450} />

      {/* Top-right */}
      <AnimatedBubble size={130} top={-30} right={-35} animated={animated} delay={150} />
      <AnimatedBubble size={55} top={75} right={15} animated={animated} delay={400} />

      {/* Mid edges */}
      <AnimatedBubble size={90} top={'30%'} left={-30} animated={animated} delay={550} />
      <AnimatedBubble size={80} top={'28%'} right={-25} animated={animated} delay={500} />

      {/* Bottom-left */}
      <AnimatedBubble size={140} bottom={15} left={-45} animated={animated} delay={300} />
      <AnimatedBubble size={60} bottom={100} left={40} animated={animated} delay={500} />

      {/* Bottom-right */}
      <AnimatedBubble size={110} bottom={-15} right={-30} animated={animated} delay={250} />
      <AnimatedBubble size={50} bottom={70} right={25} animated={animated} delay={450} />

      {/* Green bubbles - only shown when showGreen is true */}
      {showGreen && (
        <>
          <AnimatedBubble size={100} top={'15%'} left={10} animated={animated} delay={350} color={GREEN_BUBBLE_COLOR} />
          <AnimatedBubble size={75} top={'45%'} right={5} animated={animated} delay={480} color={GREEN_BUBBLE_COLOR} />
          <AnimatedBubble size={120} bottom={140} right={-20} animated={animated} delay={320} color={GREEN_BUBBLE_COLOR} />
          <AnimatedBubble size={65} bottom={40} left={60} animated={animated} delay={520} color={GREEN_BUBBLE_COLOR} />
          <AnimatedBubble size={85} top={'55%'} left={-20} animated={animated} delay={420} color={GREEN_BUBBLE_COLOR} />
        </>
      )}
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
