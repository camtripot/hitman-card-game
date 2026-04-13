import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { GameEvent } from '../models/GameState';

interface EventLogProps {
  event: GameEvent | null;
}

interface LogEntry {
  id: number;
  event: GameEvent;
}

const EVENT_ICONS: Record<string, string> = {
  card_played: '🃏',
  card_drawn: '📥',
  player_eliminated: '💀',
  bomb_tick: '💣',
  direction_changed: '🔄',
  reaction: '⚡',
  target_chosen: '🎯',
  voyante: '🔮',
  chain: '⛓️',
  shield: '🛡️',
  game_over: '🏁',
};

let nextId = 0;

export function EventLog({ event }: EventLogProps) {
  const [history, setHistory] = useState<LogEntry[]>([]);
  const scrollRef = useRef<ScrollView>(null);
  const lastEventRef = useRef<GameEvent | null>(null);

  useEffect(() => {
    if (event && event !== lastEventRef.current) {
      lastEventRef.current = event;
      setHistory(prev => {
        const next = [...prev, { id: nextId++, event }];
        if (next.length > 20) {
          return next.slice(-20);
        }
        return next;
      });
    }
  }, [event]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollToEnd({ animated: true });
    }
  }, [history]);

  if (history.length === 0) return null;

  const visibleEntries = history.slice(-5);

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        style={styles.scrollArea}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
      >
        {visibleEntries.map((entry, index) => {
          const icon = EVENT_ICONS[entry.event.type] || '📝';
          const isLatest = index === visibleEntries.length - 1;
          return (
            <View
              key={entry.id}
              style={[styles.entry, isLatest && styles.latestEntry]}
            >
              <Text style={styles.icon}>{icon}</Text>
              <Text
                style={[styles.message, isLatest && styles.latestMessage]}
                numberOfLines={2}
              >
                {entry.event.message}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    marginHorizontal: 10,
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 10,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  scrollArea: {
    flexGrow: 0,
  },
  entry: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 3,
    gap: 8,
    opacity: 0.65,
  },
  latestEntry: {
    opacity: 1,
  },
  icon: {
    fontSize: 14,
    width: 22,
    textAlign: 'center',
  },
  message: {
    color: '#aab5c0',
    fontSize: 12,
    flex: 1,
  },
  latestMessage: {
    color: '#f1c40f',
    fontWeight: '600',
    fontSize: 13,
  },
});
