import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card } from 'react-native-paper';

interface SymbolCardProps {
  symbol: string;
  meaning: string;
  emoji?: string;
  onPress?: () => void;
}

export default function SymbolCard({ symbol, meaning, emoji, onPress }: SymbolCardProps) {
  return (
    <TouchableOpacity onPress={onPress} disabled={!onPress} activeOpacity={0.7}>
      <Card style={styles.card}>
        <Card.Content style={styles.content}>
          {emoji && <Text style={styles.emoji}>{emoji}</Text>}
          
          <View style={styles.textContainer}>
            <Text style={styles.symbol}>{symbol}</Text>
            <Text style={styles.meaning} numberOfLines={2}>
              {meaning}
            </Text>
          </View>

          {onPress && (
            <Text style={styles.arrow}>›</Text>
          )}
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1e2746',
    marginVertical: 6,
    marginHorizontal: 10,
    borderRadius: 12,
    elevation: 3,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  emoji: {
    fontSize: 32,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  symbol: {
    fontSize: 16,
    fontWeight: '700',
    color: '#7c4dff',
    marginBottom: 4,
  },
  meaning: {
    fontSize: 13,
    color: '#aaa',
    lineHeight: 18,
  },
  arrow: {
    fontSize: 28,
    color: '#666',
    marginLeft: 8,
  },
});
