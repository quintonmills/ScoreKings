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
  Modal,
  TextInput,
  SafeAreaView,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// Assuming API_URL is imported or defined here
const API_URL = 'https://server-core-1.onrender.com/api';
const { width } = Dimensions.get('window');

// Theme Constants
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
  h1: { fontSize: 28, fontWeight: '800', lineHeight: 34 },
  h2: { fontSize: 22, fontWeight: '700', lineHeight: 28 },
  h3: { fontSize: 18, fontWeight: '600', lineHeight: 24 },
  body: { fontSize: 16, fontWeight: '400', lineHeight: 22 },
  caption: { fontSize: 14, fontWeight: '400', lineHeight: 18 },
  small: { fontSize: 12, fontWeight: '400', lineHeight: 16 },
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 20,
  xl: 28,
};

const CARD_STYLES = {
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  borderRadius: 12,
  borderWidth: 1,
  borderColor: '#E5E5EA',
};

const WalletScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [depositModalVisible, setDepositModalVisible] = useState(false);
  const [withdrawModalVisible, setWithdrawModalVisible] = useState(false);
  const [amount, setAmount] = useState('');
  const [processing, setProcessing] = useState(false);

  // Mock Data for initial render
  const mockTransactions = [
    {
      id: 1,
      type: 'CONTEST_WIN',
      amount: 150.0,
      description: 'NBA Sunday Night Mega Win',
      status: 'COMPLETED',
      createdAt: new Date().toISOString(),
    },
    {
      id: 2,
      type: 'CONTEST_ENTRY',
      amount: -20.0,
      description: 'Contest Entry Fee',
      status: 'COMPLETED',
      createdAt: new Date().toISOString(),
    },
    {
      id: 3,
      type: 'DEPOSIT',
      amount: 100.0,
      description: 'Initial Deposit',
      status: 'COMPLETED',
      createdAt: new Date().toISOString(),
    },
  ];

  const fetchUserData = async () => {
    try {
      const response = await fetch(`${API_URL}/me?userId=1`);
      if (!response.ok) throw new Error('Failed to fetch user');
      const userData = await response.json();
      setUser(userData);
    } catch (error) {
      setUser({ id: 1, name: 'Test User', balance: 10000.0 });
    }
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    await fetchUserData();
    setTransactions(mockTransactions);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const formatCurrency = (val) =>
    `$${Math.abs(parseFloat(val || 0)).toFixed(2)}`;

  const renderTransactionItem = ({ item }) => {
    const isPositive = item.amount > 0;
    return (
      <View style={styles.transactionCard}>
        <View style={styles.transactionHeader}>
          <View style={styles.transactionIconContainer}>
            <View
              style={[
                styles.transactionIcon,
                { backgroundColor: isPositive ? '#E8F5E9' : '#FFEBEE' },
              ]}
            >
              <Ionicons
                name={isPositive ? 'add-circle' : 'remove-circle'}
                size={20}
                color={isPositive ? COLORS.success : COLORS.danger}
              />
            </View>
            <View>
              <Text style={styles.transactionDescription}>
                {item.description}
              </Text>
              <Text style={styles.transactionDate}>
                {new Date(item.createdAt).toLocaleDateString()}
              </Text>
            </View>
          </View>
          <Text
            style={[
              styles.transactionAmount,
              { color: isPositive ? COLORS.success : COLORS.secondary },
            ]}
          >
            {isPositive ? '+' : '-'}
            {formatCurrency(item.amount)}
          </Text>
        </View>
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size='large' color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle='light-content' />

      {/* --- RE-USABLE HEADER STRUCTURE --- */}
      <LinearGradient
        colors={[COLORS.primary, '#2A5298']}
        style={styles.header}
      >
        <View style={styles.headerTopRow}>
          {/* Left Slot: Spacer or Back Button */}
          <View style={styles.headerSideItem}>
            {/* If this wasn't a main tab, you'd put a back button here */}
          </View>

          {/* Center Slot: Title */}
          <View style={styles.headerCenterItem}>
            <Text style={styles.headerTitle}>MY WALLET</Text>
          </View>

          {/* Right Slot: Profile Icon */}
          <TouchableOpacity
            style={styles.headerSideItem}
            onPress={() => navigation.navigate('Profile')}
          >
            <Ionicons
              name='person-circle-outline'
              size={32}
              color={COLORS.light}
            />
          </TouchableOpacity>
        </View>
        <Text style={styles.headerSubtitle}>Manage your funds</Text>
      </LinearGradient>

      {/* Balance Card */}
      <View style={[styles.balanceCard, CARD_STYLES.shadow]}>
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
            onPress={() => setDepositModalVisible(true)}
          >
            <LinearGradient
              colors={[COLORS.success, '#28a745']}
              style={styles.actionButtonGradient}
            >
              <Ionicons
                name='add-circle'
                size={18}
                color={COLORS.light}
                style={{ marginRight: 6 }}
              />
              <Text style={styles.actionButtonText}>ADD FUNDS</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setWithdrawModalVisible(true)}
          >
            <LinearGradient
              colors={[COLORS.warning, '#e68900']}
              style={styles.actionButtonGradient}
            >
              <Ionicons
                name='arrow-up-circle'
                size={18}
                color={COLORS.light}
                style={{ marginRight: 6 }}
              />
              <Text style={styles.actionButtonText}>WITHDRAW</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.transactionsSection}>
        <Text style={styles.sectionTitle}>RECENT TRANSACTIONS</Text>
        <FlatList
          data={transactions}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderTransactionItem}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.primary}
            />
          }
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.lightGray },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // Header Styles
  header: {
    paddingTop: Platform.OS === 'android' ? 40 : 10,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerCenterItem: {
    flex: 3,
    alignItems: 'center',
  },
  headerSideItem: {
    flex: 1,
    alignItems: 'flex-end',
    minWidth: 40,
  },
  headerTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.light,
    fontSize: 20,
  },
  headerSubtitle: {
    ...TYPOGRAPHY.caption,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginTop: 4,
  },

  // Balance Card Styles
  balanceCard: {
    backgroundColor: COLORS.cardBg,
    marginHorizontal: SPACING.md,
    marginTop: -20,
    borderRadius: 15,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  balanceIconContainer: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#F0F4F8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  balanceLabel: { ...TYPOGRAPHY.small, color: COLORS.gray },
  balanceAmount: { ...TYPOGRAPHY.h1, color: COLORS.primary, fontSize: 26 },

  actionButtons: { flexDirection: 'row', gap: 10 },
  actionButton: { flex: 1 },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 25,
  },
  actionButtonText: { color: COLORS.light, fontWeight: '700', fontSize: 13 },

  // Transaction Styles
  transactionsSection: { flex: 1, paddingHorizontal: SPACING.md },
  sectionTitle: { ...TYPOGRAPHY.h3, fontSize: 16, marginBottom: 15 },
  transactionCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transactionIconContainer: { flexDirection: 'row', alignItems: 'center' },
  transactionIcon: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionDescription: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.dark,
  },
  transactionDate: { fontSize: 11, color: COLORS.gray, marginTop: 2 },
  transactionAmount: { fontWeight: '700', fontSize: 15 },
});

export default WalletScreen;
