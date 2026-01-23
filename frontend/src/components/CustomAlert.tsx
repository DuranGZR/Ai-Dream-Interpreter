import React, { useEffect, useRef } from 'react';
import {
    View,
    StyleSheet,
    Modal,
    TouchableOpacity,
    Animated,
    Pressable,
    Dimensions,
} from 'react-native';
import { Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Feather } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

// 🌌 COSMIC PURPLE THEME
// 🌌 COSMIC PURPLE THEME (Shared)
import { COSMIC_THEME } from '../theme/theme';

const THEME = COSMIC_THEME;

export type AlertType = 'success' | 'error' | 'warning' | 'info' | 'default';

export interface AlertButton {
    text: string;
    onPress?: () => void;
    style?: 'default' | 'cancel' | 'destructive';
}

export interface CustomAlertProps {
    visible: boolean;
    title: string;
    message?: string;
    type?: AlertType;
    buttons?: AlertButton[];
    onClose: () => void;
}

const getIconConfig = (type: AlertType) => {
    switch (type) {
        case 'success':
            return { name: 'check-circle', color: THEME.success };
        case 'error':
            return { name: 'x-circle', color: THEME.error };
        case 'warning':
            return { name: 'alert-triangle', color: THEME.warning };
        case 'info':
            return { name: 'info', color: THEME.info };
        default:
            return { name: 'bell', color: THEME.accent };
    }
};

export default function CustomAlert({
    visible,
    title,
    message,
    type = 'default',
    buttons = [{ text: 'Tamam', style: 'default' }],
    onClose,
}: CustomAlertProps) {
    const scaleAnim = useRef(new Animated.Value(0.8)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    friction: 8,
                    tension: 100,
                    useNativeDriver: true,
                }),
                Animated.timing(opacityAnim, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            scaleAnim.setValue(0.8);
            opacityAnim.setValue(0);
        }
    }, [visible]);

    const iconConfig = getIconConfig(type);

    const handleButtonPress = (button: AlertButton) => {
        button.onPress?.();
        onClose();
    };

    const getButtonStyle = (style?: string) => {
        switch (style) {
            case 'destructive':
                return { backgroundColor: THEME.error };
            case 'cancel':
                return { backgroundColor: 'rgba(255,255,255,0.1)' };
            default:
                return { backgroundColor: THEME.primary };
        }
    };

    const getButtonTextStyle = (style?: string) => {
        if (style === 'cancel') {
            return { color: THEME.textMuted };
        }
        return { color: '#fff' };
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            onRequestClose={onClose}
        >
            <Pressable style={styles.overlay} onPress={onClose}>
                <Animated.View
                    style={[
                        styles.contentWrapper,
                        {
                            opacity: opacityAnim,
                            transform: [{ scale: scaleAnim }],
                        },
                    ]}
                >
                    <Pressable onPress={(e) => e.stopPropagation()}>
                        <View style={styles.alertContainer}>
                            <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
                            <LinearGradient
                                colors={['rgba(155, 48, 255, 0.15)', 'rgba(0,0,0,0.8)']}
                                style={StyleSheet.absoluteFill}
                            />

                            {/* Glow Border */}
                            <View style={styles.glowBorder} />

                            {/* Content */}
                            <View style={styles.content}>
                                {/* Icon */}
                                <View style={[styles.iconContainer, { borderColor: iconConfig.color + '40' }]}>
                                    <Feather name={iconConfig.name as any} size={32} color={iconConfig.color} />
                                </View>

                                {/* Title */}
                                <Text style={styles.title}>{title}</Text>

                                {/* Message */}
                                {message && <Text style={styles.message}>{message}</Text>}

                                {/* Buttons */}
                                <View style={[styles.buttonContainer, buttons.length === 1 && styles.singleButton]}>
                                    {buttons.map((button, index) => (
                                        <TouchableOpacity
                                            key={index}
                                            style={[
                                                styles.button,
                                                getButtonStyle(button.style),
                                                buttons.length === 1 && styles.fullWidthButton,
                                            ]}
                                            onPress={() => handleButtonPress(button)}
                                            activeOpacity={0.8}
                                        >
                                            <Text style={[styles.buttonText, getButtonTextStyle(button.style)]}>
                                                {button.text}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        </View>
                    </Pressable>
                </Animated.View>
            </Pressable>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    contentWrapper: {
        width: '100%',
        maxWidth: 340,
    },
    alertContainer: {
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(155, 48, 255, 0.3)',
    },
    glowBorder: {
        position: 'absolute',
        top: -1,
        left: -1,
        right: -1,
        bottom: -1,
        borderRadius: 25,
        borderWidth: 2,
        borderColor: 'rgba(155, 48, 255, 0.2)',
    },
    content: {
        padding: 24,
        alignItems: 'center',
    },
    iconContainer: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        borderWidth: 2,
    },
    title: {
        fontSize: 20,
        fontWeight: '600',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 8,
    },
    message: {
        fontSize: 14,
        color: THEME.textMuted,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 24,
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
    },
    singleButton: {
        justifyContent: 'center',
    },
    button: {
        flex: 1,
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 14,
        alignItems: 'center',
    },
    fullWidthButton: {
        flex: 0,
        minWidth: 140,
    },
    buttonText: {
        fontSize: 15,
        fontWeight: '600',
    },
});
