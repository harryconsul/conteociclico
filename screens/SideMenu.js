import React from 'react';
import {
    View, Button, StyleSheet,
    Alert, ActivityIndicator,
} from 'react-native';
import SideMenuItem from '../components/SideMenuItem'
import { Navigation } from 'react-native-navigation'
import { connect } from 'react-redux';
import { topBarButtons } from '../constants'
import logOut from '../apicalls/user.logout';
import { navigationHelpers } from '../helpers'

class SideMenu extends React.Component {
    state = {
        isLoading: false,
    }
    optionClickHandle = (option, title, showBarcodeButtons,optionProps) => {
        let rightButtons = null;
        if (showBarcodeButtons) {
            rightButtons = { ...topBarButtons.rightButtons }
        }
        let currentScreen = this.props.openMain ? this.props.componentId : this.props.currentScreen;
        Navigation.push(currentScreen, {
            component: {
                id: option,
                name: option,
                passProps:optionProps?{...optionProps}:null,
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
    navigationButtonPressed({ buttonId }) {
        Navigation.mergeOptions('SideMenu', {
            sideMenu: {
                left: {
                    visible: true
                }
            }
        });
    }

    userLogOut = () => {
        this.setState({ isLoading: true });
        if (this.props.realm) {
            this.props.realm.close();
        }
        logOut(this.props.token, (response) => {
            try {
                this.setState({ isLoading: false });
                navigationHelpers.callLogin();
            } catch (reason) {
                Alert("Error al cerrar sesión ");
            }
        });
    }
    render() {
        return (
            <View style={{ paddingTop: 50, height: "100%", backgroundColor: '#8c30f1' }} >
                <View style={{ height: '80%' }}>
                    <SideMenuItem optionClickHandle={() => this.optionClickHandle("CyclicCountList", "Listado de Conteo", false)}
                        optionName="Conteo Ciclico" />
                    <SideMenuItem 
                        optionClickHandle={() => this.optionClickHandle("CyclicCountList", "Conteo Cíclico", false,{
                                conteoSucursal:true
                         })}
                        optionName="Conteo Ciclico - Sucursal" />
                    <SideMenuItem optionClickHandle={() => this.optionClickHandle("QueryArticles", "Consulta de Existensias", true)}
                        optionName="Consulta de Existensias" />
                    <SideMenuItem optionClickHandle={() => this.optionClickHandle("QueryAvailableArticles", "Artículos Disponibles", false)}
                        optionName="Artículos Disponibles" />
                    <SideMenuItem optionClickHandle={() => this.optionClickHandle("PlaceSign", "Firma", false)}
                        optionName="Firma Algo" />
                    <SideMenuItem optionClickHandle={() => this.optionClickHandle("ProductsPickup", "Recolección", true)}
                        optionName="Recoleccion de Producto" />
                    <SideMenuItem
                        optionName="Salidas por Caducidad"
                        optionClickHandle={() =>
                            this.optionClickHandle("InventoryExpire", "Salidas por Caducidad", false)}
                    />
                    <SideMenuItem optionName="Transferencias"
                        optionClickHandle={() =>
                            this.optionClickHandle("InventoryTransfer", "Transferencias", false)}
                    />
                    <SideMenuItem optionName="Confirmar Recepción"
                        optionClickHandle={() =>
                            this.optionClickHandle("ConfirmTransfer", "Confirmar Recepción", true)}
                    />
                    <SideMenuItem optionName="Orden de Venta*"
                        optionClickHandle={() =>
                            this.optionClickHandle("SaleOrder", "Orden de Venta", false)}
                    />
                     <SideMenuItem optionName="Orden de Transferencia**"
                        optionClickHandle={() =>
                            this.optionClickHandle("TransferOrder", "Orden de Transferencia", false,
                            {
                                standaloneProcess:true,
                            })}
                    />
                </View>
                <View style={{ height: '20%' }}>
                    <View style={styles.logout} >
                        <View style={{ width: 200 }} >
                            {
                                this.state.isLoading ?
                                    <ActivityIndicator color="#ffffff" animating={true} size={"large"} />
                                    : null
                            }
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
        realm: state.countRealm,
    }
}
export default connect(mapStateToProps)(SideMenu);