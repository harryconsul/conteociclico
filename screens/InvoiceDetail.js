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


class InvoiceDetail extends React.Component {

    constructor(props) {
        super(props);
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
                ]


            },
        });
    }

    close = () => {
        Navigation.dismissModal(this.props.componentId);
    }

    openBarcode = (screen) => {
        
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

    navigationButtonPressed = ({ buttonId }) => {
        switch (buttonId) {
            case 'close':
                this.close();
                break;
            case 'barcode':
                this.openBarcode('PickupBarcodeInput');
        }
    }

    render() {
        const facturaDetalle = this.props.articles ? this.props.articles.values() : [];
        const detailArray = Array.from(facturaDetalle);
        
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
            </ItemView>
            :
            null;
        return (
            <ImageBackground source={backgroundImage} style={componentstyles.background}>
                <KeyboardAvoidingView
                    style={{ height: "100%", width: "100%" }} keyboardVerticalOffset={20} behavior="padding">
                    <View style={componentstyles.containerView}>
                        {facturaView}
                        <FlatList data={detailArray}
                            renderItem={({ item, index }) =>
                                <TouchableOpacity index={index.toString()}>
                                    <ItemView index={index} >
                                        <ItemLabel text={"Etiqueta: " + item.etiqueta} />
                                        <ItemHightLight text={item.articuloDesc} />
                                        <View style={styles.linea}>
                                            <View style={{ width: "50%" }}>
                                                <ItemHightLight text={"Ordenado: " + item.qty + " " + item.um} />
                                            </View>
                                            <View style={{ width: "50%" }}>
                                                <ItemHightLight text={"Entregado: " + item.entregado} />
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