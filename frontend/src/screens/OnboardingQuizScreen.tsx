import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { BlurView } from 'expo-blur';
import { Feather } from '@expo/vector-icons';
import BreathingBackground from '../components/BreathingBackground';

const { width } = Dimensions.get('window');

const QUESTIONS = [
    {
        id: 1,
        question: "Rüyalarını genellikle nasıl hatırlarsın?",
        options: [
            { text: "Çok detaylı, film gibi", type: "ANALYST", icon: "film" },
            { text: "Duygular ve hisler ön planda", type: "MYSTIC", icon: "heart" },
            { text: "Bölük pörçük ve karmaşık", type: "GUIDE", icon: "help-circle" }
        ]
    },
    {
        id: 2,
        question: "Bir rüya tabirinden en çok ne beklersin?",
        options: [
            { text: "Psikolojik analiz ve netlik", type: "ANALYST", icon: "activity" },
            { text: "Gelecekten haberler ve işaretler", type: "MYSTIC", icon: "eye" },
            { text: "Günlük hayatım için tavsiyeler", type: "GUIDE", icon: "compass" }
        ]
    },
    {
        id: 3,
        question: "Hangisi seni daha çok tanımlar?",
        options: [
            { text: "Mantıklı ve sorgulayıcı", type: "ANALYST", icon: "cpu" },
            { text: "Sezgisel ve ruhsal", type: "MYSTIC", icon: "moon" },
            { text: "Pratik ve çözüm odaklı", type: "GUIDE", icon: "check-circle" }
        ]
    }
];

export default function OnboardingQuizScreen() {
    const navigation = useNavigation();
    const { updateProfile } = useAuth();
    const [currentStep, setCurrentStep] = useState(0);
    const [scores, setScores] = useState({ ANALYST: 0, MYSTIC: 0, GUIDE: 0 });

    const handleAnswer = async (type: string) => {
        const newScores = { ...scores, [type]: scores[type as keyof typeof scores] + 1 };
        setScores(newScores);

        if (currentStep < QUESTIONS.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            finishQuiz(newScores);
        }
    };

    const finishQuiz = async (finalScores: any) => {
        // En yüksek skoru bul
        const winner = Object.keys(finalScores).reduce((a, b) => finalScores[a] > finalScores[b] ? a : b);

        await updateProfile({ persona: winner });

        navigation.reset({
            index: 0,
            routes: [{ name: 'MainTabs' as any }],
        });
    };

    const currentQuestion = QUESTIONS[currentStep];

    return (
        <View style={styles.container}>
            <BreathingBackground />

            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.stepIndicator}>Soru {currentStep + 1} / {QUESTIONS.length}</Text>
                    <Text style={styles.question}>{currentQuestion.question}</Text>
                </View>

                <View style={styles.optionsContainer}>
                    {currentQuestion.options.map((option, index) => (
                        <TouchableOpacity
                            key={index}
                            activeOpacity={0.8}
                            onPress={() => handleAnswer(option.type)}
                        >
                            <BlurView intensity={20} tint="light" style={styles.optionCard}>
                                <LinearGradient
                                    colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
                                    style={styles.gradient}
                                >
                                    <View style={styles.iconContainer}>
                                        <Feather name={option.icon as any} size={24} color="#E0AAFF" />
                                    </View>
                                    <Text style={styles.optionText}>{option.text}</Text>
                                    <Feather name="chevron-right" size={20} color="rgba(255,255,255,0.5)" />
                                </LinearGradient>
                            </BlurView>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#050505',
        justifyContent: 'center',
    },
    content: {
        padding: 24,
        zIndex: 1,
    },
    header: {
        marginBottom: 40,
        alignItems: 'center',
    },
    stepIndicator: {
        color: '#E0AAFF',
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 12,
        opacity: 0.8,
    },
    question: {
        color: '#FFFFFF',
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        lineHeight: 36,
    },
    optionsContainer: {
        gap: 16,
    },
    optionCard: {
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    gradient: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        gap: 16,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(155, 48, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(224, 170, 255, 0.3)',
    },
    optionText: {
        flex: 1,
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '500',
    },
});
