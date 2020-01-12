import React from 'react';
import {
    View, Text, Button, FlatList,
    ImageBackground, StyleSheet, TouchableOpacity,
    ActivityIndicator, KeyboardAvoidingView, Alert,
} from 'react-native';
import { connect } from 'react-redux';
import { Navigation } from 'react-native-navigation';
import Field from '../components/Field';
import { ItemView, ItemHightLight, ItemLabel } from '../components'
import { searchShipment, startConfirmation, shipmentConfirmation, printShipment } from '../apicalls/pickup.operations';
import { actionUpdateStack, actionSetTransactionMode, actionSetArticlesMap, actionSetArticle } from '../store/actions/actions.creators';
import { transactionModes } from '../constants'
import { componentstyles } from '../styles';
import backgroundImage from '../assets/labmicroBg.jpg';
import { businessUnit } from '../apicalls/business_unit.operations';

const initialState = {
    isLoading: false,
    order: null,
    articles: null,
    orderNumber: 0,
    isConfirming: true,
    lineas: 0,
};
class ProductsPickup extends React.Component {


    constructor(props) {
        super(props);
        Navigation.events().bindComponent(this);

        this.state = {
            ...initialState
        }
    }


    navigationButtonPressed = ({ buttonId }) => {
        switch (buttonId) {
            case 'sideMenu':
                this.openSideBar();
                break;
            case 'barCode':
                this.openBarcode('BarcodeReader');
                break;
            case 'refresh':
                this.refreshScreen();
                break;
            default:
                this.openBarcode('BarcodeInput');
        }
    }
    refreshScreen = () => {
        this.setState({ ...initialState });
        this.props.dispatch(actionSetArticlesMap(new Map()));
        this.setState({ isLoading: false });
    }
    openSideBar = () => {
        Navigation.mergeOptions('SideMenu', {
            sideMenu: {
                left: {
                    visible: true
                }
            }
        });
    }

