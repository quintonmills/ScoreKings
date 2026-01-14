import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';

const WalletScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.center}>
        <Text style={styles.title}>Wallet Not Available on Web</Text>
        <Text style={styles.subtitle}>
          Please open the ScoreKings app on your iPhone to manage your funds and
          test Sandbox payments.
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F7' },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  subtitle: { textAlign: 'center', color: '#8E8E93' },
});

export default WalletScreen;
