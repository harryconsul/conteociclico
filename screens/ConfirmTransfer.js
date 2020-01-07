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
import { searchOrder, startConfirmation } from '../apicalls/confirm_transfer.operations';
import { actionUpdateStack, actionSetTransactionMode, actionSetArticlesMap, actionSetArticle } from '../store/actions/actions.creators';
import { transactionModes } from '../constants'
import { componentstyles } from '../styles';
import backgroundImage from '../assets/labmicroBg.jpg';
import { businessUnit } from '../apicalls/business_unit.operations';

const initialState = {
    isLoading: false,
    order: null,
    articles: null,
    number: 0,
    isConfirming: true,
    lineas: 0,
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
                                qtyLabel: "Cantidad Pendiente por Recibir",
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

                if (rows.length) {
                    //Solo proceden ordenes con estatus 620
                    const orders = rows.filter(row => {
                        return row.status === "620";
                    });

                    if (orders.length) {
                        const order = orders[0];
                        this.getSucursal(order.sucursal).then((sucursal) => {
                            order.sucursal = sucursal;
                            this.setState({ order, isLoading: false, isConfirming: true });
                        })

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

            const rawRows = response.data.fs_P594312B_W594312BA.data.gridData.rowset;
            console.warn('data: ', rawRows);

            const productsToConfirm = new Map();

            const length = rawRows.length;

            for (let i = 0; i < length; i++) {
                const key = rawRows[i].mnShortItemNo_104.value;

                const value = {
                    key,
                    rowId: rawRows[i].rowIndex,
                    auxNumber: rawRows[i].s2ndItemNumber_103.value,
                    qty: rawRows[i].mnQuantity_116.value,
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

                productsToConfirm.set(key, value);
            }

            this.props.dispatch(actionSetArticlesMap(productsToConfirm));

            this.setState({ isLoading: false, articles: productsToConfirm, lineas: length });

            const stack = {
                stackId: response.data.stackId,
                stateId: response.data.stateId,
                rid: response.data.rid,
                currentApplication: "P594312B_W594312BA",
            }

            this.props.dispatch(actionUpdateStack(stack));
        });
    }

    confirmShipment = () => {
        Alert.alert('Articles ' , this.props.articles);
    }

    handleSelectRow = () => {
        //No aplica.
    }

    render() {
        const { order, isConfirming, articles, lineas } = this.state;

        const iniciar = isConfirming ?
            <Button onPress={this.handleConfirmation} title="Iniciar Recepción" />
            : null;

        const products = this.props.articles ? this.props.articles.values() : [];

        const productsArray = (this.state.articles ?
            Array.from(products)
            :
            [])
            .filter((item) => item.qty);


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
                        />

                        {orderView}

                        {
                            this.state.articles ?
                                //Confirmar recepción
                                <Button
                                    title="Confirmar Recepción"
                                    onPress={this.confirmShipment}
                                />
                                : null
                        }

                        <FlatList data={productsArray}
                            renderItem={({ item, index }) =>
                                <TouchableOpacity key={item.key} index={index} >
                                    <ItemView index={index} >
                                        <View style={styles.linea}>
                                            <View style={{ width: "33%" }}>
                                                <ItemLabel text={"No. " + item.auxNumber} />
                                            </View>
                                            <View style={{ width: "67%" }}>
                                                <ItemLabel text={"Catálogo: " + item.shortNumber} />
                                            </View>
                                        </View>
                                        <ItemLabel text={"Producto: " + item.description} />
                                        <ItemLabel text={"Cantidad: " + item.qty + " " + item.um} />
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