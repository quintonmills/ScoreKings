import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const ContestSelectionScreen = ({ navigation }) => {
// Sample contest data - replace with your actual data
const [contests, setContests] = useState([
{
id: 1,
title: 'Daily Shootout',
entryFee: 5.00,
prize: 50.00,
participants: 24,
players: ['Eli Ellis', 'Ian Jackson', 'Jelly Fam'],
endTime: 'Today 8:00 PM'
},
{
id: 2,
title: 'Weekly Showdown',
entryFee: 10.00,
prize: 200.00,
participants: 87,
players: ['All Teams'],
endTime: 'Sunday 11:59 PM'
}
]);

const navigateToPlayerSelection = () => {
navigation.navigate('Playerselection');
};

const navigateToProfile = () => {
navigation.navigate('Profile');
};

return (
<View style={styles.container}>
{/* Header with profile icon */}
<View style={styles.header}>
<TouchableOpacity
style={styles.backButton}
onPress={() => navigation.goBack()}
>
<Ionicons name="chevron-back" size={24} color="#fff" />
</TouchableOpacity>
<Text style={styles.headerText}>MY CONTESTS</Text>
<TouchableOpacity
style={styles.profileButton}
onPress={navigateToProfile}
>
<Ionicons name="person-circle-outline" size={28} color="#fff" />
</TouchableOpacity>
</View>

<ScrollView style={styles.content}>
{/* Active contests section */}
<View style={styles.sectionHeader}>
<Ionicons name="trophy-outline" size={20} color="#1e3f6d" />
<Text style={styles.sectionTitle}>ACTIVE CONTESTS</Text>
</View>

{contests.map(contest => (
<TouchableOpacity
key={contest.id}
style={styles.contestCard}
onPress={() => navigateToPlayerSelection}
>
<View style={styles.contestHeader}>
<Text style={styles.contestTitle}>{contest.title}</Text>
<Text style={styles.contestPrize}>${contest.prize} Prize</Text>
</View>

<View style={styles.contestDetails}>
<View style={styles.detailRow}>
<Ionicons name="pricetag-outline" size={16} color="#1e3f6d" />
<Text style={styles.detailText}>Entry: ${contest.entryFee}</Text>
</View>
<View style={styles.detailRow}>
<Ionicons name="people-outline" size={16} color="#1e3f6d" />
<Text style={styles.detailText}>{contest.participants} Joined</Text>
</View>
<View style={styles.detailRow}>
<Ionicons name="time-outline" size={16} color="#1e3f6d" />
<Text style={styles.detailText}>Ends {contest.endTime}</Text>
</View>
</View>

<View style={styles.playersRow}>
{contest.players.map((player, index) => (
<View key={index} style={styles.playerPill}>
<Text style={styles.playerPillText}>{player}</Text>
</View>
))}
</View>

<TouchableOpacity
style={styles.joinButton}
onPress={() => navigateToPlayerSelection(contest)}
>
<Text style={styles.joinButtonText}>SELECT PLAYERS</Text>
</TouchableOpacity>
</TouchableOpacity>
))}

{/* Completed contests section */}
<View style={styles.sectionHeader}>
<Ionicons name="checkmark-done-outline" size={20} color="#1e3f6d" />
<Text style={styles.sectionTitle}>COMPLETED CONTESTS</Text>
</View>
<View style={styles.emptyState}>
<Ionicons name="trophy" size={40} color="#1e3f6d" />
<Text style={styles.emptyStateText}>No completed contests yet</Text>
</View>
</ScrollView>
</View>
);
};

const styles = StyleSheet.create({
container: {
flex: 1,
backgroundColor: '#fff',
},
header: {
backgroundColor: '#1e3f6d',
paddingVertical: 16,
borderBottomWidth: 3,
borderBottomColor: '#BA0C2F',
paddingTop: 50,
flexDirection: 'row',
justifyContent: 'center',
alignItems: 'center',
},
headerText: {
color: '#fff',
fontSize: 20,
fontWeight: 'bold',
letterSpacing: 1,
},
backButton: {
position: 'absolute',
left: 15,
top: 50,
zIndex: 1,
padding: 8
},
profileButton: {
position: 'absolute',
right: 15,
top: 50,
zIndex: 1,
padding: 8
},
content: {
flex: 1,
padding: 20,
},
sectionHeader: {
flexDirection: 'row',
alignItems: 'center',
marginBottom: 16,
marginTop: 8,
},
sectionTitle: {
color: '#1e3f6d',
fontSize: 16,
fontWeight: '600',
marginLeft: 8,
},
contestCard: {
backgroundColor: '#f8f9fa',
borderRadius: 8,
padding: 16,
marginBottom: 16,
borderWidth: 1,
borderColor: '#e1e5e9',
shadowColor: '#000',
shadowOffset: { width: 0, height: 2 },
shadowOpacity: 0.1,
shadowRadius: 4,
elevation: 2,
},
contestHeader: {
flexDirection: 'row',
justifyContent: 'space-between',
marginBottom: 12,
},
contestTitle: {
color: '#1e3f6d',
fontSize: 18,
fontWeight: 'bold',
},
contestPrize: {
color: '#BA0C2F',
fontSize: 16,
fontWeight: 'bold',
},
contestDetails: {
marginBottom: 12,
},
detailRow: {
flexDirection: 'row',
alignItems: 'center',
marginBottom: 6,
},
detailText: {
color: '#666',
fontSize: 14,
marginLeft: 8,
},
playersRow: {
flexDirection: 'row',
flexWrap: 'wrap',
marginBottom: 12,
},
playerPill: {
backgroundColor: 'rgba(30, 63, 109, 0.1)',
borderRadius: 12,
paddingVertical: 4,
paddingHorizontal: 10,
marginRight: 8,
marginBottom: 8,
},
playerPillText: {
color: '#1e3f6d',
fontSize: 12,
},
joinButton: {
backgroundColor: '#BA0C2F',
borderRadius: 8,
padding: 12,
alignItems: 'center',
},
joinButtonText: {
color: '#fff',
fontSize: 16,
fontWeight: 'bold',
},
emptyState: {
alignItems: 'center',
justifyContent: 'center',
padding: 40,
backgroundColor: '#f8f9fa',
borderRadius: 8,
borderWidth: 1,
borderColor: '#e1e5e9',
},
emptyStateText: {
color: '#666',
fontSize: 16,
marginTop: 16,
},
});

export default ContestSelectionScreen;