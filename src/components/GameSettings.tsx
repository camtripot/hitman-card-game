import React, { useRef, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';

export interface GameSettingsData {
  startWithAnge: boolean;
  deadCardsReturnToPile: boolean;
}

interface GameSettingsProps {
  settings: GameSettingsData;
  onSettingsChange: (settings: GameSettingsData) => void;
  disabled?: boolean;
}

function Toggle({ value, onToggle, disabled }: { value: boolean; onToggle: () => void; disabled?: boolean }) {
  const animValue = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(animValue, {
      toValue: value ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [value, animValue]);

  const translateX = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [2, 22],
  });

  const backgroundColor = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['#7f8c8d', '#27ae60'],
  });

  return (
    <Pressable
      onPress={disabled ? undefined : onToggle}
      style={[styles.toggleOuter, disabled && styles.toggleDisabled, { cursor: disabled ? 'default' : 'pointer' } as any]}
    >
      <Animated.View style={[styles.toggleTrack, { backgroundColor }]}>
        <Animated.View style={[styles.toggleThumb, { transform: [{ translateX }] }]} />
      </Animated.View>
    </Pressable>
  );
}

export function GameSettings({ settings, onSettingsChange, disabled }: GameSettingsProps) {
  const toggle = (key: keyof GameSettingsData) => {
    onSettingsChange({ ...settings, [key]: !settings[key] });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{'\u2699\uFE0F'} Regles</Text>

      <View style={styles.row}>
        <View style={styles.labelContainer}>
          <Text style={styles.label}>{'\uD83D\uDC7C'} Commencer avec un Ange</Text>
          <Text style={styles.subtitle}>Chaque joueur commence avec un Ange en main</Text>
        </View>
        <Toggle value={settings.startWithAnge} onToggle={() => toggle('startWithAnge')} disabled={disabled} />
      </View>

      <View style={styles.row}>
        <View style={styles.labelContainer}>
          <Text style={styles.label}>{'\u267B\uFE0F'} Cartes du mort dans la pioche</Text>
          <Text style={styles.subtitle}>Les cartes d'un joueur elimine retournent dans la pioche</Text>
        </View>
        <Toggle value={settings.deadCardsReturnToPile} onToggle={() => toggle('deadCardsReturnToPile')} disabled={disabled} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#2c3e50',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 8,
  },
  labelContainer: {
    flex: 1,
    marginRight: 12,
  },
  label: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  subtitle: {
    color: '#7f8c8d',
    fontSize: 12,
    marginTop: 2,
  },
  toggleOuter: {
    padding: 2,
  },
  toggleDisabled: {
    opacity: 0.5,
  },
  toggleTrack: {
    width: 48,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
  },
  toggleThumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#fff',
  },
});
