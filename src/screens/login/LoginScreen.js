import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert, ImageBackground } from 'react-native';


const LoginScreen = ({ navigation }) => {

    const Background = require("../../assets/images/LoginBackground.png")

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = () => {
        if (!email.trim() || !password.trim()) {
            Alert.alert('Error', 'Please fill all fields');
            return;
        }

        if (!/^\S+@\S+\.\S+$/.test(email)) {
            Alert.alert('Error', 'Invalid email format');
            return;
        }

        setIsLoading(true);

        // Replace with your actual authentication logic
        console.log('Logging in with:', { email, password });

        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            navigation.navigate('Home'); // Redirect after login
        }, 1500);
    };

    return (
        <ImageBackground source={Background} style={styles.backgroundImage}>
            <View style={styles.container} >
                <Text style={styles.title}> ScoreKings </Text>

                < TextInput
                    style={styles.input}
                    placeholder="Email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />

                <View style={styles.passwordContainer}>
                    <TextInput
                        style={styles.passwordInput}
                        placeholder="Password"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!showPassword
                        }
                    />
                    < TouchableOpacity
                        style={styles.toggleButton}
                        onPress={() => setShowPassword(!showPassword)}
                    >
                        <Text style={styles.toggleText}>
                            {showPassword ? '👁️' : '👁️‍🗨️'}
                        </Text>
                    </TouchableOpacity>
                </View>

                < TouchableOpacity
                    style={styles.loginButton}
                    onPress={handleLogin}
                    disabled={isLoading}
                >
                    <Text style={styles.buttonText}>
                        {isLoading ? 'Logging in...' : 'Login'}
                    </Text>
                </TouchableOpacity>

                < TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                    <Text style={styles.footerText}>
                        Don't have an account? <Text style={styles.linkText}>Sign up</Text>
                    </Text>
                </TouchableOpacity>
            </View >
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
        backgroundColor: 'hashtag#fff',
    },
    logo: {
        width: 150,
        height: 150,
        alignSelf: 'center',
        marginBottom: 30,
    },
    backgroundImage: {
        flex: 1,
        resizeMode: 'cover', // or 'stretch', 'contain', 'repeat', 'center'
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 30,
        color: 'hashtag#BA0C2F', // Georgia Bulldogs red
    },
    input: {
        height: 50,
        borderColor: 'hashtag#ddd',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 15,
        marginBottom: 15,
        fontSize: 16,
        color: 'red',
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    passwordInput: {
        flex: 1,
        height: 50,
        borderColor: 'hashtag#ddd',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 15,
        fontSize: 16,
    },
    toggleButton: {
        position: 'absolute',
        right: 15,
    },
    toggleText: {
        fontSize: 20,
    },
    loginButton: {
        backgroundColor: 'hashtag#BA0C2F',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 20,
    },
    buttonText: {
        color: 'hashtag#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    footerText: {
        textAlign: 'center',
        color: '#666',
    },
    linkText: {
        color: 'hashtag#BA0C2F',
        fontWeight: 'bold',
    },
});

export default LoginScreen;