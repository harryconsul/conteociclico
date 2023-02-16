import React from 'react';
import {
    View, FlatList, ImageBackground, Text,
    StyleSheet, ActivityIndicator, TouchableOpacity, Alert,
} from 'react-native';
import { connect } from 'react-redux';
import { Navigation } from 'react-native-navigation';
import { ItemView, ItemLabel } from '../components';
import { componentstyles } from '../styles';
import Field from '../components/Field';
import backgroundImage from '../assets/labmicroBg.jpg';
import { queryArticleByNumber } from '../apicalls/query.operation';
import { BusinessUnit } from '../components/BusinessUnit';
import { actionSetTransactionMode } from '../store/actions/actions.creators';
import { transactionModes } from '../constants';
import { productName } from '../apicalls/product_name.operations';

const initialState = {
    producto: '',
    productoNombre: '',
    unidad: '',
    unidadNombre: '',
    rows: [],
    isLoading: false,
    articleRef: React.createRef(),

}

class QueryAvailableArticles extends React.Component {

    constructor(props) {
        super(props);
        Navigation.events().bindComponent(this);

        this.state = {
            ...initialState
        }
    }

    navigationButtonPressed({ buttonId }) {
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
        this.props.dispatch(actionSetTransactionMode(transactionModes.READ_RETURN));

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
                this.setState({ producto: search.value }, this.search);
            }


        }
    }

    unidadNegocio = (unidad) => {
        //Los datos de esta función, se alimentan desde BusinessUnit
        this.setState({ unidad });
    }

    getProductName = (producto) => {
        return new Promise((resolve, reject) => {
            productName(producto, this.props.token, (data) => {

                const rawRows = data.fs_P40ITM1_W40ITM1A.data.gridData.rowset

                if (rawRows.length != 0) {
                    const respuesta = {
                        producto: rawRows[0].sItemMasterDescription_28.value,
                        existe: true,
                    }
                    resolve(respuesta);
                } else {
                    const respuesta = {
                        producto: 'PRODUCTO NO ENCONTRADO',
                        existe: false,
                    }
                    resolve(respuesta);
                }

            }, (reason) => reject(reason));
        });
    }

    search = () => {
        const { unidad, producto } = this.state;
        //Obligatorios: unidad de negocio y producto
        if (unidad != '' && producto != '') {
            this.setState({ isLoading: true });

            this.getProductName(producto).then((respuesta) => {
                if (respuesta.existe) {
                    this.setState({ productoNombre: respuesta.producto });
                    queryArticleByNumber(unidad, producto, this.props.user.token, (data) => {

                        const rawRows = data.fs_P41202_W41202A.data.gridData.rowset;
                        console.warn(rawRows);

                        if (rawRows.length != 0) {
                            const allRows = rawRows.map((item) => ({
                                rowId: item.rowIndex,
                                ubicacion: item.sLocation_62.value,
                                ubicacionPS: item.chPS_12.value,
                                ubicacionSinFormato: item.sUnformattedLocation_10.value,
                                lote: item.sLotSerial_11.value,
                                caducidad: item.dtFechaCaducidad_508.value,
                                comprometido: item.mnCommitted_48.value,
                                disponible: item.mnAvailable_47.value,
                                existenciasFisicas: item.mnOnHand_13.value,
                                ultimaRecepcion: item.dtLastRcptDate_276.value,
                                ventasABC: item.chABC3Inv_509.value,
                            }));

                            const rows = allRows.filter(row => {
                                return row.ubicacionPS != '';
                            });

                            this.setState({ rows });
                        } else {
                            Alert.alert('Artículo no encontrado, valide sus datos');
                        }

                        this.setState({ isLoading: false });
                    });

                } else {
                    Alert.alert('No existe el producto');
                }
            });

        } else {
            Alert.alert('Ingrese la unidad de negocio y producto');
        }
    }

    componentDidMount() {
        /*if (this.props.notScreen) {
            this.state.articleRef.current.focus();
        }*/
    }

    render() {
        return (
            <ImageBackground source={this.props.notScreen ? null : backgroundImage} style={componentstyles.background}>
                <View style={{ ...componentstyles.containerView, width: '100%', margin: 5 }}>
                    {
                        this.state.isLoading ?
                            <ActivityIndicator color="#ffffff"
                                animating={this.state.isLoading} size={"large"} />
                            :
                            null
                    }
                    <View>
                        <BusinessUnit token={this.props.user.token}
                            label={"Unidad de Negocio"} placeholder={"####"}
                            defaultValue={this.props.businessUnit}
                            defaultValueNombre={this.props.businessUnitNombre}
                            unidad={this.unidadNegocio} />

                    </View>
                    <View>
                        <Field
                            onChangeText={(text) => this.setState({ producto: text })}
                            onSubmitEditing={this.search}
                            defaultValue={this.state.producto}
                            inputRef={this.state.articleRef}
                            placeholder="#####" label="Número artículo" />
                    </View>
                    {
                        this.state.productoNombre ?
                            <Text style={{ color: 'white' }}>
                                {
                                    this.state.productoNombre
                                }
                            </Text>
                            :
                            null
                    }

                    {
                        this.state.rows ?
                            <FlatList data={this.state.rows}
                                renderItem={({ item, index }) =>
                                    <TouchableOpacity key={item.rowId}
                                        onPress={this.props.handleClickRow ? () => this.props.handleClickRow(item) : null} >
                                        <ItemView index={index} >
                                            <View style={styles.linea}>
                                                <View style={{ width: "100%" }}>
                                                    <ItemLabel text={"Ubicación: " + item.ubicacionPS + " - " + item.ubicacion} />
                                                </View>
                                            </View>
                                            <View style={styles.linea}>
                                                <View style={{ width: "100%" }}>
                                                    <ItemLabel text={"Lote: " + item.lote} />
                                                </View>
                                            </View>
                                            <View style={styles.linea}>
                                                <View style={{ width: "100%" }}>
                                                    <ItemLabel text={"Caducidad: " + item.caducidad} />
                                                </View>
                                            </View>
                                            <View style={styles.linea}>
                                                <View style={{ width: "33%" }}>
                                                    <ItemLabel style={{ fontWeight: 'bold', }} text={"Disp.: " + item.disponible } />
                                                </View>
                                                <View style={{ width: "33%" }}>
                                                    <ItemLabel style={{ fontWeight: 'bold', }} text={"Comp.: " + item.comprometido} />
                                                </View>
                                                <View style={{ width: "34%" }}>
                                                    <ItemLabel style={{ fontWeight: 'bold', }} text={"Exist.: " + item.existenciasFisicas} />
                                                </View>
                                            </View>

                                        </ItemView>
                                    </TouchableOpacity>
                                } />
                            :
                            null
                    }
                </View>
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
        marginLeft: 7,
        marginRight: 7,
    },
    titulo: {
        color: "#ffffff",
        fontSize: 16,
        fontWeight: 'bold',
    },
    shadow: {
        shadowColor: 'black',
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 6,
        shadowOpacity: 0.5,
        backgroundColor: 'transparent',
        elevation: 5,
        padding: 10,
        borderRadius: 10,
    },
    header: {
        width: '100%',
        height: 45,
        padding: 5,
        backgroundColor: 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        color: 'white',
        fontSize: 20,

    }

});

export default connect(mapStateToProps)(QueryAvailableArticles);
