import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  Linking,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config/api';

const COLORS = {
  primary: '#1e3f6d',
  secondary: '#2A5298',
  light: '#ffffff',
  dark: '#0A1428',
  gray: '#8E8E93',
  danger: '#FF3B30',
  lightGray: '#F5F5F7',
  cardBorder: '#E5E5EA',
};

export const SettingsScreen = ({ navigation }) => {
  const TERMS_URL = 'https://quintonmills.github.io/sc-legal/terms.html';
  const PRIVACY_URL = 'https://quintonmills.github.io/sc-legal/privacy.html';

  const handleOpenLink = async (url) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Unable to open this link.');
      }
    } catch (error) {
      console.error('Linking Error:', error);
    }
  };

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        onPress: async () => {
          await AsyncStorage.clear();
          navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action is permanent. All remaining credits and data will be permanently removed.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const userId = await AsyncStorage.getItem('userId');
              const response = await fetch(
                `${API_URL}/auth/delete-account?userId=${userId}`,
                {
                  method: 'DELETE',
                },
              );

              if (response.ok) {
                await AsyncStorage.clear();
                navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
              } else {
                Alert.alert('Error', 'Could not delete account.');
              }
            } catch (error) {
              Alert.alert('Network Error', 'Check your connection.');
            }
          },
        },
      ],
    );
  };

  const SettingItem = ({
    icon,
    title,
    subtitle,
    onPress,
    color = COLORS.dark,
    showArrow = true,
  }) => (
    <TouchableOpacity style={styles.item} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.itemLeft}>
        <Ionicons name={icon} size={22} color={color} />
        <View style={styles.textContainer}>
          <Text style={[styles.itemText, { color }]}>{title}</Text>
          {subtitle && <Text style={styles.itemSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {showArrow && (
        <Ionicons name='chevron-forward' size={18} color={COLORS.gray} />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle='light-content' />

      {/* --- SQUARE HEADER (MATCHES CONTEST SELECTION) --- */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.header}
      >
        <SafeAreaView>
          <View style={styles.headerContent}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name='arrow-back' size={24} color={COLORS.light} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>SETTINGS</Text>
            <View style={{ width: 40 }} />
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionLabel}>REWARDS HUB</Text>
        <View style={styles.card}>
          <SettingItem
            icon='gift-outline'
            title='Rewards Store'
            subtitle='Redeem credits for prizes'
            color={COLORS.primary}
            onPress={() => navigation.navigate('RedemptionScreen')}
          />
          <View style={styles.divider} />
          <SettingItem
            icon='stats-chart-outline'
            title='Analysis History'
            subtitle='Review your past strategy entries'
            onPress={() => navigation.navigate('MyEntries')}
          />
        </View>

        <Text style={styles.sectionLabel}>LEGAL & COMPLIANCE</Text>
        <View style={styles.card}>
          <SettingItem
            icon='document-text-outline'
            title='Terms of Service'
            onPress={() => handleOpenLink(TERMS_URL)}
          />
          <View style={styles.divider} />
          <SettingItem
            icon='shield-checkmark-outline'
            title='Privacy Policy'
            onPress={() => handleOpenLink(PRIVACY_URL)}
          />
          <View style={styles.divider} />
          <SettingItem
            icon='information-circle-outline'
            title='Skill-Based Rules'
            onPress={() => handleOpenLink(TERMS_URL)}
          />
        </View>

        <Text style={styles.sectionLabel}>ACCOUNT MANAGEMENT</Text>
        <View style={styles.card}>
          <SettingItem
            icon='log-out-outline'
            title='Logout'
            showArrow={false}
            onPress={handleLogout}
          />
          <View style={styles.divider} />
          <SettingItem
            icon='trash-outline'
            title='Delete Account'
            color={COLORS.danger}
            showArrow={false}
            onPress={handleDeleteAccount}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.versionText}>Version 1.0.0 (Build 1)</Text>
          <View style={styles.disclaimerContainer}>
            <Text style={styles.disclaimerText}>
              Apple is not a sponsor of, or responsible for, any contests or
              prizes within this app. Participation is based on skill and
              analytical knowledge.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.lightGray },

  // Square Header Styling
  header: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
  },
  headerContent: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.light,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  backButton: { width: 40, alignItems: 'flex-start' },

  // Content & List Styling
  content: { flex: 1, padding: 16 },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.gray,
    marginBottom: 12,
    marginLeft: 4,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  card: {
    backgroundColor: COLORS.light,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
  },
  itemLeft: { flexDirection: 'row', alignItems: 'center' },
  textContainer: { marginLeft: 12 },
  itemText: { fontSize: 16, fontWeight: '600' },
  itemSubtitle: {
    fontSize: 11,
    color: COLORS.gray,
    marginTop: 2,
    fontWeight: '500',
  },
  divider: { height: 1, backgroundColor: COLORS.lightGray, marginLeft: 50 },

  footer: { marginTop: 10, alignItems: 'center', paddingBottom: 50 },
  versionText: { color: COLORS.gray, fontSize: 12, fontWeight: '500' },
  disclaimerContainer: { marginTop: 20, paddingHorizontal: 20 },
  disclaimerText: {
    textAlign: 'center',
    color: COLORS.gray,
    fontSize: 10,
    lineHeight: 16,
    fontStyle: 'italic',
  },
});

export default SettingsScreen;
