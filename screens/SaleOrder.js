import React from 'react';
import {
    View, Text, Button, FlatList,
    ImageBackground, StyleSheet, TouchableOpacity,
    ActivityIndicator, KeyboardAvoidingView, Alert
} from 'react-native';
import { connect } from 'react-redux';
import { Navigation } from 'react-native-navigation';
import ClientField from '../components/ClientField';
import { ItemView, ItemHightLight, ItemLabel } from '../components'
import { actionUpdateStack, actionSetArticlesMap, actionSetArticle } from '../store/actions/actions.creators';
import { componentstyles } from '../styles';
import backgroundImage from '../assets/labmicroBg.jpg';
import ContractPicker from '../components/ContractPicker';
import DatePicker from '../components/DatePicker';
import { startSaleOrder, fillOrderHeader, fillOrderDetail } from '../apicalls/sale_order.operations';
import { queryArticleByItemNumber } from '../apicalls/query.operation';
import {
    searchOrder,printShipment,
} from '../apicalls/pickup.operations';
import { topBarButtons } from '../constants'
import { dateHelpers } from '../helpers/'

class SaleOrder extends React.Component {


    constructor(props) {
        super(props);
        Navigation.events().bindComponent(this);

        this.state = {
            isLoading: false,
            articlesToOrder: new Map(props.articles),
            isOnDetail: false,
            clienteSucursal: "",
            clienteVenta: "",
            clienteEntrega: props.clienteEntrega ? props.clienteEntrega : "",
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
        startSaleOrder(this.props.token, this.props.fromCyclicCount, (response) => {
            const stack = {
                stackId: response.data.stackId,
                stateId: response.data.stateId,
                rid: response.data.rid,
            }

            this.props.dispatch(actionUpdateStack(stack));
        });

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
                                setupPrice: true,
                            }
                        },

                    }
                ]
            }
        });
    }

    confirmHeader = () => {
        const { token, stack } = this.props;
        const { clienteEntrega, clienteVenta, clienteSucursal, contrato, fechaEntrega } = this.state
        
        const form = {
            clienteEntrega,
            clienteVenta,
            contrato:contrato?contrato:"",
            fechaEntrega: dateHelpers.dateToLatinString(fechaEntrega),
            sucursal:this.props.fromCyclicCount?clienteEntrega:clienteSucursal,
        };
        //Sucursal 22 esta harcodeado temporal
        this.setState({ isLoading: true });
       
        fillOrderHeader(token, stack, form, (response) => {
            const data = response.data.fs_P574210F_W574210FA.data;
           console.log("datos" , data);
            const cabecera = {
                numeroOrden: data.txtOrderNumber_17.value,
                sucursal: this.props.fromCyclicCount ? this.props.clienteEntrega : data.txtBusinessUnit_11.value,  
                saldo : data.txtmnSdo_AA_1070 ? data.txtmnSdo_AA_1070.value : 0,              
                moneda: data.txtBaseCurrencyCode_516.value,
            };
            this.setState({ cabecera, isOnDetail: true });

            const stack = {
                stackId: response.data.stackId,
                stateId: response.data.stateId,
                rid: response.data.rid,
            }

            this.props.dispatch(actionUpdateStack(stack));

            if (this.props.fromCyclicCount) {
                const currentArticles = [...this.props.articles.values()]
                this.props.dispatch(actionSetArticlesMap(new Map()));
                const articlesSearchPromises = [];
                for (let article of currentArticles) {
                    const createSearchPromise = (article) => new Promise((resolve) => {
                        queryArticleByItemNumber(this.props.clienteEntrega, article.itemNumber, this.props.token, (response) => {
                            let qtyToFill = article.qty;
                            const rawRows = response.fs_P57LOCN_W57LOCNB.data.gridData.rowset;

                            for (let i = 0; i < rawRows.length; i++) {
                                const qtyOnHand = Number(rawRows[i].mnAvailableQuantity_22.value);
                                if (!Number.isNaN(qtyOnHand) && qtyOnHand > 0) {
                                    if (qtyToFill > qtyOnHand) {
                                        qtyToFill -= qtyOnHand;
                                        this.props.dispatch(actionSetArticle({
                                            ...article,
                                            key: rawRows[i].sLotSerial_11.value + rawRows[i].sLocation_36.value,
                                            serial: rawRows[i].sLotSerial_11.value,
                                            location: rawRows[i].sLocation_36.value,
                                            expirationDate: rawRows[i].dtExpirationDateMonth_127.value,
                                            qty: qtyOnHand,

                                        }));

                                    } else {


                                        this.props.dispatch(actionSetArticle({
                                            ...article,
                                            key: rawRows[i].sLotSerial_11.value + rawRows[i].sLocation_36.value,
                                            serial: rawRows[i].sLotSerial_11.value,
                                            location: rawRows[i].sLocation_36.value,
                                            expirationDate: rawRows[i].dtExpirationDateMonth_127.value,
                                            qty: qtyToFill,

                                        }));

                                        break;
                                    }
                                }
                            }
                            resolve(true);
                        });
                    });

                    articlesSearchPromises.push(createSearchPromise(article));


                }
                Promise.all(articlesSearchPromises).then(() => this.setState({ isLoading: false }))



            } else {
                this.setState({ isLoading: false });
            }
        },(stackError)=>{
            
            this.props.dispatch(actionUpdateStack(stackError));
            this.setState({ isLoading: false });
        })
    }

    printOrder = (orderNumber) => {
        return new Promise((resolve, reject) => {
            searchOrder(orderNumber, this.props.token, (response) => {
                
                const rawRows = response.data.fs_P554205A_W554205AD.data.gridData.rowset;
                console.warn("response print",rawRows);
                const stack = {
                    stackId: response.data.stackId,
                    stateId: response.data.stateId,
                    rid: response.data.rid,
                }
    
                const lineas = rawRows.map(row => ({
                    status: row.sNextStat_39.value,
                    rowId: "1." + String(row.rowIndex),
                }));
    
                const list = lineas.filter((item) => item.status === "580");
    
                if (list.length > 0) {
                    printShipment(this.props.token, stack, list, (response) => {
                        resolve(true);
                    })
                } else {
                    Alert.alert("No existen lineas en estatus 560 para Imprimir");
                }
            }, (reason) => reject(reason));
        });
    }

    confirmOrderDetail = () => {
        this.setState({ isLoading: true });
        const list = [];

        for (let article of this.props.articles.values()) {
            //const article = this.props.articles[key]
            if (article.qty) {
                list.push(article);
            }
        }

        const { token, stack, clienteEntrega , clienteSucursal, fromCyclicCount } = this.props;
        const articlesBusinessUnit = fromCyclicCount ? clienteEntrega : clienteSucursal;
        //22 esta harcodeado.

        fillOrderDetail(token, stack, list, articlesBusinessUnit,fromCyclicCount ,(response) => {
            console.log("Respuesta detail",response);
            this.setState({ isLoading: false })
            if (response) {
                const orderNumber = response.data.fs_P574210F_W574210FG.data.txtPreviousOrderNumber_102.value;               
                Alert.alert("Operación Exitosa", "Se ha guardado la orden de venta #" + orderNumber, [
                    {
                        text: "Aceptar",
                        onPress: () => {
                            if (this.props.fromCyclicCount) {
                                Navigation.showModal({
                                    stack: {
                                        children: [
                                            {
                                                component: {
                                                    name: 'TransferOrder',
                                                    id: 'TransferOrder',
                                                    passProps: {
                                                        clienteDestino: this.props.clienteEntrega,
                                                        articles: this.props.articlesToTransfer,
                                                    },
                                                    options: {
                                                        topBar: {
                                                            title: {
                                                                text: 'Orden de Transferencia',
                                                                color: '#ffffff'
                                                            },
                                                            ...topBarButtons.rightButtonsClose
                                                        }
                                                    }
                                                },

                                            }
                                        ]
                                    }
                                }).then(() => {
                                    this.props.dispatch(actionSetArticlesMap(new Map()));
                                    this.setState({
                                        isLoading: false,
                                        articles: null,
                                        isOnDetail: false,
                                        clienteVenta: "",
                                        clienteEntrega: "",
                                        fechaEntrega: new Date(),
                                        contrato: "",
                                        cabecera: {
                                            numeroOrden: "",
                                            sucursal: 0,
                                            saldo: 0,
                                            moneda: "",
                                        },
                                    });
                                });
                            } else {
                                setTimeout(() => {
                                    this.printOrder(orderNumber).then((respuesta) => {
                                        if (respuesta) {
                                            //Eliminar en tabla Backup
                                            console.warn("respuesta",respuesta);
                                        }
                                    }, (error) => { Alert.alert('Error al imprimir documento ', error) });
                                    
                                }, 3500);
                                this.props.dispatch(actionSetArticlesMap(new Map()));
                                this.setState({
                                    isLoading: false,
                                    articles: null,
                                    isOnDetail: false,
                                    clienteSucursal: "",
                                    clienteVenta: "",
                                    clienteEntrega: "",
                                    fechaEntrega: new Date(),
                                    contrato: "",
                                    cabecera: {
                                        numeroOrden: "",
                                        sucursal: 0,
                                        saldo: 0,
                                        moneda: "",
                                    },
                                });
                            }



                        }
                    }
                ]);


            }
        });

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
                        {
                            this.state.isLoading ?
                                <ActivityIndicator color="#ffffff"
                                    animating={true} size={"large"} />
                                : null
                        }
                        {this.state.isOnDetail ?
                            <View style={{ height: 180 }}>
                                <ItemView>
                                    <HeaderView {...this.state.cabecera} />
                                    <Button title="Captura de Articulos" onPress={this.setupArticles} />
                                </ItemView>
                            </View>
                            :
                            <View style={{ height: 520 }}>
                                <ItemView index={2} >

                                    <ClientField label="Sucursal"
                                        token={this.props.token}
                                        clientNumber={this.state.clienteSucursal}
                                        setClientNumber={(sucursal) => {
                                            this.setState({
                                                clienteSucursal: sucursal,
                                            });
                                        }} />

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


                                    <ContractPicker contract={this.state.contrato}
                                        setContract={(contrato) => this.setState({ contrato })}
                                        token={this.props.token} clientNumber={this.state.clienteVenta}
                                    />
                                    <DatePicker label="Fecha de Conteo" date={this.state.fechaEntrega}
                                        setDate={(fechaEntrega) => this.setState({ fechaEntrega })}
                                    />

                                </ItemView>
                                <Button title="Confirmar Cabecera" onPress={this.confirmHeader} />
                            </View>
                        }




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
                                        <View style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }} >
                                            <ItemLabel text={"Lote: " + item.serial} />
                                            {item.expirationDate ?
                                                <ItemLabel text={"Caducidad: " + item.expirationDate} />
                                                : null
                                            }
                                        </View>

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

