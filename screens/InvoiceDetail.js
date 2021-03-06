import React from 'react';
import {
    View, Text, Button, FlatList,
    ImageBackground, StyleSheet, TouchableOpacity,
    ActivityIndicator, KeyboardAvoidingView, Alert,
} from 'react-native';
import { ItemView, ItemHightLight, ItemLabel } from '../components'
import { connect } from 'react-redux';
import { Navigation } from 'react-native-navigation';
import backgroundImage from '../assets/labmicroBg.jpg';
import { componentstyles } from '../styles';
import closeIcon from '../assets/iconclose.png';
import iconbarcode from '../assets/iconbarcode.png';
import icondeliver from '../assets/icondeliver.png';
import { transactionModes } from '../constants';
import {
    actionUpdateStack, actionSetTransactionMode, actionSetArticlesMap,
    actionSetSucursal, actionSetInvoiceDetail
} from '../store/actions/actions.creators';
import { saveDocument } from '../apicalls/delivery.operations';

const initialState = {
    isLoading: false,
    signed: false,
}

class InvoiceDetail extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            ...initialState
        }

        Navigation.events().bindComponent(this);
    }

    componentDidMount = () => {
        Navigation.mergeOptions(this.props.componentId, {
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
                visible: true,
                rightButtons: [
                    {
                        id: 'close',
                        icon: closeIcon,
                    },
                    {
                        id: 'barcode',
                        icon: iconbarcode,
                    },
                    {
                        id:'deliver',
                        icon:icondeliver,
                    }
                ]


            },
        });
    }

    componentDidAppear = () => {
        //se ejecutara en true, después de cerrar el modal de la firma
        const { signed } = this.state;
        if (signed){
            this.props.afterSigned(true);
            this.close();
        }
    }

    close = () => {
        Navigation.dismissModal(this.props.componentId);
    }

    closeAfterSign = (respuesta) => {
        this.setState({ signed: respuesta })
    }

    openModalForSignature = () => {

        Navigation.showModal({
            stack: {
                children: [
                    {
                        component: {
                            name: "DeliverySignature",
                            passProps: {
                                itemKey: "|" + this.props.tipoFactura + "|" + this.props.factura,
                                closeAfterSign: this.closeAfterSign,
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

    openBarcode = (screen) => {
        if (this.props.articles)
            this.props.dispatch(actionSetTransactionMode(transactionModes.READ_SUBTRACT));

        Navigation.showModal({
            stack: {
                children: [
                    {
                        component: {
                            name: screen,
                            passProps: {
                                qtyLabel: "Entrega",
                            }
                        },
                        options: {
                            topBar: {
                                title: {
                                    text: 'Captura Código de Barras'
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

    deliverAll = () => {
        //Deliver all document items, without scanning.
        const factura = this.props.factura;
        const facturaDetalle = this.props.articles ? this.props.articles.values() : [];
        const delivered = (Array.from(facturaDetalle));
        const list = [];
        for (let article of delivered) {
            const entregado = article.ordenado
            list.push({ ...article, entregado });
        }
        this.setState({ isLoading: true });
        if (list.length !== 0) {
            saveDocument(this.props.token, this.props.stack, list, (response) => {
                this.openModalForSignature();
            });
        } else {
            const alert = 'No hay artículos pendientes de entregar';
            Alert.alert('Documento ' + factura,
                alert, [
                {
                    text: "Aceptar",
                    onPress: () => {
                    }
                }
            ]);
        }
        this.setState({ isLoading: false });
    }

    navigationButtonPressed = ({ buttonId }) => {
        switch (buttonId) {
            case 'close':
                this.close();
                break;
            case 'barcode':
                this.openBarcode('PickupBarcodeInput');
            case 'deliver':
                this.deliverAll();
        }
    }

    saveDocument = () => {
        const factura = this.props.factura;
        const facturaDetalle = this.props.articles ? this.props.articles.values() : [];
        const delivered = (Array.from(facturaDetalle)).filter((item) => item.ordenado != item.qty);
        const list = [];
        for (let article of delivered) {
            const entregado = article.ordenado - article.qty
            list.push({ ...article, entregado });
        }
        this.setState({ isLoading: true });
        if (list.length !== 0) {

            saveDocument(this.props.token, this.props.stack, list, (response) => {
                this.openModalForSignature();

            });
        } else {
            const alert = 'No ha entregado ningún artículo';
            Alert.alert('Documento ' + factura,
                alert, [
                {
                    text: "Aceptar",
                    onPress: () => {
                    }
                }
            ]);
        }
        this.setState({ isLoading: false });
    }

    render() {
        const facturaDetalle = this.props.articles ? this.props.articles.values() : [];
        const detailArray = (Array.from(facturaDetalle)).filter((item) => item.qty);
        const total = this.props.lineas;
        const subtotal = detailArray.length;

        const factura = this.props.factura;
        const cliente = this.props.cliente;

        const facturaView = factura ?
            <ItemView index={1} >
                <View style={styles.linea}>
                    <View style={{ width: "33%" }}>
                        <ItemHightLight text={"Doc.: " + factura} />
                    </View>
                    <View style={{ width: "67%" }}>
                        <ItemHightLight text={cliente} />
                    </View>
                </View>
                <ItemLabel text={"Lineas entregadas: " + (total - subtotal) + " de " + total} />
                <Button
                    title="GRABAR ENTREGA"
                    onPress={this.saveDocument}
                />
            </ItemView>
            :
            null;
        return (
            <ImageBackground source={backgroundImage} style={componentstyles.background}>
                <KeyboardAvoidingView
                    style={{ height: "100%", width: "100%" }} keyboardVerticalOffset={20} behavior="padding">
                    <View style={componentstyles.containerView}>
                        {
                            this.state.isLoading ?
                                <ActivityIndicator color="#ffffff"
                                    animating={true} size={"large"} />
                                :
                                null
                        }
                        {facturaView}
                        <FlatList data={detailArray}
                            renderItem={({ item, index }) =>
                                <TouchableOpacity index={index.toString()}>
                                    <ItemView index={index} >
                                        <ItemLabel text={"Etiqueta: " + item.etiqueta} />
                                        <ItemHightLight text={item.articuloDesc} />
                                        <View style={styles.linea}>
                                            <View style={{ width: "50%" }}>
                                                <ItemHightLight text={"Ordenado: " + item.ordenado + " " + item.um} />
                                            </View>
                                            <View style={{ width: "50%" }}>
                                                <ItemHightLight text={"Entregado: " + (item.ordenado - item.qty)} />
                                            </View>
                                        </View>


                                    </ItemView>
                                </TouchableOpacity>

                            } />
                    </View>
                </KeyboardAvoidingView>
            </ImageBackground >
        )
    }

}

const mapStateToProps = state => {
    return {
        user: state.user,
        token: state.user.token,
        articles: state.articles,
        sucursal: state.sucursal,
        stack: state.stack,
    };
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

export default connect(mapStateToProps)(InvoiceDetail);