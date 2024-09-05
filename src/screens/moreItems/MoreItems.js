import React, { useState, useEffect } from 'react';
import { View, SafeAreaView, StatusBar, Text, TouchableOpacity, Image, Modal, Switch, Share } from 'react-native';
import { colors, verticalScale, scale, scaleFont, constants } from '../../utils';
import FontAwesome from "react-native-vector-icons/FontAwesome";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useSelector, useDispatch } from 'react-redux';
import { switchColors } from '../../redux/actions';
import { LIGHT_THEME, DARK_THEME } from '../../utils/colors'
import LinearGradient from 'react-native-linear-gradient';



const MoreItems = (props) => {

    const theme = useSelector(state => state.theme);
    // initialize action dispatcher
    const dispatch = useDispatch();
    // define a component mode state
    const [mode, setMode] = useState(theme.colors);

    const handleThemeChange = () => {
        setIsEnabled(!isEnabled)
        dispatch(switchColors(theme.colors.mode === 'light' ? DARK_THEME : LIGHT_THEME
        ));

        const handleLangChange = () => {
            setIsEnabled1(!isEnabled1)
            // dispatch(switchColors(theme.colors.mode === 'light' ? DARK_THEME : LIGHT_THEME
            // ));
            2
        };
    }

    const shareFunction = async (message) => {
        try {
            const result = await Share.share({
                message: message,
            });
            if (result.action === Share.sharedAction) {
                if (result.activityType) {
                    // shared with activity type of result.activityType
                } else {
                    // shared
                }
            } else if (result.action === Share.dismissedAction) {
                // dismissed
            }
        } catch (error) {
            console.log('error', error)
            // alert(error.message);
        }
    }


    useEffect(() => {
        setMode(theme.colors.mode);
        console.log(theme.colors)
    }, [theme]);


    const [isEnabled, setIsEnabled] = useState(true);
    const [isEnabled1, setIsEnabled1] = useState(true);

    const handlelogout = () => {
        showModal()
    }

    const [visible, setVisible] = useState(false);
    const shareMessage = "Hey ! I have gifted you $50 to start playing on PitchPlay. Think you can beat me?  \n1. Download the PitchPlay App from here: https://dream11.onelink.me/hNTA/ll5jdi4e \n2. Use my invite code THAKU28043ST \n3. Get $200 in discounts  \n\nLet the games begin!"


    const showModal = () => setVisible(true);
    const hideModal = () => setVisible(false);


    return (
        <View style={{ flex: 1, backgroundColor: 'white', }}>
            <TouchableOpacity activeOpacity={1} style={{ flex: 1, }} onPress={hideModal} >


                <StatusBar barStyle={"light-content"} backgroundColor={'transparent'} hidden={false} translucent={true}
                />


                {visible && (
                    <View style={{ flex: 1, position: 'absolute', left: scale(25), top: verticalScale(300), elevation: 4, zIndex: 1, borderColor: colors.black, borderWidth: scale(0.25) }}>

                        <View style={{ backgroundColor: colors.primary_blue, justifyContent: 'center', alignItems: 'center', borderTopLeftRadius: verticalScale(6), borderTopRightRadius: verticalScale(6) }}>
                            <Text style={{ color: colors.white, fontSize: scaleFont(18), fontFamily: constants.OPENSANS_FONT_BOLD, paddingVertical: verticalScale(8) }}>Logout</Text>
                        </View>

                        <View style={{ backgroundColor: colors.white, height: verticalScale(120), width: scale(320), alignSelf: 'center', borderBottomLeftRadius: verticalScale(6), borderBottomRightRadius: verticalScale(6), paddingHorizontal: scale(15), paddingTop: verticalScale(20) }}>
                            <Text style={{ textAlign: 'left', color: colors.text_primary, fontSize: scaleFont(14), fontFamily: constants.OPENSANS_FONT_SEMI_BOLD }}>Are you sure you want to logout ?</Text>
                            <Text style={{ textAlign: 'left', color: colors.text_primary, fontSize: scaleFont(14), width: scale(280) }}>All your Settings will be Lost !</Text>

                            <View style={{ flexDirection: 'row', alignSelf: "center", width: scale(320), justifyContent: "space-around", marginTop: verticalScale(15), }}>

                                <TouchableOpacity onPress={hideModal} style={{ width: scale(150), height: verticalScale(40), backgroundColor: colors.green, justifyContent: 'center', alignItems: 'center', borderRadius: verticalScale(6) }}>
                                    <Text style={{ alignSelf: 'center', color: colors.white, fontSize: scaleFont(18), fontFamily: constants.OPENSANS_FONT_BOLD, marginRight: scale(15) }}>Cancel</Text>
                                </TouchableOpacity>

                                <TouchableOpacity onPress={() => props.navigation.navigate("LoginScreen")} style={{ width: scale(150), height: verticalScale(40), backgroundColor: colors.primary_red, justifyContent: 'center', alignItems: 'center', borderRadius: verticalScale(6) }}>
                                    <Text style={{ alignSelf: 'center', color: colors.white, fontSize: scaleFont(18), fontFamily: constants.OPENSANS_FONT_BOLD, }}>Logout</Text>
                                </TouchableOpacity>

                            </View>

                        </View>

                    </View>

                )}


                <LinearGradient
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                    colors={[colors.secondary_blue, colors.primary_blue]}
                    style={{
                        width: scale(360),
                        height: verticalScale(80),
                        alignSelf: 'center',
                    }}>
                    <View style={{ alignSelf: 'center', marginTop: verticalScale(40) }}>
                        <Text style={{ fontFamily: constants.OPENSANS_FONT_SEMI_BOLD, fontSize: scaleFont(20), color: colors.white }}>More Items</Text>

                    </View>
                </LinearGradient>


                <View style={{ marginLeft: scale(10), }}>

                    <TouchableOpacity onPress={() => props.navigation.navigate('NotificationScreen')} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', }}>
                        <MaterialIcons name="notifications-none" color={colors.primary_blue} size={verticalScale(24)} />
                        <View style={{ flexDirection: 'row', borderBottomWidth: verticalScale(0.25), borderColor: colors.greyColour, width: scale(320), justifyContent: "space-between", alignItems: 'center', paddingHorizontal: scale(10), height: verticalScale(50), }}>
                            <Text style={{ color: colors.black, fontSize: scaleFont(14), fontFamily: constants.OPENSANS_FONT_SEMI_BOLD }}>Notifications</Text>
                            <FontAwesome name="angle-right" color={colors.black} size={verticalScale(18)} />
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => { props.navigation.navigate('AboutUs') }} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', }}>
                        <MaterialIcons name="info-outline" color={colors.primary_blue} size={verticalScale(24)} />
                        <View style={{ flexDirection: 'row', borderBottomWidth: verticalScale(0.25), borderColor: colors.greyColour, width: scale(320), justifyContent: "space-between", alignItems: 'center', paddingHorizontal: scale(10), height: verticalScale(50), }}>
                            <Text style={{ color: colors.black, fontSize: scaleFont(14), fontFamily: constants.OPENSANS_FONT_SEMI_BOLD }}>About us</Text>
                            <FontAwesome name="angle-right" color={colors.black} size={verticalScale(18)} />
                        </View>
                    </TouchableOpacity>


                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', }}>
                        <MaterialCommunityIcons name="file-powerpoint-box-outline" color={colors.primary_blue} size={verticalScale(24)} />
                        <View style={{ flexDirection: 'row', borderBottomWidth: verticalScale(0.25), borderColor: colors.greyColour, width: scale(320), justifyContent: "space-between", alignItems: 'center', paddingHorizontal: scale(10), height: verticalScale(50), }}>
                            <Text style={{ color: colors.black, fontSize: scaleFont(14), fontFamily: constants.OPENSANS_FONT_SEMI_BOLD }}>Fantasy Points System</Text>
                            <FontAwesome name="angle-right" color={colors.black} size={verticalScale(18)} />
                        </View>
                    </View>


                    <TouchableOpacity onPress={() => { props.navigation.navigate('TermsAndConditions') }} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', }}>
                        <MaterialCommunityIcons name="text-box-multiple-outline" color={colors.primary_blue} size={verticalScale(24)} />
                        <View style={{ flexDirection: 'row', borderBottomWidth: verticalScale(0.25), borderColor: colors.greyColour, width: scale(320), justifyContent: "space-between", alignItems: 'center', paddingHorizontal: scale(10), height: verticalScale(50), }}>
                            <Text style={{ color: colors.black, fontSize: scaleFont(14), fontFamily: constants.OPENSANS_FONT_SEMI_BOLD }}>Terms & Conditions</Text>
                            <FontAwesome name="angle-right" color={colors.black} size={verticalScale(18)} />
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => shareFunction(shareMessage)} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', }}>
                        <MaterialCommunityIcons name="share-outline" color={colors.primary_blue} size={verticalScale(24)} />
                        <View style={{ flexDirection: 'row', borderBottomWidth: verticalScale(0.25), borderColor: colors.greyColour, width: scale(320), justifyContent: "space-between", alignItems: 'center', paddingHorizontal: scale(10), height: verticalScale(50), }}>
                            <Text style={{ color: colors.black, fontSize: scaleFont(14), fontFamily: constants.OPENSANS_FONT_SEMI_BOLD }}>Share App</Text>
                            <FontAwesome name="angle-right" color={colors.black} size={verticalScale(18)} />
                        </View>
                    </TouchableOpacity>


                    <TouchableOpacity onPress={() => { props.navigation.navigate('PrivacyPolicy') }} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', }}>
                        <MaterialCommunityIcons name="shield-check-outline" color={colors.primary_blue} size={verticalScale(24)} />
                        <View style={{ flexDirection: 'row', borderBottomWidth: verticalScale(0.25), borderColor: colors.greyColour, width: scale(320), justifyContent: "space-between", alignItems: 'center', paddingHorizontal: scale(10), height: verticalScale(50), }}>
                            <Text style={{ color: colors.black, fontSize: scaleFont(14), fontFamily: constants.OPENSANS_FONT_SEMI_BOLD }}>Privacy Policy</Text>
                            <FontAwesome name="angle-right" color={colors.black} size={verticalScale(18)} />
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => handlelogout()} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', }}>
                        <MaterialCommunityIcons name="logout" color={colors.primary_blue} size={verticalScale(24)} />
                        <View style={{ flexDirection: 'row', borderBottomWidth: verticalScale(0.25), borderColor: colors.greyColour, width: scale(320), justifyContent: "space-between", alignItems: 'center', paddingHorizontal: scale(10), height: verticalScale(50), }}>
                            <Text style={{ color: colors.black, fontSize: scaleFont(14), fontFamily: constants.OPENSANS_FONT_SEMI_BOLD }}>Logout</Text>
                            <FontAwesome name="angle-right" color={colors.black} size={verticalScale(18)} />
                        </View>
                    </TouchableOpacity>

                </View>

            </TouchableOpacity>
        </View>
    );
}

export default MoreItems