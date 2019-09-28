import React from 'react';
import {
    View, Button, StyleSheet,
    Alert
} from 'react-native';
import SideMenuItem from '../components/SideMenuItem'
import { Navigation } from 'react-native-navigation'
import { connect } from 'react-redux';
import {topBarButtons} from '../constants'
import logOut from '../apicalls/user.logout';

import Auth from './Auth';

class SideMenu extends React.Component {
    optionClickHandle = (option, title,showBarcodeButtons) => {
        let rightButtons=null;
        if(showBarcodeButtons){
            rightButtons={...topBarButtons.rightButtons}
        }
        Navigation.push(this.props.currentScreen, {
            component: {
                id: option,
                name: option,
                options: {
                    topBar: {
                        title: {
                            text: title,
                            color: '#ffffff'
                        },
                        ...rightButtons
                    }
                }

            },

        });
        Navigation.mergeOptions('SideMenu', {
            sideMenu: {
                left: {
                    visible: false
                }
            }
        });
    }

    userLogOut = () => {
        logOut(this.props.token, (response) => {
            try {
                Alert.alert("Queda pendiente llamar login");
            } catch (reason) {
                Alert("Error al cerrar sesión ");
            }
        });
    }
    render() {
        return (
            <View style={{ paddingTop: 50, height: "100%", backgroundColor: '#8c30f1' }} >
                <View style={{ height: '80%' }}>
                    <SideMenuItem optionClickHandle={() => this.optionClickHandle("CyclicCountList", "Conteo Cíclico",false)}
                        optionName="Conteo Ciclico" />
                    <SideMenuItem optionClickHandle={() => this.optionClickHandle("QueryArticles", "Consulta de Existensias",false)}
                        optionName="Consulta de Existensias" />
                    <SideMenuItem optionClickHandle={() => this.optionClickHandle("PlaceSign", "Firma",false)}
                        optionName="Firma Algo" />
                    <SideMenuItem optionClickHandle={() => this.optionClickHandle("ProductsPickup", "Recolección de Producto",true)}
                        optionName="Recoleccion de Producto" />
                    <SideMenuItem
                        optionName="Salidas por Caducidad"
                        optionClickHandle={() =>
                            this.optionClickHandle("InventoryExpire", "Salidas por Caducidad",false)}
                    />
                    <SideMenuItem optionName="Salidas por Transferencia"
                        optionClickHandle={() =>
                            this.optionClickHandle("InventoryTransfer", "Salidas por Transferencia",false)}
                    />
                    <SideMenuItem optionName="Orden de Venta"
                        optionClickHandle={() =>
                            this.optionClickHandle("SaleOrder", "Orden de Venta",false)}
                    />
                </View>
                <View style={{ height: '20%' }}>
                    <View style={styles.logout} >
                        <View style={{ width: 200 }} >
                            <Button title="SALIR" onPress={this.userLogOut} />
                        </View>
                    </View>
                </View>

            </View>
        )
    }
}
const styles = StyleSheet.create({
    logout: {
        width: '100%',
        height: 45,
        padding: 5,
        backgroundColor: 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
    }
})
const mapStateToProps = state => {
    return {
        currentScreen: state.currentScreen,
        token: state.user.token,
    }
}
export default connect(mapStateToProps)(SideMenu);