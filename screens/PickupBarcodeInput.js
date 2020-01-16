import React from 'react';
import {
    View, StyleSheet, Alert, KeyboardAvoidingView
    , ImageBackground
} from 'react-native';
import Field from '../components/Field';
import { ArticleCard,ArticleScanMode } from '../components'
import { connect } from 'react-redux';
import { Navigation } from 'react-native-navigation';
import { actionSetArticle } from '../store/actions/actions.creators';
import { transactionModes } from '../constants';
import backgroundImage from '../assets/labmicroBg.jpg';
import closeIcon from '../assets/iconclose.png';
import { componentstyles } from '../styles';
import { queryArticle } from '../apicalls/query.operation';

class PickupBarcodInput extends React.Component {
    constructor(props) {
        super(props);
        Navigation.events().bindComponent(this);
        this.state = {
            editingItem: null,
            isEditing: false,
            qty: 0,
            articleRef: React.createRef(),
            searchCode: "",
            confirmMode: false,
        }

    }

    componentDidMount = () => {
        Navigation.mergeOptions(this.props.componentId, {
            topBar: {
                title: {
                    text: 'Lectura de Codigo de Barras'
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
                    }
                ]


            },
        });

        
    }
    handleAccept = () => {
        const { editingItem, qty } = this.state;
        const item = {
            ...editingItem,
            qty: this.props.transactionMode === transactionModes.READ_SUBTRACT
                ? editingItem.qtyToPickUp - qty
                : qty,
        };




        this.props.dispatch(actionSetArticle(item));

        this.setState(
            {
                editingItem: null,
                searchCode: "",
                isEditing: false,
                qty: 0,


            }, () => this.state.articleRef.current.focus()
        );



    }

    producto = (etiqueta) => {
        return new Promise((resolve, reject) => {
            queryArticle(this.props.sucursal, this.state.searchCode, this.props.user.token, (data) => {
                const rawRows = data.fs_P5541001_W5541001A.data.gridData.rowset;

                const productos = rawRows.map((item, index) => ({
                    key: index,
                    etiqueta: item.mnNmeronico_24.value,
                    producto: item.sDescription_38.value,
                    unidadNegocio: item.sBusinessUnit_48.value,
                    ubicacion: item.sLocation_55.value,
                    disponible: item.mnQuantityOnHand_46.value,
                    existencia: item.mnQuantitySinCalcular_57.value,
                    comprometido: item.mnQuantityHardCommitted_58.value,
                    caducidad: item.dtExpirationDateMonth_53.value,
                    lote: item.sLotSerialNumber_37.value,
                    um: item.sUM_54.value,
                    catalogo: item.s2ndItemNumber_33.value,
                }));

                if (productos.length > 0) {
                    const producto = productos[0];
                    resolve(producto);
                } else {
                    resolve([]);
                }



            });
        }, (reason) => reject(reason));
    }

    barCodeHandler = () => {
        //Get the item
        if (this.props.transactionMode === transactionModes.READ_RETURN) {
            const item = {
                key: "search",
                value: this.state.searchCode,
            }
            this.props.dispatch(actionSetArticle(item));
            Navigation.dismissModal(this.props.componentId);

        } else {
            //Buscar el producto en JD
            this.producto().then((producto) => {
                const products = this.props.list ? this.props.list.values() : [];

                const filtrados = (this.props.list ?
                    Array.from(products)
                    :
                    [])
                    .filter((item) => item.catalogo === producto.catalogo && item.lote === producto.lote);

                //lote,um,catalogo
                console.warn('filtrados', filtrados);
                for (let i = 0; i < filtrados.length; i++) {
                    const linea = filtrados[i];

                    const um = linea.um;
                    if (um === producto.um) {
                        //1er paso validar si coincide con algun producto de filtrados.
                        const key = linea.key;

                        const item = this.props.list.get(key);

                        if (item) {
                            const editingItem = { ...item };

                            if (!editingItem.qty) {
                                editingItem.qty = 0;
                            }
                            if (this.props.transactionMode === transactionModes.READ_ADD) {
                                editingItem.qty++;
                            } else {
                                if (editingItem.qty > 0) {
                                    editingItem.qty--;
                                } else {
                                    Alert.alert('Producto terminado', editingItem.description);
                                }

                            }

                            if (!this.state.confirmMode) {

                                this.setState({
                                    editingItem,
                                    qty: this.props.transactionMode === transactionModes.READ_SUBTRACT
                                        ? editingItem.qtyToPickUp - editingItem.qty
                                        : editingItem.qty,
                                    isEditing: false,
                                    searchCode: "",
                                });

                                const item = { ...editingItem };

                                this.props.dispatch(actionSetArticle(item));

                                this.state.articleRef.current.focus();

                            } else {
                                this.setState({
                                    editingItem,
                                    qty: this.props.transactionMode === transactionModes.READ_SUBTRACT
                                        ? editingItem.qtyToPickUp - editingItem.qty
                                        : editingItem.qty,
                                    isEditing: true,
                                });

                            }

                        }
                    } else {
                        //2do paso el producto NO coincide con los filtrados, usar las conversiones.
                        const conversiones = linea.conversiones ? linea.conversiones.values() : [];

                        const umFiltradas = (linea.conversiones ?
                            Array.from(conversiones)
                            :
                            [])
                            .filter((item) => item.unidad === producto.um);

                        if (umFiltradas.length != 0) {
                            const conversion = umFiltradas[0].valorConversion;

                            const key = linea.key;

                            const item = this.props.list.get(key);

                            if (item) {
                                const editingItem = { ...item };

                                if (!editingItem.qty) {
                                    editingItem.qty = 0;
                                }
                                if (this.props.transactionMode === transactionModes.READ_ADD) {
                                    editingItem.qty++;
                                } else {
                                    if (editingItem.qty >= conversion) {
                                        editingItem.qty -= conversion;
                                    } else {
                                        Alert.alert('Producto terminado', editingItem.description);
                                    }

                                }

                                if (!this.state.confirmMode) {

                                    this.setState({
                                        editingItem,
                                        qty: this.props.transactionMode === transactionModes.READ_SUBTRACT
                                            ? editingItem.qtyToPickUp - editingItem.qty
                                            : editingItem.qty,
                                        isEditing: false,
                                        searchCode: "",
                                    });

                                    const item = { ...editingItem };

                                    this.props.dispatch(actionSetArticle(item));

                                    this.state.articleRef.current.focus();

                                } else {
                                    this.setState({
                                        editingItem,
                                        qty: this.props.transactionMode === transactionModes.READ_SUBTRACT
                                            ? editingItem.qtyToPickUp - editingItem.qty
                                            : editingItem.qty,
                                        isEditing: true,
                                    });

                                }

                            }
                        }
                        console.warn('UM Filtradas: ', umFiltradas);
                    }
                }

            });
            /*
            const item = this.props.list.get(this.state.searchCode);

            if (item) {

                const editingItem = { ...item };



                if (!editingItem.qty) {
                    editingItem.qty = 0;
                }
                if (this.props.transactionMode === transactionModes.READ_ADD) {
                    editingItem.qty++;
                } else {
                    if (editingItem.qty > 0) {
                        editingItem.qty--;
                    } else {
                        Alert.alert('Producto terminado', editingItem.description);
                    }

                }


                if (!this.state.confirmMode) {

                    this.setState({
                        editingItem,
                        qty: this.props.transactionMode === transactionModes.READ_SUBTRACT
                            ? editingItem.qtyToPickUp - editingItem.qty
                            : editingItem.qty,
                        isEditing: false,
                        searchCode: "",
                    });

                    const item = { ...editingItem };

                    this.props.dispatch(actionSetArticle(item));

                    this.state.articleRef.current.focus();
                    console.warn('if');

                } else {
                    console.warn('else');
                    this.setState({
                        editingItem,
                        qty: this.props.transactionMode === transactionModes.READ_SUBTRACT
                            ? editingItem.qtyToPickUp - editingItem.qty
                            : editingItem.qty,
                        isEditing: true,
                    });

                }








            } else {
                this.setState({ isEditing: true });
                Alert.alert("No encontrado ", "No hemos podido encontrar " + this.state.searchCode,
                    [{
                        text: "Continuar",
                        onPress: () => {
                            this.setState({ isEditing: false, searchCode: "" });
                            this.state.articleRef.current.focus();
                        },
                    }]);
            }
            */
        }

    }
    close = () => {
        Navigation.dismissModal(this.props.componentId);
    }
    navigationButtonPressed = ({ buttonId }) => {
        switch (buttonId) {
            case 'close':
                this.close();
                break;
            default:
                this.close();
        }
    }
    render() {
        const item = this.state.editingItem;
        const { qty, confirmMode } = this.state;
        return (
            <ImageBackground source={backgroundImage} style={componentstyles.background}>
                <KeyboardAvoidingView
                    style={{ height: "100%", width: "100%" }} keyboardVerticalOffset={20} behavior="padding">
                    <View style={componentstyles.containerView}>
                    <ArticleScanMode confirmMode={confirmMode} changeMode={(confirmMode)=>this.setState({confirmMode})} />
                        <Field onChangeText={(text) => this.setState({ searchCode: text })}
                            onSubmitEditing={this.barCodeHandler}
                            autoFocus={true}
                            value={this.state.searchCode}
                            inputRef={this.state.articleRef}
                            keyboardType={"numeric"}
                            blurOnSubmit={false}
                            placeholder="#####" label="Búsqueda por Handheld---" />
                        {

                            item ?
                                <ArticleCard handleAccept={confirmMode ? this.handleAccept : null}
                                    item={item} qty={qty}
                                    qtyLabel={this.props.qtyLabel}
                                    setQty={(qty) => this.setState({ qty })} />
                                : null
                        }


                    </View>
                </KeyboardAvoidingView>
            </ImageBackground >
        )
    }
}
const mapStateToProps = state => {
    return {
        list: state.articles,
        sucursal: state.sucursal,
        transactionMode: state.transactionMode,
        user: state.user,
        token: state.user.token,
    };
}
const styles = StyleSheet.create({
    barcodeGuide: {
        alignSelf: "center",
        borderStyle: "solid",
        borderColor: "#ffffff",
        borderWidth: 1,
        height: "30%",
        width: "70%",



    }
})
export default connect(mapStateToProps)(PickupBarcodInput);
