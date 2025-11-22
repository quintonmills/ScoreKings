import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const PaymentScreen = ({ route, navigation }) => {
  const { player1, player2, stat, entryFee } = route.params;
  const [selectedMethod, setSelectedMethod] = useState(null);

  const paymentMethods = [
    {
      id: 'card',
      name: 'Credit/Debit Card',
      icon: 'card-outline',
      iconSelected: 'card',
    },
    {
      id: 'paypal',
      name: 'PayPal',
      icon: 'logo-paypal',
      iconSelected: 'ios-wallet',
    },
    {
      id: 'crypto',
      name: 'Crypto',
      icon: 'logo-bitcoin',
      iconSelected: 'logo-bitcoin',
    },
    {
      id: 'bank',
      name: 'Bank Transfer',
      icon: 'bank-outline',
      iconSelected: 'bank',
    },
  ];

  const handlePayment = () => {
    if (!selectedMethod) {
      Alert.alert('Error', 'Please select a payment method');
      return;
    }
    Alert.alert('Success', `Payment processed for $${entryFee}`);
    navigation.navigate('Comparison', { player1, player2, stat });
  };

  return (
    <View style={styles.container}>
      {/* Blue header bar */}
      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name='chevron-back' size={24} color='#fff' />
        </TouchableOpacity>

        <Text style={styles.headerText}>PAYMENT</Text>
      </View>

      <View style={styles.content}>
        {/* Matchup card */}
        <View style={styles.matchupCard}>
          <View style={styles.matchupHeader}>
            <Ionicons name='trophy-outline' size={24} color='#BA0C2F' />
            <Text style={styles.matchupText}>
              {player1.name} vs {player2.name}
            </Text>
          </View>
          <Text style={styles.statText}>Comparing: {stat.toUpperCase()}</Text>
          <View style={styles.feeContainer}>
            <Ionicons name='pricetag-outline' size={20} color='#1e3f6d' />
            <Text style={styles.feeText}>Entry Fee:</Text>
            <Text style={styles.amountText}>${entryFee}</Text>
          </View>
        </View>

        {/* Payment methods */}
        <View style={styles.sectionHeader}>
          <Ionicons name='wallet-outline' size={20} color='#1e3f6d' />
          <Text style={styles.sectionTitle}>SELECT PAYMENT METHOD</Text>
        </View>

        <View style={styles.paymentMethods}>
          {paymentMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.methodButton,
                selectedMethod === method.id && styles.selectedMethod,
              ]}
              onPress={() => setSelectedMethod(method.id)}
            >
              <Ionicons
                name={
                  selectedMethod === method.id
                    ? method.iconSelected
                    : method.icon
                }
                size={24}
                color={selectedMethod === method.id ? '#BA0C2F' : '#1e3f6d'}
              />
              <Text style={styles.methodText}>{method.name}</Text>
              {selectedMethod === method.id && (
                <Ionicons
                  name='checkmark-circle'
                  size={20}
                  color='#BA0C2F'
                  style={styles.checkIcon}
                />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Pay button */}
        <TouchableOpacity style={styles.payButton} onPress={handlePayment}>
          <Ionicons name='lock-closed-outline' size={20} color='#fff' />
          <Text style={styles.payButtonText}>PAY SECURELY - ${entryFee}</Text>
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
  },
  headerText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  matchupCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e1e5e9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  matchupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  matchupText: {
    color: '#1e3f6d',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  statText: {
    color: '#666',
    textAlign: 'center',
    marginBottom: 12,
    fontSize: 14,
  },
  feeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  feeText: {
    color: '#333',
    marginHorizontal: 8,
    fontSize: 16,
  },
  amountText: {
    color: '#BA0C2F',
    fontSize: 24,
    fontWeight: 'bold',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingLeft: 8,
  },
  sectionTitle: {
    color: '#1e3f6d',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  paymentMethods: {
    marginBottom: 24,
  },
  methodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedMethod: {
    backgroundColor: 'rgba(186, 12, 47, 0.05)',
    borderColor: '#BA0C2F',
  },
  methodText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 16,
    flex: 1,
  },
  checkIcon: {
    marginLeft: 'auto',
  },
  payButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#BA0C2F',
    borderRadius: 8,
    padding: 16,
    marginTop: 'auto',
    shadowColor: '#BA0C2F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  payButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    marginLeft: 8,
  },
});

export default PaymentScreen;
