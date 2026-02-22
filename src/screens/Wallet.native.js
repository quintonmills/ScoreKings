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
  SafeAreaView,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { verifyLocation } from '../util/geo';
import {
  initConnection,
  endConnection,
  getProducts,
  requestPurchase,
  clearTransactionIOS,
  purchaseUpdatedListener,
  purchaseErrorListener,
  finishTransaction,
} from 'react-native-iap';

// FLEXIBLE API CONFIG
const LOCAL_IP = '10.0.0.253';
const PORT = '4000';
const API_URL = __DEV__
  ? `http://${LOCAL_IP}:${PORT}/api`
  : 'https://server-core-1.onrender.com/api';

const itemSkus = Platform.select({
  ios: ['com.scorekings.credits.500'],
  android: ['com.scorekings.credits.500'],
});

const COLORS = {
  primary: '#1e3f6d',
  secondary: '#2A5298',
  light: '#ffffff',
  dark: '#0A1428',
  gray: '#8E8E93',
  success: '#28A745',
  danger: '#FF3B30',
  lightGray: '#F5F5F7',
  cardBorder: '#E5E5EA',
};

const WalletScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processing, setProcessing] = useState(false);

  // ==================== IAP IMPLEMENTATION ====================
  useEffect(() => {
    let purchaseUpdateSubscription;
    let purchaseErrorSubscription;

    const initIAP = async () => {
      // SKIP IAP on local network/simulators to prevent E_IAP_NOT_AVAILABLE
      if (API_URL.includes(LOCAL_IP)) {
        console.log('Local Dev: Skipping IAP Initialization');
        return;
      }

      try {
        await initConnection();
        if (Platform.OS === 'ios') {
          await clearTransactionIOS();
        }

        purchaseUpdateSubscription = purchaseUpdatedListener(
          async (purchase) => {
            const receipt = purchase.transactionReceipt;
            if (receipt) {
              try {
                await validateWithBackend(receipt, purchase);
                await finishTransaction({ purchase, isConsumable: true });
              } catch (err) {
                console.error('Transaction Finish Error:', err);
              } finally {
                setProcessing(false);
              }
            }
          },
        );

        purchaseErrorSubscription = purchaseErrorListener((error) => {
          setProcessing(false);
          if (error.code !== 'E_USER_CANCELLED' && error.code !== 'unknown') {
            Alert.alert(
              'Payment Error',
              'The transaction could not be completed.',
            );
          }
        });
      } catch (err) {
        console.warn('IAP Connection Error:', err);
      }
    };

    initIAP();

    return () => {
      // SAFE CLEANUP: The fix for the logout crash
      try {
        if (purchaseUpdateSubscription) purchaseUpdateSubscription.remove();
        if (purchaseErrorSubscription) purchaseErrorSubscription.remove();

        // Wrap endConnection in a try/catch for environments where it was never started
        endConnection().catch((err) =>
          console.log('IAP EndConnection ignored'),
        );
      } catch (e) {
        console.log('Cleanup skipped: IAP not active.');
      }
    };
  }, []);

  const fetchUserData = async () => {
    try {
      const storedId = await AsyncStorage.getItem('userId');
      const idToFetch = storedId || '1';

      const response = await fetch(`${API_URL}/me?userId=${idToFetch}`);
      const userData = await response.json();
      setUser(userData);

      const transRes = await fetch(
        `${API_URL}/users/${idToFetch}/transactions`,
      );
      const transData = await transRes.json();
      setTransactions(Array.isArray(transData) ? transData : []);
    } catch (error) {
      console.error('Data Fetch Error:', error);
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
      const storedId = await AsyncStorage.getItem('userId');
      const idToUse = storedId || '1';

      const response = await fetch(`${API_URL}/payments/verify-apple`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: idToUse,
          receipt,
          productId: purchase.productId,
          transactionId: purchase.transactionId,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        Alert.alert('Success', 'Deposit confirmed! Your credits are ready.');
        if (result.balance !== undefined) {
          setUser((prev) => ({ ...prev, balance: result.balance }));
        }
        fetchUserData();
      } else {
        throw new Error(result.error || 'Validation failed');
      }
    } catch (err) {
      console.error('Backend Validation Error:', err);
      Alert.alert(
        'Sync Error',
        'Payment processed, but wallet update failed. Please pull to refresh.',
      );
      throw err;
    }
  };

  const handleDeposit = async () => {
    if (processing) return;
    setProcessing(true);

    // MOCK DEPOSIT FOR LOCAL TESTING
    if (API_URL.includes(LOCAL_IP)) {
      Alert.alert(
        'Local Test',
        "Simulating success since IAP isn't available locally.",
      );
      // You could add a fetch call here to your local /payments/mock-deposit route
      setProcessing(false);
      return;
    }

    try {
      const geo = await verifyLocation(user?.email);
      if (!geo.allowed) {
        Alert.alert(
          'Restricted Area',
          geo.error || 'You must be in an eligible area.',
          [{ text: 'OK', onPress: () => setProcessing(false) }],
        );
        return;
      }

      const products = await getProducts({ skus: itemSkus });
      if (!products || products.length === 0) {
        Alert.alert('Store Error', 'Product not found.');
        setProcessing(false);
        return;
      }

      await requestPurchase({
        sku: itemSkus[0],
        andFlush: Platform.OS === 'ios',
      });
    } catch (err) {
      console.error('Deposit flow error:', err);
      setProcessing(false);
    }
  };

  const formatCurrency = (val) =>
    `$${Math.abs(parseFloat(val || 0)).toFixed(2)}`;

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size='large' color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle='light-content' />
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.header}
      >
        <SafeAreaView>
          <View style={styles.headerContent}>
            <TouchableOpacity
              style={styles.headerSideItem}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name='arrow-back' size={24} color={COLORS.light} />
            </TouchableOpacity>
            <View style={styles.headerCenterItem}>
              <Text style={styles.headerTitle}>MY WALLET</Text>
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
      </LinearGradient>

      <FlatList
        data={transactions}
        keyExtractor={(item, index) => item.id?.toString() || index.toString()}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={fetchUserData}
            tintColor={COLORS.primary}
          />
        }
        ListHeaderComponent={
          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <View style={styles.walletLabelRow}>
                <Text style={styles.statLabel}>AVAILABLE BALANCE</Text>
                <Ionicons
                  name='shield-checkmark'
                  size={14}
                  color={COLORS.success}
                />
              </View>
              <Text style={styles.statValue}>
                {formatCurrency(user?.balance)}
              </Text>
              <View style={styles.buttonWrapper}>
                <TouchableOpacity
                  style={[styles.depositButton, processing && { opacity: 0.7 }]}
                  onPress={handleDeposit}
                  disabled={processing}
                >
                  {processing ? (
                    <ActivityIndicator color={COLORS.light} size='small' />
                  ) : (
                    <>
                      <Ionicons
                        name='add-circle'
                        size={18}
                        color={COLORS.light}
                        style={{ marginRight: 8 }}
                      />
                      <Text style={styles.depositButtonText}>
                        DEPOSIT $5.00 CREDITS
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
            <Text style={styles.sectionTitle}>TRANSACTION LOG</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.transactionCard}>
            <View style={styles.iconContainer}>
              <Ionicons
                name={item.amount > 0 ? 'arrow-down-circle' : 'arrow-up-circle'}
                size={24}
                color={item.amount > 0 ? COLORS.success : COLORS.gray}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.transactionDescription}>
                {item.description?.toUpperCase()}
              </Text>
              <Text style={styles.transactionDate}>
                {new Date(item.createdAt).toLocaleDateString()}
              </Text>
            </View>
            <Text
              style={[
                styles.transactionAmount,
                { color: item.amount > 0 ? COLORS.success : COLORS.dark },
              ]}
            >
              {item.amount > 0 ? '+' : '-'}
              {formatCurrency(item.amount)}
            </Text>
          </View>
        )}
        style={styles.list}
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </View>
  );
};

