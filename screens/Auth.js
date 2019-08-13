
import React, { Component } from 'react';
import {
    StyleSheet, Text, View, TextInput, Button,
    ImageBackground, Alert, Switch, ActivityIndicator, KeyboardAvoidingView
} from 'react-native';
import { Navigation } from 'react-native-navigation';
import { connect } from 'react-redux';
import { actionLogin } from '../store/actions/actions.creators';

import Realm from 'realm';
import userLogin from '../apicalls/user.login';
import backgroundImage from '../assets/mainBg.jpg';
import menuIcon from '../assets/iconmenu.png'

import { componentstyles } from '../styles'

const UserSchema = {
    name: 'user',
    primaryKey: 'username',
    properties: {
        username: 'string',
        password: 'string',
        rememberMe: 'bool',

    }

}
const callMainApp = () => {
    Navigation.setRoot({
        root: {
            sideMenu: {
                left: {
                    component: {
                        id: "SideMenu",
                        name: "SideMenu",
                    }
                },
                center: {
                    stack: {
                        children: [
                            {
                                component: {
                                    id: "CyclicCountList",
                                    name: 'CyclicCountList',
                                    options: {
                                        topBar: {
                                            title: {
                                                text: 'Listados de Conteo',
                                                color: "#ffffff"
                                            },
                                        }
                                    }
                                },

                            }

                        ],
                        options: {
                            topBar: {
                                drawBehind: true,
                                background: {
                                    color: '#8c30f1c7',
                                    translucent: true,
                                    blur: false
                                },

                                leftButtons: [
                                    {
                                        id: 'sideMenu',
                                        icon: menuIcon,
                                    }
                                ]

                            }
                        }
                    }
                },



            }

        }


    });

}
class Auth extends Component {
    state = {
        username: "", password: "", passwordRef: React.createRef(),
        rememberMe: false, realm: null, userInDB: null,
        isLoading: false,
    }

    componentDidMount() {
        Realm.open({ schema: [UserSchema] }).then((realm) => this.setState({ realm }));


    }

    login = () => {
        this.setState({ isLoading: true });
        userLogin(this.state.username, this.state.password, (response) => {
            this.setState({ isLoading: false });
            try {
                const { realm, username, password, rememberMe, userInDB } = this.state;
                if (!userInDB) {
                    realm.write(() => {
                        realm.create('user', { username, password, rememberMe });
                    });
                }
                const responseInfo = response.data.userInfo;

                this.props.login({
                    username,
                    name: responseInfo.alphaName,
                    token: responseInfo.token,
                });
                callMainApp();
            } catch (reason) {

                Alert("Error al registrar al usuario ");
                console.warn(reason);
            }



        });
    }
    handleUserSet = () => {
        const { realm, username } = this.state;
        const users = realm.objects('user');
        const user = users.filtered("username=$0", username);
        if (user.length) {
            this.setState({ password: user[0].password, userInDB: user[0], });
        } else {
            this.setState({ userInDB: null, })
        }

        this.state.passwordRef.current.focus()
    }
    render() {
        return (

            <ImageBackground source={backgroundImage}                 
                style={componentstyles.background}>
                <KeyboardAvoidingView
                 style={{height:"100%",width:"100%"}} keyboardVerticalOffset={20}  behavior="padding">
                    <View style={styles.container}>
                        <Text style={styles.welcome}>Inventario DICIPA</Text>
                        <TextInput autoFocus placeholder={"Usuario"} returnKeyType="next"
                            onSubmitEditing={this.handleUserSet}
                            placeholderTextColor={"#fffa"}
                            style={componentstyles.textboxLogin}
                            onChangeText={(text) => this.setState({ username: text })} />
                        <TextInput placeholder={"Contraseña"}
                            ref={this.state.passwordRef} value={this.state.password}
                            style={componentstyles.textboxLogin}
                            placeholderTextColor={"#fffa"}
                            secureTextEntry
                            onChangeText={(text) => this.setState({ password: text })} autoCompleteType="password" />
                        <Button
                            onPress={this.login}
                            title="Iniciar Sesión"
                        />
                        <View style={{ flexDirection: "row" }}>
                            <Text style={styles.instructions}>Recordarme en este telefono</Text>
                            <Switch value={this.state.rememberMe}
                                onValueChange={(value) => this.setState({ rememberMe: value })}
                            />
                        </View>
                        <ActivityIndicator color="#ffffff" animating={this.state.isLoading} size={"large"} />
                    </View>
                </KeyboardAvoidingView>



            </ImageBackground>

        );
    }
}

const styles = StyleSheet.create({
    container: {
        height: "100%",
        width: "100%",        
        justifyContent: 'flex-start',
        alignItems: 'center',
        flexDirection: "column",
        paddingTop: "15%"

    },

    welcome: {
        fontSize: 20,
        textAlign: 'center',
        margin: 40,
        color: "#ffffff"
    },
    instructions: {
        color: '#fffa',
        marginTop: 15,
    },
});

const mapDispatchToProps = (dispatch) => {
    return {
        login: (user) => dispatch(actionLogin(user)),
    }
};
export default connect(null, mapDispatchToProps)(Auth);
