import React from 'react';
import {
    ImageBackground, View,
    KeyboardAvoidingView, Alert,
} from 'react-native';
import { ArticleCard, ArticleSearch,searchArticle } from '../components/';

import { componentstyles } from '../styles';
import backgroundImage from '../assets/labmicroBg.jpg';
import { actionSetArticle, actionSetTransactionMode } from '../store/actions/actions.creators'
import { connect } from 'react-redux';
import { Navigation } from 'react-native-navigation';
import ArticleScanMode from '../components/ArticleScanMode';
import { topBarButtons, transactionModes } from '../constants'
class ArticleSetup extends React.Component {

    constructor(props) {
        super(props);
        Navigation.events().bindComponent(this);

        this.state = {
            isLoading: false,
            item: null,
            qty: 0,
            price: 0,
            isSettingUp: false,
            confirmMode: true,
            location: "",

        }
    }
    componentDidMount = () => {
        Navigation.mergeOptions(this.props.componentId, {
            topBar: {
                title: {
                    text: 'Configurar Artículos'
                },
                drawBehind: true,
                background: {
                    color: '#8c30f1c7',
                    translucent: true,
                    blur: false
                },
                visible: true,
                ...topBarButtons.rightButtonsCameraClose,
            },
        });
    }
    handleClickRow = (itemQ) => {

        const item = {
            key: itemQ.etiqueta,
            itemNumber: itemQ.itemNumber,
            description: itemQ.producto,
            stock: itemQ.disponible,
            location: itemQ.ubicacion,
            serial: itemQ.lote,
            um: itemQ.unidadMedida,
            qty: 1,
            locationTo: "",
            price: 0,

        }
        //Si el item, ya existe agregarle los nuevos
        const processItem = this.props.articles.get(item.key)

        if (processItem) {
            item.qty += processItem.qty;
            item.locationTo = processItem.locationTo;
            item.price = processItem.price;

        }

        this.setState({
            item,
            qty: item.qty,
            price: item.price,
            locationTo: item.locationTo,
            isSettingUp: true
        });
    }

    navigationButtonPressed({ buttonId }) {
        switch (buttonId) {
            case 'close':
                this.close();
                break;
            case 'barCode':
                this.openBarcode('BarcodeReader');
                break;
            default:
                this.close();

        }
    }
    close = () => {
        Navigation.dismissModal(this.props.componentId);
    }

    openBarcode = (screen) => {
        this.props.dispatch(actionSetTransactionMode(transactionModes.READ_RETURN));

        Navigation.showModal({
            stack: {
                children: [
                    {
                        component: {
                            name: screen,
                            id:screen,
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
                searchArticle(this.props.businessUnit,search.value,this.props.token)
                .then((response)=>{
                    this.setState({queryRows:response});
                }).catch((error)=>{
                    Alert.alert(error);
                });

            }


        }
    }


    handleAccept = () => {
        const { item, qty, price, locationTo } = this.state;

        //la cantidad ingresada debe ser, menor o igual a su stock.
        //se tuvo que aplicar parseInt(), caso contrario mandaba al else{alert}
        if (parseInt(qty) <= parseInt(item.stock)) {
            const updateItem = { ...item, qty, price, locationTo };

            this.props.dispatch(actionSetArticle(updateItem));
            this.setState({ item: null, qty: 0, price: 0, locationTo: "", isSettingUp: false });

        } else {
            Alert.alert(
                'La cantidad supera lo disponible!',
                'Debe ser menor o igual a ' + item.stock,
                [{ text: 'Aceptar', style: "destructive" }]
            );
        }

    }
    render() {
        const { qty, item, isSettingUp, isLoading, price, confirmMode, locationTo } = this.state;
        return (
            <ImageBackground source={backgroundImage} style={componentstyles.background}>
                <View style={componentstyles.containerView}>
                    <ArticleScanMode confirmMode={confirmMode} changeMode={(confirmMode) => this.setState({ confirmMode })} />
                    {
                        isSettingUp && confirmMode ?
                            <ArticleCard
                                item={item}
                                qty={qty}
                                setQty={(qty) => this.setState({ qty })}
                                setPrice={this.props.setupPrice ? (price) => this.setState({ price }) : null}
                                price={price}
                                setLocation={this.props.setupLocation ? (locationTo) => this.setState({ locationTo }) : null}
                                location={locationTo}
                                handleAccept={this.handleAccept} />
                            :
                            <ArticleSearch
                                businessUnit={this.props.businessUnit}
                                businessUnitNombre={this.props.businessUnitNombre}
                                queryRows={this.state.queryRows}
                                handleClickRow={this.handleClickRow}
                            />


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
export default connect(mapStateToProps)(ArticleSetup);