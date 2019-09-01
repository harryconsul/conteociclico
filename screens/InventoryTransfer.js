import React from 'react';
import {
    View, Text, Button, FlatList,
    ImageBackground, StyleSheet, TouchableOpacity,
    ActivityIndicator, KeyboardAvoidingView,
} from 'react-native';
import { connect } from 'react-redux';
import { Navigation } from 'react-native-navigation';
import Field from '../components/Field';
import { BusinessUnit } from '../components/BusinessUnit';
import { ItemView, ItemHightLight, ItemLabel } from '../components'
import { actionUpdateStack, actionSetTransactionMode, actionSetArticlesMap, actionSetArticle } from '../store/actions/actions.creators';
import { transactionModes } from '../constants'
import { componentstyles } from '../styles';
import backgroundImage from '../assets/labmicroBg.jpg';

class InventoryTransfer extends React.Component {


    constructor(props) {
        super(props);
        Navigation.events().bindComponent(this);

        this.state = {
            isLoading: false,
            order: null,
            articles: null,
            orderNumber: "",
            isConfirming: true,
            unidadOrigen: null,
            unidadDestino: null,
        }
    }


    navigationButtonPressed = ({ buttonId }) => {
        if (buttonId === 'sideMenu') {
            Navigation.mergeOptions('SideMenu', {
                sideMenu: {
                    left: {
                        visible: true
                    }
                }
            });
        } else {
            if (this.state.articles) {
                this.props.dispatch(actionSetTransactionMode(transactionModes.READ_SUBTRACT));
            } else {
                this.props.dispatch(actionSetTransactionMode(transactionModes.READ_RETURN));
            }
            Navigation.showModal({
                stack: {
                    children: [
                        {
                            component: {
                                name: 'BarcodeReader',
                            },
                            options: {
                                topBar: {
                                    title: {
                                        text: 'Captura Codigo de Barras'
                                    },
                                    drawBehind: true,
                                    background: {
                                        color: '#8c30f1c7',
                                        translucent: true,
                                        blur: false
                                    },

                                }
                            }
                        }
                    ]
                }
            });

        }
    }
    componentDidAppear() {
        if (this.props.articles) {

            const search = this.props.articles.get("search");
            if (search) {
                this.setState({ orderNumber: search.value }, this.searchOrder);
            }


        }
    }

    componentDidMount() {

    }
    setupArticles = () => {
        Navigation.showModal({
            stack: {
                children: [
                    {
                        component: {
                            name: 'ArticleSetup',
                            passProps: {
                                businessUnit: this.state.unidadOrigen,
                            }
                        },
                        options: {
                            topBar: {
                                title: {
                                    text: 'Configurar Articulos'
                                },
                                drawBehind: true,
                                background: {
                                    color: '#8c30f1c7',
                                    translucent: true,
                                    blur: false
                                },
                                visible: true,


                            }
                        }
                    }
                ]
            }
        });
    }


    handleSelectRow = (key) => {
        const item = this.props.articles.get(key);
        this.props.dispatch(actionSetArticle({ ...item, qty: 0 }));

    }
    render() {
        const { order, isConfirming } = this.state;

        const list = [];

        for (let article of this.props.articles.values()) {
            //const article = this.props.articles[key]
            if (article.qty) {
                list.push(article);
            }
        }

        return (
            <ImageBackground source={backgroundImage} style={componentstyles.background}>

                <View style={componentstyles.containerView}>
                <KeyboardAvoidingView style={{height:"60%"}}
                            keyboardVerticalOffset={60} behavior="padding">
                    
                    <ItemView index={2} >

                        <Field label="Explicación del Movimiento"
                            onChangeText={(text) => this.setState({ orderNumber: text })}
                            onSubmitEditing={this.searchOrder} placeholder="Ejem:Urgencia en sucursal" />
                        <BusinessUnit label="Origen - Numero de Sucursal"
                            token={this.props.token}
                            unidad={(unidad) => {
                                this.setState({
                                    unidadOrigen: unidad,
                                });
                            }} placeholder={"####"} />
                        <BusinessUnit label="Destino - Numero de Sucursal"
                            token={this.props.token}
                            unidad={(unidad) => {
                                this.setState({
                                    unidadDestino: unidad,
                                });
                            }}
                            placeholder={"####"} />


                    </ItemView>
                    </KeyboardAvoidingView>
                    <Button title="Configurar Articulos" onPress={this.setupArticles} />
                    <ActivityIndicator color="#ffffff"
                        animating={this.state.isLoading} size={"large"} />

                    {
                        this.state.articles ?
                            <Button disabled={productsArray.length ? true : false} title="Guardar Transferencia" onPress={this.confirmShipment} />
                            : null
                    }
                    <FlatList data={list}
                        renderItem={({ item, index }) =>
                            <TouchableOpacity key={item.key} index={index} onPress={() => this.handleSelectRow(item.key)}>
                                <ItemView index={index} >
                                    <ItemLabel text={"Numero: " + item.serial} />
                                    <ItemHightLight text={"Descripcion: " + item.description} />
                                    <ItemHightLight text={"Ubicación: " + item.location} />
                                    <ItemHightLight text={"Cantidad: " + item.qty} />
                                </ItemView>
                            </TouchableOpacity>

                        } />
                </View>


            </ImageBackground>

        )
    }
}
const mapStateToProps = (state) => {
    return {
        user: state.user,
        token: state.user.token,
        stack: state.stack,
        articles: state.articles,
    }

}
const styles = StyleSheet.create({
    item: {
        flex: 1,
        justifyContent: 'space-between',
        backgroundColor: "#d6d5ce",
        marginBottom: 5,
        padding: 10
    },
    itemText: {
        color: "#000000",
        fontSize: 20,
    }
});
export default connect(mapStateToProps)(InventoryTransfer);
