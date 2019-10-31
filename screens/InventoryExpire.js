import React, { Component } from 'react';
import {
    View, ImageBackground, FlatList, Alert, ActivityIndicator,
    Button, KeyboardAvoidingView, TouchableOpacity,
} from 'react-native';
import { Navigation } from 'react-native-navigation';
import backgroundImage from '../assets/labmicroBg.jpg';
import { componentstyles } from '../styles';
import Field from '../components/Field';
import { BusinessUnit } from '../components/BusinessUnit';
import { RazonMovimiento } from '../components/RazonMovimiento';

import { connect } from 'react-redux';
import { ItemView, ItemHightLight, ItemLabel } from '../components';
import { startExit, fillTransfer } from '../apicalls/expire.operations';
import { actionUpdateStack, actionSetArticlesMap } from '../store/actions/actions.creators';

const initialState = {
    isLoading: false,
    articles: null,
    isConfirming: true,
    unidadOrigen: null,
    unidadOrigenNombre: null,
    razonCodigo: null,
    razonDescripcion: null,
    motivo: null,
}

class InventoryExpire extends Component {
    constructor(props) {
        super(props);
        Navigation.events().bindComponent(this);

        this.state = {
            ...initialState
        }

        this.props.dispatch(actionSetArticlesMap(new Map()));
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
        this.setState({ isLoading: true });
        const { unidadOrigen, unidadOrigenNombre, motivo, razonCodigo, razonDescripcion } = this.state;

        //Validaciones del encabezado
        if (unidadOrigenNombre) {
            if (razonDescripcion) {
                if (motivo != "") {
                    
                    const rows = [];

                    for (let article of this.props.articles.values()) {

                        if (article.qty) {
                            rows.push(article);
                        }
                    }
                    const form = {
                        motivo,
                        razonCodigo,
                        unidadOrigen,
                        rows,

                    }
                    const { token, stack } = this.props;

                    fillTransfer(token, stack, form, (response) => {

                        const doctipo = response.data.fs_P4112_W4112A.data.txtPrevDocType_192.value;
                        const document = response.data.fs_P4112_W4112A.data.txtPrevDocumentNo_151.value;
                        Alert.alert(
                            'Salida confirmada',
                            doctipo + ": " + document,
                            [{
                                text: 'Aceptar',
                                onPress: () => {
                                    this.setState({ ...initialState });
                                    this.setState({ reiniciar: true });
                                    this.props.dispatch(actionSetArticlesMap(new Map()));
                                }
                            }]
                        );
                    });
                    
                } else {
                    Alert.alert(
                        'Sin motivo de salida!',
                        'Ingrese el motivo de salida',
                        [{ text: 'Aceptar' }]
                    );
                }

            } else {
                Alert.alert(
                    'Sin razón de salida!',
                    'Ingrese el código de razón',
                    [{ text: 'Aceptar' }]
                );
            }
        } else {
            Alert.alert(
                'Sin Sucursal!',
                'Ingrese el número de sucursal',
                [{ text: 'Aceptar' }]
            );
        }

        this.setState({ isLoading: false });
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
                <KeyboardAvoidingView style={{ height: "100%", width: "100%" }}
                    enabled behavior="padding">
                    <View style={componentstyles.containerView}>

                        <View style={{ height: 250 }}>
                            <View>
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
                                <RazonMovimiento
                                    label="Razón"
                                    placeholder="Ejem: C03"
                                    token={this.props.token}
                                    razon={(codigo, descripcion) => {
                                        this.setState({
                                            razonCodigo: codigo,
                                            razonDescripcion: descripcion,
                                        });
                                    }}
                                    defaultValue={this.state.razonCodigo}
                                />
                                <Field
                                    label="Motivo"
                                    defaultValue={this.state.motivo}
                                    placeholder="Ejem: Caducidad del Producto"
                                    onChangeText={(text) => { this.setState({ motivo: text }) }}
                                />

                            </View>
                        </View>

                        {
                            this.state.isLoading ?
                                <ActivityIndicator color="#ffffff"
                                    animating={this.state.isLoading} size={"large"} />
                                :
                                null
                        }

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
                                        <ItemLabel text={"Número: " + item.itemNumber} />
                                        <ItemLabel text={item.description} />
                                        <ItemLabel text={"Ubicación: " + item.location} />
                                        <View style={{
                                            flexDirection: 'row',
                                            justifyContent: "space-between",
                                        }}>
                                            <View style={{ width: "50%" }}>
                                                <ItemHightLight text={"Disp.: " + item.stock} />
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