    openBarcode = (screen) => {
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
                            name: screen,
                            passProps: {
                                qtyLabel: "Cantidad Recolectada",
                            }
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

    sucursal = (sucursal) => {

        return new Promise((resolve, reject) => {
            businessUnit(sucursal, this.props.token, (data) => {
                const rawRows = data.fs_P0006S_W0006SA.data.gridData.rowset;
                resolve(rawRows[0].sDescription_41.value);

            }, (reason) => reject(reason));
        });
    }

    printOrder = () => {
        return new Promise((resolve, reject) => {
            searchShipment(this.state.orderNumber, this.props.token, (response) => {
                const rawRows = response.data.fs_P554205A_W554205AD.data.gridData.rowset;

                const stack = {
                    stackId: response.data.stackId,
                    stateId: response.data.stateId,
                    rid: response.data.rid,
                }

                const printRows = new Map();
                for (let i = 0; i < rawRows.length; i++) {

                    if (parseInt(rawRows[i].sLastStat_38.value) == 560) {
                        const key = rawRows[i].rowIndex;
                        const value = {
                            key,
                            rowId: rawRows[i].rowIndex,
                        }

                        printRows.set(key, value);
                    }
                }

                const list = [];
                for (let article of printRows.values()) {
                    list.push({ ...article });
                }

                if (list.length > 0) {
                    printShipment(this.props.token, stack, list, (response) => {
                        resolve(true);
                    })
                }
            }, (reason) => reject(reason));
        });
    }

    searchOrder = () => {
        const { orderNumber } = this.state;
        if (orderNumber != '') {
            this.setState({ isLoading: true });
            searchShipment(orderNumber, this.props.token, (response) => {

                const rawRows = response.data.fs_P554205A_W554205AD.data.gridData.rowset;
                console.warn('Buscar recolección: ', rawRows);
                const rows = rawRows.map((item) => ({
                    rowId: item.rowIndex,
                    orden: item.mnOrderNumber_27.value,
                    cliente: item.sSoldToName_64.value,
                    alias: item.sShipToNumber_90.value,
                    fecha: item.dtOrderDate_36.value,
                    sucursal: item.sBusinessUnit_37.value,
                    status: item.sLastStat_38.value,
                    ruta: item.sRuta_92.value,
                }));

                const orders = rows.filter(row => {
                    return row.status === '540';
                });

                if (orders.length != 0) {
                    //Usar el 1er item
                    const order = orders[0];
                    this.sucursal(order.sucursal).then((nombreSucursal) => {
                        order.nombreSucursal = nombreSucursal;
                        this.setState({ order, isLoading: false, isConfirming: true, });
                    });

                    const stack = {
                        stackId: response.data.stackId,
                        stateId: response.data.stateId,
                        rid: response.data.rid,
                        currentApplication: "P554205A_W554205AD",
                    }
                    this.props.dispatch(actionUpdateStack(stack));

                } else {
                    this.setState({ orderNumber: '' })
                    Alert.alert('Recolección ' + orderNumber + ' procesada o no existe');
                }

                this.setState({ isLoading: false });

            }, (error) => console.warn(error));
        } else {
            Alert.alert("Ingrese el número de recolección.");
        }
    }

    startPickup = () => {
        //Se ejecuta al dar tap sobre INICIAR RECOLECCIÓN.
        this.setState({ isConfirming: false, isLoading: true });

        startConfirmation(this.props.token, this.props.stack, (response) => {
            const rawRows = response.data.fs_P554205A_W554205AE.data.gridData.rowset;
            console.warn('Iniciar recolección: ' , rawRows);
            
            const productToPickup = new Map();
            const allArticles = new Map();
            let lineas = 0;

            for (let i = 0; i < rawRows.length; i++) {

                const key = rawRows[i].mnNmeronico_253.value;

                const value = {
                    key,
                    rowId: rawRows[i].rowIndex,
                    articulo: rawRows[i].mnNmeronico_253.value,
                    itemNumber: rawRows[i].sItemNumber_35.value,
                    lote: rawRows[i].sLotSerial_50.value,
                    um: rawRows[i].sUnitofMeasure_178.value,
                    location: rawRows[i].sLocation_36.value,
                    description: rawRows[i].sDescription_44.value,
                    qty: rawRows[i].mnQuantityShipped_71.value,
                    qtyToPickUp: rawRows[i].mnQuantityShipped_71.value,
                    sucursal: rawRows[i].sBranchPlant_37.value,
                    prevStatus: rawRows[i].sLastStat_48.value,
                    nextStatus: rawRows[i].sNextStat_47.value,
                    ordenTipo: rawRows[i].sOrTy_77.value,
                }
                //Sólo mostrar productos que esten en 540 - 560 y que tenga número de lote.
                if (parseInt(rawRows[i].sLastStat_48.value) == 540 && parseInt(rawRows[i].sNextStat_47.value) == 560
                    && rawRows[i].sLotSerial_50.value.length > 0) {
                    productToPickup.set(key, value);

                    lineas += 1;
                }

                allArticles.set(key, value);
            }

            this.props.dispatch(actionSetArticlesMap(productToPickup));

            this.setState({ isLoading: false, articles: productToPickup, allArticles: allArticles, lineas });

            const stack = {
                stackId: response.data.stackId,
                stateId: response.data.stateId,
                rid: response.data.rid,
                currentApplication: "P554205A_W554205AE",
            }
            this.props.dispatch(actionUpdateStack(stack));
        })
    }

    confirmShipment = () => {
        //this.setState({ isLoading: true });
        const products = this.props.articles ? this.props.articles.values() : [];

        const collected = (this.state.articles ?
            Array.from(products)
            :
            [])
            .filter((item) => !item.qty);

        const list = [];
        const { allArticles } = this.state;

        for (let article of collected) {
            allArticles.delete(article.key);
        }

        for (let article of allArticles.values()) {
            list.push({ ...article, set: "0" });
        }

        if (collected.length > 0) {
            this.setState({ isLoading: true });
            shipmentConfirmation(this.props.token, this.props.stack, list, (response) => {

                Alert.alert(
                    'Proceso terminado',
                    '¿Imprimir documento?',
                    [
                        {
                            text: 'No',
                            onPress: () => {
                                this.setState({ ...initialState });
                                this.props.dispatch(actionSetArticlesMap(new Map()));
                                this.setState({ isLoading: false });
                            }
                        },
                        {
                            text: 'Si',
                            onPress: () => {
                                this.printOrder().then((respuesta) => {
                                    if (respuesta) {
                                        this.setState({ ...initialState });
                                        this.props.dispatch(actionSetArticlesMap(new Map()));
                                        this.setState({ isLoading: false });
                                    }
                                }, (error) => { Alert.alert('Error al imprimir documento ', error) });
                            }
                        }
                    ],
                    { cancelable: false },
                );
            })
        } else {
            Alert.alert("Recolecte almenos un artículo.");
        }
    }

    handleSelectRow = (key) => {
        //Se setea qty = 0, para indicar que ya fue recolectado.
        //El usuario pidio quitarlo, se comenta por si se requiere mas adelante.

        /*
        const item = this.props.articles.get(key);
        this.props.dispatch(actionSetArticle({ ...item, qty: 0 }));
        */
    }
    render() {
        const { order, isConfirming, articles, lineas } = this.state;
        const iniciar = isConfirming ?
            <Button onPress={this.startPickup} title="Iniciar Recolección" />
            : null;

        const products = this.props.articles ? this.props.articles.values() : [];

        const productsArray = (this.state.articles ?
            Array.from(products)
            :
            [])
            .filter((item) => item.qty);

        const orderView = order ?
            <ItemView index={1} >
                <View style={styles.linea}>
                    <View style={{ width: "60%" }}>
                        <ItemLabel text={"Orden: " + order.orden} />
                    </View>
                    <View style={{ width: "40%" }}>
                        <ItemLabel text={"Fecha: " + order.fecha} />
                    </View>
                </View>
                <ItemLabel text={"Cliente: " + order.cliente} />
                <ItemLabel text={"Alias: " + order.alias} />
                <ItemLabel text={"Sucursal: " + order.nombreSucursal} />
                <ItemLabel text={"Ruta: " + order.ruta} />
                {
                    articles ?
                        <View>
                            <ItemHightLight text={"Recolectar " + productsArray.length + " de " + lineas} />

                        </View>
                        :
                        null
                }

                {iniciar}
            </ItemView>
            :
            null;

        return (
            <ImageBackground source={backgroundImage} style={componentstyles.background}>
                <KeyboardAvoidingView
                    style={{ height: "100%", width: "100%" }} enabled behavior="padding">
                    <View style={componentstyles.containerView}>
                        {
                            this.state.isLoading ?
                                <ActivityIndicator color="#ffffff"
                                    animating={true} size={"large"} />
                                :
                                null
                        }
                        <Field
                            label="No. de Recolección"
                            autoFocus
                            placeholder={"####"}
                            keyboardType={"numeric"}
                            onChangeText={(text) => this.setState({ orderNumber: text })}
                            defaultValue={this.state.orderNumber}
                            onSubmitEditing={this.searchOrder}
                        />
                        {orderView}
                        {
                            this.state.articles ?
                                //La recolección puede ser parcial
                                <Button
                                    title="Confirmar Recolección"
                                    onPress={this.confirmShipment}
                                />
                                : null
                        }

                        <FlatList data={productsArray}
                            renderItem={({ item, index }) =>
                                <TouchableOpacity key={item.key} index={index}>
                                    <ItemView index={index} >
                                        <View style={styles.linea}>
                                            <View style={{ width: "45%" }}>
                                                <ItemHightLight text={"Etiqueta: " + item.articulo} />
                                            </View>
                                            <View style={{ width: "55%" }}>
                                                <ItemLabel text={"Catálogo: " + item.itemNumber} />
                                            </View>
                                        </View>
                                        <ItemHightLight text={"Producto: " + item.description} />
                                        <View style={styles.linea}>
                                            <View style={{ width: "45%" }}>
                                                <ItemHightLight text={"Pediente: " + item.qty + " " + item.um} />
                                            </View>
                                            <View style={{ width: "55%" }}>
                                                <ItemHightLight text={"Recolectado: " + (item.qtyToPickUp - item.qty + " " + item.um)} />
                                            </View>
                                        </View>

                                        <ItemLabel text={"Ubicación: " + item.location} />
                                        <ItemLabel text={"Lote: " + item.lote} />

                                    </ItemView>
                                </TouchableOpacity>

                            } />
                    </View>
                </KeyboardAvoidingView>

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
    }, linea: {
        flexDirection: 'row',
        justifyContent: "space-between",
    },
});
export default connect(mapStateToProps)(ProductsPickup);
