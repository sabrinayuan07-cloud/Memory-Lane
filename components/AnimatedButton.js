import React, { useRef } from 'react';
import { Animated, TouchableWithoutFeedback } from 'react-native';
import { playPop } from '../utils/popSound';

/**
 * A button that slightly grows on press and plays a pop sound.
 * Drop-in replacement for TouchableOpacity in terms of usage.
 */
export default function AnimatedButton({ onPress, style, children }) {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        Animated.spring(scaleAnim, {
            toValue: 1.06,
            useNativeDriver: true,
            speed: 50,
            bounciness: 4,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
            speed: 50,
            bounciness: 4,
        }).start();
    };

    const handlePress = () => {
        playPop();
        if (onPress) onPress();
    };

    return (
        <TouchableWithoutFeedback
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={handlePress}
        >
            <Animated.View style={[style, { transform: [{ scale: scaleAnim }] }]}>
                {children}
            </Animated.View>
        </TouchableWithoutFeedback>
    );
}
