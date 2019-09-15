import React, { Component } from 'react';
import {
    View, Text, ImageBackground,
    Button
} from 'react-native';
import { Navigation } from 'react-native-navigation';
import backgroundImage from '../assets/labmicroBg.jpg';
import { componentstyles } from '../styles';
import Field from '../components/Field';
import { BusinessUnit } from '../components/BusinessUnit';
import { connect } from 'react-redux';
import { ItemView, ItemHightLight, ItemLabel } from '../components'

class InventoryExpire extends Component {
    constructor(props) {
        super(props);
        Navigation.events().bindComponent(this);

        this.state = {
            isLoading: false,
            articles: null,
            isConfirming: true,
            sucursal: null,
            motivo: "",
        }
    }

    setUpProduct = () =>{
        Navigation.showModal({
            stack: {
                children: [
                    {
                        component: {
                            name: 'AddProduct',
                            passProps: {
                                businessUnit: this.state.sucursal,
                            }
                        },
                        
                    }
                ]
            }
        });
    }

    render() {
        return (
            <ImageBackground source={backgroundImage} style={componentstyles.background}>
                <View style={componentstyles.containerView}>
                    <View style={{ height: 200 }}>
                        <ItemView item={2}>
                            <BusinessUnit
                                label="Sucursal"
                                placeholder="###"
                                token={this.props.token}
                                unidad={(unidad) => {
                                    this.setState({
                                        sucursal: unidad,
                                    });
                                }}
                            />
                            <Field
                                label="Explicación"
                                placeholder="Ejem: caducidad"
                                onChangeText={(text) => { this.setState({ motivo: text }) }}
                            />
                            <Text style={{ color: 'white' }}>HOLA COMO ESTAS</Text>
                        </ItemView>
                    </View>
                    <View style={{ flexDirection:'row' , justifyContent: "space-between" }}>
                        <Button title="AGREGAR PRODUCTOS" 
                            onPress={this.setUpProduct} disabled={this.state.sucursal?false:true}/>
                        <Button title="CONFIRMAR SALIDA" />
                    </View>
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

export default connect(mapStateToProps)(InventoryExpire);