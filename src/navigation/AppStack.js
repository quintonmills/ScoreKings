// import 'react-native-gesture-handler';
import React from 'react';
import { Platform } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import { createDrawerNavigator, } from '@react-navigation/drawer';
import FontAwesome from "react-native-vector-icons/FontAwesome";
import Entypo from "react-native-vector-icons/Entypo";
import MaterialIcon from "react-native-vector-icons/MaterialIcons"
import AntDesign from "react-native-vector-icons/AntDesign"
import { useSelector } from 'react-redux';
import { colors, verticalScale, scale } from "../utils"

/* Dashboard Tab */
import Dashboard from '../screens/dashboard/Dashboard';
import PlayerSelection from '../screens/dashboard/contestSelect/PlayerSelection';
import PaymentScreen from '../screens/dashboard/contestSelect/PaymentScreen';
import ContestSelectionScreen from '../screens/dashboard/contestSelect/ContestSelectionScreen';
import ContestReviewScreen from '../screens/dashboard/contestSelect/ContestReviewScreen';
import TeamPreview from '../screens/dashboard/contestSelect/TeamPreview';
import NotificationScreen from '../screens/dashboard/NotificationScreen';

/* My Contest Tab */
import MyContest from '../screens/myContest/MyContest';

/* Wallet Tab */
import Wallet from '../screens/wallet/Wallet';
import TransactionHistory from '../screens/wallet/TransactionHistory';
import WithdrawMoney from '../screens/wallet/WithdrawMoney';
import AddMoney from '../screens/wallet/AddMoney';
import PaymentOptions from '../screens/wallet/PaymentOptions';

/* MoreItems Tab */
import MoreItems from '../screens/moreItems/MoreItems';
import PrivacyPolicy from '../screens/moreItems/PrivacyPolicy';
import AboutUs from '../screens/moreItems/AboutUs';

/* Drawer Screens */
import Myprofile from '../screens/drawerscreens/Myprofile';
import EditProfile from '../screens/drawerscreens/EditProfile';
import CustomDrawerContent from '../screens/drawerscreens/CustomDrawerContent';
import Settings from '../screens/drawerscreens/Settings';
import Refer from '../screens/drawerscreens/Refer';
import FollowUsScreen from '../screens/drawerscreens/FollowUsScreen';
import Support from '../screens/drawerscreens/Support';

/* Login */
import LoginScreen from '../screens/login/LoginScreen';
import OtpVerification from '../screens/login/OtpVerification';
import SocialSignIn from '../screens/login/SocialSignIn';
import SignInScreen from '../screens/login/SignInScreen';

/* Registration */
import SignUpScreen from '../screens/registration/SignUpScreen';
import SplashScreen from '../screens/SplashScreen';
import OnboardingStories from '../screens/OnboardingStories';
import TermsAndConditions from '../screens/moreItems/TermsAndConditions';


const Stack = createNativeStackNavigator();
const Tab = createMaterialBottomTabNavigator();
const Drawer = createDrawerNavigator();

const DrawerNavigator = () => {
    return (
        <Drawer.Navigator
            drawerContent={(props) => <CustomDrawerContent {...props} />}
            screenOptions={{
                drawerStyle: {
                    width: scale(280)
                },
                headerShown: false,
            }} initialRouteName="BottomTab"  >
            <Drawer.Screen name="BottomTab" component={BottomTabNavigator} options={{
                headerShown: false
            }} />
        </Drawer.Navigator>
    );
}


