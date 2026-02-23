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
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { verifyLocation } from '../util/geo';
import { useStripe } from '@stripe/stripe-react-native'; // Replacement

const LOCAL_IP = '10.0.0.253';
const PORT = '4000';
const API_URL = 'https://server-core-1.onrender.com/api';

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

const WalletScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processing, setProcessing] = useState(false);

  const { initPaymentSheet, presentPaymentSheet } = useStripe();

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
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleDeposit = async () => {
    if (processing) return;
    setProcessing(true);

    try {
      // 1. Geolocation Check
      const geo = await verifyLocation(user?.email);
      if (!geo.allowed) {
        Alert.alert('Restricted Area', geo.error || 'You must be in Georgia.');
        return;
      }

      // 2. Fetch Stripe Config from Server
      const response = await fetch(
        `${API_URL}/payments/create-payment-intent`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, amount: 500 }), // $5.00
        },
      );
      const { paymentIntent, ephemeralKey, customer } = await response.json();

      // 3. Init Stripe Sheet
      const { error: initError } = await initPaymentSheet({
        merchantDisplayName: 'ScoreKings',
        customerId: customer,
        customerEphemeralKeySecret: ephemeralKey,
        paymentIntentClientSecret: paymentIntent,
        defaultBillingDetails: { email: user.email },
      });

      if (initError) throw new Error(initError.message);

      // 4. Open Payment UI
      const { error: presentError } = await presentPaymentSheet();

      if (presentError) {
        if (presentError.code !== 'Canceled')
          Alert.alert('Error', presentError.message);
      } else {
        // 5. Tell server to update Prisma balance
        await fetch(`${API_URL}/payments/confirm-deposit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, amount: 500 }),
        });
        Alert.alert('Success', 'Deposit confirmed!');
        fetchUserData();
      }
    } catch (err) {
      Alert.alert('Payment Error', err.message);
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
    <View style={styles.container}>
      <StatusBar barStyle='light-content' />
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.header}
      >
        <SafeAreaView>
          <View style={styles.headerContent}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.headerSideItem}
            >
              <Ionicons name='arrow-back' size={24} color={COLORS.light} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>SECURE WALLET</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Profile')}
              style={styles.headerSideItem}
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
          <RefreshControl refreshing={refreshing} onRefresh={fetchUserData} />
        }
        ListHeaderComponent={
          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>AVAILABLE CREDITS</Text>
              <Text style={styles.statValue}>
                {formatCurrency(user?.balance)}
              </Text>
              <TouchableOpacity
                style={styles.depositButton}
                onPress={handleDeposit}
                disabled={processing}
              >
                {processing ? (
                  <ActivityIndicator color='#fff' />
                ) : (
                  <Text style={styles.depositButtonText}>
                    DEPOSIT $5.00 (STRIPE)
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.transactionCard}>
            <Text style={styles.transactionDescription}>
              {item.description}
            </Text>
            <Text style={styles.transactionAmount}>
              {formatCurrency(item.amount)}
            </Text>
          </View>
        )}
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
