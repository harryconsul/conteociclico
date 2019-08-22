import React from 'react';
import {
    View, Text, Button, TextInput, FlatList,
    ImageBackground, StyleSheet, TouchableOpacity,
    ActivityIndicator, KeyboardAvoidingView,
} from 'react-native';
import { connect } from 'react-redux';
import { Navigation } from 'react-native-navigation';
import Field from '../components/Field';
import { ItemView, ItemHightLight, ItemLabel } from '../components'
import { searchShipment, startConfirmation } from '../apicalls/pickup.operations';
import { actionUpdateStack, actionSetProductsToPickup } from '../store/actions/actions.creators';
import { componentstyles } from '../styles';
import backgroundImage from '../assets/labmicroBg.jpg';

class ProductsPickup extends React.Component {

    constructor(props) {
        super(props);
        Navigation.events().bindComponent(this);
        this.state = {
            isLoading: false,
            order: null,
            articles: null,
            orderNumber: "",
            isConfirming: true,
        }
    }

    navigationButtonPressed({ buttonId }) {
        if (buttonId === 'sideMenu') {
            Navigation.mergeOptions('SideMenu', {
                sideMenu: {
                    left: {
                        visible: true
                    }
                }
            });
        }else{
            
        }
    }


    componentDidMount() {

    }
    searchOrder = () => {
        this.setState({ isLoading: true });
        searchShipment(this.state.orderNumber, this.props.token, (response) => {
            const rawRows = response.data.fs_P554205_W554205D.data.gridData.rowset;
            const rows = rawRows.map(item => ({
                rowId: item.rowIndex,
                numero: item.mnOrderNumber_27.value,
                cliente: item.sSoldToName_64.value,
                fecha: item.dtOrderDate_36.value,
            }));
            let order = null;
            if (rows.length) {
                order = rows[0];
            }
            this.setState({ order, isLoading: false, isConfirming: true, });
            const stack = {
                stackId: response.data.stackId,
                stateId: response.data.stateId,
                rid: response.data.rid,
                currentApplication: "P554205_W554205D",
            }
            this.props.dispatch(actionUpdateStack(stack));
        }, (error) => console.warn(error));
    }
    startPickup = () => {
        this.setState({ isConfirming: false, isLoading: true })
        startConfirmation(this.props.token, this.props.stack, (response) => {
            const rawRows = response.data.fs_P554205_W554205E.data.gridData.rowset;
            const productToPickup = new Map();
            for (let i = 0; i < rawRows.length; i++) {
                const key = rawRows[i].sItemNumber_35.value;
                const value = {
                    itemSerial: rawRows[i].sLotSerial_50.value,
                    itemDescription: rawRows[i].sDescription_44.value,
                    itemLocation: rawRows[i].sLocation_36.value,
                    itemQty: rawRows[i].mnQuantityShipped_71.value,
                }
                productToPickup.set(key, value);
            }
            this.props.dispatch(actionSetProductsToPickup(productToPickup));
            this.setState({ isLoading: false });

        })
    }

    render() {
        const { order, isConfirming } = this.state;
        const orderView = order && isConfirming ? <ItemView index={1} >
            <ItemLabel text={"Numero: " + order.numero} />
            <ItemHightLight text={"Cliente: " + order.cliente} />
            <ItemLabel text={"Fecha de pedido: " + order.fecha} />
            <Button onPress={this.startPickup} title="Comenzar Recolección" />
        </ItemView> : null;
        const productsArray = this.props.products ?
            Array.from(this.props.products.values()) : [];

        return (
            <ImageBackground source={backgroundImage} style={componentstyles.background}>
                <KeyboardAvoidingView
                    style={{ height: "100%", width: "100%" }} keyboardVerticalOffset={20} behavior="padding">
                    <View style={componentstyles.containerView}>
                        <Field label="Numero de orden"
                            onChangeText={(text) => this.setState({ orderNumber: text })}
                            onSubmitEditing={this.searchOrder} placeholder={"####"} />

                        <ActivityIndicator color="#ffffff"
                            animating={this.state.isLoading} size={"large"} />
                        {orderView}
                        <FlatList data={productsArray}
                            renderItem={({ item, index }) =>
                                <TouchableOpacity index={index} onPress={() => this.handleSelectRow(index)}>
                                    <ItemView index={index} >
                                        <ItemLabel text={"Numero: " + item.itemSerial} />
                                        <ItemHightLight text={"Descripcion: " + item.itemDescription} />
                                        <ItemHightLight text={"Ubicación: " + item.itemLocation} />
                                        <ItemHightLight text={"Cantidad: " + item.itemQty} />
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
        products: state.products,
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
export default connect(mapStateToProps)(ProductsPickup);
