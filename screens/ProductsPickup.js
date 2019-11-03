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
import { searchShipment, startConfirmation, shipmentConfirmation } from '../apicalls/pickup.operations';
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
            default:
                this.openBarcode('BarcodeInput');
        }
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
    searchOrder = () => {
        if (parseInt(this.state.orderNumber) > 0) {
            this.setState({ isLoading: true });
            searchShipment(this.state.orderNumber, this.props.token, (response) => {
                const rawRows = response.data.fs_P554205_W554205D.data.gridData.rowset;

                const rows = rawRows.map(item => ({
                    rowId: item.rowIndex,
                    orden: item.mnOrderNumber_27.value,
                    cliente: item.sSoldToName_64.value,
                    alias: item.sShipToNumber_90.value,
                    fecha: item.dtOrderDate_36.value,
                    sucursal: item.sBusinessUnit_37.value,
                }));

                let order = null;
                if (rows.length) {
                    order = rows[0];
                    this.sucursal(order.sucursal).then((nombreSucursal) => {
                        order.nombreSucursal = nombreSucursal;
                        this.setState({ order, isLoading: false, isConfirming: true, });
                    })

                    const stack = {
                        stackId: response.data.stackId,
                        stateId: response.data.stateId,
                        rid: response.data.rid,
                        currentApplication: "P554205_W554205D",
                    }
                    this.props.dispatch(actionUpdateStack(stack));
                } else {
                    Alert.alert("El folio que busca ya fue procesado o no existe");
                    this.setState({ isLoading: false });
                }
                this.setState({ isLoading: false });
            }, (error) => console.warn(error));
        } else {
            Alert.alert("Ingrese el número de recolección.");
        }
    }
    startPickup = () => {
        //Se ejecuta al dar tap sobre INICIAR RECOLECCIÓN.
        this.setState({ isConfirming: false, isLoading: true })
        startConfirmation(this.props.token, this.props.stack, (response) => {
            const rawRows = response.data.fs_P554205_W554205E.data.gridData.rowset;
            const productToPickup = new Map();
            let lineas = 0;

            for (let i = 0; i < rawRows.length; i++) {
                //Sólo mostrar productos que esten en 540 - 560 y que tenga no. de lote.
                if (parseInt(rawRows[i].sLastStat_48.value) == 540 && parseInt(rawRows[i].sNextStat_47.value) == 560
                    && rawRows[i].sLotSerial_50.value.length > 0) {

                    //Catálogo: sItemNumber_35
                    const key = rawRows[i].sItemNumber_35.value;

                    const value = {
                        key,
                        catalogo: rawRows[i].sItemNumber_35.value,
                        lote: rawRows[i].sLotSerial_50.value,
                        um: rawRows[i].sUnitofMeasure_178.value,
                        ubicacion: rawRows[i].sLocation_36.value,
                        producto: rawRows[i].sDescription_44.value,
                        cantidad: rawRows[i].mnQuantityShipped_71.value,
                        sucursal: rawRows[i].sBranchPlant_37.value,
                        prevStatus: rawRows[i].sLastStat_48.value,
                        nextStatus: rawRows[i].sNextStat_47.value,
                        ordenTipo: rawRows[i].sOrTy_77.value,
                    }
                    productToPickup.set(key, value);

                    lineas += 1;
                }
            }
            this.props.dispatch(actionSetArticlesMap(productToPickup));
            this.setState({ isLoading: false, articles: productToPickup, lineas });
            const stack = {
                stackId: response.data.stackId,
                stateId: response.data.stateId,
                rid: response.data.rid,
                currentApplication: "P554205_W554205E",
            }
            this.props.dispatch(actionUpdateStack(stack));
        })
    }
    confirmShipment = () => {
        this.setState({ isLoading: true });
        shipmentConfirmation(this.props.token, this.props.stack, (response) => {

            Alert.alert("Aviso", "Recolección Confirmada", [
                {
                    text: "Aceptar",
                    onPress: () => {
                        this.setState({ ...initialState });
                        this.props.dispatch(actionSetArticlesMap(new Map()));
                        this.setState({ isLoading: false });
                    }
                }
            ])
        })
    }
    handleSelectRow = (key) => {
        const item = this.props.articles.get(key);
        this.props.dispatch(actionSetArticle({ ...item, cantidad: 0 }));

    }
    render() {
        const { order, isConfirming, articles, lineas } = this.state;
        const iniciar = isConfirming ?
            <Button onPress={this.startPickup} title="Iniciar Recolección" />
            : null;

        const products = this.props.articles ? this.props.articles.values() : [];
        const productsArray = (this.state.articles ?
            Array.from(products) : []).filter((item) => item.cantidad);

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
                {
                    articles ?
                        <ItemHightLight text={"Recolectar " + productsArray.length + " de " + lineas} />
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
                            onSubmitEditing={this.searchOrder}
                        />
                        {orderView}
                        {
                            this.state.articles ?
                                <Button disabled={productsArray.length ? true : false}
                                    title="Confirmar Recolección"
                                    onPress={this.confirmShipment}
                                />
                                : null
                        }
                        <FlatList data={productsArray}
                            renderItem={({ item, index }) =>
                                <TouchableOpacity key={item.key} index={index} onPress={() => this.handleSelectRow(item.key)}>
                                    <ItemView index={index} >
                                        <ItemLabel text={"Catálogo: " + item.catalogo} />
                                        <ItemLabel text={"Producto: " + item.producto} />
                                        <ItemLabel text={"Cantidad: " + item.cantidad + " " + item.um} />
                                        <ItemLabel text={"Ubicación: " + item.ubicacion} />
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
