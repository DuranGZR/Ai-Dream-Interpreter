import { NavigatorScreenParams } from '@react-navigation/native';

export type MainTabParamList = {
    Home: undefined;
    History: undefined;
    Calendar: undefined;
    Stats: undefined;
    Profile: undefined;
};

export type RootStackParamList = {
    Onboarding: undefined;
    Login: undefined;
    MainTabs: NavigatorScreenParams<MainTabParamList>;
    Result: {
        interpretation: string;
        energy: number;
        symbols: Array<string | { name: string; meaning: string }>;
        dreamText?: string;
        fromHistory?: boolean;
        dreamId?: string;
        date?: string;
    };
    OnboardingQuiz: undefined;
};

declare global {
    namespace ReactNavigation {
        interface RootParamList extends RootStackParamList { }
    }
}
