import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GameEvent } from '../models/GameState';

interface EventLogProps {
  event: GameEvent | null;
}

export function EventLog({ event }: EventLogProps) {
  if (!event) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{event.message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginHorizontal: 10,
    borderRadius: 8,
    marginVertical: 4,
  },
  text: {
    color: '#f1c40f',
    fontSize: 13,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
