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
  Dimensions,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { API_URL } from '../config/api';

const { width } = Dimensions.get('window');

// --- ADMIN THEME CONSTANTS ---
const COLORS = {
  primary: '#0A1F44', // Deep Navy
  accent: '#7D1324', // Maroon Stripe
  background: '#F0F2F5',
  cardBg: '#ffffff',
  textMain: '#1A1A1A',
  textMuted: '#65676B',
  success: '#28A745',
  danger: '#DC3545',
  border: '#E4E6EB',
  light: '#ffffff',
};

const PlayerSelectionScreen = ({ navigation, route }) => {
  const { contest } = route.params;
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [picks, setPicks] = useState([]);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const response = await fetch(`${API_URL}/players`);
        const data = await response.json();
        const transformedData = data.map((player) => ({
          playerId: player.id,
          playerName: player.name,
          team: player.team,
          image: player.image,
          stat: 'POINTS',
          line: Math.round((player.ppg - 0.5) * 10) / 10,
          seasonAvg: player.ppg || 0,
        }));
        setPlayers(transformedData);
      } catch (error) {
        console.error('Error fetching players:', error);
        setPlayers([
          {
            playerId: 1,
            playerName: 'Eli Ellis',
            team: 'YNG',
            image:
              'https://images.overtime.tv/ote-games/e3008e5d-0f63-423a-abbc-49f9bbacc2e0/8e251d72-2e5c-4f4f-86f5-27ecf66c268a.webp',
            line: 28.5,
            seasonAvg: 32.4,
            stat: 'POINTS',
          },
          {
            playerId: 2,
            playerName: 'Ian Jackson',
            team: 'OSC',
            image:
              'https://images.overtime.tv/ote-games/e3008e5d-0f63-423a-abbc-49f9bbacc2e0/596c2acd-6993-4230-bcb2-04a64d1a6cd8.webp',
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
      (p) => p.playerId === player.playerId,
    );
    let newPicks = [...picks];

    if (existingPickIndex !== -1) {
      if (newPicks[existingPickIndex].prediction === prediction) {
        newPicks.splice(existingPickIndex, 1);
      } else {
        newPicks[existingPickIndex].prediction = prediction;
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

  const getPickStatus = (playerId) => {
    const pick = picks.find((p) => p.playerId === playerId);
    if (!pick) return null;
    return {
      prediction: pick.prediction,
      isOver: pick.prediction === 'over',
      isUnder: pick.prediction === 'under',
    };
  };

  const renderPlayerCard = ({ item }) => {
    const pickStatus = getPickStatus(item.playerId);

    return (
      <View style={styles.playerCard}>
        <View style={styles.cardHeader}>
          <Image source={{ uri: item.image }} style={styles.playerImage} />
          <View style={styles.playerInfo}>
            <Text style={styles.playerName}>
              {item.playerName.toUpperCase()}
            </Text>
            <Text style={styles.playerTeam}>
              {item.team} • AVG {item.seasonAvg} {item.stat}
            </Text>
          </View>
          <View style={styles.lineContainer}>
            <Text style={styles.lineLabel}>LINE</Text>
            <Text style={styles.lineValue}>{item.line}</Text>
          </View>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[
              styles.predictionButton,
              styles.overBorder,
              pickStatus?.isOver && { backgroundColor: COLORS.success },
            ]}
            onPress={() => handlePickSelection(item, 'over')}
          >
            <Text
              style={[
                styles.predictionText,
                { color: pickStatus?.isOver ? COLORS.light : COLORS.success },
              ]}
            >
              OVER
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.predictionButton,
              styles.underBorder,
              pickStatus?.isUnder && { backgroundColor: COLORS.danger },
            ]}
            onPress={() => handlePickSelection(item, 'under')}
          >
            <Text
              style={[
                styles.predictionText,
                { color: pickStatus?.isUnder ? COLORS.light : COLORS.danger },
              ]}
            >
              UNDER
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size='large' color={COLORS.primary} />
      </View>
    );

  return (
    <View style={styles.container}>
      <StatusBar barStyle='light-content' backgroundColor={COLORS.primary} />

      {/* --- BOXY CENTERED HEADER --- */}
      <View style={styles.headerWrapper}>
        <SafeAreaView>
          <View style={styles.headerContent}>
            <TouchableOpacity
              style={styles.headerSideItem}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name='chevron-back' size={24} color={COLORS.light} />
            </TouchableOpacity>

            <View style={styles.headerCenterItem}>
              <Text style={styles.headerTitle}>PLAYER SELECTION</Text>
              <Text style={styles.headerSubtitle} numberOfLines={1}>
                {contest.title.toUpperCase()}
              </Text>
            </View>

            <View style={styles.headerSideItem} />
          </View>
        </SafeAreaView>
        <View style={styles.headerAccentLine} />
      </View>

      <FlatList
        data={players}
        keyExtractor={(item) => item.playerId.toString()}
        ListHeaderComponent={
          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>PICKS SELECTED</Text>
              <View style={styles.counterRow}>
                <Text style={styles.statValue}>{picks.length}</Text>
                <Text style={styles.statTotal}>/ 2</Text>
              </View>
              <View
                style={[
                  styles.statIndicator,
                  { width: picks.length === 2 ? '100%' : '50%' },
                ]}
              />
              <Text style={styles.instructionText}>
                SUBMIT REQUIRED TO FINALIZE ENTRY
              </Text>
            </View>
          </View>
        }
        renderItem={renderPlayerCard}
        contentContainerStyle={styles.scrollContent}
      />

      {/* --- FOOTER BUTTON --- */}
      {picks.length === 2 && (
        <SafeAreaView style={styles.footer}>
          <TouchableOpacity
            style={styles.submitButton}
            onPress={() =>
              navigation.navigate('ContestReviewScreen', { contest, picks })
            }
          >
            <Text style={styles.submitButtonText}>REVIEW ENTRIES</Text>
            <Ionicons
              name='arrow-forward'
              size={18}
              color={COLORS.light}
              style={{ marginLeft: 8 }}
            />
          </TouchableOpacity>
        </SafeAreaView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // Header
  headerWrapper: { backgroundColor: COLORS.primary, zIndex: 100 },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    paddingTop: Platform.OS === 'android' ? 10 : 0,
  },
  headerSideItem: { width: 40, alignItems: 'center' },
  headerCenterItem: { flex: 1, alignItems: 'center' },
  headerTitle: {
    color: COLORS.light,
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 9,
    fontWeight: '600',
    marginTop: 2,
    letterSpacing: 0.5,
  },
  headerAccentLine: { height: 4, backgroundColor: COLORS.accent },

  // Selection Stat Card
  statsContainer: { padding: 16 },
  statBox: {
    backgroundColor: COLORS.cardBg,
    padding: 16,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 1,
  },
  counterRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: 4 },
  statValue: { fontSize: 28, fontWeight: '900', color: COLORS.primary },
  statTotal: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginLeft: 4,
  },
  statIndicator: {
    height: 3,
    backgroundColor: COLORS.accent,
    marginTop: 10,
    marginBottom: 10,
  },
  instructionText: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },

  // Player Cards
  scrollContent: { paddingBottom: 100 },
  playerCard: {
    backgroundColor: COLORS.cardBg,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  playerImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.background,
    marginRight: 12,
  },
  playerInfo: { flex: 1 },
  playerName: { fontSize: 14, fontWeight: '800', color: COLORS.textMain },
  playerTeam: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: '600',
    marginTop: 2,
  },
  lineContainer: { alignItems: 'flex-end' },
  lineLabel: { fontSize: 9, fontWeight: '800', color: COLORS.textMuted },
  lineValue: { fontSize: 18, fontWeight: '900', color: COLORS.primary },

  // Buttons
  actionButtons: { flexDirection: 'row', gap: 10 },
  predictionButton: {
    flex: 1,
    height: 40,
    borderRadius: 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  overBorder: { borderColor: COLORS.success },
  underBorder: { borderColor: COLORS.danger },
  predictionText: { fontWeight: '900', fontSize: 12, letterSpacing: 1 },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: COLORS.light,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    padding: 16,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    height: 50,
    borderRadius: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    color: COLORS.light,
    fontWeight: '900',
    fontSize: 14,
    letterSpacing: 1,
  },
});

export default PlayerSelectionScreen;
