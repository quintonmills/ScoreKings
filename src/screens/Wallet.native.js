import React, { useState, useEffect, useCallback } from 'react';
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
import * as IAP from 'react-native-iap'; // Import IAP

const API_URL = 'https://server-core-1.onrender.com/api';
const { width } = Dimensions.get('window');

// Define your IAP product ID (Must match App Store Connect later)
const itemSkus = Platform.select({
  ios: ['com.scorekings.deposit10'],
  android: ['com.scorekings.deposit10'],
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
  cardBg: '#ffffff',
  cardBorder: '#E5E5EA',
};

const TYPOGRAPHY = {
  h1: { fontSize: 28, fontWeight: '800' },
  h2: { fontSize: 20, fontWeight: '700' },
  h3: { fontSize: 16, fontWeight: '600' },
  body: { fontSize: 16, fontWeight: '400' },
  caption: { fontSize: 14, fontWeight: '400' },
  small: { fontSize: 12, fontWeight: '400' },
};

const SPACING = { md: 12, lg: 20 };

const WalletScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processing, setProcessing] = useState(false);

  // --- 1. MAGIC TRIGGER FOR SANDBOX ---
  useEffect(() => {
    const initStore = async () => {
      try {
        await IAP.initConnection();
        console.log(
          'StoreKit Initialized - Sandbox menu should appear in Settings now.'
        );
        // This call wakes up the sandbox environment
        await IAP.getProducts({ skus: itemSkus });
      } catch (err) {
        console.warn('IAP Initialization Error:', err);
      }
    };
    initStore();

    return () => {
      IAP.endConnection();
    };
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await fetch(`${API_URL}/me?userId=1`);
      const userData = await response.json();
      setUser(userData);

      const transRes = await fetch(`${API_URL}/users/1/transactions`);
      const transData = await transRes.json();
      setTransactions(transData);
    } catch (error) {
      setUser({ id: 1, name: 'Test User', balance: 0.0 });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  // --- 2. APPLE PAY / IAP DEPOSIT FLOW ---
  const handleDeposit = async () => {
    setProcessing(true);
    try {
      // For testing, we request a purchase
      // In a real build, 'com.scorekings.deposit10' must exist in App Store Connect
      const purchase = await IAP.requestPurchase({ sku: itemSkus[0] });

      if (purchase) {
        // Send receipt to your backend
        const response = await fetch(`${API_URL}/users/1/deposit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: 10.0,
            receipt: purchase.transactionReceipt,
            isTest: __DEV__,
          }),
        });

        if (response.ok) {
          Alert.alert('Success', 'Funds added to your wallet!');
          fetchUserData();
        }

        await IAP.finishTransaction({ purchase, isConsumable: true });
      }
    } catch (err) {
      if (err.code !== 'E_USER_CANCELLED') {
        Alert.alert('Payment Error', err.message);
      }
    } finally {
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
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle='light-content' />
      <LinearGradient
        colors={[COLORS.primary, '#2A5298']}
        style={styles.header}
      >
        <View style={styles.headerTopRow}>
          <View style={styles.headerSideItem} />
          <Text style={styles.headerTitle}>MY WALLET</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
            <Ionicons
              name='person-circle-outline'
              size={32}
              color={COLORS.light}
            />
          </TouchableOpacity>
        </View>
        <Text style={styles.headerSubtitle}>Manage your funds</Text>
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

        <View style={styles.actionButtons}>
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
                <>
                  <Ionicons
                    name='add-circle'
                    size={18}
                    color='#fff'
                    style={{ marginRight: 6 }}
                  />
                  <Text style={styles.actionButtonText}>ADD $10.00</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.transactionCard}>
            <Text style={styles.transactionDescription}>
              {item.description}
            </Text>
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
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchUserData} />
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.lightGray },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    padding: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: { ...TYPOGRAPHY.h2, color: '#fff' },
  headerSubtitle: {
    textAlign: 'center',
    color: 'rgba(255,255,255,0.7)',
    marginTop: 5,
  },
  balanceCard: {
    backgroundColor: '#fff',
    margin: 15,
    marginTop: -20,
    borderRadius: 15,
    padding: 20,
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
  balanceLabel: { fontSize: 10, color: COLORS.gray },
  balanceAmount: { fontSize: 26, fontWeight: '800', color: COLORS.primary },
  actionButtons: { flexDirection: 'row' },
  actionButton: { flex: 1 },
  actionButtonGradient: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonText: { color: '#fff', fontWeight: 'bold' },
  list: { paddingHorizontal: 15 },
  transactionCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  transactionDescription: { fontWeight: '600' },
  transactionAmount: { fontWeight: 'bold' },
});

export default WalletScreen;
