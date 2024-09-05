import React, { useState, useEffect } from 'react';
import { View, Text, Image, SafeAreaView, StatusBar, ImageBackground } from 'react-native';
import { colors, scale, scaleFont, verticalScale, constants, fullHeight, fullWidth } from '../utils'
import Icon from "react-native-vector-icons/FontAwesome5";



const SplashScreen = (props) => {

    const Background = require("../assets/images/LoginBackground.png")

    useEffect(() => {
        setTimeout(() => {
            props.navigation.navigate('LoginScreen')
        }, 3000)
    }, [])

    return (
        <View style={{ flex: 1, backgroundColor: colors.primary_blue, justifyContent: 'center', alignItems: 'center' }}>

            <StatusBar barStyle={"light-content"} backgroundColor={'transparent'} hidden={false} translucent={true}
            />
            <ImageBackground source={Background} style={{ width: fullWidth, height: verticalScale(720), alignSelf: 'center', }}>

                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>

                    <View style={{ alignSelf: 'center', justifyContent: 'center', alignItems: 'center', }}>
                        <Icon
                            name="trophy"
                            size={verticalScale(80)}
                            color={colors.white}
                        />
                        <Text style={{ color: colors.white, fontFamily: constants.OPENSANS_FONT_EXTRA_BOLD, fontSize: scaleFont(40), marginTop: verticalScale(5) }}>PitchPlay</Text>
                    </View>

                </View>

            </ImageBackground>


        </View>
    );
}

export default SplashScreen;