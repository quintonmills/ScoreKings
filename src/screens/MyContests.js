import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { API_URL } from '../config/api';

export default function MyContestsScreen({ navigation }) {
  const [entries, setEntries] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState(null);
  const userId = 1; // TODO: Replace with actual auth user

  const fetchEntries = async () => {
    try {
      const response = await fetch(`${API_URL}/users/${userId}/entries`);
      const data = await response.json();
      setEntries(data);
    } catch (err) {
      console.error('Error fetching entries:', err);
    }
  };

  const fetchUser = async () => {
    try {
      const response = await fetch(`${API_URL}/me`);
      const data = await response.json();
      setUser(data);
    } catch (err) {
      console.error('Error fetching user:', err);
    }
  };

  useEffect(() => {
    fetchEntries();
    fetchUser();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchEntries();
    await fetchUser();
    setRefreshing(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'won':
        return '#28a745';
      case 'lost':
        return '#BA0C2F';
      case 'active':
        return '#1e3f6d';
      default:
        return '#666';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'won':
        return 'trophy';
      case 'lost':
        return 'close-circle';
      case 'active':
        return 'time';
      default:
        return 'hourglass';
    }
  };

  const activeEntries = entries.filter(
    (e) => e.status === 'active' || e.status === 'pending'
  );
  const completedEntries = entries.filter(
    (e) => e.status === 'won' || e.status === 'lost'
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>MY ENTRIES</Text>
      </View>

      {/* Balance Card */}
      {user && (
        <View style={styles.balanceCard}>
          <View style={styles.balanceRow}>
            <Ionicons name='wallet-outline' size={24} color='#1e3f6d' />
            <View style={styles.balanceInfo}>
              <Text style={styles.balanceLabel}>Virtual Balance</Text>
              <Text style={styles.balanceAmount}>${user.balance}</Text>
            </View>
          </View>
        </View>
      )}

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Active Entries */}
        {activeEntries.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Ionicons name='basketball-outline' size={20} color='#1e3f6d' />
              <Text style={styles.sectionTitle}>ACTIVE ENTRIES</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{activeEntries.length}</Text>
              </View>
            </View>

            {activeEntries.map((entry) => (
              <TouchableOpacity
                key={entry.id}
                style={styles.entryCard}
                onPress={() =>
                  navigation.navigate('EntryDetail', { entryId: entry.id })
                }
              >
                <View style={styles.entryHeader}>
                  <View style={styles.entryTitleRow}>
                    <Text style={styles.contestName}>{entry.contestTitle}</Text>
                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor: getStatusColor(entry.status) + '20',
                        },
                      ]}
                    >
                      <Ionicons
                        name={getStatusIcon(entry.status)}
                        size={14}
                        color={getStatusColor(entry.status)}
                      />
                      <Text
                        style={[
                          styles.statusText,
                          { color: getStatusColor(entry.status) },
                        ]}
                      >
                        {entry.status.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.picksSection}>
                  <Text style={styles.picksLabel}>Your Picks:</Text>
                  {entry.picks.map((pick, index) => (
                    <View key={index} style={styles.pickRow}>
                      <Text style={styles.pickNumber}>{index + 1}.</Text>
                      <Text style={styles.pickText}>
                        {pick.playerName} -{' '}
                        {pick.prediction === 'over' ? '↑ OVER' : '↓ UNDER'}{' '}
                        {pick.line} PTS
                      </Text>
                    </View>
                  ))}
                </View>

                <View style={styles.entryFooter}>
                  <View style={styles.footerItem}>
                    <Text style={styles.footerLabel}>Entry Fee</Text>
                    <Text style={styles.footerValue}>${entry.entryFee}</Text>
                  </View>
                  <View style={styles.footerItem}>
                    <Text style={styles.footerLabel}>Potential Win</Text>
                    <Text style={styles.potentialWin}>
                      ${entry.potentialPayout}
                    </Text>
                  </View>
                  <View style={styles.footerItem}>
                    <Text style={styles.footerLabel}>Ends</Text>
                    <Text style={styles.footerValue}>{entry.endTime}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </>
        )}

        {/* Completed Entries */}
        {completedEntries.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Ionicons
                name='checkmark-done-outline'
                size={20}
                color='#1e3f6d'
              />
              <Text style={styles.sectionTitle}>COMPLETED</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{completedEntries.length}</Text>
              </View>
            </View>

            {completedEntries.map((entry) => (
              <TouchableOpacity
                key={entry.id}
                style={[
                  styles.entryCard,
                  entry.status === 'won' && styles.wonCard,
                  entry.status === 'lost' && styles.lostCard,
                ]}
                onPress={() =>
                  navigation.navigate('EntryDetail', { entryId: entry.id })
                }
              >
                <View style={styles.entryHeader}>
                  <View style={styles.entryTitleRow}>
                    <Text style={styles.contestName}>{entry.contestTitle}</Text>
                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor: getStatusColor(entry.status) + '20',
                        },
                      ]}
                    >
                      <Ionicons
                        name={getStatusIcon(entry.status)}
                        size={14}
                        color={getStatusColor(entry.status)}
                      />
                      <Text
                        style={[
                          styles.statusText,
                          { color: getStatusColor(entry.status) },
                        ]}
                      >
                        {entry.status === 'won' ? 'WON' : 'LOST'}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.picksSection}>
                  {entry.picks.map((pick, index) => (
                    <View key={index} style={styles.pickRow}>
                      <Ionicons
                        name={
                          pick.result === 'won'
                            ? 'checkmark-circle'
                            : 'close-circle'
                        }
                        size={16}
                        color={pick.result === 'won' ? '#28a745' : '#BA0C2F'}
                      />
                      <Text style={styles.pickText}>
                        {pick.playerName} -{' '}
                        {pick.prediction === 'over' ? 'OVER' : 'UNDER'}{' '}
                        {pick.line}
                        {pick.actualValue && ` (${pick.actualValue})`}
                      </Text>
                    </View>
                  ))}
                </View>

                {entry.status === 'won' && (
                  <View style={styles.winBanner}>
                    <Ionicons name='trophy' size={20} color='#FFD700' />
                    <Text style={styles.winText}>
                      Won ${entry.potentialPayout}!
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </>
        )}

        {/* Empty State */}
        {entries.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name='basketball-outline' size={60} color='#ccc' />
            <Text style={styles.emptyStateTitle}>No Entries Yet</Text>
            <Text style={styles.emptyStateText}>
              Make your first picks to get started!
            </Text>
            <TouchableOpacity
              style={styles.browseButton}
              onPress={() => navigation.navigate('Contests')}
            >
              <Text style={styles.browseButtonText}>BROWSE CONTESTS</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#1e3f6d',
    paddingTop: 50,
    paddingBottom: 16,
    borderBottomWidth: 3,
    borderBottomColor: '#BA0C2F',
  },
  headerText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 1,
  },
  balanceCard: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  balanceInfo: {
    marginLeft: 12,
  },
  balanceLabel: {
    color: '#666',
    fontSize: 14,
  },
  balanceAmount: {
    color: '#1e3f6d',
    fontSize: 24,
    fontWeight: 'bold',
  },
  scrollContent: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 8,
  },
  sectionTitle: {
    color: '#1e3f6d',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  badge: {
    backgroundColor: '#BA0C2F',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  entryCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  wonCard: {
    borderColor: '#28a745',
    borderWidth: 2,
  },
  lostCard: {
    opacity: 0.7,
  },
  entryHeader: {
    marginBottom: 12,
  },
  entryTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  contestName: {
    color: '#1e3f6d',
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  picksSection: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 6,
    marginBottom: 12,
  },
  picksLabel: {
    color: '#666',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  pickRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  pickNumber: {
    color: '#1e3f6d',
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 6,
  },
  pickText: {
    color: '#333',
    fontSize: 14,
    flex: 1,
  },
  entryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerItem: {
    flex: 1,
  },
  footerLabel: {
    color: '#666',
    fontSize: 12,
  },
  footerValue: {
    color: '#1e3f6d',
    fontSize: 14,
    fontWeight: '600',
  },
  potentialWin: {
    color: '#BA0C2F',
    fontSize: 14,
    fontWeight: 'bold',
  },
  winBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(40, 167, 69, 0.1)',
    padding: 8,
    borderRadius: 6,
    marginTop: 8,
  },
  winText: {
    color: '#28a745',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    color: '#1e3f6d',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
  },
  emptyStateText: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  browseButton: {
    backgroundColor: '#BA0C2F',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  browseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
