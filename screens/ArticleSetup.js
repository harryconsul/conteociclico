import React from 'react';
import {
    ImageBackground, View,
    KeyboardAvoidingView, Alert,
} from 'react-native';
import { ArticleCard } from '../components/';
import QueryArticles from './QueryArticles';
import { componentstyles } from '../styles';
import backgroundImage from '../assets/labmicroBg.jpg';
import { actionSetArticle } from '../store/actions/actions.creators'
import { connect } from 'react-redux';
import { Navigation } from 'react-native-navigation';
class ArticleSetup extends React.Component {

    constructor(props) {
        super(props);
        Navigation.events().bindComponent(this);

        this.state = {
            isLoading: false,
            item: null,
            qty: 0,
            price: "",
            isSettingUp: false,

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
            },
        });
    }
    handleClickRow = (itemQ) => {

        const item = {
            key: itemQ.etiqueta,
            itemNumber: itemQ.itemNumber,
            description: itemQ.producto,
            stock: itemQ.cantidad,
            location: itemQ.ubicacion,
            serial: itemQ.lote,
            um: itemQ.unidadMedida,
        }
        this.setState({ item, qty: 1, isSettingUp: true });
    }

    handleAccept = () => {
        const { item, qty, price } = this.state;
        
        //la cantidad ingresada debe ser, menor o igual a su stock.
        if (qty <= item.stock) {
            const updateItem = { ...item, qty, price };

            this.props.dispatch(actionSetArticle(updateItem));
            this.setState({ item: null, qty: 0, price: "", isSettingUp: false });

        } else {
            Alert.alert(
                'La cantidad supera su stock!',
                'Debe ser menor o igual a ' + item.stock,
                [{ text: 'Aceptar', style: "destructive" }]
            );
        }

    }
    render() {
        const { qty, item, isSettingUp, isLoading, price, } = this.state;
        return (
            <ImageBackground source={backgroundImage} style={componentstyles.background}>
                <View style={componentstyles.containerView}>
                    {
                        isSettingUp ?
                            <ArticleCard
                                item={item}
                                qty={qty}
                                setQty={(qty) => this.setState({ qty })}
                                setPrice={(price) => this.setState({ price })}
                                price={price}
                                handleAccept={this.handleAccept} />
                            :
                            <QueryArticles
                                businessUnit={this.props.businessUnit}
                                businessUnitNombre={this.props.businessUnitNombre}
                                notScreen
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