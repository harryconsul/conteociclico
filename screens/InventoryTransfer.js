import React from 'react';
import {
    View, Text, Button, FlatList,
    ImageBackground, StyleSheet, TouchableOpacity,
    ActivityIndicator, KeyboardAvoidingView,
} from 'react-native';
import { connect } from 'react-redux';
import { Navigation } from 'react-native-navigation';
import Field from '../components/Field';
import { BusinessUnit } from '../components/BusinessUnit';
import { ItemView, ItemHightLight, ItemLabel } from '../components'
import { actionUpdateStack } from '../store/actions/actions.creators';
import { componentstyles } from '../styles';
import { startTransfer, fillTransfer } from '../apicalls/transfer.operations'
import backgroundImage from '../assets/labmicroBg.jpg';


class InventoryTransfer extends React.Component {


    constructor(props) {
        super(props);
        Navigation.events().bindComponent(this);

        this.state = {
            isLoading: false,
            articles: null,
            isConfirming: true,
            unidadOrigen: null,
            unidadOrigenNombre: null,
            unidadDestino: null,
            unidadDestinoNombre: null,
            explicacion: "",
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
        startTransfer(this.props.token, (response) => {
            const stack = {
                stackId: response.data.stackId,
                stateId: response.data.stateId,
                rid: response.data.rid,
                currentApplication: "P564113_W564113B_DICIPA003",

            }

            this.props.dispatch(actionUpdateStack(stack));

        })
    }
    setupArticles = () => {
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
    confirmTransfer = () => {
        const { unidadDestino, unidadOrigen, explicacion } = this.state;
        const rows = [];

        for (let article of this.props.articles.values()) {

            if (article.qty) {
                rows.push(article);
            }
        }
        const form = {
            explicacion,
            unidadOrigen,
            unidadDestino,
            rows,

        }
        const { token, stack } = this.props;

        fillTransfer(token, stack, form, (response) => {
            console.warn("response 2", response);
        });
    }

    handleSelectRow = (key) => {


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
                    behavior="padding" enabled>
                    <View style={componentstyles.containerView}>

                        <View style={{ height: 200 }}>
                            <ItemView index={2} >

                                <Field label="Explicación del Movimiento"
                                    onChangeText={(text) => this.setState({ explicacion: text })}
                                    onSubmitEditing={this.searchOrder} placeholder="Ejem:Urgencia en sucursal" />
                                <View style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
                                    <BusinessUnit label="Origen - MCU"
                                        token={this.props.token}
                                        unidad={(unidad, nombre) => {
                                            this.setState({
                                                unidadOrigen: unidad,
                                                unidadOrigenNombre: nombre,
                                            });
                                        }}
                                        placeholder={"####"} />
                                    <BusinessUnit label="Destino - MCU"
                                        token={this.props.token}
                                        unidad={(unidad, nombre) => {
                                            this.setState({
                                                unidadDestino: unidad,
                                                unidadDestinoNombre: nombre,
                                            });
                                        }}
                                        placeholder={"####"} />

                                </View>


                            </ItemView>

                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: "space-between" }}>
                            <Button title="AGREGAR ARTICULOS" onPress={this.setupArticles} />
                            <Button title="CONFIRMAR" onPress={this.confirmTransfer} />
                        </View>
                        <ActivityIndicator color="#ffffff"
                            animating={this.state.isLoading} size={"large"} />

                        {
                            this.state.articles ?
                                <Button disabled={productsArray.length ? true : false} title="Guardar Transferencia" onPress={this.confirmShipment} />
                                : null
                        }
                        <FlatList data={list}
                            renderItem={({ item, index }) =>
                                <TouchableOpacity key={item.key} index={index} onPress={() => this.handleSelectRow(item.key)}>
                                    <ItemView index={index} >
                                        <ItemLabel text={"Numero: " + item.serial} />
                                        <ItemHightLight text={"Descripcion: " + item.description} />
                                        <ItemHightLight text={"Ubicación: " + item.location} />
                                        <ItemHightLight text={"Cantidad: " + item.qty} />
                                    </ItemView>
                                </TouchableOpacity>

                            } />
                    </View>
                </KeyboardAvoidingView>


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
    }
});
export default connect(mapStateToProps)(InventoryTransfer);
