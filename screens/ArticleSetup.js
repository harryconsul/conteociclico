import React from 'react';
import { ImageBackground, View, KeyboardAvoidingView } from 'react-native';
import { ArticleCard } from '../components/';
import QueryArticles from './QueryArticles';
import { componentstyles } from '../styles';
import backgroundImage from '../assets/labmicroBg.jpg';
import {actionSetArticle} from '../store/actions/actions.creators'
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
            isSettingUp: false,
        }
    }
    componentDidMount=()=>{
        Navigation.mergeOptions(this.props.componentId, {
            topBar: {
                title: {
                    text: 'Configurar Articulos'
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
            key: itemQ.shortNumber,            
            description: itemQ.producto,            
            location: itemQ.ubicacion,
            serial: itemQ.lote,                        
            um:itemQ.unidadMedida,            
        }
        this.setState({ item, qty: 1, isSettingUp: true });
    }
    handleAccept=()=>{
        const { item, qty } = this.state;
        const updateItem = { ...item, qty };

        this.props.dispatch(actionSetArticle(updateItem));
        this.setState({item:null,qty:0,isSettingUp:false});

    }
    render() {
        const { qty, item, isSettingUp, isLoading } = this.state;
        return (
            <ImageBackground source={backgroundImage} style={componentstyles.background}>
                <View style={componentstyles.containerView}>
                    {
                        isSettingUp ?
                            <ArticleCard item={item} qty={qty}
                                setQty={(qty) => this.setState({ qty })}

                                handleAccept={this.handleAccept} />
                            :
                            <QueryArticles businessUnit={this.props.businessUnit}                                
                                notScreen handleClickRow={this.handleClickRow} />


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