import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { API_URL } from '../config/api';

const PaymentScreen = ({ route, navigation }) => {
  const { contest, picks, potentialPayout } = route.params;
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async () => {
    setIsProcessing(true);

    try {
      const response = await fetch(`${API_URL}/api/contests/${contest.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 1, // TODO: Replace with actual auth user
          picks: picks,
          entryFee: contest.entryFee,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert('Error', data.error || 'Failed to submit entry');
        setIsProcessing(false);
        return;
      }

      // Success!
      Alert.alert(
        'Entry Submitted! 🎉',
        `Your picks are in! You'll win $${potentialPayout} if both hit.\n\nNew Balance: $${data.newBalance}`,
        [
          {
            text: 'View My Entries',
            onPress: () => navigation.navigate('MainTabs', { screen: 'MyContests' }),
          },
          {
            text: 'Browse Contests',
            onPress: () => navigation.navigate('MainTabs', { screen: 'Contests' }),
            style: 'cancel',
          },
        ]
      );
    } catch (err) {
      console.error('Payment error:', err);
      Alert.alert('Error', 'Unable to connect to server');
      setIsProcessing(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          disabled={isProcessing}
        >
          <Ionicons name='chevron-back' size={24} color='#fff' />
        </TouchableOpacity>
        <Text style={styles.headerText}>PAYMENT</Text>
      </View>

      <View style={styles.content}>
        {/* Entry Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Ionicons name='trophy-outline' size={28} color='#BA0C2F' />
            <Text style={styles.summaryTitle}>{contest.title}</Text>
          </View>

          <View style={styles.picksPreview}>
            <Text style={styles.picksLabel}>Your Picks:</Text>
            {picks.map((pick, index) => (
              <Text key={pick.playerId} style={styles.pickSummary}>
                {index + 1}. {pick.playerName} - {pick.prediction === 'over' ? 'OVER' : 'UNDER'} {pick.line} PTS
              </Text>
            ))}
          </View>

          <View style={styles.divider} />

          <View style={styles.amountRow}>
            <Text style={styles.amountLabel}>Entry Fee:</Text>
            <Text style={styles.amountValue}>${contest.entryFee}</Text>
          </View>

          <View style={styles.amountRow}>
            <Text style={styles.potentialLabel}>Potential Win:</Text>
            <Text style={styles.potentialValue}>${potentialPayout}</Text>
          </View>
        </View>

        {/* Payment Method - Virtual Coins */}
        <View style={styles.paymentSection}>
          <View style={styles.sectionHeader}>
            <Ionicons name='wallet-outline' size={20} color='#1e3f6d' />
            <Text style={styles.sectionTitle}>PAYMENT METHOD</Text>
          </View>

          <View style={styles.methodCard}>
            <View style={styles.methodInfo}>
              <Ionicons name='cash-outline' size={28} color='#28a745' />
              <View style={styles.methodDetails}>
                <Text style={styles.methodName}>Virtual Coins</Text>
                <Text style={styles.methodDescription}>Free-to-play balance</Text>
              </View>
            </View>
            <Ionicons name='checkmark-circle' size={24} color='#28a745' />
          </View>

          <View style={styles.balanceInfo}>
            <Ionicons name='information-circle-outline' size={18} color='#666' />
            <Text style={styles.balanceText}>
              This is a free-to-play contest using virtual currency
            </Text>
          </View>
        </View>

        {/* Important Info */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Important:</Text>
          <View style={styles.infoRow}>
            <Ionicons name='checkmark-circle-outline' size={16} color='#28a745' />
            <Text style={styles.infoText}>Both picks must win for payout</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name='time-outline' size={16} color='#666' />
            <Text style={styles.infoText}>Contest ends {contest.endTime}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name='close-circle-outline' size={16} color='#BA0C2F' />
            <Text style={styles.infoText}>No refunds after submission</Text>
          </View>
        </View>
      </View>

      {/* Submit Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.submitButton, isProcessing && styles.disabledButton]}
          onPress={handlePayment}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <>
              <ActivityIndicator color='#fff' size='small' />
              <Text style={styles.submitButtonText}>PROCESSING...</Text>
            </>
          ) : (
            <>
              <Ionicons name='lock-closed' size={20} color='#fff' />
              <Text style={styles.submitButtonText}>
                CONFIRM ENTRY - ${contest.entryFee}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#1e3f6d',
    paddingVertical: 16,
    borderBottomWidth: 3,
    borderBottomColor: '#BA0C2F',
    paddingTop: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  backButton: {
    position: 'absolute',
    left: 15,
    top: 50,
    zIndex: 1,
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  summaryCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryTitle: {
    color: '#1e3f6d',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  picksPreview: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 6,
    marginBottom: 12,
  },
  picksLabel: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  pickSummary: {
    color: '#1e3f6d',
    fontSize: 14,
    marginBottom: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#e1e5e9',
    marginVertical: 12,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  amountLabel: {
    color: '#666',
    fontSize: 16,
  },
  amountValue: {
    color: '#1e3f6d',
    fontSize: 16,
    fontWeight: '600',
  },
  potentialLabel: {
    color: '#1e3f6d',
    fontSize: 16,
    fontWeight: 'bold',
  },
  potentialValue: {
    color: '#BA0C2F',
    fontSize: 20,
    fontWeight: 'bold',
  },
  paymentSection: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#1e3f6d',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    borderWidth: 2,
    borderColor: '#28a745',
  },
  methodInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  methodDetails: {
    marginLeft: 12,
  },
  methodName: {
    color: '#1e3f6d',
    fontSize: 16,
    fontWeight: 'bold',
  },
  methodDescription: {
    color: '#666',
    fontSize: 14,
  },
  balanceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    padding: 8,
  },
  balanceText: {
    color: '#666',
    fontSize: 13,
    marginLeft: 6,
    flex: 1,
  },
  infoCard: {
    backgroundColor: 'rgba(30, 63, 109, 0.05)',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  infoTitle: {
    color: '#1e3f6d',
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    color: '#666',
    fontSize: 14,
    marginLeft: 8,
  },
  footer: {
    padding: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e1e5e9',
    backgroundColor: '#fff',
  },
  submitButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#BA0C2F',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#BA0C2F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  disabledButton: {
    backgroundColor: '#999',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default PaymentScreen;