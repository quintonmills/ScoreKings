import React, { useState, } from 'react';
import { View, Image, ImageBackground, Text, TouchableOpacity, StatusBar, Keyboard } from 'react-native';
import { colors, constants, fullWidth, scale, scaleFont, verticalScale } from '../../utils';
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import FontAwesome from "react-native-vector-icons/FontAwesome";


const LoginScreen = (props) => {

    const [phoneNumber, sethoneNumber] = useState();

    const Background = require("../../assets/images/LoginBackground.png")


    const handleTextChange = (text) => {
        sethoneNumber(text)
    }

    return (
        <View style={{ flex: 1, backgroundColor: colors.primary_blue }}>
            <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={() => Keyboard.dismiss()}>


                <StatusBar barStyle={"light-content"} backgroundColor={'transparent'} hidden={false} translucent={true}
                />



                <ImageBackground source={Background} style={{ width: fullWidth, height: verticalScale(720), alignSelf: 'center', }}>

                    <View style={{ flex: 1 }}>

                        <View style={{ alignSelf: 'center', justifyContent: 'center', alignItems: 'center', marginTop: verticalScale(100) }}>
                            <FontAwesome5
                                name="trophy"
                                size={verticalScale(80)}
                                color={colors.white}
                            />

                            <Text style={{ color: colors.white, fontFamily: constants.OPENSANS_FONT_EXTRA_BOLD, fontSize: scaleFont(40) }}>PitchPlay</Text>
                            <Text style={{ color: colors.white, fontFamily: constants.OPENSANS_FONT_SEMI_BOLD, fontSize: scaleFont(12), opacity: 0.5 }}>Empower the player!</Text>
                        </View>

                        <View style={{}}>
                            <View style={{ flexDirection: 'row', width: scale(360), alignItems: 'center', justifyContent: 'space-evenly', alignSelf: 'center', marginTop: verticalScale(220) }}>
                                <TouchableOpacity onPress={() => props.navigation.navigate("Socialsignin")} style={{ flexDirection: "row", height: verticalScale(50), width: scale(160), backgroundColor: colors.white, borderRadius: verticalScale(6), justifyContent: "center", alignItems: 'center', paddingHorizontal: scale(28) }}>
                                    <Image source={require("../../assets/images/Google.png")} style={{ height: verticalScale(14), width: verticalScale(14), }} />
                                    <Text style={{ fontSize: scaleFont(14), marginLeft: scale(20), color: colors.black, fontFamily: constants.OPENSANS_FONT_SEMI_BOLD }}>Google</Text>
                                </TouchableOpacity>

                                <TouchableOpacity onPress={() => props.navigation.navigate("Socialsignin")} style={{ flexDirection: 'row', height: verticalScale(50), width: scale(160), backgroundColor: colors.white, borderRadius: verticalScale(6), justifyContent: "center", alignItems: 'center', paddingHorizontal: scale(22) }}>
                                    <FontAwesome
                                        name="facebook"
                                        size={verticalScale(14)}
                                        color={'#3b5998'}
                                    />
                                    <Text style={{ fontSize: scaleFont(14), marginLeft: scale(20), color: colors.black, fontFamily: constants.OPENSANS_FONT_SEMI_BOLD }}>Facebook</Text>
                                </TouchableOpacity>

                            </View>

                            <Text style={{ alignSelf: 'center', color: colors.white, fontSize: scaleFont(14), marginTop: verticalScale(14), fontFamily: constants.OPENSANS_FONT_MEDIUM }}>or</Text>

                            <TouchableOpacity onPress={() => props.navigation.navigate('Signin')} style={{ backgroundColor: colors.primary_blue, height: verticalScale(50), width: scale(340), alignSelf: 'center', borderRadius: verticalScale(6), marginTop: verticalScale(14), justifyContent: 'center', alignItems: 'center' }}>
                                <Text style={{ color: colors.white, fontSize: scaleFont(16), fontFamily: constants.OPENSANS_FONT_SEMI_BOLD }}>Sign in using Email/Mobile</Text>
                            </TouchableOpacity>

                            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                                <Text style={{ alignSelf: 'center', color: colors.white, fontSize: scaleFont(12), marginTop: verticalScale(14), fontFamily: constants.OPENSANS_FONT_MEDIUM }}>New User? </Text>
                                <TouchableOpacity onPress={() => props.navigation.navigate("SignupScreen")} style={{ justifyContent: 'center', alignItems: "center", marginTop: verticalScale(12) }} ><Text style={{ alignSelf: 'center', color: colors.primary_blue, fontSize: scaleFont(14), fontFamily: constants.OPENSANS_FONT_MEDIUM, }}>Create an Account </Text></TouchableOpacity>
                            </View>

                        </View>

                    </View>


                </ImageBackground>
            </TouchableOpacity>

        </View>
    );
}

export default LoginScreen;