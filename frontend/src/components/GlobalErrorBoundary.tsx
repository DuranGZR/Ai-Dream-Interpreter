import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Updates from 'expo-updates';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export default class GlobalErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Global Error Caught:', error, errorInfo);
        // Here you would normally log to Sentry
        // Sentry.captureException(error); 
    }

    handleRestart = async () => {
        try {
            await Updates.reloadAsync();
        } catch (e) {
            // If reload fails (e.g. in dev client), just reset state
            this.setState({ hasError: false, error: null });
        }
    };

    render() {
        if (this.state.hasError) {
            return (
                <SafeAreaView style={styles.container}>
                    <StatusBar barStyle="light-content" />
                    <View style={styles.content}>
                        <View style={styles.iconContainer}>
                            <Feather name="alert-triangle" size={48} color="#FF6B6B" />
                        </View>

                        <Text style={styles.title}>Bir şeyler ters gitti</Text>
                        <Text style={styles.message}>
                            Uygulama beklenmedik bir hatayla karşılaştı.
                        </Text>

                        {this.state.error && (
                            <View style={styles.errorBox}>
                                <Text style={styles.errorText} numberOfLines={3}>
                                    {this.state.error.toString()}
                                </Text>
                            </View>
                        )}

                        <TouchableOpacity style={styles.button} onPress={this.handleRestart}>
                            <Feather name="refresh-cw" size={20} color="#fff" />
                            <Text style={styles.buttonText}>Uygulamayı Yeniden Başlat</Text>
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            );
        }

        return this.props.children;
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#050505',
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        padding: 24,
        width: '100%',
        alignItems: 'center',
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255, 107, 107, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        borderWidth: 1,
        borderColor: 'rgba(255, 107, 107, 0.3)',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 12,
        textAlign: 'center',
    },
    message: {
        fontSize: 16,
        color: '#9CA3AF',
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 24,
    },
    errorBox: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        padding: 16,
        borderRadius: 12,
        width: '100%',
        marginBottom: 32,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    errorText: {
        color: '#EF4444',
        fontSize: 12,
        fontFamily: 'monospace',
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#9B30FF',
        paddingHorizontal: 24,
        paddingVertical: 16,
        borderRadius: 16,
        gap: 12,
        width: '100%',
        justifyContent: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
