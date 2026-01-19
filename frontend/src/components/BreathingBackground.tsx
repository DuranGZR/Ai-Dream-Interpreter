import React, { useEffect, useRef, useMemo } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

// 🌌 DEEP SPACE THEME
const BG_COLORS = ['#020202', '#0B0B15', '#150A1E'] as const;

// Generate random stars once
const NUM_STARS = 40;
const generateStars = () => {
    return Array.from({ length: NUM_STARS }).map((_, i) => ({
        id: i,
        x: Math.random() * width,
        y: Math.random() * (height * 0.6), // Only in top 60%
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.8 + 0.2,
    }));
};

export default function BreathingBackground() {
    const pulseAnim = useRef(new Animated.Value(0.3)).current;
    const stars = useMemo(() => generateStars(), []);

    useEffect(() => {
        // 1. subtle Horizon Pulse (Ufuk Çizgisi Nabzı)
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 0.6,
                    duration: 4000,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 0.3,
                    duration: 4000,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    return (
        <View style={StyleSheet.absoluteFill}>
            {/* 1. Base Gradient */}
            <LinearGradient
                colors={BG_COLORS}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
            />

            {/* 2. Stars (Static but random) */}
            {stars.map((star) => (
                <View
                    key={star.id}
                    style={[
                        styles.star,
                        {
                            left: star.x,
                            top: star.y,
                            width: star.size,
                            height: star.size,
                            opacity: star.opacity,
                        },
                    ]}
                />
            ))}

            {/* 3. Horizon Glow (Nefes Alan Alt Işık) */}
            <Animated.View
                style={[
                    styles.horizonGlow,
                    {
                        opacity: pulseAnim,
                    },
                ]}
            >
                <LinearGradient
                    colors={['transparent', 'rgba(155, 48, 255, 0.2)', 'rgba(155, 48, 255, 0.5)']}
                    style={StyleSheet.absoluteFill}
                />
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    star: {
        position: 'absolute',
        backgroundColor: '#FFF',
        borderRadius: 999,
    },
    horizonGlow: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: height * 0.4, // Bottom 40%
    },
});
