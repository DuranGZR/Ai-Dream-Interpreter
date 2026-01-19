import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface EnergyBarProps {
  energy: number; // 0-100 arası
  size?: 'small' | 'medium' | 'large';
}

export default function EnergyBar({ energy, size = 'medium' }: EnergyBarProps) {
  // Enerji seviyesine göre renk
  const getColor = () => {
    if (energy >= 70) return '#4caf50'; // Yeşil - Pozitif
    if (energy >= 40) return '#ff9800'; // Turuncu - Nötr
    return '#f44336'; // Kırmızı - Negatif
  };

  // Boyut ayarları
  const heights = {
    small: 6,
    medium: 10,
    large: 14,
  };

  const height = heights[size];
  const color = getColor();

  return (
    <View style={styles.container}>
      <View style={[styles.bar, { height }]}>
        <View
          style={[
            styles.fill,
            {
              width: `${Math.max(0, Math.min(100, energy))}%`,
              backgroundColor: color,
              height,
            },
          ]}
        />
      </View>
      <Text style={[styles.label, { fontSize: size === 'small' ? 10 : 12 }]}>
        {energy}%
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bar: {
    flex: 1,
    backgroundColor: '#333',
    borderRadius: 10,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: 10,
  },
  label: {
    color: '#aaa',
    fontWeight: '600',
    minWidth: 35,
    textAlign: 'right',
  },
});
