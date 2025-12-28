import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { API_URL } from '../config/api';

const PlayerSelectionScreen = ({ navigation, route }) => {
  const { contest } = route.params;
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [picks, setPicks] = useState([]);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        // Fetching players since the contest-specific props route might be empty
        const response = await fetch(`${API_URL}/players`);
        const data = await response.json();

        // If the backend sends raw Players, but the UI wants "Props":
        const formattedData = data.map((item) => ({
          playerId: item.id,
          playerName: item.name,
          team: item.team,
          image: item.image,
          line: 22.5, // UI expects this
          seasonAvg: item.ppg, // UI expects this
          stat: 'POINTS', // UI expects this
        }));
        setProps(formattedData);
        // Transform Player data into the "Prop" format the UI expects
        const transformedData = data.map((player) => ({
          playerId: player.id,
          playerName: player.name,
          team: player.team,
          image: player.image,
          stat: 'POINTS',
          line: 21.5, // Default line for demo
          seasonAvg: player.ppg || 0,
        }));

        setPlayers(transformedData);
      } catch (error) {
        console.error('Error fetching players:', error);
        // DEMO FALLBACK: If DB connection fails, show these so you can still demo
        setPlayers([
          {
            playerId: 1,
            playerName: 'Eli Ellis',
            team: 'YNG',
            image: 'https://ot-p-83015.s3.amazonaws.com/players/eli_ellis.png',
            line: 28.5,
            seasonAvg: 32.4,
            stat: 'POINTS',
          },
          {
            playerId: 2,
            playerName: 'Ian Jackson',
            team: 'OSC',
            image:
              'https://ot-p-83015.s3.amazonaws.com/players/ian_jackson.png',
            line: 21.5,
            seasonAvg: 24.2,
            stat: 'POINTS',
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayers();
  }, []);

  const handlePickSelection = (player, prediction) => {
    const existingPickIndex = picks.findIndex(
      (p) => p.playerId === player.playerId
    );
    let newPicks = [...picks];

    if (existingPickIndex !== -1) {
      if (newPicks[existingPickIndex].prediction === prediction) {
        newPicks.splice(existingPickIndex, 1); // Remove if clicking same button
      } else {
        newPicks[existingPickIndex].prediction = prediction; // Switch Over/Under
      }
    } else {
      if (picks.length >= 2) {
        Alert.alert('Limit Reached', 'You can only select 2 players.');
        return;
      }
      newPicks.push({ ...player, prediction });
    }
    setPicks(newPicks);
  };

  const renderPlayerCard = ({ item }) => {
    const currentPick = picks.find((p) => p.playerId === item.playerId);
    const isOver = currentPick?.prediction === 'over';
    const isUnder = currentPick?.prediction === 'under';

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Image source={{ uri: item.image }} style={styles.playerImage} />
          <View style={styles.playerInfo}>
            <Text style={styles.playerName}>{item.playerName}</Text>
            <Text style={styles.playerTeam}>
              {item.team} • AVG {item.seasonAvg}
            </Text>
          </View>
          <View style={styles.lineBadge}>
            <Text style={styles.lineLabel}>{item.stat}</Text>
            <Text style={styles.lineValue}>{item.line}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[
              styles.predButton,
              styles.overBtn,
              isOver && styles.overActive,
            ]}
            onPress={() => handlePickSelection(item, 'over')}
          >
            <Ionicons
              name='arrow-up'
              size={18}
              color={isOver ? '#fff' : '#28a745'}
            />
            <Text style={[styles.predText, isOver && styles.textWhite]}>
              HIGHER
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.predButton,
              styles.underBtn,
              isUnder && styles.underActive,
            ]}
            onPress={() => handlePickSelection(item, 'under')}
          >
            <Ionicons
              name='arrow-down'
              size={18}
              color={isUnder ? '#fff' : '#BA0C2F'}
            />
            <Text style={[styles.predText, isUnder && styles.textWhite]}>
              LOWER
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size='large' color='#BA0C2F' />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerSection}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Ionicons name='chevron-back' size={28} color='#1e3f6d' />
        </TouchableOpacity>
        <View>
          <Text style={styles.welcomeText}>CONTEST: {contest.title}</Text>
          <Text style={styles.mainHeading}>PICK 2 PLAYERS</Text>
        </View>
      </View>

      <FlatList
        data={players}
        keyExtractor={(item) => item.playerId.toString()}
        renderItem={renderPlayerCard}
        contentContainerStyle={styles.listPadding}
      />

      {picks.length === 2 && (
        <View style={styles.footerAction}>
          <TouchableOpacity
            style={styles.continueButton}
            onPress={() =>
              navigation.navigate('ContestReviewScreen', { contest, picks })
            }
          >
            <Text style={styles.continueText}>REVIEW ENTRIES</Text>
            <Ionicons name='arrow-forward' size={18} color='#fff' />
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F4F7' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerSection: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E1E5E9',
  },
  backBtn: { marginRight: 15 },
  welcomeText: {
    color: '#BA0C2F',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  mainHeading: { color: '#1e3f6d', fontSize: 22, fontWeight: '900' },
  listPadding: { padding: 15, paddingBottom: 100 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 18,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E1E5E9',
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  playerImage: {
    width: 60, // MUST HAVE WIDTH
    height: 60, // MUST HAVE HEIGHT
    borderRadius: 30, // Makes it a circle
    backgroundColor: '#DDD', // This proves the component is there!
    marginRight: 12,
    resizeMode: 'cover', // Ensures the face fills the circle
  },
  playerInfo: { flex: 1 },
  playerName: { fontSize: 19, fontWeight: '800', color: '#1e3f6d' },
  playerTeam: { fontSize: 13, color: '#666', fontWeight: '600', marginTop: 2 },
  lineBadge: {
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 8,
    borderRadius: 12,
    width: 75,
    borderWidth: 1,
    borderColor: '#E1E5E9',
  },
  lineLabel: { fontSize: 10, fontWeight: 'bold', color: '#666' },
  lineValue: { fontSize: 20, fontWeight: '900', color: '#1e3f6d' },
  divider: { height: 1, backgroundColor: '#E1E5E9', marginVertical: 15 },
  buttonRow: { flexDirection: 'row', gap: 10 },
  predButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
  },
  overBtn: { borderColor: '#28a745', backgroundColor: '#fff' },
  underBtn: { borderColor: '#BA0C2F', backgroundColor: '#fff' },
  overActive: { backgroundColor: '#28a745' },
  underActive: { backgroundColor: '#BA0C2F' },
  predText: { fontWeight: '900', fontSize: 14, marginLeft: 6 },
  textWhite: { color: '#fff' },
  footerAction: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#E1E5E9',
  },
  continueButton: {
    backgroundColor: '#1e3f6d',
    borderRadius: 15,
    paddingVertical: 18,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#1e3f6d',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  continueText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 16,
    marginRight: 8,
  },
});

export default PlayerSelectionScreen;
