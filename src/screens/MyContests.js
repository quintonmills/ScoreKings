import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Ionicons,
} from 'react-native';

export default function MyContestsScreen({ navigation }) {
  // 1. HARDCODED USER DATA
  const [user] = useState({
    id: 4,
    name: 'Test User',
    balance: 10000,
    email: 'test@test.com',
  });

  // 2. HARDCODED ENTRIES DATA
  const [entries] = useState([
    {
      id: 101,
      contestTitle: 'NBA Sunday Night Mega',
      entryFee: 20,
      potentialPayout: 100,
      status: 'ACTIVE',
      picks: [
        { playerName: 'LeBron James', prediction: 'OVER', line: 25.5 },
        { playerName: 'Kevin Durant', prediction: 'UNDER', line: 28.5 },
      ],
    },
    {
      id: 102,
      contestTitle: 'Lakers vs Warriors Prop',
      entryFee: 10,
      potentialPayout: 30,
      status: 'PENDING',
      picks: [{ playerName: 'Stephen Curry', prediction: 'OVER', line: 4.5 }],
    },
  ]);

  // We set loading to false immediately because data is local
  const [loading] = useState(false);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>MY ENTRIES</Text>
      </View>

      {/* Balance Card */}
      <View style={styles.balanceCard}>
        <View style={styles.balanceRow}>
          <Text style={styles.balanceLabel}>Virtual Balance</Text>
          <Text style={styles.balanceAmount}>
            ${user.balance.toLocaleString()}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>
          ACTIVE ENTRIES ({entries.length})
        </Text>

        {entries.map((entry) => (
          <TouchableOpacity key={entry.id} style={styles.entryCard}>
            <View style={styles.entryHeader}>
              <Text style={styles.contestName}>{entry.contestTitle}</Text>
              <Text style={styles.statusText}>{entry.status}</Text>
            </View>

            <View style={styles.picksSection}>
              {entry.picks.map((pick, index) => (
                <Text key={index} style={styles.pickText}>
                  • {pick.playerName}: {pick.prediction} {pick.line}
                </Text>
              ))}
            </View>

            <View style={styles.entryFooter}>
              <Text style={styles.footerLabel}>Entry: ${entry.entryFee}</Text>
              <Text style={styles.payoutText}>
                Win: ${entry.potentialPayout}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f4f4' },
  header: { backgroundColor: '#1e3f6d', paddingTop: 60, paddingBottom: 20 },
  headerText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  balanceCard: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  balanceRow: { alignItems: 'center' },
  balanceLabel: { fontSize: 14, color: '#666' },
  balanceAmount: { fontSize: 32, fontWeight: 'bold', color: '#1e3f6d' },
  scrollContent: { padding: 15 },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 10,
  },
  entryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  contestName: { fontSize: 16, fontWeight: 'bold' },
  statusText: { color: '#BA0C2F', fontWeight: 'bold' },
  picksSection: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
    marginBottom: 10,
  },
  pickText: { fontSize: 14, marginVertical: 2 },
  entryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
  },
  footerLabel: { color: '#666' },
  payoutText: { fontWeight: 'bold', color: '#28a745' },
});
