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
        Alert.alert(
          'Error',
          'Unable to open this link. Please check your internet connection.',
        );
      }
    } catch (error) {
      console.error('Linking Error:', error);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action is permanent. All remaining credits and data will be permanently removed.',
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
                // 1. Wipe local storage
                await AsyncStorage.clear();

                // 2. Alert the user
                Alert.alert(
                  'Deleted',
                  'Your account has been permanently removed.',
                  [
                    {
                      text: 'OK',
                      onPress: () => {
                        // 3. Kick them back to Login/Auth flow
                        navigation.reset({
                          index: 0,
                          routes: [{ name: 'Login' }],
                        });
                      },
                    },
                  ],
                );
              } else {
                const data = await response.json();
                Alert.alert('Error', data.error || 'Could not delete account.');
              }
            } catch (error) {
              console.error('Delete Error:', error);
              Alert.alert(
                'Network Error',
                'Check your connection and try again.',
              );
            }
          },
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
    <TouchableOpacity style={styles.item} onPress={onPress} activeOpacity={0.7}>
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
      <StatusBar barStyle='light-content' />

      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name='arrow-back' size={24} color={COLORS.light} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>SETTINGS</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
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

        <View style={styles.footer}>
          <Text style={styles.versionText}>Version 1.0.0 (Build 1)</Text>

          {/* CRITICAL APPLE DISCLAIMER */}
          <View style={styles.disclaimerContainer}>
            <Text style={styles.disclaimerText}>
              Apple is not a sponsor of, or responsible for, any contests or
              sweepstakes within this app.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
  },
  header: {
    height: Platform.OS === 'ios' ? 60 : 80,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.light,
    letterSpacing: 1.2,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.gray,
    marginBottom: 10,
    marginLeft: 4,
    letterSpacing: 1,
  },
  card: {
    backgroundColor: COLORS.light,
    borderRadius: 16,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    overflow: 'hidden',
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    // Elevation for Android
    elevation: 2,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.lightGray,
    marginLeft: 50,
  },
  footer: {
    marginTop: 10,
    alignItems: 'center',
    paddingBottom: 50,
  },
  versionText: {
    color: COLORS.gray,
    fontSize: 12,
    fontWeight: '500',
  },
  disclaimerContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  disclaimerText: {
    textAlign: 'center',
    color: COLORS.gray,
    fontSize: 11,
    lineHeight: 16,
    fontStyle: 'italic',
  },
});
