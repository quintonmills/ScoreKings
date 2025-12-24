import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

const PlayerCard = ({
  player,
  selected,
  selectedIndex,
  selectedStat,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={[styles.card, selected && styles.selectedCard]}
      onPress={onPress}
    >
      <Image source={{ uri: player.image }} style={styles.playerImage} />

      <View style={styles.info}>
        <Text style={styles.name}>{player.name}</Text>
        <Text style={styles.team}>{player.team}</Text>
        <Text style={styles.stat}>
          {player[selectedStat]} {selectedStat.toUpperCase()}
        </Text>
      </View>

      {selected && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{selectedIndex + 1}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: '#BA0C2F',
  },
  playerImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  team: {
    fontSize: 14,
    color: '#666',
  },
  stat: {
    fontSize: 16,
    color: '#BA0C2F',
    marginTop: 5,
    fontWeight: 'bold',
  },
  badge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#BA0C2F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default PlayerCard;
