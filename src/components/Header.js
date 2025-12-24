import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

const Header = ({ title, navigation }) => (
  <View
    style={{
      backgroundColor: '#1e3f6d',
      paddingTop: 50,
      paddingBottom: 20,
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
      px: 20,
    }}
  >
    <TouchableOpacity onPress={() => navigation?.goBack()}>
      <Text style={{ color: '#fff', marginLeft: 10 }}> BACK </Text>
    </TouchableOpacity>
    <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>
      {title}
    </Text>
    <TouchableOpacity onPress={() => navigation?.navigate('Profile')}>
      <Text style={{ color: '#fff', marginRight: 10 }}> PROFILE </Text>
    </TouchableOpacity>
  </View>
);

export default Header;
