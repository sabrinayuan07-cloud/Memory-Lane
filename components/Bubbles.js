import React from 'react';
import { View, StyleSheet } from 'react-native';

const Bubble = ({ size, top, left, right, bottom, opacity = 0.3 }) => (
  <View
    style={[
      styles.bubble,
      {
        width: size,
        height: size,
        borderRadius: size / 2,
        opacity,
        ...(top !== undefined && { top }),
        ...(left !== undefined && { left }),
        ...(right !== undefined && { right }),
        ...(bottom !== undefined && { bottom }),
      },
    ]}
  />
);

export default function Bubbles() {
  return (
    <View style={styles.container} pointerEvents="none">
      {/* Top-left area */}
      <Bubble size={120} top={-35} left={-40} opacity={0.18} />
      <Bubble size={55} top={50} left={20} opacity={0.14} />
      <Bubble size={30} top={110} left={60} opacity={0.12} />

      {/* Top-right area */}
      <Bubble size={95} top={-25} right={-25} opacity={0.22} />
      <Bubble size={38} top={45} right={15} opacity={0.13} />
      <Bubble size={22} top={100} right={55} opacity={0.1} />

      {/* Left edge - mid area */}
      <Bubble size={65} top={'28%'} left={-25} opacity={0.15} />
      <Bubble size={28} top={'35%'} left={10} opacity={0.1} />

      {/* Right edge - mid area */}
      <Bubble size={50} top={'25%'} right={-15} opacity={0.14} />
      <Bubble size={20} top={'32%'} right={20} opacity={0.1} />

      {/* Left side - lower mid */}
      <Bubble size={42} top={'58%'} left={-10} opacity={0.13} />
      <Bubble size={18} top={'63%'} left={30} opacity={0.09} />

      {/* Right side - lower mid */}
      <Bubble size={55} top={'55%'} right={-20} opacity={0.15} />
      <Bubble size={25} top={'62%'} right={10} opacity={0.1} />

      {/* Bottom-left area */}
      <Bubble size={105} bottom={30} left={-35} opacity={0.2} />
      <Bubble size={48} bottom={90} left={35} opacity={0.14} />
      <Bubble size={25} bottom={130} left={70} opacity={0.1} />

      {/* Bottom-right area */}
      <Bubble size={80} bottom={-15} right={-20} opacity={0.18} />
      <Bubble size={35} bottom={50} right={25} opacity={0.13} />
      <Bubble size={18} bottom={95} right={60} opacity={0.09} />

      {/* Bottom center-ish (off to sides) */}
      <Bubble size={40} bottom={10} left={'30%'} opacity={0.11} />
      <Bubble size={30} bottom={60} right={'28%'} opacity={0.1} />

      {/* Tiny accents scattered */}
      <Bubble size={14} top={160} left={'20%'} opacity={0.08} />
      <Bubble size={16} top={'45%'} right={40} opacity={0.08} />
      <Bubble size={12} bottom={160} left={50} opacity={0.07} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  bubble: {
    position: 'absolute',
    backgroundColor: '#A8D8EA',
  },
});
