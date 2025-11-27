import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const MyContestsScreen = ({ navigation }) => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  const userId = 1; // TODO: replace with stored authenticated user

  useEffect(() => {
    fetch(`http://localhost:4000/api/users/${userId}/entries`)
      .then((res) => res.json())
      .then((data) => setEntries(data))
      .catch((err) => console.log('Error fetching entries:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name='chevron-back' size={24} color='#fff' />
        </TouchableOpacity>

        <Text style={styles.headerText}>My Contests</Text>
      </View>

      <ScrollView style={styles.content}>
        {loading ? (
          <Text style={{ textAlign: 'center', marginTop: 20 }}>Loading...</Text>
        ) : entries.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name='trophy-outline' size={40} color='#1e3f6d' />
            <Text style={styles.emptyText}>
              You haven't joined any contests
            </Text>
          </View>
        ) : (
          entries.map((entry) => (
            <View key={entry.id} style={styles.card}>
              <Text style={styles.title}>{entry.contestTitle}</Text>
              <Text style={styles.subText}>
                Stat: {entry.stat.toUpperCase()}
              </Text>
              <Text style={styles.subText}>Entry Fee: ${entry.entryFee}</Text>
              <Text style={styles.subText}>Prize: ${entry.contestPrize}</Text>
              <Text style={styles.subText}>Ends: {entry.endTime}</Text>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    backgroundColor: '#1e3f6d',
    paddingVertical: 16,
    paddingTop: 50,
    borderBottomWidth: 3,
    borderBottomColor: '#BA0C2F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    left: 15,
    top: 50,
    padding: 8,
  },
  headerText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: { padding: 20 },
  card: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  title: {
    color: '#1e3f6d',
    fontSize: 18,
    fontWeight: 'bold',
  },
  subText: {
    color: '#444',
    marginTop: 4,
  },
  emptyState: {
    marginTop: 40,
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 10,
    color: '#1e3f6d',
    fontSize: 16,
  },
});

export default MyContestsScreen;
