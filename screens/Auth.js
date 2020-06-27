
import React, { Component } from 'react';
import {
    StyleSheet, Text, View, TextInput, Button, Picker,
    ImageBackground, Alert, Switch, ActivityIndicator, KeyboardAvoidingView
} from 'react-native';
import { Navigation } from 'react-native-navigation';
import { connect } from 'react-redux';
import { actionLogin } from '../store/actions/actions.creators';
import Realm from 'realm';
import userLogin from '../apicalls/user.login';
import userLogout from '../apicalls/user.logout';
import backgroundImage from '../assets/labmicroBg.jpg';
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
const TokenSchema = {
    name: "token",
    primaryKey: 'token',
    properties: {
        token: 'string',
        environment:'string',
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
                                    id: "SideMenu",
                                    name: 'SideMenu',
                                    passProps : {
                                        openMain:true,
            
                                    },
                                    options: {
                                        topBar: {
                                            title: {
                                                text: 'DICIPA - BIENVENIDO',
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
        environment: "PD",
    }

    componentDidMount() {
        
        if (this.props.realm) {
            this.props.realm.close();
        }

        this.initRealm();
       

    }

    initRealm = () => {
        Realm.open({ schema: [UserSchema,TokenSchema] }).then((realm) => {

            realm.write(()=>{
                const tokens = realm.objects('token');
                
                if(tokens.length){
                    const tokensToClose = [];
                    for(let i = 0; i<tokens.length;i++){
                        tokensToClose.push({...tokens[i]});
                    }
                    tokensToClose.forEach(token=>{
                        
                        userLogout(token.token,(response)=>{
                            //Notificar al usuario que cerramos su sesion anterior ?
                    
                        },token.environment,()=>{
                            //informar que no se puedo cerrar?
                            
                        });
                    });

                }
                
                realm.delete(tokens);
            });

            this.setState({ realm })
        });

    }

   

    login = () => {
        if (this.state.username != '' && this.state.password != '') {
            this.setState({ isLoading: true });
            userLogin(this.state.username, this.state.password, this.state.environment, (response) => {
                this.setState({ isLoading: false });
                const saveUser = new Promise((resolve, reject) => {
                    const { realm, username, password, rememberMe } = this.state;
                    try {
                        if (!this.userInDB) {
                            const users = realm.objects('user');
                            const user = users.filtered("username=$0", username);

                            if (user.length) {

                                realm.write(() => {
                                    realm.create('user', { username, password, rememberMe }, true);
                                });
                            } else {

                                realm.write(() => {
                                    realm.create('user', { username, password, rememberMe });
                                });
                            }

                        } else {

                            realm.write(() => {
                                realm.create('user', { username, password, rememberMe }, true);
                            });

                        }
                        const responseInfo = response.data.userInfo;

                        resolve({ username, responseInfo });

                    } catch (error) {
                        reject(error);
                    }
                });

                saveUser.then(({ username, responseInfo }) => {
                    this.props.login({
                        username,
                        name: responseInfo.alphaName,
                        token: responseInfo.token,
                    });
                    this.state.realm.write(() => {
                        this.state.realm.create('token', { 
                            "token":responseInfo.token,
                            "environment": this.state.environment,
                         }, true);
                    });
                    this.state.realm.close();
                    callMainApp();
                }).catch((error) => {
                    Alert("Error al registrar al usuario ");

                })

            },()=>{
                if (this.userInDB) {
                    
                    if(this.userInDB.password === this.state.password){
                        this.state.realm.close();
                        Alert.alert('Entrando en Modo OFFLINE');
                        callMainApp();

                    }
                }
            });
        }else{
            Alert.alert("Ingrese sus credenciales de acceso");
        }

    }
    handleUserSet = () => {
        const { realm, username } = this.state;
        const users = realm.objects('user');
        const user = users.filtered("username=$0", username);
        if (user.length) {
            const rememberMe = user[0].rememberMe
            const password = rememberMe ? user[0].password : "";

            this.userInDB = user[0];
            this.setState({ password, rememberMe });
        } else {
            this.userInDB = null
        }

        this.state.passwordRef.current.focus()
    }
    render() {
        return (

            <ImageBackground source={backgroundImage}
                style={componentstyles.background}>
                <KeyboardAvoidingView
                    style={{ height: "100%", width: "100%" }} keyboardVerticalOffset={20} behavior="padding">
                    <View style={styles.container}>
                        <Text style={styles.welcome}>Inventario DICIPA</Text>
                        {
                            this.state.isLoading ?
                                <ActivityIndicator color="#ffffff" animating={true} size={"large"} />
                                : null
                        }
                        <View style={{ flexDirection: "row" }}>
                            <Text style={styles.instructions}>Ambiente</Text>
                            <Picker
                                selectedValue={this.state.environment}
                                style={{ height: 50, width: 100, color: "#FFFFFF" }}
                                onValueChange={(itemValue) =>
                                    this.setState({ environment: itemValue })
                                }>
                                <Picker.Item label="PD" value="PD" />
                                <Picker.Item label="PY" value="PY" />
                            </Picker>

                        </View>
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
                            onChangeText={(text) => this.setState({ password: text })}
                            autoCompleteType="password"
                            onSubmitEditing={this.login}
                        />
                        <View style={{ flexDirection: "row" }}>
                            <Text style={styles.instructions}>Recordarme en este teléfono</Text>
                            <Switch value={this.state.rememberMe}
                                onValueChange={(value) => this.setState({ rememberMe: value })}
                            />
                        </View>
                        <Button
                            onPress={this.login}
                            title="Iniciar Sesión"
                        />

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
        marginTop: 40,
        marginBottom: 10,
        color: "#ffffff"
    },
    instructions: {
        color: '#fffa',
        marginTop: 3,
        marginBottom: 7,

    },
});

const mapDispatchToProps = (dispatch) => {
    return {
        login: (user) => dispatch(actionLogin(user)),
    }
};
const mapStateToProps = (state)=> {
    return {        
        
        realm: state.countRealm,
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(Auth);
