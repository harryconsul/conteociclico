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
import { searchOrder, startConfirmation, transferConfirmation } from '../apicalls/confirm_transfer.operations';
import { queryArticleByCatalogo } from '../apicalls/query.operation';
import { actionUpdateStack, actionSetTransactionMode, actionSetArticlesMap, actionSetArticle } from '../store/actions/actions.creators';
import { transactionModes } from '../constants'
import { componentstyles } from '../styles';
import backgroundImage from '../assets/labmicroBg.jpg';
import { businessUnit, unidadMedida } from '../apicalls/business_unit.operations';

const initialState = {
    isLoading: false,
    order: null,
    articles: null,
    number: '',
    isConfirming: true,
};

class ConfirmTransfer extends React.Component {

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
        this.moKey = "";
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
                                qtyLabel: "Recibir",
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

    getSucursal = (sucursal) => {
        return new Promise((resolve, reject) => {
            businessUnit(sucursal, this.props.token, (data) => {
                const rawRows = data.fs_P0006S_W0006SA.data.gridData.rowset;
                resolve(rawRows[0].sDescription_41.value);

            }, (reason) => reject(reason));
        });
    }

    getArticuloEtiqueta = (catalogo, lote) => {
        return new Promise((resolve, reject) => {
            queryArticleByCatalogo(catalogo, lote, this.props.token, (data) => {
                const rawRows = data.fs_P5541001_W5541001A.data.gridData.rowset;
                if(rawRows.length > 0)
                    resolve(rawRows[0].mnNmeronico_24.value);
                else
                    resolve('SIN ETIQUETA');

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

    showPlaceAgreement = () => {


        Navigation.showModal({
            stack: {
                children: [
                    {
                        component: {
                            name: "PlaceAgreement",
                            passProps: {
                                itemKey: this.moKey,
                            }
                        },
                        options: {
                            topBar: {
                                title: {
                                    text: 'Comentarios y Firma de Recepción'
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

    handleSearchOrder = () => {
        if (parseInt(this.state.number) > 0) {
            this.setState({ isLoading: true });
            searchOrder(this.state.number, this.props.token, (response) => {

                const rawRows = response.data.fs_P594312B_W594312BD.data.gridData.rowset;

                const rows = rawRows.map((item) => ({
                    rowId: item.rowIndex,
                    expire: item.dtFchCaducMes_129.value,
                    order: item.mnOrderNumber_10.value,
                    orderType: item.sOrTy_11.value,
                    line: item.mnLineNumber_43.value,
                    qty: item.mnQuantityOpen_16.value,
                    um: item.sTransUOM_87.value,
                    price: item.mnAmountOpen_17.value,
                    currency: item.sBaseCurr_79.value,
                    unitPrice: item.mnUnitCost_142.value,
                    product: item.sDescription_25.value,
                    sucursal: item.sBranchPlant_34.value,
                    lote: item.sLotSerialNumber_138.value,
                    orderDate: item.dtOrderDate_90.value,
                    requestDate: item.dtRequestDate_91.value,
                    promiseDate: item.dtPromisedDelivery_92.value,
                    docType: item.sDOCType_127.value,
                    docNumber: item.mnDocumentNumber_128.value,
                    status: item.sRLastStat_126.value,
                }));

                if (rows.length > 0) {
                    //Solo proceden ordenes con estatus 620
                    const orders = rows.filter((item) => item.status === "620");

                    if (orders.length) {
                        //1er Item, para mostrar.
                        const order = orders[0];
                        this.getSucursal(order.sucursal).then((sucursal) => {
                            order.sucursal = sucursal;
                            this.setState({ order, isLoading: false, isConfirming: true });
                        });

                        const stack = {
                            stackId: response.data.stackId,
                            stateId: response.data.stateId,
                            rid: response.data.rid,
                            currentApplication: "P594312B_W594312BD",
                        }

                        this.props.dispatch(actionUpdateStack(stack));

                    } else {
                        Alert.alert("Folio pendiente de envío");
                    }

                } else {
                    Alert.alert("Folio procesado o no existe");
                    this.setState({ isLoading: false });
                }

                this.setState({ isLoading: false });

            }, (error) => console.warn(error));
        } else {
            Alert.alert("Ingrese el número de orden.");
        }
    }

    handleConfirmation = () => {
        //Se ejecuta al dar tap sobre INICIAR RECEPCIÓN.
        this.setState({ isConfirming: false, isLoading: true });

        startConfirmation(this.props.token, this.props.stack, (response) => {

            const errors = response.data.fs_P594312B_W594312BA.errors;

            if (errors.length === 0) {
                const rawRows = response.data.fs_P594312B_W594312BA.data.gridData.rowset;

                const productsToConfirm = new Map();
                const length = rawRows.length;

                for (let i = 0; i < length; i++) {
                    const key = rawRows[i].rowIndex;

                    const etiqueta = rawRows[i].mnNmeronico_598.value;
                    const itemNumber = rawRows[i].s2ndItemNumber_103.value;
                    const lote = rawRows[i].sLotSerial_46.value;

                    const value = {
                        key,
                        rowId: rawRows[i].rowIndex,
                        etiqueta: etiqueta,
                        itemNumber: rawRows[i].s2ndItemNumber_103.value,
                        qty: rawRows[i].mnQuantity_116.value,
                        qtyToPickUp: rawRows[i].mnQuantity_116.value,
                        um: rawRows[i].sTransUOM_54.value,
                        unitCost: rawRows[i].mnUnitCost_119.value,
                        amount: rawRows[i].mnAmount_117.value,
                        description: rawRows[i].sDescription_40.value,
                        branch: rawRows[i].sBranchPlant_36.value,
                        location: rawRows[i].sLocation_126.value,
                        lote: rawRows[i].sLotSerial_46.value,
                        orderType: rawRows[i].sOrTy_47.value,
                        shortNumber: rawRows[i].mnShortItemNo_104.value,
                    }

                    this.unidadMedida(itemNumber).then((conversiones) => {
                        value.conversiones = conversiones;
                    });

                    if (value.etiqueta == "0") {
                        //En caso que llegue etiqueta vacía, hay que buscar en una pantalla alterna
                        this.getArticuloEtiqueta(itemNumber, lote).then((etiqueta) => {
                            value.etiqueta = (etiqueta !== "0" ? etiqueta : 'FALTA');
                        });
                    }
                    
                    //Set MAP
                    productsToConfirm.set(key, value);

                    if (i === 0) { // 0 for the first row
                        //This moKey is for upload comments and signature
                        this.moKey = this.state.number + '|' + value.orderType
                            + '|' + rawRows[i].sOrdCo_43.value + '|' + rawRows[i].sOrdSuf_411.value;
                    }
                }

                this.props.dispatch(actionSetArticlesMap(productsToConfirm));

                this.setState({ isLoading: false, articles: productsToConfirm });

                const stack = {
                    stackId: response.data.stackId,
                    stateId: response.data.stateId,
                    rid: response.data.rid,
                    currentApplication: "P594312B_W594312BA",
                }

                this.props.dispatch(actionUpdateStack(stack));

            } else {
                this.setState({ isLoading: false });

                let mensaje = ''
                for (let error of errors)
                    mensaje += mensaje !== '' ? ', ' + error.TITLE : error.TITLE;

                //se usa el siguiente alert, porque algunas veces viene vacío aunque tiene valor
                const alert = mensaje !== '' ? mensaje : 'La orden tiene errores, no puede ser procesada';
                Alert.alert('No. de Orden ' + this.state.number,
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
    }

    confirmTransfer = () => {
        const products = this.props.articles ? this.props.articles.values() : [];

        //Sólo pasarían las lineas que confirmed es > a 0
        const confirmed = (this.state.articles ?
            Array.from(products)
            :
            [])
            .filter((item) => parseInt(item.qty) !== parseInt(item.qtyToPickUp));

        const list = [];
        for (let article of confirmed) {
            list.push({ ...article, confirmed: parseInt(article.qtyToPickUp) - parseInt(article.qty), set: "0" });
        }

        if (list.length > 0) {

            const newList = list.filter(item => parseInt(item.qtyToPickUp) == parseInt(item.confirmed));

            if (newList.length > 0) {
                this.setState({ isLoading: true });

                try {
                    transferConfirmation(this.props.token, this.props.stack, newList, (response) => {
                        console.log("transferConfirmation",response);
                        
                        let erroresP59BA = [];
                        let erroresP59BD = [];
                        let erroresP42 = [];
                        let errores = [];
                        let recibo = '';
                        
                        try {
                            const obj = response.data;
                            const myJSON = JSON.stringify(obj);
                            let responseData = myJSON;

                            if (responseData.indexOf('fs_P594312B_W594312BA') > 0){
                                erroresP59BA = response.data.fs_P594312B_W594312BA.errors;
                                errores = erroresP59BA;
                            }
                            if (responseData.indexOf('fs_P594312B_W594312BD') > 0){
                                erroresP59BD = response.data.fs_P594312B_W594312BD.errors;
                                errores = erroresP59BD;
                                recibo = response.data.fs_P594312B_W594312BD.data.txtReceiptDocument_97.value;
                                console.log("recibo",recibo);
                            }
                                
                            if (responseData.indexOf('fs_P4220_W4220C') > 0){
                                erroresP42 = response.data.fs_P4220_W4220C.errors;
                                errores = erroresP42;
                            }
                                
                          } catch (error) {
                            console.error(error);
                          }
                        
                        if (erroresP59BA.length === 0 && erroresP59BD.length === 0 && erroresP42.length === 0) {
                            //Success
                            Alert.alert('Proceso terminado ' + recibo,
                                alert, [
                                {
                                    text: "Aceptar",
                                    onPress: () => {
                                        //TEMPORAL: this.showPlaceAgreement();
                                        this.refreshScreen();
                                    }
                                }
                            ]);

                        } else {
                            this.setState({ isLoading: false });

                            let mensaje = ''
                            for (let error of errores)
                                mensaje += mensaje !== '' ? ', ' + error.TITLE : error.TITLE;

                            //se usa el siguiente alert, porque algunas veces viene vacío aunque tiene valor
                            const alert = mensaje !== '' ? mensaje : 'La orden tiene errores, no puede ser procesada';
                            Alert.alert('No. de Orden ' + this.state.number,
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
                } catch (error) {
                    console.error(error);
                }


            } else {
                Alert.alert("Solo lineas confirmadas completas");
            }

        } else {
            Alert.alert("Confirme al menos un artículo.");
        }

    }

    handleSelectRow = () => {
        //No aplica.
    }

    render() {
        const { order, isConfirming, articles } = this.state;

        const iniciar = isConfirming ?
            <Button onPress={this.handleConfirmation} title="Iniciar Recepción" />
            : null;

        const products = this.props.articles ? this.props.articles.values() : [];

        const productsArray = (this.state.articles ?
            Array.from(products)
            :
            [])
            .filter((item) => item.qty !== '0' && item.qty !== 0);


        const orderView = order ?
            <ItemView index={1} >
                <ItemHightLight text={"Orden " + order.order} />
                <ItemLabel text={"Sucursal: " + order.sucursal} />
                <View style={styles.linea}>
                    <View style={{ width: "60%" }}>
                        <ItemLabel text={"Fecha solicitud: " + order.orderDate} />
                    </View>
                    <View style={{ width: "40%" }}>
                        <ItemLabel text={"Tipo de Orden : " + order.orderType} />
                    </View>
                </View>
                <View style={styles.linea}>
                    <View style={{ width: "60%" }}>
                        <ItemLabel text={"Tipo de Documento: " + order.docType} />
                    </View>
                    <View style={{ width: "40%" }}>
                        <ItemLabel text={"Doc #: " + order.docNumber} />
                    </View>
                </View>
                <View style={styles.linea}>
                    <View style={{ width: "60%" }}>
                        <ItemLabel text={"Estatus: " + order.status} />
                    </View>
                    <View style={{ width: "40%" }}>
                        <ItemLabel text={''} />
                    </View>
                </View>
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
                            label="No. de Orden"
                            autoFocus
                            placeholder={"####"}
                            keyboardType={"numeric"}
                            onChangeText={(text) => this.setState({ number: text })}
                            defaultValue={this.state.number}
                            onSubmitEditing={this.handleSearchOrder}
                            blurOnSubmit={true}
                        />

                        {orderView}

                        {
                            this.state.articles ?
                                //Confirmar recepción
                                <Button
                                    title="Confirmar Recepción"
                                    onPress={this.confirmTransfer}
                                />
                                : null
                        }

                        <FlatList data={productsArray}
                            renderItem={({ item, index }) =>
                                <TouchableOpacity key={item.key} index={index} >
                                    <ItemView index={index} >
                                        <View style={styles.linea}>
                                            <View style={{ width: "55%" }}>
                                                <ItemHightLight text={"Etiqueta: " + item.etiqueta} />
                                            </View>
                                            <View style={{ width: "45%" }}>
                                                <ItemLabel text={"Catálogo: " + item.shortNumber} />
                                            </View>
                                        </View>
                                        <ItemLabel text={"Producto: " + item.description} />
                                        <View style={styles.linea}>
                                            <View style={{ width: "45%" }}>
                                                <ItemHightLight text={"Pendiente: " + item.qty + " " + item.um} />
                                            </View>
                                            <View style={{ width: "55%" }}>
                                                <ItemHightLight text={"Confirmado: " + (item.qtyToPickUp - item.qty + " " + item.um)} />
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
export default connect(mapStateToProps)(ConfirmTransfer);