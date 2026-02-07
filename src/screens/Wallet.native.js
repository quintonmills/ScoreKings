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
import * as IAP from 'react-native-iap';

const API_URL = 'https://server-core-1.onrender.com/api';

const itemSkus = Platform.select({
  ios: ['com.scorekings.credits.500'],
  android: ['com.scorekings.credits.500'],
});

// --- ADMIN THEME CONSTANTS ---
const COLORS = {
  primary: '#0A1F44', // Deep Navy
  accent: '#7D1324', // Maroon Stripe
  background: '#F0F2F5', // Light gray background
  cardBg: '#ffffff',
  textMain: '#1A1A1A',
  textMuted: '#65676B',
  success: '#28A745',
  danger: '#DC3545',
  border: '#E4E6EB',
  light: '#ffffff',
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
        if (Platform.OS === 'ios') await IAP.clearTransactionIOS();

        purchaseUpdateSubscription = IAP.purchaseUpdatedListener(
          async (purchase) => {
            const receipt = purchase.transactionReceipt;
            if (receipt) await validateWithBackend(receipt, purchase);
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

  const validateWithBackend = async (receipt, purchase) => {
    try {
      const response = await fetch(`${API_URL}/payments/verify-apple`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 1, receipt }),
      });
      if (response.ok) {
        Alert.alert('Success', 'Deposit confirmed!');
        fetchUserData();
      }
      await IAP.finishTransaction({ purchase, isConsumable: true });
    } catch (err) {
      Alert.alert('Error', 'Could not verify purchase.');
    } finally {
      setProcessing(false);
    }
  };

  const handleDeposit = async () => {
    setProcessing(true);
    try {
      const products = await IAP.getProducts({ skus: itemSkus });
      if (!products || products.length === 0) {
        Alert.alert('Error', 'Product not found in store.');
        setProcessing(false);
        return;
      }
      await IAP.requestPurchase({ sku: itemSkus[0] });
    } catch (err) {
      if (err.code !== 'E_USER_CANCELLED')
        Alert.alert('Payment Error', err.message);
      setProcessing(false);
    }
  };

  const formatCurrency = (val) =>
    `$${Math.abs(parseFloat(val || 0)).toFixed(2)}`;

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size='large' color={COLORS.primary} />
      </View>
    );

  return (
    <View style={styles.container}>
      <StatusBar barStyle='light-content' backgroundColor={COLORS.primary} />

      {/* --- BOXY CENTERED ADMIN HEADER --- */}
      <View style={styles.headerWrapper}>
        <SafeAreaView>
          <View style={styles.headerContent}>
            <TouchableOpacity
              style={styles.headerSideItem}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name='chevron-back' size={24} color={COLORS.light} />
            </TouchableOpacity>

            <View style={styles.headerCenterItem}>
              <View style={styles.titleRow}>
                <Ionicons
                  name='wallet-outline'
                  size={18}
                  color={COLORS.light}
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.headerTitle}>MY WALLET</Text>
              </View>
              <Text style={styles.headerSubtitle}>FINANCIAL OVERVIEW</Text>
            </View>

            <TouchableOpacity
              style={styles.headerSideItem}
              onPress={() => navigation.navigate('Profile')}
            >
              <Ionicons
                name='person-circle-outline'
                size={28}
                color={COLORS.light}
              />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
        <View style={styles.headerAccentLine} />
      </View>

      <FlatList
        data={transactions}
        keyExtractor={(item, index) => item.id?.toString() || index.toString()}
        ListHeaderComponent={
          <>
            {/* --- STATS SUMMARY BOX --- */}
            <View style={styles.statsContainer}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>AVAILABLE BALANCE</Text>
                <Text style={styles.statValue}>
                  {formatCurrency(user?.balance)}
                </Text>
                <View style={styles.statIndicator} />

                <TouchableOpacity
                  style={styles.depositButton}
                  onPress={handleDeposit}
                  disabled={processing}
                >
                  {processing ? (
                    <ActivityIndicator color={COLORS.light} size='small' />
                  ) : (
                    <Text style={styles.depositButtonText}>
                      DEPOSIT $5.00 CREDITS
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
            <Text style={styles.sectionTitle}>TRANSACTION LOG</Text>
          </>
        }
        renderItem={({ item }) => (
          <View style={styles.transactionCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.transactionDescription}>
                {item.description?.toUpperCase()}
              </Text>
              <Text style={styles.transactionDate}>
                {new Date(item.createdAt).toLocaleDateString()} •{' '}
                {new Date(item.createdAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>
            <Text
              style={[
                styles.transactionAmount,
                { color: item.amount > 0 ? COLORS.success : COLORS.danger },
              ]}
            >
              {item.amount > 0 ? '+' : '-'}
              {formatCurrency(item.amount)}
            </Text>
          </View>
        )}
        style={styles.list}
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={fetchUserData}
            tintColor={COLORS.primary}
          />
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>No transactions found in system.</Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // --- Header ---
  headerWrapper: { backgroundColor: COLORS.primary, zIndex: 100 },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    paddingTop: Platform.OS === 'android' ? 10 : 0,
  },
  headerSideItem: { width: 40, alignItems: 'center' },
  headerCenterItem: { flex: 1, alignItems: 'center' },
  titleRow: { flexDirection: 'row', alignItems: 'center' },
  headerTitle: {
    color: COLORS.light,
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 9,
    fontWeight: '600',
    marginTop: 2,
    letterSpacing: 0.5,
  },
  headerAccentLine: { height: 4, backgroundColor: COLORS.accent },

  // --- Stats & Deposit ---
  statsContainer: { padding: 16 },
  statBox: {
    backgroundColor: COLORS.cardBg,
    padding: 20,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 2,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 1,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.primary,
    marginTop: 4,
  },
  statIndicator: {
    height: 3,
    width: 40,
    backgroundColor: COLORS.accent,
    marginTop: 12,
    marginBottom: 20,
  },
  depositButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  depositButtonText: {
    color: COLORS.light,
    fontWeight: '800',
    fontSize: 13,
    letterSpacing: 1,
  },

  // --- List ---
  sectionTitle: {
    paddingHorizontal: 16,
    marginBottom: 10,
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 1,
  },
  list: { flex: 1 },
  transactionCard: {
    backgroundColor: COLORS.cardBg,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transactionDescription: {
    fontWeight: '700',
    fontSize: 13,
    color: COLORS.textMain,
  },
  transactionDate: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 4,
    fontWeight: '600',
  },
  transactionAmount: { fontWeight: '900', fontSize: 15 },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
});

export default WalletScreen;
