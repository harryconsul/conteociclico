import React, { Component } from 'react';
import {
    View, Text, ImageBackground, FlatList, Alert,
    Button, KeyboardAvoidingView, TouchableOpacity,
} from 'react-native';
import { Navigation } from 'react-native-navigation';
import backgroundImage from '../assets/labmicroBg.jpg';
import { componentstyles } from '../styles';
import Field from '../components/Field';
import { BusinessUnit } from '../components/BusinessUnit';
import { connect } from 'react-redux';
import { ItemView, ItemHightLight, ItemLabel } from '../components';
import { startExit, fillTransfer } from '../apicalls/expire.operations';
import { actionUpdateStack } from '../store/actions/actions.creators';

class InventoryExpire extends Component {
    constructor(props) {
        super(props);
        Navigation.events().bindComponent(this);

        this.state = {
            isLoading: false,
            articles: null,
            isConfirming: true,
            unidadOrigen: null,
            unidadOrigenNombre: null,
            motivo: "",
        }
    }

    navigationButtonPressed = ({ buttonId }) => {
        if (buttonId === 'sideMenu') {
            Navigation.mergeOptions('SideMenu', {
                sideMenu: {
                    left: {
                        visible: true
                    }
                }
            });
        } else {


        }
    }

    componentDidMount() {
        startExit(this.props.token, (response) => {
            const stack = {
                stackId: response.data.stackId,
                stateId: response.data.stateId,
                rid: response.data.rid,
                currentApplication: "P4112_W4112A_DICIPA008",

            }

            this.props.dispatch(actionUpdateStack(stack));

        })
    }

    setUpProduct = () => {
        Navigation.showModal({
            stack: {
                children: [
                    {
                        component: {
                            name: 'ArticleSetup',
                            passProps: {
                                businessUnit: this.state.unidadOrigen,
                                businessUnitNombre: this.state.unidadOrigenNombre,
                            }
                        },

                    }
                ]
            }
        });
    }

    handleSelectRow = (key) => { }

    confirmarSalida = () => {

        const { unidadOrigen, motivo } = this.state;

        //Solo si ingreso un motivo
        if (motivo != "") {
            const rows = [];
    
            for (let article of this.props.articles.values()) {
    
                if (article.qty) {
                    rows.push(article);
                }
            }
            const form = {
                motivo,
                unidadOrigen,
                rows,
    
            }
            const { token, stack } = this.props;
    
            fillTransfer(token, stack, form, (response) => {
                console.warn("Respuesta a la salida ", response);
            });
            
        } else {
            Alert.alert(
                'Sin motivo de salida!',
                'Ingrese el motivo de salida',
                [{ text: 'Aceptar', style: "destructive" }]
            );
        }
    }

    render() {
        const list = [];

        for (let article of this.props.articles.values()) {
            //const article = this.props.articles[key]
            if (article.qty) {
                list.push(article);
            }
        }

        return (
            <ImageBackground source={backgroundImage} style={componentstyles.background}>
                <KeyboardAvoidingView style={{ height: "100%", width: "100%" }} >
                    <View style={componentstyles.containerView}>
                        <View style={{ height: 200 }}>
                            <ItemView item={2}>
                                <BusinessUnit
                                    label="Sucursal"
                                    placeholder="###"
                                    token={this.props.token}
                                    unidad={(unidad, nombre) => {
                                        this.setState({
                                            unidadOrigen: unidad,
                                            unidadOrigenNombre: nombre,
                                        });
                                    }}
                                />
                                <Field
                                    label="Explicación"
                                    placeholder="Ejem: caducidad"
                                    onChangeText={(text) => { this.setState({ motivo: text }) }}
                                />
                            </ItemView>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: "space-between" }}>
                            <Button title="AGREGAR PRODUCTOS"
                                onPress={this.setUpProduct}
                                disabled={this.state.unidadOrigen ? false : true}
                            />
                            <Button
                                title="CONFIRMAR SALIDA"
                                disabled={list.length != 0 ? false : true}
                                onPress={this.confirmarSalida}
                            />
                        </View>

                        <FlatList data={list}
                            renderItem={({ item, index }) =>
                                <TouchableOpacity key={item.key} index={index} onPress={() => this.handleSelectRow(item.key)}>
                                    <ItemView index={index} >
                                        <ItemLabel text={"Numero: " + item.itemNumber} />
                                        <ItemHightLight text={"Descripción: " + item.description} />
                                        <ItemHightLight text={"Ubicación: " + item.location} />
                                        <View style={{
                                            flexDirection: 'row',
                                            justifyContent: "space-between",
                                        }}>
                                            <View style={{ width: "50%" }}>
                                                <ItemHightLight text={"Stock: " + item.stock} />
                                            </View>

                                            <View style={{ width: "50%" }}>
                                                <ItemHightLight text={"Por Salir: " + item.qty} />
                                            </View>
                                        </View>
                                    </ItemView>
                                </TouchableOpacity>

                            }
                        />
                    </View>
                </KeyboardAvoidingView >
            </ImageBackground >
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