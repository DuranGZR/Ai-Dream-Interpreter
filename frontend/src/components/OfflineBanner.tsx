import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, Animated, Dimensions, SafeAreaView } from 'react-native';
import { useNetwork } from '../context/NetworkContext';
import { Feather } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');

export default function OfflineBanner() {
    const { isConnected, isInternetReachable } = useNetwork();
    const slideAnim = useRef(new Animated.Value(-100)).current;

    // Show if NOT connected or Internet NOT reachable
    // Note: Sometimes isInternetReachable can be null initially, handle gracefully
    const isOffline = !isConnected || (isInternetReachable === false);

    useEffect(() => {
        Animated.timing(slideAnim, {
            toValue: isOffline ? 0 : -100,
            duration: 300,
            useNativeDriver: true,
        }).start();
    }, [isOffline]);

    return (
        <Animated.View style={[styles.container, { transform: [{ translateY: slideAnim }] }]}>
            <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
            <SafeAreaView>
                <Animated.View style={styles.content}>
                    <Feather name="wifi-off" size={16} color="#fff" />
                    <Text style={styles.text}>İnternet bağlantısı yok - Çevrimdışı mod</Text>
                </Animated.View>
            </SafeAreaView>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(239, 68, 68, 0.9)', // Red/Error color
        zIndex: 9999, // On top of everything
        overflow: 'hidden',
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        gap: 8,
    },
    text: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
});
