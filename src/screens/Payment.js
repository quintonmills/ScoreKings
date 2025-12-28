import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { API_URL } from '../config/api';

const PaymentScreen = ({ route, navigation }) => {
  const { contest, picks, potentialPayout } = route.params;
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async () => {
    setIsProcessing(true);

    try {
      // Ensure URL matches the pattern /api/contests/[ID]/submit
      const response = await fetch(`${API_URL}/contests/${contest.id}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          userId: 1,
          entryFee: contest.entryFee,
          picks: picks.map((p) => ({
            playerId: p.playerId,
            playerName: p.playerName,
            team: p.team || 'OTE',
            line: p.line,
            prediction: p.prediction,
            stat: 'points',
          })),
        }),
      });
      const result = await response.json();

      if (response.ok) {
        navigation.replace('SuccessScreen', { payout: potentialPayout });
      } else {
        alert(result.error || 'Submission failed');
      }
    } catch (err) {
      alert('Connection error. Is your local server running?');
    } finally {
      setIsProcessing(false);
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          disabled={isProcessing}
        >
          <Ionicons name='chevron-back' size={24} color='#1e3f6d' />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>CONFIRM ENTRY</Text>
      </View>

      <View style={styles.content}>
        {/* Ticket Summary Card */}
        <View style={styles.ticketCard}>
          <Text style={styles.contestTitle}>{contest.title}</Text>

          <View style={styles.picksList}>
            {picks.map((pick) => (
              <View key={pick.playerId} style={styles.pickRow}>
                <Ionicons name='checkmark-circle' size={18} color='#28a745' />
                <Text style={styles.pickText}>
                  {pick.playerName}{' '}
                  <Text style={styles.boldText}>
                    {pick.prediction.toUpperCase()}
                  </Text>{' '}
                  {pick.line} PTS
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.divider} />

          <View style={styles.statsRow}>
            <View>
              <Text style={styles.statLabel}>ENTRY FEE</Text>
              <Text style={styles.statValue}>${contest.entryFee}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.statLabel}>EST. PAYOUT</Text>
              <Text style={[styles.statValue, { color: '#BA0C2F' }]}>
                ${potentialPayout}
              </Text>
            </View>
          </View>
        </View>

        {/* Payment Method View */}
        <View style={styles.paymentMethod}>
          <Text style={styles.sectionTitle}>PAYMENT METHOD</Text>
          <View style={styles.methodRow}>
            <Ionicons name='wallet' size={24} color='#1e3f6d' />
            <View style={{ marginLeft: 12 }}>
              <Text style={styles.methodName}>Virtual Wallet</Text>
              <Text style={styles.methodSub}>Available: $10,000.00</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Footer / Action Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.confirmButton, isProcessing && styles.disabledButton]}
          onPress={handlePayment}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator color='#fff' />
          ) : (
            <Text style={styles.confirmButtonText}>
              SUBMIT ENTRY - ${contest.entryFee}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F4F7' },
  header: {
    height: 60,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E1E5E9',
  },
  headerTitle: { color: '#1e3f6d', fontSize: 18, fontWeight: '800' },
  backButton: { position: 'absolute', left: 15 },
  content: { padding: 20 },
  ticketCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  contestTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1e3f6d',
    marginBottom: 15,
  },
  picksList: { marginBottom: 15 },
  pickRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  pickText: { fontSize: 15, color: '#444', marginLeft: 10 },
  boldText: { fontWeight: 'bold', color: '#1e3f6d' },
  divider: { height: 1, backgroundColor: '#EEE', marginVertical: 15 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  statLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#888',
    letterSpacing: 1,
  },
  statValue: { fontSize: 24, fontWeight: '900', color: '#1e3f6d' },
  paymentMethod: { marginTop: 30 },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#888',
    marginBottom: 15,
  },
  methodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E1E5E9',
  },
  methodName: { fontSize: 16, fontWeight: '700', color: '#1e3f6d' },
  methodSub: { fontSize: 13, color: '#28a745', fontWeight: '600' },
  footer: { position: 'absolute', bottom: 30, left: 20, right: 20 },
  confirmButton: {
    backgroundColor: '#BA0C2F',
    paddingVertical: 18,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: '#BA0C2F',
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1,
  },
  disabledButton: { backgroundColor: '#999' },
});

export default PaymentScreen;