const BottomTabNavigator = () => {
    const theme = useSelector(state => state.theme)

    return (
        <Tab.Navigator initialRouteName='Dashboard'
            tabBarColor={colors.black}
            shifting={true}
            activeColor={colors.primary_blue}
            inactiveColor={colors.greyColour}
            barStyle={{ backgroundColor: theme.colors.background_primary }}
            screenOptions={{ tabStyle: { borderTopWidth: 0, headerShown: false, }, }} >
            <Tab.Screen name="Dashboard" component={Dashboard} options={{
                tabBarLabel: 'Home',
                tabBarStyle: { borderTopWidth: 0, height: (Platform.OS === 'ios') ? verticalScale(84) : verticalScale(54), },
                tabBarIcon: ({ focused }) => {
                    return (
                        <FontAwesome name="home" color={focused ? colors.primary_blue : colors.greyColour} size={verticalScale(20)} />
                    )
                }
            }} />
            <Tab.Screen name="MyContest" component={MyContest} options={{
                tabBarLabel: 'My Contest',
                tabBarStyle: { borderTopWidth: 0, height: (Platform.OS === 'ios') ? verticalScale(84) : verticalScale(54), },
                tabBarIcon: ({ focused }) => {
                    return (
                        <Entypo name="medal" color={focused ? colors.primary_blue : colors.greyColour} size={verticalScale(20)} />
                    )
                }
            }} />
            <Tab.Screen name="Wallet" component={Wallet} options={{
                tabBarLabel: 'Wallet',
                tabBarStyle: { borderTopWidth: 0, height: (Platform.OS === 'ios') ? verticalScale(84) : verticalScale(54), },
                tabBarIcon: ({ focused }) => {
                    return (
                        <MaterialIcon name="account-balance-wallet" color={focused ? colors.primary_blue : colors.greyColour} size={verticalScale(18)} />
                    )
                }
            }} />
            <Tab.Screen name="More" component={MoreItems} options={{
                tabBarLabel: 'More',
                tabBarStyle: { borderTopWidth: 0, height: (Platform.OS === 'ios') ? verticalScale(84) : verticalScale(54), },
                tabBarIcon: ({ focused }) => {
                    return (
                        <AntDesign name="appstore1" color={focused ? colors.primary_blue : colors.greyColour} size={verticalScale(20)} />
                    )
                }
            }} />

        </Tab.Navigator>
    );
}


const AppStack = () => {

    return (

        <Stack.Navigator initialRouteName="SplashScreen"
            screenOptions={{ animation: 'slide_from_right', }} >
            <Stack.Screen name="BottomTab" component={DrawerNavigator} options={{ headerShown: false }} />
            <Stack.Screen name="SplashScreen" component={SplashScreen} options={{ headerShown: false, }} />
            <Stack.Screen name="OnboardingStories" component={OnboardingStories} options={{ headerShown: false }} />

            {/* Dashboard Screens */}
            <Stack.Screen name="NotificationScreen" component={NotificationScreen} options={{ headerShown: false }} />
            <Stack.Screen name="ContestReviewScreen" component={ContestReviewScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Playerselection" component={PlayerSelection} options={{ headerShown: false }} />
            <Stack.Screen name="TeamPreview" component={TeamPreview} options={{ headerShown: false }} />
            <Stack.Screen name="PaymentScreen" component={PaymentScreen} options={{ headerShown: false }} />
            <Stack.Screen name="ContestSelectionScreen" component={ContestSelectionScreen} options={{ headerShown: false }} />

            {/* Login Screens */}
            <Stack.Screen name="LoginScreen" component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen name="SignupScreen" component={SignUpScreen} options={{ headerShown: false }} />
            <Stack.Screen name="OtpVerification" component={OtpVerification} options={{ headerShown: false }} />
            <Stack.Screen name="Signin" component={SignInScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Socialsignin" component={SocialSignIn} options={{ headerShown: false }} />

            {/* MoreItem Screens */}
            <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicy} options={{ headerShown: false }} />
            <Stack.Screen name="AboutUs" component={AboutUs} options={{ headerShown: false }} />
            <Stack.Screen name="TermsAndConditions" component={TermsAndConditions} options={{ headerShown: false }} />

            {/*  Drawer Screens */}
            <Stack.Screen name="Refer" component={Refer} options={{ headerShown: false }} />
            <Stack.Screen name="FollowUsScreen" component={FollowUsScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Support" component={Support} options={{ headerShown: false }} />
            <Stack.Screen name="MyProfile" component={Myprofile} options={{ headerShown: false }} />
            <Stack.Screen name="EditProfile" component={EditProfile} options={{ headerShown: false }} />
            <Stack.Screen name="Settings" component={Settings} options={{ headerShown: false }} />

            {/* Wallet Screens */}
            <Stack.Screen name="TransactionHistory" component={TransactionHistory} options={{ headerShown: false }} />
            <Stack.Screen name="WithdrawMoney" component={WithdrawMoney} options={{ headerShown: false }} />
            <Stack.Screen name="AddMoney" component={AddMoney} options={{ headerShown: false }} />
            <Stack.Screen name="PaymentOptions" component={PaymentOptions} options={{ headerShown: false }} />

        </Stack.Navigator>
    );

};
export default AppStack;

