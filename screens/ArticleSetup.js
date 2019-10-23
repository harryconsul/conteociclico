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
import ArticleScanMode from '../components/ArticleScanMode';
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
            confirmMode:true,
            location:"",

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
            stock: itemQ.disponible,
            location: itemQ.ubicacion,
            serial: itemQ.lote,
            um: itemQ.unidadMedida,
            qty:1,
            locationTo:"",
            price:0,

        }
        //Si el item, ya existe agregarle los nuevos
        const processItem = this.props.articles.get(item.key)

        if(processItem){
            item.qty += processItem.qty;
            item.locationTo = processItem.locationTo;
            item.price = processItem.price;

        }


        this.setState({ 
                item,
                qty: item.qty,
                price:item.price,
                locationTo:item.locationTo , 
                isSettingUp: true 
        });
    }

    handleAccept = () => {
        const { item, qty, price, locationTo } = this.state;
        
        //la cantidad ingresada debe ser, menor o igual a su stock.
        if (qty <= item.stock) {
            const updateItem = { ...item, qty, price ,locationTo};

            this.props.dispatch(actionSetArticle(updateItem));
            this.setState({ item: null, qty: 0, price: 0,locationTo:"", isSettingUp: false });

        } else {
            Alert.alert(
                'La cantidad supera lo disponible!',
                'Debe ser menor o igual a ' + item.stock,
                [{ text: 'Aceptar', style: "destructive" }]
            );
        }

    }
    render() {
        const { qty, item, isSettingUp, isLoading, price, confirmMode,locationTo} = this.state;
        return (
            <ImageBackground source={backgroundImage} style={componentstyles.background}>
                <View style={componentstyles.containerView}>
                    <ArticleScanMode confirmMode = {confirmMode} changeMode={(confirmMode)=>this.setState({confirmMode})} />
                    {
                        isSettingUp && confirmMode ?
                            <ArticleCard
                                item={item}
                                qty={qty}
                                setQty={(qty) => this.setState({ qty })}
                                setPrice={this.props.setupPrice?(price) => this.setState({ price }):null}
                                price={price}
                                setLocation={this.props.setupLocation?(locationTo)=>this.setState({locationTo}):null}
                                location={locationTo}
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