import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { API_URL } from '../config/api';

export default function MyContestsScreen({ navigation }) {
  const [entries, setEntries] = useState([]);
  const userId = 1; // mock user while auth isn't built

  useEffect(() => {
    fetch(`${API_URL}/api/users/1/entries`)
      .then((res) => res.json())
      .then((data) => setEntries(data))
      .catch((err) => console.log(err));
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>My Contests</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {entries.map((entry) => (
          <TouchableOpacity
            key={entry.id}
            style={styles.card}
            onPress={() =>
              navigation.navigate('ContestReviewScreen', {
                entryId: entry.id,
              })
            }
          >
            <Text style={styles.title}>{entry.contestTitle}</Text>
            <Text style={styles.sub}>Entry Fee: ${entry.entryFee}</Text>
            <Text style={styles.sub}>Stat: {entry.stat.toUpperCase()}</Text>
            <Text style={styles.sub}>
              Created: {new Date(entry.createdAt).toLocaleString()}
            </Text>
            <Ionicons
              name='chevron-forward'
              size={18}
              color='#1e3f6d'
              style={{ marginTop: 10 }}
            />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
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
  },
  card: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  title: { fontSize: 18, color: '#1e3f6d', fontWeight: 'bold' },
  sub: { color: '#666', marginTop: 4 },
});
