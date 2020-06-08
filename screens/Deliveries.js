import React from 'react';
import {
    View, Text, Button, FlatList,
    ImageBackground, StyleSheet, TouchableOpacity,
    ActivityIndicator, KeyboardAvoidingView, Alert,
} from 'react-native';
import { searchRoute, selectInvoice } from '../apicalls/delivery.operations';
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
import { businessUnit, unidadMedida } from '../apicalls/business_unit.operations';
import iconRefresh from '../assets/iconrefresh.png';

const initialState = {
    isLoading: false,
    ruta: '',
    facturas: null,
    facturaDetalle: null,
}

class Deliveries extends React.Component {
    constructor(props) {
        super(props);
        Navigation.events().bindComponent(this);

        this.state = {
            ...initialState
        }
    }

    componentDidMount = () => {
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

    openInvoiceDetail = () => {
        Navigation.showModal({
            stack: {
                children: [
                    {
                        component: {
                            name: "InvoiceDetail",
                            passProps: {
                                qtyLabel: "Recolectado",
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

    searchRuta = () => {
        const { ruta } = this.state;

        if (ruta !== "") {
            this.setState({ isLoading: true });
            searchRoute(ruta, this.props.token, (response) => {
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
                        Alert.alert("Ruta " + ruta + " sin pendientes de entrega");
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
    selectRow = (row, factura) => {
        selectInvoice(row, this.props.token, this.props.stack, (response) => {
            const errors = response.data.fs_P55R4202_W55R4202A.errors;
            if (errors.length === 0) {
                const rawRows = response.data.fs_P55R4202_W55R4202A.data.gridData.rowset;

                const toDeliver = new Map();

                for (let i = 0; i < rawRows.length; i++) {
                    const key = rawRows[i].rowIndex;

                    const value = {
                        key,
                        rowId: rawRows[i].rowIndex,
                        linea: rawRows[i].mnLinea_34.value,
                        etiqueta: rawRows[i].mnNmeroEtiqueta_31.value,
                        articuloId: rawRows[i].sIdArticulo_23.value,
                        articuloDesc: rawRows[i].sDescripcinArticulo_25.value,
                        um: rawRows[i].sUniMed_26.value,
                        precio: rawRows[i].mnPrecio_27.value,
                        ordenado: rawRows[i].mnCantidadOdenada_20.value,
                        entregado: rawRows[i].mnCantidadSurtida_28.value,
                        observaciones: rawRows[i].sObservacionesdeEntrega_29.value,
                    }

                    toDeliver.set(key, value);
                }

                console.warn('Deliver', toDeliver);
                this.props.dispatch(actionSetArticlesMap(toDeliver));
                //this.props.dispatch(actionSetInvoiceDetail(toDeliver));

                const stack = {
                    stackId: response.data.stackId,
                    stateId: response.data.stateId,
                    rid: response.data.rid,
                    currentApplication: "P55R4202_W55R4202A",
                }

                this.props.dispatch(actionUpdateStack(stack));

                //this.openInvoiceDetail();
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
        const { facturas } = this.state;

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
                            label="No. de Ruta"
                            autoFocus
                            placeholder={"####"}
                            keyboardType={"numeric"}
                            onChangeText={(ruta) => this.setState({ ruta })}
                            defaultValue={this.state.ruta}
                            onSubmitEditing={this.searchRuta}
                            blurOnSubmit={true}
                        />

                        <FlatList data={facturas}
                            renderItem={({ item, index }) =>
                                <TouchableOpacity onPress={() => this.selectRow(item.rowId, item.factura)} key={item.rowId} index={index.toString()}>
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
        facturaDetalle: state.facturaDetalle,
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