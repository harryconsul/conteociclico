import React from 'react';
import {
    View, Text, Button, FlatList,
    ImageBackground, StyleSheet, TouchableOpacity,
    ActivityIndicator, KeyboardAvoidingView,
} from 'react-native';
import { connect } from 'react-redux';
import { Navigation } from 'react-native-navigation';

import ClientField from '../components/ClientField';
import { ItemView, ItemHightLight, ItemLabel } from '../components'
import { actionUpdateStack } from '../store/actions/actions.creators';
import { componentstyles } from '../styles';
import backgroundImage from '../assets/labmicroBg.jpg';
import ContractPicker from '../components/ContractPicker';
import DatePicker from '../components/DatePicker';
import { startSaleOrder, fillOrderHeader, fillOrderDetail } from '../apicalls/sale_order.operations';
import { dateHelpers } from '../helpers/'
class SaleOrder extends React.Component {


    constructor(props) {
        super(props);
        Navigation.events().bindComponent(this);

        this.state = {
            isLoading: false,
            articles: null,
            isOnDetail: false,
            clienteVenta: "",
            clienteEntrega: props.clienteEntrega?props.clienteEntrega:"",
            fechaEntrega: new Date(),
            contrato: "",
            cabecera: {
                numeroOrden: "",
                sucursal: 0,
                saldo: 0,
                moneda: "",
            },
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


        }
    }


    componentDidMount() {
        startSaleOrder(this.props.token, (response) => {
            const stack = {
                stackId: response.data.stackId,
                stateId: response.data.stateId,
                rid: response.data.rid,
            }

            this.props.dispatch(actionUpdateStack(stack));
        })
    }
    setupArticles = () => {
        Navigation.showModal({
            stack: {
                children: [
                    {
                        component: {
                            name: 'ArticleSetup',
                            passProps: {
                                businessUnit: this.state.cabecera.sucursal,
                                setupPrice:true,
                            }
                        },

                    }
                ]
            }
        });
    }

    confirmHeader = () => {
        const { token, stack } = this.props;
        const { clienteEntrega, clienteVenta, contrato, fechaEntrega } = this.state


        const form = {
            clienteEntrega,
            clienteVenta,
            contrato,
            fechaEntrega: dateHelpers.dateToLatinString(fechaEntrega),
        };
        this.setState({ isLoading: true });
        fillOrderHeader(token, stack, form, (response) => {
            const data = response.data.fs_P574210F_W574210FA.data;

            const cabecera = {
                numeroOrden: data.txtOrderNumber_17.value,
                sucursal: data.txtBusinessUnit_11.value,
                saldo: data.txtmnSdo_AA_1070.value,
                moneda: data.txtBaseCurrencyCode_516.value,
            };
            this.setState({ cabecera, isOnDetail: true, isLoading: false });

            const stack = {
                stackId: response.data.stackId,
                stateId: response.data.stateId,
                rid: response.data.rid,
            }

            this.props.dispatch(actionUpdateStack(stack));
        })

    }

    confirmOrderDetail = () => {
        const list = [];

        for (let article of this.props.articles.values()) {
            //const article = this.props.articles[key]
            if (article.qty) {
                list.push(article);
            }
        }
        const { token, stack } = this.props;
        fillOrderDetail(token, stack, list, (response) => {
            if (response) {
                console.warn("response 2", response.data)
            }
        })

    }
    handleSelectRow = (key) => {


    }
    render() {

        const list = [];

        for (let article of this.props.articles.values()) {
            //const article = this.props.articles[key]
            if (article.qty) {
                list.push(article);
            }
        }

        return (
            <ImageBackground source={backgroundImage} style={componentstyles.background}>
                <KeyboardAvoidingView style={{ height: "100%", width: "100%" }}
                    behavior="padding" enabled>
                    <View style={componentstyles.containerView}>
                        {this.state.isOnDetail ?
                            <View style={{ height: 180 }}>
                                <ItemView>
                                    <HeaderView {...this.state.cabecera} />
                                    <Button title="Configurar Articulos" onPress={this.setupArticles} />
                                </ItemView>
                            </View>
                            :
                            <View style={{ height: 310 }}>
                                <ItemView index={2} >


                                    <View style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
                                        <ClientField label="Vendido a"
                                            token={this.props.token}
                                            clientNumber={this.state.clienteVenta}
                                            setClientNumber={(cliente) => {
                                                this.setState({
                                                    clienteVenta: cliente,
                                                });
                                            }} />
                                        <ClientField label="Entregado a"
                                            clientNumber={this.state.clienteEntrega}
                                            token={this.props.token}
                                            setClientNumber={(cliente) => {
                                                this.setState({
                                                    clienteEntrega: cliente,
                                                });
                                            }}
                                        />

                                    </View>
                                    <ContractPicker contract={this.state.contrato}
                                        setContract={(contrato) => this.setState({ contrato })}
                                        token={this.props.token} clientNumber={this.state.clienteVenta}
                                    />
                                    <DatePicker label="Fecha de Entrega" date={this.state.fechaEntrega}
                                        setDate={(fechaEntrega) => this.setState({ fechaEntrega })}
                                    />

                                </ItemView>
                                <Button title="Confirmar Cabecera" onPress={this.confirmHeader} />
                            </View>
                        }


                        <ActivityIndicator color="#ffffff"
                            animating={this.state.isLoading} size={"large"} />

                        {
                            this.state.isOnDetail ?
                                <Button disabled={list.length ? false : true} title="Guardar Detalle" onPress={this.confirmOrderDetail} />
                                : null
                        }
                        <FlatList data={list}
                            renderItem={({ item, index }) =>
                                <TouchableOpacity key={item.key} index={index} onPress={() => this.handleSelectRow(item.key)}>
                                    <ItemView index={index} >
                                        <View style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }} >
                                            <ItemLabel text={"Catalogo: " + item.itemNumber} />
                                            <ItemHightLight text={"Ubicación: " + item.location} />
                                        </View>
                                        <ItemLabel text={"Lote: " + item.serial} />
                                        <ItemHightLight text={"Descripcion: " + item.description} />
                                        <View style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }} >
                                            <ItemHightLight text={"Cantidad: " + item.qty} />
                                            <ItemHightLight text={"Precio: " + item.price} />
                                        </View>

                                    </ItemView>
                                </TouchableOpacity>

                            } />
                    </View>
                </KeyboardAvoidingView>


            </ImageBackground>

        )
    }
}

const HeaderView = ({ numeroOrden, sucursal, saldo, moneda }) => (
    <View>
        <Text>{"Numero de Orden : " + numeroOrden}</Text>
        <View style={{ display: "flex", flexDirection: "row" }}>
            <Text>{"Sucursal :" + sucursal}</Text>
            <Text style={{ marginLeft: 15 }}>{"Saldo :" + saldo + " " + moneda}</Text>
        </View>
    </View>
)


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
export default connect(mapStateToProps)(SaleOrder);

