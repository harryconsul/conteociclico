import React from 'react';
import {
    View, Text, Button,  FlatList,
    ImageBackground, StyleSheet, TouchableOpacity,
    ActivityIndicator, KeyboardAvoidingView,
} from 'react-native';
import { connect } from 'react-redux';
import { Navigation } from 'react-native-navigation';
import Field from '../components/Field';
import { ItemView, ItemHightLight, ItemLabel } from '../components'
import { searchShipment, startConfirmation,shipmentConfirmation } from '../apicalls/pickup.operations';
import { actionUpdateStack,  actionSetTransactionMode, actionSetArticlesMap,actionSetArticle } from '../store/actions/actions.creators';
import { transactionModes } from '../constants'
import { componentstyles } from '../styles';
import backgroundImage from '../assets/labmicroBg.jpg';

class InventoryTransfer extends React.Component {


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
            if (this.state.articles) {
                this.props.dispatch(actionSetTransactionMode(transactionModes.READ_SUBTRACT));
            } else {
                this.props.dispatch(actionSetTransactionMode(transactionModes.READ_RETURN));
            }
            Navigation.showModal({
                stack: {
                    children: [
                        {
                            component: {
                                name: 'BarcodeReader',
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
    }
    componentDidAppear() {
        if (this.props.articles) {

            const search = this.props.articles.get("search");
            if (search) {
                this.setState({ orderNumber: search.value }, this.searchOrder);
            }


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
            //console.warn(rawRows);
            for (let i = 0; i < rawRows.length; i++) {
                const key = rawRows[i].sItemNumber_35.value;
                
                const value = {
                    key,
                    serial: rawRows[i].sLotSerial_50.value,
                    um:rawRows[i].sUnitofMeasure_178.value,
                    location: rawRows[i].sDescription_44.value,
                    description: rawRows[i].sLocation_36.value,
                    qty: rawRows[i].mnQuantityShipped_71.value,
                }
                productToPickup.set(key, value);
            }
            this.props.dispatch(actionSetArticlesMap(productToPickup));
            this.setState({ isLoading: false, articles: productToPickup });
            const stack = {
                stackId: response.data.stackId,
                stateId: response.data.stateId,
                rid: response.data.rid,
                currentApplication: "P554205_W554205E",
            }
            this.props.dispatch(actionUpdateStack(stack));

        })
    }
    confirmShipment=()=>{
        shipmentConfirmation(this.props.token,this.props.stack,(response)=>{

        })
    }
    handleSelectRow = (key)=>{
        const item = this.props.articles.get(key);
        this.props.dispatch(actionSetArticle({...item,qty:0}));
        
    }
    render() {
        const { order, isConfirming } = this.state;
        const orderView = order && isConfirming ? <ItemView index={1} >
            <ItemLabel text={"Numero: " + order.numero} />
            <ItemHightLight text={"Cliente: " + order.cliente} />
            <ItemLabel text={"Fecha de pedido: " + order.fecha} />
            <Button onPress={this.startPickup} title="Comenzar Recolección" />
        </ItemView> : null;
        const products  = this.props.articles ? this.props.articles.values():[];
        const productsArray =(this.state.articles ?
            Array.from(products) : []).filter((item)=>item.qty);

        return (
            <ImageBackground source={backgroundImage} style={componentstyles.background}>
                <KeyboardAvoidingView
                    style={{ height: "100%", width: "100%" }} keyboardVerticalOffset={20} behavior="padding">
                    <View style={componentstyles.containerView}>
                    <ItemView index={1} >
                        <Field label="Explicación del Movimiento"
                            onChangeText={(text) => this.setState({ orderNumber: text })}
                            onSubmitEditing={this.searchOrder} placeholder="Ejem:Urgencia en sucursal" />
                        <Field label="Origen - Numero de Sucursal"
                            keyboardType={"numberic"}
                            onChangeText={(text) => this.setState({ orderNumber: text })}
                            onSubmitEditing={this.searchOrder} placeholder={"####"} />
                        <Field label="Destino - Numero de Sucursal"
                            keyboardType={"numberic"}
                            onChangeText={(text) => this.setState({ orderNumber: text })}
                            onSubmitEditing={this.searchOrder} placeholder={"####"} />

                         <ActivityIndicator color="#ffffff"
                            animating={this.state.isLoading} size={"large"} />
                        
                        {
                           this.state.articles?
                           <Button disabled={productsArray.length?true:false} title="Guardar Transferencia"  onPress ={this.confirmShipment}/>
                           :null
                        }
                        <FlatList data={productsArray}
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
