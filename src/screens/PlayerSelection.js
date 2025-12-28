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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { API_URL } from '../config/api';

const { width } = Dimensions.get('window');

// Theme Constants (same as MyContestsScreen)
const COLORS = {
  primary: '#1e3f6d', // Dark blue
  secondary: '#BA0C2F', // Red
  success: '#34C759', // Green
  warning: '#FF9500', // Orange
  danger: '#FF3B30', // Red
  light: '#ffffff',
  dark: '#0A1428',
  gray: '#8E8E93',
  lightGray: '#F5F5F7',
  cardBg: '#ffffff',
  cardBorder: '#E5E5EA',
};

const TYPOGRAPHY = {
  h1: { fontSize: 28, fontWeight: '800', lineHeight: 34 },
  h2: { fontSize: 22, fontWeight: '700', lineHeight: 28 },
  h3: { fontSize: 18, fontWeight: '600', lineHeight: 24 },
  body: { fontSize: 16, fontWeight: '400', lineHeight: 22 },
  caption: { fontSize: 14, fontWeight: '400', lineHeight: 18 },
  small: { fontSize: 12, fontWeight: '400', lineHeight: 16 },
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const CARD_STYLES = {
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  borderRadius: 12,
  borderWidth: 1,
  borderColor: COLORS.cardBorder,
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

        // Transform Player data into the "Prop" format the UI expects
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
        // DEMO FALLBACK: If DB connection fails, show demo data
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

  const getPickStatus = (playerId) => {
    const pick = picks.find((p) => p.playerId === playerId);
    if (!pick) return null;
    return {
      isSelected: true,
      prediction: pick.prediction,
      isOver: pick.prediction === 'over',
      isUnder: pick.prediction === 'under',
    };
  };

  const renderPlayerCard = ({ item }) => {
    const pickStatus = getPickStatus(item.playerId);

    return (
      <View style={[styles.playerCard, CARD_STYLES.shadow]}>
        {/* Card Header */}
        <View style={styles.cardHeader}>
          <Image source={{ uri: item.image }} style={styles.playerImage} />
          <View style={styles.playerInfo}>
            <Text style={styles.playerName} numberOfLines={1}>
              {item.playerName}
            </Text>
            <Text style={styles.playerTeam}>
              {item.team} • Avg: {item.seasonAvg} {item.stat}
            </Text>
          </View>
          <View style={styles.lineContainer}>
            <Text style={styles.lineLabel}>LINE</Text>
            <Text style={styles.lineValue}>{item.line}</Text>
          </View>
        </View>

        {/* Pick Status Badge */}
        {pickStatus && (
          <View style={styles.selectionBadge}>
            <Text
              style={[
                styles.selectionText,
                pickStatus.isOver ? styles.overText : styles.underText,
              ]}
            >
              {pickStatus.prediction.toUpperCase()} SELECTED
            </Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[
              styles.predictionButton,
              styles.overButton,
              pickStatus?.isOver && styles.overActive,
            ]}
            onPress={() => handlePickSelection(item, 'over')}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={
                pickStatus?.isOver
                  ? ['#34C759', '#28a745']
                  : ['transparent', 'transparent']
              }
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons
                name='arrow-up'
                size={18}
                color={pickStatus?.isOver ? COLORS.light : COLORS.success}
              />
              <Text
                style={[
                  styles.predictionText,
                  pickStatus?.isOver && styles.activeText,
                ]}
              >
                OVER
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.predictionButton,
              styles.underButton,
              pickStatus?.isUnder && styles.underActive,
            ]}
            onPress={() => handlePickSelection(item, 'under')}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={
                pickStatus?.isUnder
                  ? [COLORS.secondary, '#a00a25']
                  : ['transparent', 'transparent']
              }
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons
                name='arrow-down'
                size={18}
                color={pickStatus?.isUnder ? COLORS.light : COLORS.secondary}
              />
              <Text
                style={[
                  styles.predictionText,
                  pickStatus?.isUnder && styles.activeText,
                ]}
              >
                UNDER
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size='large' color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading players...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[COLORS.primary, '#2A5298']}
        style={styles.header}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name='chevron-back' size={24} color={COLORS.light} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>SELECT PLAYERS</Text>
          <Text style={styles.headerSubtitle}>{contest.title}</Text>
        </View>
      </LinearGradient>

      {/* Selection Counter */}
      <View style={styles.counterCard}>
        <Text style={styles.counterTitle}>PICKS SELECTED</Text>
        <View style={styles.counterContainer}>
          <Text style={styles.counterNumber}>{picks.length}</Text>
          <Text style={styles.counterLabel}>/ 2</Text>
        </View>
        <Text style={styles.counterInstruction}>
          Tap OVER or UNDER for each player
        </Text>
      </View>

      {/* Players List */}
      <FlatList
        data={players}
        keyExtractor={(item) => item.playerId.toString()}
        renderItem={renderPlayerCard}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Continue Button */}
      {picks.length === 2 && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.continueButton}
            onPress={() =>
              navigation.navigate('ContestReviewScreen', { contest, picks })
            }
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[COLORS.primary, COLORS.secondary]}
              style={styles.continueGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.continueText}>REVIEW ENTRIES</Text>
              <Ionicons
                name='arrow-forward'
                size={18}
                color={COLORS.light}
                style={{ marginLeft: 8 }}
              />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
  },
  loadingText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.gray,
    marginTop: SPACING.md,
  },
  header: {
    paddingTop: 60,
    paddingBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  backButton: {
    marginRight: SPACING.sm,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.light,
  },
  headerSubtitle: {
    ...TYPOGRAPHY.caption,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: SPACING.xs,
  },
  counterCard: {
    backgroundColor: COLORS.cardBg,
    margin: SPACING.md,
    borderRadius: CARD_STYLES.borderRadius,
    padding: SPACING.lg,
    borderWidth: CARD_STYLES.borderWidth,
    borderColor: CARD_STYLES.borderColor,
    ...CARD_STYLES.shadow,
    alignItems: 'center',
  },
  counterTitle: {
    ...TYPOGRAPHY.small,
    color: COLORS.gray,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: SPACING.sm,
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: SPACING.sm,
  },
  counterNumber: {
    ...TYPOGRAPHY.h1,
    color: COLORS.primary,
  },
  counterLabel: {
    ...TYPOGRAPHY.h3,
    color: COLORS.gray,
    marginLeft: SPACING.xs,
  },
  counterInstruction: {
    ...TYPOGRAPHY.caption,
    color: COLORS.gray,
    textAlign: 'center',
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  playerCard: {
    backgroundColor: COLORS.cardBg,
    marginBottom: SPACING.md,
    borderRadius: CARD_STYLES.borderRadius,
    borderWidth: CARD_STYLES.borderWidth,
    borderColor: COLORS.cardBorder,
    padding: SPACING.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  playerImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.lightGray,
    marginRight: SPACING.md,
    resizeMode: 'cover',
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    ...TYPOGRAPHY.h3,
    color: COLORS.dark,
    marginBottom: SPACING.xs,
  },
  playerTeam: {
    ...TYPOGRAPHY.small,
    color: COLORS.gray,
  },
  lineContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(30, 63, 109, 0.1)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 6,
    minWidth: 70,
  },
  lineLabel: {
    ...TYPOGRAPHY.small,
    color: COLORS.primary,
    fontWeight: '600',
    fontSize: 10,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  lineValue: {
    ...TYPOGRAPHY.h3,
    color: COLORS.primary,
    fontWeight: '700',
  },
  selectionBadge: {
    backgroundColor: 'rgba(30, 63, 109, 0.1)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: SPACING.md,
  },
  selectionText: {
    ...TYPOGRAPHY.small,
    fontWeight: '600',
    fontSize: 10,
    letterSpacing: 0.5,
  },
  overText: {
    color: COLORS.success,
  },
  underText: {
    color: COLORS.secondary,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  predictionButton: {
    flex: 1,
    borderWidth: 2,
    borderRadius: 8,
    overflow: 'hidden',
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  overButton: {
    borderColor: COLORS.success,
  },
  underButton: {
    borderColor: COLORS.secondary,
  },
  overActive: {
    borderColor: COLORS.success,
  },
  underActive: {
    borderColor: COLORS.secondary,
  },
  predictionText: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
    marginLeft: SPACING.xs,
  },
  activeText: {
    color: COLORS.light,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.md,
    backgroundColor: COLORS.light,
    borderTopWidth: 1,
    borderTopColor: COLORS.cardBorder,
    ...CARD_STYLES.shadow,
  },
  continueButton: {
    width: '100%',
  },
  continueGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: 25,
  },
  continueText: {
    ...TYPOGRAPHY.body,
    color: COLORS.light,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});

export default PlayerSelectionScreen;