// ... Styles remain identical to your original code
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.lightGray },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { paddingBottom: 10 },
  headerContent: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
  },
  headerSideItem: { width: 40, alignItems: 'center' },
  headerCenterItem: { flex: 1, alignItems: 'center' },
  headerTitle: {
    color: COLORS.light,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1,
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  statsContainer: { padding: 16 },
  statBox: {
    backgroundColor: COLORS.light,
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    elevation: 3,
  },
  walletLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.gray,
    letterSpacing: 1,
    marginRight: 6,
  },
  statValue: {
    fontSize: 38,
    fontWeight: '900',
    color: COLORS.dark,
    marginBottom: 20,
  },
  buttonWrapper: {
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    paddingTop: 20,
  },
  depositButton: {
    backgroundColor: COLORS.primary,
    height: 54,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  depositButtonText: {
    color: COLORS.light,
    fontWeight: '800',
    fontSize: 14,
    letterSpacing: 1,
  },
  sectionTitle: {
    marginTop: 25,
    marginBottom: 12,
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.gray,
    letterSpacing: 1,
  },
  list: { flex: 1 },
  transactionCard: {
    backgroundColor: COLORS.light,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: { marginRight: 12 },
  transactionDescription: {
    fontWeight: '700',
    fontSize: 13,
    color: COLORS.dark,
  },
  transactionDate: { fontSize: 11, color: COLORS.gray, marginTop: 2 },
  transactionAmount: { fontWeight: '800', fontSize: 15 },
});

export default WalletScreen;
