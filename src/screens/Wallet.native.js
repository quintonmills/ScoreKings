import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Dimensions,
  SafeAreaView,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as IAP from 'react-native-iap';

const API_URL = 'https://server-core-1.onrender.com/api';

// Product ID must match exactly what you created in App Store Connect
const itemSkus = Platform.select({
  ios: ['com.scorekings.credits.500'], // Updated to match backend SKU mapping
  android: ['com.scorekings.credits.500'],
});

const COLORS = {
  primary: '#1e3f6d',
  secondary: '#BA0C2F',
  success: '#34C759',
  warning: '#FF9500',
  danger: '#FF3B30',
  light: '#ffffff',
  dark: '#0A1428',
  gray: '#8E8E93',
  lightGray: '#F5F5F7',
};

const WalletScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processing, setProcessing] = useState(false);

  // ==================== IAP SETUP ====================

  useEffect(() => {
    let purchaseUpdateSubscription;
    let purchaseErrorSubscription;

    const initIAP = async () => {
      try {
        await IAP.initConnection();
        if (Platform.OS === 'ios') {
          await IAP.clearTransactionIOS();
        }

        // Listen for successful purchases
        purchaseUpdateSubscription = IAP.purchaseUpdatedListener(
          async (purchase) => {
            const receipt = purchase.transactionReceipt;
            if (receipt) {
              await validateWithBackend(receipt, purchase);
            }
          },
        );

        purchaseErrorSubscription = IAP.purchaseErrorListener((error) => {
          console.warn('IAP Error', error);
          setProcessing(false);
        });
      } catch (err) {
        console.warn('IAP Init Error', err);
      }
    };

    initIAP();

    return () => {
      if (purchaseUpdateSubscription) purchaseUpdateSubscription.remove();
      if (purchaseErrorSubscription) purchaseErrorSubscription.remove();
      IAP.endConnection();
    };
  }, []);

  // ==================== DATA FETCHING ====================

  const fetchUserData = async () => {
    try {
      const response = await fetch(`${API_URL}/me?userId=1`);
      const userData = await response.json();
      setUser(userData);

      const transRes = await fetch(`${API_URL}/users/1/transactions`);
      const transData = await transRes.json();
      setTransactions(transData);
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  // ==================== TRANSACTION VALIDATION ====================

  const validateWithBackend = async (receipt, purchase) => {
    try {
      // THIS CALLS YOUR NEW SECURE BACKEND ROUTE
      const response = await fetch(`${API_URL}/payments/verify-apple`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 1, // Change to actual logged in user ID
          receipt: receipt,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        Alert.alert('Success', 'Deposit confirmed!');
        fetchUserData();
      } else {
        Alert.alert(
          'Verification Failed',
          result.error || 'Server rejected receipt',
        );
      }

      // Tell Apple the transaction is finished
      await IAP.finishTransaction({ purchase, isConsumable: true });
    } catch (err) {
      Alert.alert('Error', 'Could not reach server to verify purchase.');
    } finally {
      setProcessing(false);
    }
  };

  const handleDeposit = async () => {
    setProcessing(true);
    try {
      await IAP.requestPurchase({ sku: itemSkus[0] });
    } catch (err) {
      console.warn(err);
      setProcessing(false);
    }
  };

  // ==================== RENDER ====================

  const formatCurrency = (val) =>
    `$${Math.abs(parseFloat(val || 0)).toFixed(2)}`;

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size='large' color={COLORS.primary} />
      </View>
    );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle='light-content' />
      <LinearGradient
        colors={[COLORS.primary, '#2A5298']}
        style={styles.header}
      >
        <View style={styles.headerTopRow}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name='chevron-back' size={28} color='#fff' />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>MY WALLET</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
            <Ionicons
              name='person-circle-outline'
              size={32}
              color={COLORS.light}
            />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={styles.balanceCard}>
        <View style={styles.balanceHeader}>
          <View style={styles.balanceIconContainer}>
            <Ionicons name='wallet' size={24} color={COLORS.primary} />
          </View>
          <View>
            <Text style={styles.balanceLabel}>AVAILABLE BALANCE</Text>
            <Text style={styles.balanceAmount}>
              {formatCurrency(user?.balance)}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleDeposit}
          disabled={processing}
        >
          <LinearGradient
            colors={[COLORS.success, '#28a745']}
            style={styles.actionButtonGradient}
          >
            {processing ? (
              <ActivityIndicator color='#fff' />
            ) : (
              <Text style={styles.actionButtonText}>ADD $500.00 CREDITS</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Transaction History</Text>

      <FlatList
        data={transactions}
        keyExtractor={(item, index) => item.id?.toString() || index.toString()}
        renderItem={({ item }) => (
          <View style={styles.transactionCard}>
            <View>
              <Text style={styles.transactionDescription}>
                {item.description}
              </Text>
              <Text style={styles.transactionDate}>
                {new Date(item.createdAt).toLocaleDateString()}
              </Text>
            </View>
            <Text
              style={[
                styles.transactionAmount,
                { color: item.amount > 0 ? COLORS.success : COLORS.danger },
              ]}
            >
              {item.amount > 0 ? '+' : ''}
              {formatCurrency(item.amount)}
            </Text>
          </View>
        )}
        style={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchUserData} />
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>No transactions yet.</Text>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.lightGray },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: 20, paddingBottom: 40 },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#fff' },
  balanceCard: {
    backgroundColor: '#fff',
    margin: 15,
    marginTop: -25,
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  balanceIconContainer: {
    width: 45,
    height: 45,
    backgroundColor: '#f0f4f8',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  balanceLabel: { fontSize: 10, color: COLORS.gray, letterSpacing: 1 },
  balanceAmount: { fontSize: 28, fontWeight: '800', color: COLORS.primary },
  actionButtonGradient: { padding: 15, borderRadius: 12, alignItems: 'center' },
  actionButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  sectionTitle: {
    marginHorizontal: 20,
    marginVertical: 10,
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.gray,
  },
  list: { paddingHorizontal: 15 },
  transactionCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transactionDescription: { fontWeight: '600', fontSize: 14 },
  transactionDate: { fontSize: 12, color: COLORS.gray, marginTop: 2 },
  transactionAmount: { fontWeight: 'bold', fontSize: 16 },
  emptyText: { textAlign: 'center', marginTop: 20, color: COLORS.gray },
});

export default WalletScreen;
