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
import { API_URL } from '../config/api';

const { width, height } = Dimensions.get('window');

// Theme Constants with adjusted spacing
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
  borderColor: COLORS.cardBorder,
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

  // Mock transaction types
  const mockTransactions = [
    {
      id: 1,
      type: 'CONTEST_WIN',
      amount: 150.0,
      description: 'NBA Sunday Night Mega Win',
      status: 'COMPLETED',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 2,
      type: 'CONTEST_ENTRY',
      amount: -20.0,
      description: 'Contest Entry Fee',
      status: 'COMPLETED',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 3,
      type: 'DEPOSIT',
      amount: 100.0,
      description: 'Initial Deposit',
      status: 'COMPLETED',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 4,
      type: 'CONTEST_WIN',
      amount: 60.0,
      description: 'Daily Pick Contest',
      status: 'COMPLETED',
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 5,
      type: 'CONTEST_ENTRY',
      amount: -10.0,
      description: 'Quick Pick Entry',
      status: 'COMPLETED',
      createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  // Fetch user data
  const fetchUserData = async () => {
    try {
      const response = await fetch(`${API_URL}/me?userId=1`);
      if (!response.ok) throw new Error('Failed to fetch user');
      const userData = await response.json();
      setUser(userData);
      return userData;
    } catch (error) {
      console.error('Error fetching user:', error);
      const mockUser = {
        id: 1,
        name: 'Test User',
        email: 'test@test.com',
        balance: 10000.0,
      };
      setUser(mockUser);
      return mockUser;
    }
  };

  // Fetch transactions
  const fetchTransactions = async () => {
    try {
      setTransactions(mockTransactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setTransactions(mockTransactions);
    }
  };

  // Load all data
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      await fetchUserData();
      await fetchTransactions();
    } catch (error) {
      console.error('Error loading wallet data:', error);
      Alert.alert('Error', 'Failed to load wallet data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Handle refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  // Handle deposit
  const handleDeposit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount');
      return;
    }

    setProcessing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const depositAmount = parseFloat(amount);
      const newBalance = (user.balance || 0) + depositAmount;
      setUser({ ...user, balance: newBalance });

      const newTransaction = {
        id: transactions.length + 1,
        type: 'DEPOSIT',
        amount: depositAmount,
        description: 'Wallet Deposit',
        status: 'COMPLETED',
        createdAt: new Date().toISOString(),
      };
      setTransactions([newTransaction, ...transactions]);

      Alert.alert(
        'Success',
        `$${depositAmount.toFixed(2)} deposited successfully!`
      );
      setAmount('');
      setDepositModalVisible(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to process deposit');
    } finally {
      setProcessing(false);
    }
  };

  // Handle withdrawal
  const handleWithdraw = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount');
      return;
    }

    const withdrawAmount = parseFloat(amount);
    if (withdrawAmount > (user.balance || 0)) {
      Alert.alert(
        'Insufficient Funds',
        'You cannot withdraw more than your balance'
      );
      return;
    }

    setProcessing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const newBalance = (user.balance || 0) - withdrawAmount;
      setUser({ ...user, balance: newBalance });

      const newTransaction = {
        id: transactions.length + 1,
        type: 'WITHDRAWAL',
        amount: -withdrawAmount,
        description: 'Withdrawal Request',
        status: 'PENDING',
        createdAt: new Date().toISOString(),
      };
      setTransactions([newTransaction, ...transactions]);

      Alert.alert(
        'Request Submitted',
        `Withdrawal request of $${withdrawAmount.toFixed(
          2
        )} submitted. It will be processed within 24-48 hours.`
      );
      setAmount('');
      setWithdrawModalVisible(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to process withdrawal');
    } finally {
      setProcessing(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Format currency
  const formatCurrency = (amount) => {
    return `$${Math.abs(parseFloat(amount || 0)).toFixed(2)}`;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  // Get transaction icon and color
  const getTransactionConfig = (type) => {
    switch (type) {
      case 'DEPOSIT':
        return { icon: 'add-circle', color: COLORS.success, label: 'Deposit' };
      case 'WITHDRAWAL':
        return {
          icon: 'arrow-up-circle',
          color: COLORS.warning,
          label: 'Withdrawal',
        };
      case 'CONTEST_WIN':
        return { icon: 'trophy', color: COLORS.success, label: 'Win' };
      case 'CONTEST_ENTRY':
        return { icon: 'ticket', color: COLORS.secondary, label: 'Entry' };
      case 'REFUND':
        return {
          icon: 'refresh-circle',
          color: COLORS.primary,
          label: 'Refund',
        };
      default:
        return { icon: 'cash', color: COLORS.gray, label: 'Transaction' };
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED':
        return COLORS.success;
      case 'PENDING':
        return COLORS.warning;
      case 'FAILED':
        return COLORS.danger;
      default:
        return COLORS.gray;
    }
  };

  // Calculate stats
  const calculateStats = () => {
    const totalDeposits = transactions
      .filter((t) => t.type === 'DEPOSIT' && t.status === 'COMPLETED')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const totalWins = transactions
      .filter((t) => t.type === 'CONTEST_WIN' && t.status === 'COMPLETED')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const totalSpent = Math.abs(
      transactions
        .filter((t) => t.type === 'CONTEST_ENTRY' && t.status === 'COMPLETED')
        .reduce((sum, t) => sum + t.amount, 0)
    );

    const netProfit = totalWins - totalSpent;

    return {
      totalDeposits,
      totalWins,
      totalSpent,
      netProfit,
    };
  };

  const stats = calculateStats();

  // Render transaction item
  const renderTransactionItem = ({ item }) => {
    const config = getTransactionConfig(item.type);
    const statusColor = getStatusColor(item.status);
    const isPositive = item.amount > 0;

    return (
      <TouchableOpacity style={[styles.transactionCard, CARD_STYLES.shadow]}>
        <View style={styles.transactionHeader}>
          <View style={styles.transactionIconContainer}>
            <View
              style={[
                styles.transactionIcon,
                { backgroundColor: config.color + '20' },
              ]}
            >
              <Ionicons name={config.icon} size={18} color={config.color} />
            </View>
            <View style={styles.transactionInfo}>
              <Text style={styles.transactionDescription} numberOfLines={1}>
                {item.description}
              </Text>
              <View style={styles.transactionMeta}>
                <Text style={styles.transactionType}>{config.label}</Text>
                <Text style={styles.transactionDate}>
                  {formatDate(item.createdAt)}
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.transactionAmountContainer}>
            <Text
              style={[
                styles.transactionAmount,
                isPositive ? styles.positiveAmount : styles.negativeAmount,
              ]}
              numberOfLines={1}
            >
              {isPositive ? '+' : ''}
              {formatCurrency(item.amount)}
            </Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: statusColor + '20' },
              ]}
            >
              <Text style={[styles.statusText, { color: statusColor }]}>
                {item.status}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Render deposit modal
  const renderDepositModal = () => (
    <Modal
      animationType='slide'
      transparent={true}
      visible={depositModalVisible}
      onRequestClose={() => setDepositModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <SafeAreaView style={styles.modalSafeArea}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle} numberOfLines={1}>
                Add Funds
              </Text>
              <TouchableOpacity
                onPress={() => setDepositModalVisible(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name='close' size={22} color={COLORS.gray} />
              </TouchableOpacity>
            </View>

            <View style={styles.balancePreview}>
              <Text style={styles.balanceLabel}>Current Balance</Text>
              <Text style={styles.balanceValue} numberOfLines={1}>
                {formatCurrency(user?.balance)}
              </Text>
            </View>

            <View style={styles.amountInputContainer}>
              <Text style={styles.inputLabel}>Amount to Deposit</Text>
              <View style={styles.amountInput}>
                <Text style={styles.currencySymbol}>$</Text>
                <TextInput
                  style={styles.amountTextInput}
                  value={amount}
                  onChangeText={setAmount}
                  placeholder='0.00'
                  keyboardType='decimal-pad'
                  placeholderTextColor={COLORS.gray}
                  returnKeyType='done'
                />
              </View>
            </View>

            <View style={styles.quickAmounts}>
              {[10, 25, 50, 100, 250].map((quickAmount) => (
                <TouchableOpacity
                  key={quickAmount}
                  style={styles.quickAmountButton}
                  onPress={() => setAmount(quickAmount.toString())}
                >
                  <Text style={styles.quickAmountText} numberOfLines={1}>
                    ${quickAmount}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.newBalancePreview}>
              <Text style={styles.newBalanceLabel}>New Balance</Text>
              <Text style={styles.newBalanceValue} numberOfLines={1}>
                {formatCurrency((user?.balance || 0) + parseFloat(amount || 0))}
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.modalButton, processing && styles.disabledButton]}
              onPress={handleDeposit}
              disabled={processing}
            >
              {processing ? (
                <ActivityIndicator color={COLORS.light} size='small' />
              ) : (
                <LinearGradient
                  colors={[COLORS.success, '#28a745']}
                  style={styles.modalButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Ionicons
                    name='add-circle'
                    size={18}
                    color={COLORS.light}
                    style={{ marginRight: 6 }}
                  />
                  <Text style={styles.modalButtonText} numberOfLines={1}>
                    DEPOSIT ${parseFloat(amount || 0).toFixed(2)}
                  </Text>
                </LinearGradient>
              )}
            </TouchableOpacity>

            <Text style={styles.modalNote} numberOfLines={2}>
              Funds will be added instantly to your virtual wallet
            </Text>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );

  // Render withdraw modal
  const renderWithdrawModal = () => (
    <Modal
      animationType='slide'
      transparent={true}
      visible={withdrawModalVisible}
      onRequestClose={() => setWithdrawModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <SafeAreaView style={styles.modalSafeArea}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle} numberOfLines={1}>
                Withdraw Funds
              </Text>
              <TouchableOpacity
                onPress={() => setWithdrawModalVisible(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name='close' size={22} color={COLORS.gray} />
              </TouchableOpacity>
            </View>

            <View style={styles.balancePreview}>
              <Text style={styles.balanceLabel}>Available Balance</Text>
              <Text style={styles.balanceValue} numberOfLines={1}>
                {formatCurrency(user?.balance)}
              </Text>
            </View>

            <View style={styles.amountInputContainer}>
              <Text style={styles.inputLabel}>Amount to Withdraw</Text>
              <View style={styles.amountInput}>
                <Text style={styles.currencySymbol}>$</Text>
                <TextInput
                  style={styles.amountTextInput}
                  value={amount}
                  onChangeText={setAmount}
                  placeholder='0.00'
                  keyboardType='decimal-pad'
                  placeholderTextColor={COLORS.gray}
                  returnKeyType='done'
                />
              </View>
            </View>

            <View style={styles.quickAmounts}>
              {[50, 100, 250, 500, 1000].map((quickAmount) => (
                <TouchableOpacity
                  key={quickAmount}
                  style={styles.quickAmountButton}
                  onPress={() => setAmount(quickAmount.toString())}
                >
                  <Text style={styles.quickAmountText} numberOfLines={1}>
                    ${quickAmount}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.withdrawalInfo}>
              <Ionicons
                name='information-circle'
                size={18}
                color={COLORS.warning}
              />
              <Text style={styles.withdrawalInfoText} numberOfLines={3}>
                Withdrawals are processed within 24-48 hours. Minimum
                withdrawal: $10.
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.modalButton, processing && styles.disabledButton]}
              onPress={handleWithdraw}
              disabled={processing}
            >
              {processing ? (
                <ActivityIndicator color={COLORS.light} size='small' />
              ) : (
                <LinearGradient
                  colors={[COLORS.warning, '#e68900']}
                  style={styles.modalButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Ionicons
                    name='arrow-up-circle'
                    size={18}
                    color={COLORS.light}
                    style={{ marginRight: 6 }}
                  />
                  <Text style={styles.modalButtonText} numberOfLines={1}>
                    REQUEST WITHDRAWAL
                  </Text>
                </LinearGradient>
              )}
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size='large' color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading wallet...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle='light-content' backgroundColor={COLORS.primary} />

      {/* Compact Header */}
      <LinearGradient
        colors={[COLORS.primary, '#2A5298']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            MY WALLET
          </Text>
          <Text style={styles.headerSubtitle} numberOfLines={1}>
            Manage your funds
          </Text>
        </View>
      </LinearGradient>

      {/* Balance Card */}
      <View style={[styles.balanceCard, CARD_STYLES.shadow]}>
        <View style={styles.balanceHeader}>
          <View style={styles.balanceIconContainer}>
            <Ionicons name='wallet' size={22} color={COLORS.primary} />
          </View>
          <View style={styles.balanceInfo}>
            <Text style={styles.balanceLabel}>AVAILABLE BALANCE</Text>
            <Text style={styles.balanceAmount} numberOfLines={1}>
              {formatCurrency(user?.balance)}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setDepositModalVisible(true)}
          >
            <LinearGradient
              colors={[COLORS.success, '#28a745']}
              style={styles.actionButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons
                name='add-circle'
                size={18}
                color={COLORS.light}
                style={{ marginRight: 6 }}
              />
              <Text style={styles.actionButtonText} numberOfLines={1}>
                ADD FUNDS
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.withdrawButton]}
            onPress={() => setWithdrawModalVisible(true)}
          >
            <LinearGradient
              colors={[COLORS.warning, '#e68900']}
              style={styles.actionButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons
                name='arrow-up-circle'
                size={18}
                color={COLORS.light}
                style={{ marginRight: 6 }}
              />
              <Text style={styles.actionButtonText} numberOfLines={1}>
                WITHDRAW
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats Overview */}
      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>WALLET OVERVIEW</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View
              style={[
                styles.statIcon,
                { backgroundColor: COLORS.success + '20' },
              ]}
            >
              <Ionicons name='trending-up' size={18} color={COLORS.success} />
            </View>
            <Text style={styles.statLabel} numberOfLines={1}>
              Total Wins
            </Text>
            <Text
              style={[styles.statValue, { color: COLORS.success }]}
              numberOfLines={1}
            >
              {formatCurrency(stats.totalWins)}
            </Text>
          </View>

          <View style={styles.statCard}>
            <View
              style={[
                styles.statIcon,
                { backgroundColor: COLORS.primary + '20' },
              ]}
            >
              <Ionicons name='cash' size={18} color={COLORS.primary} />
            </View>
            <Text style={styles.statLabel} numberOfLines={1}>
              Total Deposits
            </Text>
            <Text
              style={[styles.statValue, { color: COLORS.primary }]}
              numberOfLines={1}
            >
              {formatCurrency(stats.totalDeposits)}
            </Text>
          </View>

          <View style={styles.statCard}>
            <View
              style={[
                styles.statIcon,
                { backgroundColor: COLORS.secondary + '20' },
              ]}
            >
              <Ionicons name='ticket' size={18} color={COLORS.secondary} />
            </View>
            <Text style={styles.statLabel} numberOfLines={1}>
              Total Spent
            </Text>
            <Text
              style={[styles.statValue, { color: COLORS.secondary }]}
              numberOfLines={1}
            >
              {formatCurrency(stats.totalSpent)}
            </Text>
          </View>

          <View style={styles.statCard}>
            <View
              style={[
                styles.statIcon,
                {
                  backgroundColor:
                    stats.netProfit >= 0
                      ? COLORS.success + '20'
                      : COLORS.danger + '20',
                },
              ]}
            >
              <Ionicons
                name={stats.netProfit >= 0 ? 'arrow-up' : 'arrow-down'}
                size={18}
                color={stats.netProfit >= 0 ? COLORS.success : COLORS.danger}
              />
            </View>
            <Text style={styles.statLabel} numberOfLines={1}>
              Net Profit
            </Text>
            <Text
              style={[
                styles.statValue,
                {
                  color: stats.netProfit >= 0 ? COLORS.success : COLORS.danger,
                },
              ]}
              numberOfLines={1}
            >
              {stats.netProfit >= 0 ? '+' : ''}
              {formatCurrency(stats.netProfit)}
            </Text>
          </View>
        </View>
      </View>

      {/* Transaction History */}
      <View style={styles.transactionsSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle} numberOfLines={1}>
            RECENT TRANSACTIONS
          </Text>
          <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
            <Ionicons name='refresh-outline' size={18} color={COLORS.gray} />
          </TouchableOpacity>
        </View>

        {transactions.length > 0 ? (
          <FlatList
            data={transactions}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderTransactionItem}
            contentContainerStyle={styles.transactionsList}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={COLORS.primary}
                colors={[COLORS.primary]}
              />
            }
            ListFooterComponent={<View style={styles.listFooter} />}
          />
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name='receipt-outline' size={50} color={COLORS.gray} />
            <Text style={styles.emptyTitle} numberOfLines={1}>
              No Transactions Yet
            </Text>
            <Text style={styles.emptyText} numberOfLines={2}>
              Your transaction history will appear here
            </Text>
          </View>
        )}
      </View>

      {/* Modals */}
      {renderDepositModal()}
      {renderWithdrawModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
  },
  loadingText: {
    ...TYPOGRAPHY.caption,
    fontSize: 13,
    color: COLORS.gray,
    marginTop: SPACING.md,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 0 : StatusBar.currentHeight,
    paddingBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
    height: Platform.OS === 'ios' ? 88 : 78,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  headerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    ...TYPOGRAPHY.h3,
    fontSize: 16,
    color: COLORS.light,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    ...TYPOGRAPHY.small,
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  balanceCard: {
    backgroundColor: COLORS.cardBg,
    marginHorizontal: SPACING.md,
    marginTop: -SPACING.lg,
    borderRadius: CARD_STYLES.borderRadius,
    borderWidth: CARD_STYLES.borderWidth,
    borderColor: CARD_STYLES.borderColor,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  balanceIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(30, 63, 109, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  balanceInfo: {
    flex: 1,
  },
  balanceLabel: {
    ...TYPOGRAPHY.small,
    fontSize: 11,
    color: COLORS.gray,
    letterSpacing: 0.5,
    marginBottom: SPACING.xs,
  },
  balanceAmount: {
    ...TYPOGRAPHY.h1,
    fontSize: 24,
    color: COLORS.primary,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  actionButton: {
    flex: 1,
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: SPACING.md,
    borderRadius: 25,
  },
  actionButtonText: {
    ...TYPOGRAPHY.body,
    fontSize: 14,
    color: COLORS.light,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  withdrawButton: {
    opacity: 0.9,
  },
  statsSection: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h3,
    fontSize: 16,
    color: COLORS.dark,
    marginBottom: SPACING.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  statCard: {
    width: (width - SPACING.md * 2 - SPACING.sm) / 2,
    backgroundColor: COLORS.cardBg,
    borderRadius: CARD_STYLES.borderRadius,
    borderWidth: CARD_STYLES.borderWidth,
    borderColor: CARD_STYLES.borderColor,
    padding: SPACING.md,
    ...CARD_STYLES.shadow,
  },
  statIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  statLabel: {
    ...TYPOGRAPHY.small,
    fontSize: 11,
    color: COLORS.gray,
    marginBottom: SPACING.xs,
  },
  statValue: {
    ...TYPOGRAPHY.h3,
    fontSize: 16,
    fontWeight: '700',
  },
  transactionsSection: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  refreshButton: {
    padding: SPACING.xs,
  },
  transactionsList: {
    paddingBottom: SPACING.xl + 60, // Extra padding for bottom tab bar
  },
  listFooter: {
    height: 20,
  },
  transactionCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: CARD_STYLES.borderRadius,
    borderWidth: CARD_STYLES.borderWidth,
    borderColor: CARD_STYLES.borderColor,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transactionIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: SPACING.sm,
  },
  transactionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  transactionInfo: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  transactionDescription: {
    ...TYPOGRAPHY.body,
    fontSize: 14,
    color: COLORS.dark,
    marginBottom: 4,
  },
  transactionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  transactionType: {
    ...TYPOGRAPHY.small,
    fontSize: 11,
    color: COLORS.gray,
    backgroundColor: 'rgba(30, 63, 109, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  transactionDate: {
    ...TYPOGRAPHY.small,
    fontSize: 11,
    color: COLORS.gray,
  },
  transactionAmountContainer: {
    alignItems: 'flex-end',
    minWidth: 80,
  },
  transactionAmount: {
    ...TYPOGRAPHY.h3,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  positiveAmount: {
    color: COLORS.success,
  },
  negativeAmount: {
    color: COLORS.secondary,
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    ...TYPOGRAPHY.small,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xl * 2,
  },
  emptyTitle: {
    ...TYPOGRAPHY.h3,
    fontSize: 16,
    color: COLORS.dark,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  emptyText: {
    ...TYPOGRAPHY.body,
    fontSize: 14,
    color: COLORS.gray,
    textAlign: 'center',
    paddingHorizontal: SPACING.xl,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalSafeArea: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.light,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: SPACING.lg,
    maxHeight: height * 0.85,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  modalCloseButton: {
    padding: SPACING.xs,
  },
  modalTitle: {
    ...TYPOGRAPHY.h2,
    fontSize: 20,
    color: COLORS.dark,
    flex: 1,
    marginRight: SPACING.sm,
  },
  balancePreview: {
    backgroundColor: 'rgba(30, 63, 109, 0.05)',
    padding: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  balanceLabel: {
    ...TYPOGRAPHY.small,
    fontSize: 11,
    color: COLORS.gray,
    marginBottom: SPACING.xs,
  },
  balanceValue: {
    ...TYPOGRAPHY.h1,
    fontSize: 24,
    color: COLORS.primary,
  },
  amountInputContainer: {
    marginBottom: SPACING.lg,
  },
  inputLabel: {
    ...TYPOGRAPHY.body,
    fontSize: 14,
    color: COLORS.dark,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  amountInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.cardBorder,
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  currencySymbol: {
    ...TYPOGRAPHY.h2,
    fontSize: 20,
    color: COLORS.primary,
    fontWeight: '700',
    marginRight: SPACING.xs,
  },
  amountTextInput: {
    flex: 1,
    ...TYPOGRAPHY.h2,
    fontSize: 20,
    color: COLORS.dark,
    fontWeight: '700',
  },
  quickAmounts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  quickAmountButton: {
    backgroundColor: 'rgba(30, 63, 109, 0.1)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    minWidth: 60,
    alignItems: 'center',
  },
  quickAmountText: {
    ...TYPOGRAPHY.body,
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  newBalancePreview: {
    backgroundColor: 'rgba(52, 199, 89, 0.1)',
    padding: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  newBalanceLabel: {
    ...TYPOGRAPHY.small,
    fontSize: 11,
    color: COLORS.success,
    marginBottom: SPACING.xs,
  },
  newBalanceValue: {
    ...TYPOGRAPHY.h2,
    fontSize: 20,
    color: COLORS.success,
    fontWeight: '700',
  },
  withdrawalInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255, 149, 0, 0.1)',
    padding: SPACING.md,
    borderRadius: 8,
    marginBottom: SPACING.lg,
  },
  withdrawalInfoText: {
    ...TYPOGRAPHY.small,
    fontSize: 12,
    color: COLORS.warning,
    marginLeft: SPACING.sm,
    flex: 1,
  },
  modalButton: {
    marginBottom: SPACING.md,
  },
  modalButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: SPACING.lg,
    borderRadius: 25,
  },
  modalButtonText: {
    ...TYPOGRAPHY.body,
    fontSize: 14,
    color: COLORS.light,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  modalNote: {
    ...TYPOGRAPHY.small,
    fontSize: 12,
    color: COLORS.gray,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export default WalletScreen;
