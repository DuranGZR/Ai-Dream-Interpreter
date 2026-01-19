import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, ViewStyle } from 'react-native';
import { useIsFocused } from '@react-navigation/native';

interface AnimatedScreenProps {
    children: React.ReactNode;
    style?: ViewStyle;
}

export default function AnimatedScreen({ children, style }: AnimatedScreenProps) {
    // Animation values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(20)).current; // Start 20px lower
    const scaleAnim = useRef(new Animated.Value(0.98)).current; // Start slightly smaller

    const isFocused = useIsFocused();

    useEffect(() => {
        if (isFocused) {
            // Reset values to initial state for re-entry
            fadeAnim.setValue(0);
            slideAnim.setValue(20);
            scaleAnim.setValue(0.98);

            // Play entrance animation
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 400,
                    useNativeDriver: true,
                }),
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 500,
                    useNativeDriver: true, // Smooth slide up
                }),
                Animated.timing(scaleAnim, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                })
            ]).start();
        }
    }, [isFocused]);

    return (
        <Animated.View
            style={[
                style,
                {
                    flex: 1,
                    opacity: fadeAnim,
                    transform: [
                        { translateY: slideAnim },
                        { scale: scaleAnim }
                    ],
                },
            ]}
        >
            {children}
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
