import React, { createContext, useContext, useEffect, useState } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

interface NetworkContextType {
    isConnected: boolean;
    isInternetReachable: boolean;
    type: string;
}

const NetworkContext = createContext<NetworkContextType>({
    isConnected: true,
    isInternetReachable: true,
    type: 'unknown',
});

export const useNetwork = () => useContext(NetworkContext);

export function NetworkProvider({ children }: { children: React.ReactNode }) {
    const [networkState, setNetworkState] = useState<{
        isConnected: boolean;
        isInternetReachable: boolean;
        type: string;
    }>({
        isConnected: true,
        isInternetReachable: true,
        type: 'unknown',
    });

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
            setNetworkState({
                isConnected: state.isConnected ?? true, // Default to true if null
                isInternetReachable: state.isInternetReachable ?? true, // Default to true if null
                type: state.type,
            });
        });

        return () => {
            unsubscribe();
        };
    }, []);

    return (
        <NetworkContext.Provider value={networkState}>
            {children}
        </NetworkContext.Provider>
    );
}
