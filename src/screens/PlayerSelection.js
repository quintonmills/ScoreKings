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
import { LinearGradient } from 'expo-linear-gradient';
import { API_URL } from '../config/api';

const COLORS = {
  primary: '#1e3f6d',
  secondary: '#2A5298',
  light: '#ffffff',
  dark: '#0A1428',
  gray: '#8E8E93',
  success: '#28A745',
  danger: '#FF3B30',
  lightGray: '#F5F5F7',
  cardBorder: '#E5E5EA',
};

const PlayerSelectionScreen = ({ navigation, route }) => {
  const { contest } = route.params;
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [picks, setPicks] = useState([]);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const response = await fetch(`${API_URL}/api/players`);
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
            activeOpacity={0.7}
            style={[
              styles.predictionButton,
              { borderColor: COLORS.success },
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
            activeOpacity={0.7}
            style={[
              styles.predictionButton,
              { borderColor: COLORS.danger },
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
      <StatusBar barStyle='light-content' />

      {/* Full-Width Square Gradient Header */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.header}
      >
        <SafeAreaView>
          <View style={styles.headerContent}>
            <TouchableOpacity
              style={styles.headerSideItem}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name='arrow-back' size={24} color={COLORS.light} />
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
      </LinearGradient>

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
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressBar,
                    {
                      width:
                        picks.length === 1
                          ? '50%'
                          : picks.length === 2
                            ? '100%'
                            : '0%',
                    },
                  ]}
                />
              </View>
              <Text style={styles.instructionText}>
                SUBMIT REQUIRED TO FINALIZE ENTRY
              </Text>
            </View>
          </View>
        }
        renderItem={renderPlayerCard}
        contentContainerStyle={styles.scrollContent}
      />

      {picks.length === 2 && (
        <View style={styles.footer}>
          <SafeAreaView edges={['bottom']}>
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
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.lightGray },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // Header Styling (Matching ContestSelection)
  header: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
  },
  headerContent: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
  },
  headerSideItem: { width: 40 },
  headerCenterItem: { flex: 1, alignItems: 'center' },
  headerTitle: {
    color: COLORS.light,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
    letterSpacing: 0.5,
  },

  // Stat Card (Updated to rounded premium style)
  statsContainer: { padding: 16 },
  statBox: {
    backgroundColor: COLORS.light,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.gray,
    letterSpacing: 1,
  },
  counterRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: 4 },
  statValue: { fontSize: 28, fontWeight: '900', color: COLORS.primary },
  statTotal: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.gray,
    marginLeft: 4,
  },
  progressTrack: {
    height: 4,
    backgroundColor: '#E5E5EA',
    borderRadius: 2,
    marginTop: 12,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },
  instructionText: { fontSize: 10, fontWeight: '600', color: COLORS.gray },

  // Player Cards (Updated to 12pt rounded)
  scrollContent: { paddingBottom: 120 },
  playerCard: {
    backgroundColor: COLORS.light,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  playerImage: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: COLORS.lightGray,
    marginRight: 12,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  playerInfo: { flex: 1 },
  playerName: { fontSize: 15, fontWeight: '700', color: COLORS.dark },
  playerTeam: {
    fontSize: 12,
    color: COLORS.gray,
    fontWeight: '500',
    marginTop: 2,
  },
  lineContainer: { alignItems: 'flex-end' },
  lineLabel: { fontSize: 10, fontWeight: '800', color: COLORS.gray },
  lineValue: { fontSize: 20, fontWeight: '900', color: COLORS.primary },

  // Buttons (Rounded consistent with premium theme)
  actionButtons: { flexDirection: 'row', gap: 12 },
  predictionButton: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  predictionText: { fontWeight: '800', fontSize: 13, letterSpacing: 1 },

  // Footer (Floating submit style)
  footer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: COLORS.light,
    borderTopWidth: 1,
    borderTopColor: COLORS.cardBorder,
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 30 : 16,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    height: 54,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  submitButtonText: {
    color: COLORS.light,
    fontWeight: '800',
    fontSize: 15,
    letterSpacing: 1,
  },
});

export default PlayerSelectionScreen;
