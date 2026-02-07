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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const COLORS = {
  primary: '#1e3f6d',
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
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert('Error', "Don't know how to open this URL");
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action is permanent and all funds will be forfeited.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => console.log('Delete Account Triggered'),
        },
      ],
    );
  };

  const SettingItem = ({
    icon,
    title,
    onPress,
    color = COLORS.dark,
    showArrow = true,
  }) => (
    <TouchableOpacity style={styles.item} onPress={onPress}>
      <View style={styles.itemLeft}>
        <Ionicons name={icon} size={22} color={color} />
        <Text style={[styles.itemText, { color }]}>{title}</Text>
      </View>
      {showArrow && (
        <Ionicons name='chevron-forward' size={20} color={COLORS.gray} />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Small Header consistent with your Wallet/Contest theme */}
      <LinearGradient
        colors={[COLORS.primary, '#2A5298']}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name='arrow-back' size={24} color={COLORS.light} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <ScrollView style={styles.content}>
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
        </View>

        <Text style={styles.sectionLabel}>ACCOUNT MANAGEMENT</Text>
        <View style={styles.card}>
          <SettingItem
            icon='trash-outline'
            title='Delete Account'
            color={COLORS.danger}
            showArrow={false}
            onPress={handleDeleteAccount}
          />
        </View>

        <Text style={styles.versionText}>Version 1.0.0 (Build 1)</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.lightGray },
  header: {
    height: Platform.OS === 'ios' ? 60 : 70,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.light },
  backButton: { width: 40 },
  content: { flex: 1, padding: 20 },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.gray,
    marginBottom: 8,
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: COLORS.light,
    borderRadius: 12,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    overflow: 'hidden',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  itemLeft: { flexDirection: 'row', alignItems: 'center' },
  itemText: { fontSize: 16, fontWeight: '500', marginLeft: 12 },
  divider: { height: 1, backgroundColor: COLORS.lightGray, marginLeft: 50 },
  versionText: {
    textAlign: 'center',
    color: COLORS.gray,
    fontSize: 12,
    marginTop: 10,
  },
});
