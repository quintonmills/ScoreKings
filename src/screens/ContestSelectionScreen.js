import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
  Platform,
  StatusBar,
  ActivityIndicator,
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
  lightGray: '#F5F5F7',
  cardBorder: '#E5E5EA',
};

const ContestSelectionScreen = ({ navigation }) => {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchContests = async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); 

    console.log(`🏀 Fetching from: ${API_URL}/contests`);

    try {
      const response = await fetch(`${API_URL}/contests`, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      
      clearTimeout(timeoutId);
      const data = await response.json();
      
      // LOGIC FIX: Your server sends a raw array. 
      // This check ensures we handle both raw arrays and wrapped objects.
      const finalData = Array.isArray(data) ? data : (data.contests || []);
      
      console.log('✅ Contests loaded. Count:', finalData.length);
      setContests(finalData);
    } catch (error) {
      if (error.name === 'AbortError') {
        console.error('❌ Timeout: Check your MacBook Firewall or Port 4000');
      } else {
        console.error('❌ Fetch Error:', error.message);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchContests();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchContests();
  };

  const renderContestCard = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.8}
      onPress={() => navigation.navigate('PlayerSelection', { contest: item })}
    >
      <View style={styles.cardContent}>
        <View style={styles.cardInfo}>
          <Text style={styles.contestTitle}>{item.title || 'Daily Contest'}</Text>
          <View style={styles.feeContainer}>
            <Ionicons name='ticket-outline' size={14} color={COLORS.gray} />
            <Text style={styles.entryFeeText}>Entry: ${item.entryFee}</Text>
          </View>
        </View>
        <View style={styles.prizeContainer}>
          <Text style={styles.prizeLabel}>WIN</Text>
          <Text style={styles.prizeAmount}>${item.prize}</Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.statusBadge}>
          <View style={[styles.statusDot, { backgroundColor: item.status === 'LIVE' ? '#E74C3C' : COLORS.success }]} />
          <Text style={[styles.statusText, { color: item.status === 'LIVE' ? '#E74C3C' : COLORS.success }]}>
            {item.status || 'ACTIVE'}
          </Text>
        </View>
        <Ionicons name='chevron-forward' size={18} color={COLORS.gray} />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle='light-content' />

      <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.header}>
        <SafeAreaView>
          <View style={styles.headerContent}>
            <View style={{ width: 40 }} />
            <Text style={styles.headerTitle}>ScoreKings</Text>
            <TouchableOpacity
              style={styles.profileButton}
              onPress={() => navigation.navigate('Settings')}
            >
              <Ionicons name='person-circle-outline' size={28} color={COLORS.light} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {loading && !refreshing ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Connecting to Local Backend...</Text>
        </View>
      ) : (
        <FlatList
          data={contests}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderContestCard}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
          }
          ListEmptyComponent={() => (
            <View style={styles.center}>
              <Text style={styles.emptyText}>No active contests in your local DB.</Text>
              <TouchableOpacity onPress={fetchContests} style={styles.retryButton}>
                <Text style={styles.retryText}>Refresh Database</Text>
              </TouchableOpacity>
            </View>
          )}
          ListHeaderComponent={() => (
            <Text style={styles.sectionLabel}>TODAY'S FEATURED GAMES</Text>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.lightGray },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  header: { paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0, elevation: 4 },
  headerContent: { height: 64, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: COLORS.light, textTransform: 'uppercase', letterSpacing: 1 },
  profileButton: { width: 40, alignItems: 'flex-end' },
  listContent: { padding: 16 },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: COLORS.gray, marginBottom: 12, marginLeft: 4, letterSpacing: 1 },
  card: { backgroundColor: COLORS.light, borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: COLORS.cardBorder, overflow: 'hidden' },
  cardContent: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, alignItems: 'center' },
  cardInfo: { flex: 1 },
  contestTitle: { fontSize: 16, fontWeight: '700', color: COLORS.dark, marginBottom: 4 },
  feeContainer: { flexDirection: 'row', alignItems: 'center' },
  entryFeeText: { fontSize: 13, color: COLORS.gray, marginLeft: 4, fontWeight: '600' },
  prizeContainer: { alignItems: 'flex-end' },
  prizeLabel: { fontSize: 10, fontWeight: '800', color: COLORS.gray },
  prizeAmount: { fontSize: 22, fontWeight: '900', color: COLORS.primary },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#F9FAFB', borderTopWidth: 1, borderTopColor: COLORS.cardBorder },
  statusBadge: { flexDirection: 'row', alignItems: 'center' },
  statusDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  statusText: { fontSize: 11, fontWeight: '800' },
  loadingText: { marginTop: 10, color: COLORS.gray, fontWeight: '600' },
  emptyText: { color: COLORS.gray, textAlign: 'center', marginBottom: 10 },
  retryButton: { backgroundColor: COLORS.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  retryText: { color: COLORS.light, fontWeight: '700' },
});

export default ContestSelectionScreen;