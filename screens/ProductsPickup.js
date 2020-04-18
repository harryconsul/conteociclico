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
import {
    searchShipment, startConfirmation, shipmentConfirmation, printShipment,
    searchShipmentBackup, deleteBackup, addShipmentBackup, confirmLineBackup,
    searchAlmacenista, confirmAlmacenista
} from '../apicalls/pickup.operations';
import { actionUpdateStack, actionSetTransactionMode, actionSetArticlesMap, actionSetSucursal } from '../store/actions/actions.creators';
import { transactionModes } from '../constants'
import { componentstyles } from '../styles';
import backgroundImage from '../assets/labmicroBg.jpg';
import { businessUnit, unidadMedida } from '../apicalls/business_unit.operations';

const initialState = {
    isLoading: false,
    order: null,
    articles: null,
    orderNumber: 0,
    isConfirming: true,
    lineas: 0,
    sucursal: '',
    rowsBackup: null,
    stackBackup: null,
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
                this.openBarcode('PickupBarcodeInput');
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

    confirmLineBackupCallback = (row) => {

        const rows = this.state.rowsBackup.filter(item => item.lineNumber === row.lineNumber);
        confirmLineBackup(this.props.token, this.state.stackBackup, rows, (response) => {

            const stackBackup = {
                stackId: response.data.stackId,
                stateId: response.data.stateId,
                rid: response.data.rid,
                currentApplication: "P574211U_W574211UA",
            };

            this.setState({ stackBackup });
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
                                qtyLabel: "Recolectado",
                                confirmLineBackupCallback: this.confirmLineBackupCallback,
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

    unidadMedida = (itemNumber) => {
        return new Promise((resolve, reject) => {
            unidadMedida(itemNumber, this.props.token, (data) => {
                const rawRows = data.fs_P41002_W41002A.data.gridData.rowset;

                const conversiones = new Map();
                for (let i = 0; i < rawRows.length; i++) {
                    const keyConversion = rawRows[i].rowIndex;

                    const umConversion = {
                        valor: rawRows[i].chVC_38.value,
                        unidad: rawRows[i].sFromUOM_6.value,
                        valorConversion: rawRows[i].mnConversionFactor_7.value,
                        valorUnidad: rawRows[i].sToUOM_8.value,
                    }

                    conversiones.set(keyConversion, umConversion);
                }

                resolve(conversiones);

            }, (reason) => reject(reason));
        });
    }

    printOrder = (orderNumber) => {
        return new Promise((resolve, reject) => {
            searchShipment(orderNumber, this.props.token, (response) => {
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

    deleteBackup = (stack, rows) => {
        return new Promise((resolve, reject) => {
            deleteBackup(this.props.token, stack, rows, (response) => {
                resolve(response);
            }, (reason) => reject(reason));
        });
    }

    confirmAlmacenista = (stack, rows) => {
        return new Promise((resolve, reject) => {
            confirmAlmacenista(this.props.token, stack, rows, (response) => {
                resolve(response);
            }, (reason) => reject(reason));
        });
    }

    searchOrder = () => {
        const { orderNumber } = this.state;
        if (orderNumber != '') {
            this.setState({ isLoading: true });



            searchShipment(orderNumber, this.props.token, (response) => {

                const rawRows = response.data.fs_P554205A_W554205AD.data.gridData.rowset;

                const rows = rawRows.map((item) => ({
                    rowId: item.rowIndex,
                    orden: item.mnOrderNumber_27.value,
                    cliente: item.sSoldToName_64.value,
                    alias: item.sShipToNumber_90.value,
                    fecha: item.dtOrderDate_36.value,
                    sucursal: item.sBusinessUnit_37.value,
                    status: item.sNextStat_39.value,
                    ruta: item.sRuta_92.value,
                }));

                const orders = rows.filter(row => {
                    return row.status === '560';
                });

                if (orders.length != 0) {
                    //Usar el 1er item
                    const order = orders[0];

                    addShipmentBackup(orderNumber, order.sucursal, this.props.token, () => {
                        searchShipmentBackup(orderNumber, this.props.token, (response) => {
                            const filasBackup = response;

                            const rawRows = filasBackup.data.fs_P574211U_W574211UA.data.gridData.rowset;

                            const rowsBackup = rawRows.map(row => ({
                                "recoleccionCompletada": row.chOneWorldEventPoint01_56.value,
                                "controlID": "1." + String(row.rowIndex),
                                "lineNumber": row.mnLineNumber_20.value,
                            }));

                            const stackBackup = {
                                stackId: filasBackup.data.stackId,
                                stateId: filasBackup.data.stateId,
                                rid: filasBackup.data.rid,
                                currentApplication: "P574211U_W574211UA",
                            }

                            if (rowsBackup.length > 0) {
                                this.setState({ rowsBackup, stackBackup });
                            }



                        }, null);

                    }, null);

                    //Al confirmar la recolección, se va a guardar el almacenista por linea.
                    searchAlmacenista(orderNumber, this.props.token, (response) => {
                        const filasAlmacenista = response;

                        const rawRows = response.data.fs_P554211C_W554211CA.data.gridData.rowset;

                        const rowsAlmacenista = rawRows.map((row) => ({
                            "controlID": "1." + String(row.rowIndex),
                            "lineNumber": row.mnLineNumber_47.value,
                        }));

                        const stackAlmacenista = {
                            stackId: filasAlmacenista.data.stackId,
                            stateId: filasAlmacenista.data.stateId,
                            rid: filasAlmacenista.data.rid,
                            currentApplication: "P554211C_W554211CA",
                        }

                        if (rowsAlmacenista.length > 0) {
                            this.setState({ rowsAlmacenista, stackAlmacenista });
                        }

                    }, null);

                    this.sucursal(order.sucursal).then((nombreSucursal) => {
                        order.nombreSucursal = nombreSucursal;
                        this.setState({ order, isLoading: false, isConfirming: true });
                    });

                    this.props.dispatch(actionSetSucursal(order.sucursal));

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
        const { rowsBackup } = this.state;

        startConfirmation(this.props.token, this.props.stack, (response) => {

            const errors = response.data.fs_P554205A_W554205AE.errors;

            if (errors.length === 0) {

                const rawRows = response.data.fs_P554205A_W554205AE.data.gridData.rowset;

                const toPickup = new Map();
                const allProducts = new Map();
                let lineas = 0;

                for (let i = 0; i < rawRows.length; i++) {

                    const key = rawRows[i].rowIndex;
                    const nextStatus = rawRows[i].sNextStat_47.value;
                    const lote = rawRows[i].sLotSerial_50.value;
                    const itemNumber = rawRows[i].sItemNumber_35.value;
                    const um = rawRows[i].sUnitofMeasure_178.value;
                    const etiqueta = rawRows[i].mnNmeronico_253.value;

                    let recoleccionCompletada = "";



                    let value = {
                        key,
                        rowId: rawRows[i].rowIndex,
                        etiqueta: etiqueta !== "0" ? etiqueta : 'FALTA',
                        itemNumber: rawRows[i].sItemNumber_35.value,
                        lote: rawRows[i].sLotSerial_50.value,
                        um: rawRows[i].sUnitofMeasure_178.value,
                        location: rawRows[i].sLocation_36.value,
                        producto: rawRows[i].sDescription_44.value,
                        qty: rawRows[i].mnQuantityShipped_71.value,
                        qtyToPickUp: rawRows[i].mnQuantityShipped_71.value,
                        sucursal: rawRows[i].sBranchPlant_37.value,
                        prevStatus: rawRows[i].sLastStat_48.value,
                        nextStatus: rawRows[i].sNextStat_47.value,
                        ordenTipo: rawRows[i].sOrTy_77.value,
                        lineNumber: rawRows[i].mnLineNumber_177.value,
                    }
                    const rowBackup = rowsBackup.find(item => item.lineNumber === value.lineNumber);
                    if (rowBackup) {
                        recoleccionCompletada = rowBackup.recoleccionCompletada;
                    }

                    if (recoleccionCompletada === "X") {
                        //si ya tiene una X no tiene que recolectar
                        value.qty = 0;
                    }
                    //Sólo mostrar productos que esten en 560 y que tenga número de lote.
                    // y que su orderBackup no sea X
                    if (nextStatus === '560' && lote !== '' && recoleccionCompletada !== "X") {
                        this.unidadMedida(itemNumber).then((conversiones) => {
                            value.conversiones = conversiones;
                        });

                        toPickup.set(key, value);

                        lineas += 1;
                    }

                    allProducts.set(key, value);
                }

                this.props.dispatch(actionSetArticlesMap(toPickup));

                this.setState({ isLoading: false, articles: toPickup, allProducts, lineas });

                const stack = {
                    stackId: response.data.stackId,
                    stateId: response.data.stateId,
                    rid: response.data.rid,
                    currentApplication: "P554205A_W554205AE",
                }
                this.props.dispatch(actionUpdateStack(stack));
            } else {
                const { orderNumber } = this.state;
                this.setState({ isLoading: false });

                let mensaje = ''
                for (let error of errors)
                    mensaje += mensaje !== '' ? ', ' + error.TITLE : error.TITLE;

                //se usa el siguiente alert, porque algunas veces viene vacío aunque tiene valor
                const alert = mensaje !== '' ? mensaje : 'La orden tiene errores, no puede ser procesada';
                Alert.alert('No. de Orden ' + orderNumber,
                    alert, [
                    {
                        text: "Aceptar",
                        onPress: () => {
                            this.refreshScreen();
                        }
                    }
                ]);
            }
        })
    }

    confirmShipment = () => {
        //this.setState({ isLoading: true });
        const products = this.props.articles ? Array.from(this.props.articles.values()) : [];

        const collected = (this.state.articles ?
            [...products]
            :
            [])
            .filter((item) => !item.qty);

        const missingToCollect = (products ?
            [...products]
            :
            [])
            .filter((item) => item.qty > 0);



        const list = [];
        const { allProducts } = this.state;

        for (let article of collected) {
            allProducts.delete(article.key);
        }

        for (let article of allProducts.values()) {
            if (article.nextStatus !== '560') { // desmarcar los articulos que fueron parcialemente recolectados
                list.push({ ...article, set: "0" });
            }
        }

        if (missingToCollect.length === 0) {
            this.setState({ isLoading: true });

            shipmentConfirmation(this.props.token, this.props.stack, list, (response) => {
                const errors = response.data.fs_P554205A_W554205AD.errors;

                if (errors.length === 0) {
                    //Eliminar en tabla Backup
                    const { stackBackup, rowsBackup } = this.state;
                    this.deleteBackup(stackBackup, rowsBackup).then((response) => {
                    }, (error) => { console.warn('Error al eliminar backup ', error) });

                    //Marcar el almacenista
                    const { rowsAlmacenista, stackAlmacenista } = this.state;
                    this.confirmAlmacenista(stackAlmacenista, rowsAlmacenista).then((response) => {
                    }, (error) => { console.warn('Error al confirmar almacenista ', error) });
                    
                    const orden = this.state.orderNumber;

                    Alert.alert(
                        'Proceso terminado',
                        '¿Imprimir documento?',
                        [
                            {
                                text: 'No',
                                onPress: () => {
                                }
                            },
                            {
                                text: 'Si',
                                onPress: () => {
                                    this.printOrder(orden).then((respuesta) => {
                                    }, (error) => { Alert.alert('Error al imprimir documento ', error) });
                                }
                            }
                        ],
                        { cancelable: false },
                    );
                    //Limpiar variables. 
                    this.setState({ ...initialState });
                    this.props.dispatch(actionSetArticlesMap(new Map()));
                    this.setState({ isLoading: false });
                } else {
                    const { orderNumber } = this.state;
                    this.setState({ isLoading: false });

                    let mensaje = ''
                    for (let error of errors)
                        mensaje += mensaje !== '' ? ', ' + error.TITLE : error.TITLE;

                    //se usa el siguiente alert, porque algunas veces viene vacío aunque tiene valor
                    const alert = mensaje !== '' ? mensaje : 'La orden tiene errores, no puede ser procesada';
                    Alert.alert('No. de Orden ' + orderNumber,
                        alert, [
                        {
                            text: "Aceptar",
                            onPress: () => {
                                this.refreshScreen();
                            }
                        }
                    ]);
                }

            });
        } else {
            Alert.alert("Debe recolectar todos los articulos para confirmar");
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
                            blurOnSubmit={true}
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
                                <TouchableOpacity key={item.key} index={index.toString()}>
                                    <ItemView index={index} >
                                        <View style={styles.linea}>
                                            <View style={{ width: "45%" }}>
                                                <ItemHightLight text={"Etiqueta: " + item.etiqueta} />
                                            </View>
                                            <View style={{ width: "55%" }}>
                                                <ItemLabel text={"Catálogo: " + item.itemNumber} />
                                            </View>
                                        </View>
                                        <ItemHightLight text={"Producto: " + item.producto} />
                                        <View style={styles.linea}>
                                            <View style={{ width: "45%" }}>
                                                <ItemHightLight text={"Pendiente: " + item.qty + " " + item.um} />
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
