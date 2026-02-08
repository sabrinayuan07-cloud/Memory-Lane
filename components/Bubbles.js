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

export default function Bubbles({ animated = false, forceMixed = false }) {
  const [colorMode, setColorMode] = useState('mixed'); // 'mixed', 'blue', 'green'

  useEffect(() => {
    // If forceMixed is true, stay mixed (for Welcome/UserSelection)
    if (forceMixed) {
      setColorMode('mixed');
      return;
    }

    // Auto-detect user type from storage
    const checkUserType = async () => {
      try {
        const userType = await AsyncStorage.getItem('userType');
        if (userType === 'family' || userType === 'familyMember') {
          setColorMode('green');
        } else if (userType === 'self') {
          setColorMode('blue');
        } else {
          setColorMode('mixed'); // No user type yet
        }
      } catch (error) {
        console.log('Error checking user type:', error);
        setColorMode('mixed');
      }
    };

    checkUserType();
  }, [forceMixed]);

  // Define bubble colors based on mode
  const getBubbleColor = (index) => {
    if (colorMode === 'blue') return BLUE_BUBBLE_COLOR;
    if (colorMode === 'green') return GREEN_BUBBLE_COLOR;
    // Mixed mode - alternate blue and green
    return index % 2 === 0 ? BLUE_BUBBLE_COLOR : GREEN_BUBBLE_COLOR;
  };

  return (
    <View style={styles.container} pointerEvents="none">
      {/* Bubbles with dynamic colors */}
      <AnimatedBubble size={160} top={-45} left={-50} animated={animated} delay={200} color={getBubbleColor(0)} />
      <AnimatedBubble size={70} top={80} left={20} animated={animated} delay={450} color={getBubbleColor(1)} />
      <AnimatedBubble size={130} top={-30} right={-35} animated={animated} delay={150} color={getBubbleColor(2)} />
      <AnimatedBubble size={55} top={75} right={15} animated={animated} delay={400} color={getBubbleColor(3)} />
      <AnimatedBubble size={90} top={'30%'} left={-30} animated={animated} delay={550} color={getBubbleColor(4)} />
      <AnimatedBubble size={80} top={'28%'} right={-25} animated={animated} delay={500} color={getBubbleColor(5)} />
      <AnimatedBubble size={140} bottom={15} left={-45} animated={animated} delay={300} color={getBubbleColor(6)} />
      <AnimatedBubble size={60} bottom={100} left={40} animated={animated} delay={500} color={getBubbleColor(7)} />
      <AnimatedBubble size={110} bottom={-15} right={-30} animated={animated} delay={250} color={getBubbleColor(8)} />
      <AnimatedBubble size={50} bottom={70} right={25} animated={animated} delay={450} color={getBubbleColor(9)} />
      <AnimatedBubble size={100} top={'15%'} left={10} animated={animated} delay={350} color={getBubbleColor(10)} />
      <AnimatedBubble size={75} top={'45%'} right={5} animated={animated} delay={480} color={getBubbleColor(11)} />
      <AnimatedBubble size={120} bottom={140} right={-20} animated={animated} delay={320} color={getBubbleColor(12)} />
      <AnimatedBubble size={65} bottom={40} left={60} animated={animated} delay={520} color={getBubbleColor(13)} />
      <AnimatedBubble size={85} top={'55%'} left={-20} animated={animated} delay={420} color={getBubbleColor(14)} />
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