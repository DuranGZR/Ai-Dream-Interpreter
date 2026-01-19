import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Text, Modal, Animated, Easing, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

interface MysticLoaderProps {
    visible: boolean;
}

const LOADING_MESSAGES = [
    "Rüyanızın derinliklerine dalıyorum...",
    "Sembollerin gizli anlamları çözülüyor...",
    "Bilinçaltınızla bağlantı kuruluyor...",
    "Kozmik enerjiler hizalanıyor...",
    "Ruhsal mesajlar şifre çözülüyor...",
    "Arketip haritası çıkarılıyor...",
    "Yıldızlar konuşuyor, dinliyorum..."
];

// Partikül bileşeni
function Particle({ delay }: { delay: number }) {
    const translateY = useRef(new Animated.Value(0)).current;
    const opacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const animate = () => {
            Animated.loop(
                Animated.sequence([
                    Animated.delay(delay),
                    Animated.parallel([
                        Animated.timing(translateY, {
                            toValue: -height,
                            duration: 8000,
                            easing: Easing.linear,
                            useNativeDriver: true,
                        }),
                        Animated.sequence([
                            Animated.timing(opacity, {
                                toValue: 1,
                                duration: 1000,
                                useNativeDriver: true,
                            }),
                            Animated.delay(6000),
                            Animated.timing(opacity, {
                                toValue: 0,
                                duration: 1000,
                                useNativeDriver: true,
                            }),
                        ]),
                    ]),
                    Animated.timing(translateY, {
                        toValue: 0,
                        duration: 0,
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        };
        animate();
    }, []);

    return (
        <Animated.View
            style={[
                styles.particle,
                {
                    left: Math.random() * width,
                    opacity,
                    transform: [{ translateY }],
                },
            ]}
        />
    );
}

export default function MysticLoader({ visible }: MysticLoaderProps) {
    const outerRing = useRef(new Animated.Value(0)).current;
    const middleRing = useRef(new Animated.Value(0)).current;
    const innerRing = useRef(new Animated.Value(0)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const glowAnim = useRef(new Animated.Value(0.5)).current;
    const textOpacity = useRef(new Animated.Value(0)).current;

    const [messageIndex, setMessageIndex] = useState(0);

    // Mesaj döngüsü - smooth transition
    useEffect(() => {
        if (visible) {
            const interval = setInterval(() => {
                Animated.sequence([
                    Animated.timing(textOpacity, {
                        toValue: 0,
                        duration: 500,
                        useNativeDriver: true,
                    }),
                    Animated.delay(100),
                    Animated.timing(textOpacity, {
                        toValue: 1,
                        duration: 500,
                        useNativeDriver: true,
                    }),
                ]).start();

                setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
            }, 3000);
            return () => clearInterval(interval);
        } else {
            setMessageIndex(0);
            textOpacity.setValue(0);
        }
    }, [visible]);

    // Animasyonlar
    useEffect(() => {
        if (visible) {
            // İlk mesaj fade in
            Animated.timing(textOpacity, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }).start();

            // 3 Halka - farklı hızlarda
            Animated.loop(
                Animated.timing(outerRing, {
                    toValue: 1,
                    duration: 20000,
                    easing: Easing.linear,
                    useNativeDriver: true,
                })
            ).start();

            Animated.loop(
                Animated.timing(middleRing, {
                    toValue: 1,
                    duration: 15000,
                    easing: Easing.linear,
                    useNativeDriver: true,
                })
            ).start();

            Animated.loop(
                Animated.timing(innerRing, {
                    toValue: 1,
                    duration: 12000,
                    easing: Easing.linear,
                    useNativeDriver: true,
                })
            ).start();

            // Nabız (daha smooth)
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 1.2,
                        duration: 2000,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 2000,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                ])
            ).start();

            // Glow effect
            Animated.loop(
                Animated.sequence([
                    Animated.timing(glowAnim, {
                        toValue: 1,
                        duration: 2500,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                    Animated.timing(glowAnim, {
                        toValue: 0.5,
                        duration: 2500,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        } else {
            outerRing.setValue(0);
            middleRing.setValue(0);
            innerRing.setValue(0);
            pulseAnim.setValue(1);
            glowAnim.setValue(0.5);
        }
    }, [visible]);

    const outerSpin = outerRing.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    const middleSpin = middleRing.interpolate({
        inputRange: [0, 1],
        outputRange: ['360deg', '0deg'], // Ters yön
    });

    const innerSpin = innerRing.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.container}>
                <BlurView intensity={90} tint="dark" style={StyleSheet.absoluteFill} />

                {/* Partikül sistemi - yıldızlar */}
                {visible && Array.from({ length: 20 }).map((_, i) => (
                    <Particle key={i} delay={i * 400} />
                ))}

                {/* Dış halka - en yavaş */}
                <Animated.View style={[styles.ringOuter, { transform: [{ rotate: outerSpin }] }]}>
                    <LinearGradient
                        colors={['rgba(155, 48, 255, 0)', 'rgba(155, 48, 255, 0.3)', 'rgba(155, 48, 255, 0)']}
                        style={styles.gradientRing}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    />
                </Animated.View>

                {/* Orta halka */}
                <Animated.View style={[styles.ringMiddle, { transform: [{ rotate: middleSpin }] }]}>
                    <LinearGradient
                        colors={['rgba(224, 170, 255, 0)', 'rgba(224, 170, 255, 0.4)', 'rgba(224, 170, 255, 0)']}
                        style={styles.gradientRing}
                        start={{ x: 1, y: 0 }}
                        end={{ x: 0, y: 1 }}
                    />
                </Animated.View>

                {/* İç halka */}
                <Animated.View style={[styles.ringInner, { transform: [{ rotate: innerSpin }] }]}>
                    <View style={styles.innerDots}>
                        {[0, 90, 180, 270].map((angle, i) => (
                            <View
                                key={i}
                                style={[
                                    styles.dot,
                                    {
                                        transform: [
                                            { rotate: `${angle}deg` },
                                            { translateY: -60 },
                                        ],
                                    },
                                ]}
                            />
                        ))}
                    </View>
                </Animated.View>

                {/* Merkez kristal küre - glow effect */}
                <Animated.View
                    style={[
                        styles.glowContainer,
                        {
                            opacity: glowAnim,
                            transform: [{ scale: pulseAnim }]
                        }
                    ]}
                >
                    <View style={styles.glowCircle} />
                </Animated.View>

                {/* Merkez İkon */}
                <Animated.View style={[styles.centerIcon, { transform: [{ scale: pulseAnim }] }]}>
                    <View style={styles.iconBg}>
                        <Feather name="eye" size={48} color="#E0AAFF" />
                    </View>
                </Animated.View>

                {/* Mesaj - smooth fade */}
                <Animated.View style={[styles.textContainer, { opacity: textOpacity }]}>
                    <Text style={styles.loadingText}>
                        {LOADING_MESSAGES[messageIndex]}
                    </Text>
                    <View style={styles.textUnderline} />
                </Animated.View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.95)',
    },

    // Partikül
    particle: {
        position: 'absolute',
        width: 3,
        height: 3,
        borderRadius: 1.5,
        backgroundColor: '#E0AAFF',
        top: height,
        shadowColor: '#E0AAFF',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 4,
    },

    // Halkalar
    ringOuter: {
        position: 'absolute',
        width: 280,
        height: 280,
        justifyContent: 'center',
        alignItems: 'center',
    },
    ringMiddle: {
        position: 'absolute',
        width: 220,
        height: 220,
        justifyContent: 'center',
        alignItems: 'center',
    },
    ringInner: {
        position: 'absolute',
        width: 160,
        height: 160,
        justifyContent: 'center',
        alignItems: 'center',
    },
    gradientRing: {
        width: '100%',
        height: '100%',
        borderRadius: 1000,
        borderWidth: 2,
        borderColor: 'rgba(155, 48, 255, 0.4)',
    },

    // Noktalar
    innerDots: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    dot: {
        position: 'absolute',
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#9B30FF',
        shadowColor: '#9B30FF',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 12,
    },

    // Glow
    glowContainer: {
        position: 'absolute',
        zIndex: 1,
    },
    glowCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(155, 48, 255, 0.3)',
        shadowColor: '#9B30FF',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 40,
    },

    // Merkez
    centerIcon: {
        position: 'absolute',
        zIndex: 10,
    },
    iconBg: {
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: 'rgba(0,0,0,0.6)',
        borderWidth: 2,
        borderColor: 'rgba(224, 170, 255, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#E0AAFF',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 20,
    },

    // Text
    textContainer: {
        position: 'absolute',
        bottom: 120, // Dairelerin çok altında
        paddingHorizontal: 40,
        alignItems: 'center',
        width: '100%',
    },
    loadingText: {
        color: '#E0AAFF',
        fontSize: 18, // Daha büyük
        fontFamily: 'CormorantGaramond_500Medium',
        letterSpacing: 1.2,
        textAlign: 'center',
        fontStyle: 'italic',
        lineHeight: 28,
    },
    textUnderline: {
        marginTop: 16,
        width: 80,
        height: 3,
        backgroundColor: 'rgba(155, 48, 255, 0.6)',
        borderRadius: 1.5,
    },
});
