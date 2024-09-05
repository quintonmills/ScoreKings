import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, StatusBar } from 'react-native';
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { scaleFont, verticalScale, scale, colors, constants } from "../../utils";
import { useSelector } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';

const TermsAndConditions = (props) => {
    return (
        <View style={{ flex: 1, backgroundColor: colors.background_primary }}>
            <StatusBar barStyle={"light-content"} backgroundColor={'transparent'} hidden={false} translucent={true}
            />

            <LinearGradient
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                colors={[colors.secondary_blue, colors.primary_blue]}
                style={{ width: scale(365), height: verticalScale(80), alignSelf: 'center', }}>
                <View style={{ alignSelf: 'center', width: scale(365), marginTop: verticalScale(40), flexDirection: 'row', alignItems: 'center', }}>
                    <TouchableOpacity style={{ width: scale(100), paddingHorizontal: scale(20), }} onPress={() => { props.navigation.goBack() }} >
                        <MaterialCommunityIcons
                            name="arrow-left"
                            size={verticalScale(26)}
                            color={colors.white}
                        />
                    </TouchableOpacity>
                    <Text style={{ fontFamily: constants.OPENSANS_FONT_SEMI_BOLD, fontSize: scaleFont(18), color: colors.white }}>Terms And Conditions</Text>
                </View>
            </LinearGradient>


            <View style={{ justifyContent: 'center', width: scale(320), alignSelf: 'center', flex: 1, }}>
                <ScrollView style={{}} showsVerticalScrollIndicator={false}>

                    <View style={{ alignSelf: 'center', paddingVertical: verticalScale(40) }}>
                        <FontAwesome5
                            name="trophy"
                            size={verticalScale(120)}
                            color={colors.primary_blue}
                        />
                    </View>

                    <Text style={{ color: colors.text_primary, fontSize: scaleFont(14), fontFamily: constants.OPENSANS_FONT_MEDIUM, textAlign: "justify" }}>
                        Score Kings Terms and Conditions Last Updated: 06/30/2024  </Text>

                    <Text style={{ color: colors.text_primary, fontSize: scaleFont(14), fontFamily: constants.OPENSANS_FONT_MEDIUM, marginTop: verticalScale(10), textAlign: "justify" }}>
                        1. Acceptance of Terms
                        By downloading, installing, or using the Score Kings application ("the App"), you agree to be bound by these Terms and Conditions. If you do not agree to these terms, do not use the App.
                    </Text>
                    <Text style={{ color: colors.text_primary, fontSize: scaleFont(14), fontFamily: constants.OPENSANS_FONT_MEDIUM, marginTop: verticalScale(10), textAlign: "justify" }}>
                        2. Eligibility
                        You must be at least 18 years old to use the App. By using the App, you represent and warrant that you are of legal age to form a binding contract with Score Kings.
                    </Text>
                    <Text style={{ color: colors.text_primary, fontSize: scaleFont(14), fontFamily: constants.OPENSANS_FONT_MEDIUM, marginTop: verticalScale(10), textAlign: "justify" }}>
                        3. Account Registration
                        To use certain features of the App, you may be required to register for an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete.
                    </Text>
                    <Text style={{ color: colors.text_primary, fontSize: scaleFont(14), fontFamily: constants.OPENSANS_FONT_MEDIUM, marginTop: verticalScale(10), textAlign: "justify" }}>
                        4. User Conduct

                        You agree not to:

                        a) Use the App for any unlawful purpose or in violation of any local, state, national, or international law

                        b) Interfere with or disrupt the operation of the App or servers

                        c) Impersonate any person or entity, or falsely state or otherwise misrepresent your affiliation with a person or entity

                        d) Attempt to gain unauthorized access to the App or its related systems or networks
                    </Text>
                    <Text style={{ color: colors.text_primary, fontSize: scaleFont(14), fontFamily: constants.OPENSANS_FONT_MEDIUM, marginTop: verticalScale(10), textAlign: "justify" }}>
                        5. Fantasy Contests
                        Participation in fantasy contests is subject to our Contest Rules, which are incorporated by reference into these Terms and Conditions.
                    </Text>
                    <Text style={{ color: colors.text_primary, fontSize: scaleFont(14), fontFamily: constants.OPENSANS_FONT_MEDIUM, marginTop: verticalScale(10), textAlign: "justify" }}>
                        6. Payments and Refunds
                        All payments made through the App are final and non-refundable, unless otherwise required by law.
                    </Text>
                    <Text style={{ color: colors.text_primary, fontSize: scaleFont(14), fontFamily: constants.OPENSANS_FONT_MEDIUM, marginTop: verticalScale(10), textAlign: "justify" }}>
                        7. Intellectual Property
                        The App and its original content, features, and functionality are owned by Score Kings and are protected by international copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws.
                    </Text>
                    <Text style={{ color: colors.text_primary, fontSize: scaleFont(14), fontFamily: constants.OPENSANS_FONT_MEDIUM, marginTop: verticalScale(10), textAlign: "justify" }}>
                        8. Privacy Policy
                        Your use of the App is also governed by our Privacy Policy, which is incorporated by reference into these Terms and Conditions.
                    </Text>
                    <Text style={{ color: colors.text_primary, fontSize: scaleFont(14), fontFamily: constants.OPENSANS_FONT_MEDIUM, marginTop: verticalScale(10), textAlign: "justify" }}>
                        9. Disclaimer of Warranties
                        The App is provided on an "as is" and "as available" basis without any warranties of any kind.
                    </Text>
                    <Text style={{ color: colors.text_primary, fontSize: scaleFont(14), fontFamily: constants.OPENSANS_FONT_MEDIUM, marginTop: verticalScale(10), textAlign: "justify" }}>
                        10. Limitation of Liability
                        To the fullest extent permitted by applicable law, Score Kings shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues.
                    </Text>
                    <Text style={{ color: colors.text_primary, fontSize: scaleFont(14), fontFamily: constants.OPENSANS_FONT_MEDIUM, marginTop: verticalScale(10), textAlign: "justify" }}>
                        11. Indemnification
                        You agree to indemnify and hold Score Kings harmless from any claims, losses, damages, liabilities, including attorney's fees, arising out of your use or misuse of the App.
                    </Text>
                    <Text style={{ color: colors.text_primary, fontSize: scaleFont(14), fontFamily: constants.OPENSANS_FONT_MEDIUM, marginTop: verticalScale(10), textAlign: "justify" }}>
                        12. Governing Law
                        These Terms shall be governed by and construed in accordance with the laws of Georgia, without regard to its conflict of law provisions.
                    </Text>
                    <Text style={{ color: colors.text_primary, fontSize: scaleFont(14), fontFamily: constants.OPENSANS_FONT_MEDIUM, marginTop: verticalScale(10), textAlign: "justify" }}>
                        13. Changes to Terms
                        We reserve the right to modify these Terms at any time. We will always post the most current version on our App.
                    </Text>
                    <Text style={{ color: colors.text_primary, fontSize: scaleFont(14), fontFamily: constants.OPENSANS_FONT_MEDIUM, marginTop: verticalScale(10), textAlign: "justify" }}>
                        14. Contact Us
                        If you have any questions about these Terms, please contact us at pitchplay@gmail.com.
                    </Text>

                </ScrollView>
            </View>


        </View>
    );
}

export default TermsAndConditions;