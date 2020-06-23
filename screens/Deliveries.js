import React from 'react';
import {
    View, Text, Button, FlatList,
    ImageBackground, StyleSheet, TouchableOpacity,
    ActivityIndicator, KeyboardAvoidingView, Alert,
} from 'react-native';
import { searchRoute, selectInvoice, searchUser } from '../apicalls/delivery.operations';
import { connect } from 'react-redux';
import { Navigation } from 'react-native-navigation';
import Field from '../components/Field';
import { ItemView, ItemHightLight, ItemLabel } from '../components'
import {
    actionUpdateStack, actionSetTransactionMode, actionSetArticlesMap,
    actionSetSucursal, actionSetInvoiceDetail
} from '../store/actions/actions.creators';
import { transactionModes } from '../constants'
import { componentstyles } from '../styles';
import backgroundImage from '../assets/labmicroBg.jpg';
import { unidadMedida } from '../apicalls/business_unit.operations';
import iconRefresh from '../assets/iconrefresh.png';

const initialState = {
    isLoading: false,
    facturas: null,
    signed: false,
}

class Deliveries extends React.Component {
    constructor(props) {
        super(props);
        Navigation.events().bindComponent(this);

        this.state = {
            ...initialState, ruta: null,
        }
    }

    componentDidMount = () => {
        this.setState({ isLoading: true });
        const user = this.props.user.username;
        searchUser(user, this.props.token, (response) => {

            const errors = response.data.fs_P0092_W0092D.errors;

            if (errors.length === 0) {
                const rawRows = response.data.fs_P0092_W0092D.data.gridData.rowset;

                if (rawRows.length === 1) {
                    const ruta = {
                        user: rawRows[0].sUserID_7.value,
                        userNumber: rawRows[0].mnAddressNumber_60.value,
                        userName: rawRows[0].sRoleDescription_99.value,
                    }

                    this.setState({ ruta });
                }

            } else {
                let mensaje = ''
                for (let error of errors)
                    mensaje += mensaje !== '' ? ', ' + error.TITLE : error.TITLE;

                //se usa el siguiente alert, porque algunas veces viene vacío aunque tiene valor
                const alert = mensaje !== '' ? mensaje : 'No fue posible recuperar el no. de ruta';
                Alert.alert('No. de Ruta ' + ruta,
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
        this.setState({ isLoading: false });

        Navigation.mergeOptions(this.props.componentId, {
            topBar: {
                title: {
                    text: 'Entrega de Documentos'
                },
                drawBehind: true,
                background: {
                    color: '#8c30f1c7',
                    translucent: true,
                    blur: false
                },
                visible: true,
                rightButtons: [
                    {
                        id: 'refresh',
                        icon: iconRefresh,
                    },
                ]


            },
        });
    }

    componentDidAppear = () => {
        //se ejecutara en true, después de cerrar el modal de la firma
        const { signed } = this.state;
        if (signed)
            this.searchRuta();
    }

    navigationButtonPressed = ({ buttonId }) => {
        switch (buttonId) {
            case 'sideMenu':
                this.openSideBar();
                break;
            case 'refresh':
                this.refreshScreen();
                break;
        }
    }

    refreshScreen = () => {
        this.setState({ ...initialState });
        //this.props.dispatch(actionSetArticlesMap(new Map()));
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

    afterSigned = (respuesta) => {
        this.setState({ signed: respuesta });
    }

    openInvoiceDetail = (factura,cliente,lineas,rutaUsuario,tipoFactura) => {
        Navigation.showModal({
            stack: {
                children: [
                    {
                        component: {
                            name: "InvoiceDetail",
                            passProps: {
                                factura: factura,
                                cliente: cliente,
                                lineas: lineas,
                                rutaUsuario,
                                tipoFactura,
                                afterSigned: this.afterSigned,
                            }
                        },
                        options: {
                            topBar: {
                                title: {
                                    text: 'Detalle del Documento'
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

    searchRuta = () => {
        const { ruta } = this.state;

        if (ruta !== null) {
            this.setState({ isLoading: true });

            searchRoute(ruta.userNumber, this.props.token, (response) => {
                //Validar que no haya errores
                const errors = response.data.fs_P55R4202_W55R4202B.errors;

                if (errors.length === 0) {
                    
                    const rawRows = response.data.fs_P55R4202_W55R4202B.data.gridData.rowset;
                    
                    const facturas = rawRows.map((item) => ({
                        rowId: item.rowIndex,
                        ruta: item.mnNmeroRuta_24.value,
                        factura: item.mnNmeroFactura_25.value,
                        tipoFactura: item.sTipoFactura_26.value,
                        fechaFactura: item.dtFechaFactura_27.value,
                        numeroCliente: item.mnNmeroCliente_28.value,
                        nombreCliente: item.sNombreCliente_29.value,
                        recibe: item.sNombredequienRecibe_35.value,
                    }));

                    const stack = {
                        stackId: response.data.stackId,
                        stateId: response.data.stateId,
                        rid: response.data.rid,
                        currentApplication: "P55R4202_W55R4202B",
                    }

                    this.props.dispatch(actionUpdateStack(stack));

                    if (facturas.length != 0) {
                        this.setState({ facturas })
                    } else {
                        Alert.alert("Ruta " + ruta.user + " sin pendientes de entrega");
                    }
                } else {
                    let mensaje = ''
                    for (let error of errors)
                        mensaje += mensaje !== '' ? ', ' + error.TITLE : error.TITLE;

                    //se usa el siguiente alert, porque algunas veces viene vacío aunque tiene valor
                    const alert = mensaje !== '' ? mensaje : 'La ruta tiene errores, no puede ser procesada';
                    Alert.alert('No. de Ruta ' + ruta,
                        alert, [
                        {
                            text: "Aceptar",
                            onPress: () => {
                                this.refreshScreen();
                            }
                        }
                    ]);
                }
                this.setState({ isLoading: false });

            }, (error) => console.warn(error));
            this.setState({ isLoading: false });
        }
    }

    selectRow = (row, factura, cliente,rutaUsuario,tipoFactura) => {
        selectInvoice(row, this.props.token, this.props.stack, (response) => {
            const errors = response.data.fs_P55R4202_W55R4202A.errors;
            if (errors.length === 0) {
                const rawRows = response.data.fs_P55R4202_W55R4202A.data.gridData.rowset;

                const toDeliver = new Map();
                
                for (let i = 0; i < rawRows.length; i++) {
                    const key = rawRows[i].rowIndex;
                    const etiqueta = rawRows[i].mnNmeroEtiqueta_31.value;
                    const itemNumber = rawRows[i].sIdArticulo_23.value;
                    const entregado = 0;//rawRows[i].mnCantidadSurtida_28.value

                    const value = {
                        key,
                        rowId: "1." + String(rawRows[i].rowIndex),
                        etiqueta: etiqueta !== "0" ? etiqueta : 'FALTA',
                        linea: rawRows[i].mnLinea_34.value,
                        itemNumber: itemNumber,
                        articuloDesc: rawRows[i].sDescripcinArticulo_25.value,
                        ordenado: rawRows[i].mnCantidadOdenada_20.value,
                        qty: rawRows[i].mnCantidadOdenada_20.value,
                        qtyToPickUp: rawRows[i].mnCantidadOdenada_20.value,
                        entregado: entregado,
                        um: rawRows[i].sUniMed_26.value,
                        precio: rawRows[i].mnPrecio_27.value,
                        observaciones: rawRows[i].sObservacionesdeEntrega_29.value,
                    }

                    this.unidadMedida(itemNumber).then((conversiones) => {
                        value.conversiones = conversiones;
                    });

                    toDeliver.set(key, value);
                }
                
                this.props.dispatch(actionSetArticlesMap(toDeliver));

                const stack = {
                    stackId: response.data.stackId,
                    stateId: response.data.stateId,
                    rid: response.data.rid,
                    currentApplication: "P55R4202_W55R4202A",
                }

                this.props.dispatch(actionUpdateStack(stack));

                this.openInvoiceDetail(factura,cliente,rawRows.length,rutaUsuario,tipoFactura);
            } else {
                let mensaje = ''
                for (let error of errors)
                    mensaje += mensaje !== '' ? ', ' + error.TITLE : error.TITLE;

                //se usa el siguiente alert, porque algunas veces viene vacío aunque tiene valor
                const alert = mensaje !== '' ? mensaje : 'El documento ' + factura + ' tiene observaciones';
                Alert.alert('Documento ' + factura,
                    alert, [
                    {
                        text: "Aceptar",
                        onPress: () => {
                        }
                    }
                ]);
            }

        }, (error) => console.warn(error))
    }
    render() {
        const { ruta, facturas } = this.state;

        const routeView = ruta ?
            <ItemView index={1} >
                <View style={styles.linea}>
                    <View style={{ width: "60%" }}>
                        <ItemHightLight text={"Usuario: " + ruta.user} />
                    </View>
                    <View style={{ width: "40%" }}>
                        <ItemHightLight text={"No.: " + ruta.userNumber} />
                    </View>
                </View>
                <ItemHightLight text={ruta.userName} />
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
                        {
                            routeView
                        }
                        {
                            <Button
                                title="BUSCAR DOCUMENTOS"
                                onPress={this.searchRuta}
                            />
                        }
                        <FlatList data={facturas}
                            renderItem={({ item, index }) =>
                                <TouchableOpacity onPress={() => this.selectRow(item.rowId, item.factura, item.nombreCliente,ruta.userNumber,item.tipoFactura)} key={item.rowId} index={index.toString()}>
                                    <ItemView index={index} >
                                        <View style={styles.linea}>
                                            <View style={{ width: "55%" }}>
                                                <ItemHightLight text={"Documento: " + item.factura} />
                                            </View>
                                            <View style={{ width: "45%" }}>
                                                <ItemHightLight text={"Tipo Doc: " + item.tipoFactura} />
                                            </View>
                                        </View>
                                        <ItemLabel text={"Fecha: " + item.fechaFactura} />
                                        <View style={styles.linea}>
                                            <View style={{ width: "40%" }}>
                                                <ItemHightLight text={"Cliente: " + item.numeroCliente} />
                                            </View>
                                            <View style={{ width: "60%" }}>
                                                <ItemHightLight text={item.nombreCliente} />
                                            </View>
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
    },
    linea: {
        flexDirection: 'row',
        justifyContent: "space-between",
    },
});

export default connect(mapStateToProps)(Deliveries);