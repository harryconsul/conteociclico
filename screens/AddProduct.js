import React, { Component } from 'react';
import { Text , View , ImageBackground} from 'react-native';
import { connect } from 'react-redux';
import { Navigation } from 'react-native-navigation';
import { componentstyles } from '../styles';
import backgroundImage from '../assets/labmicroBg.jpg';

class AddProduct extends Component {
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
                    text: 'Agregar Productos'
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

    render() {

        return (
            <ImageBackground source={backgroundImage} style={componentstyles.background}>
                <View style={componentstyles.containerView}>
                    <Text style={{color:'white'}}>Hola</Text>
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

export default connect(mapStateToProps)(AddProduct);