import React from 'react';
import {
    View, Text, Button, FlatList,
    ImageBackground, StyleSheet, TouchableOpacity,
    ActivityIndicator, KeyboardAvoidingView, Alert,
} from 'react-native';
import { searchRoute } from '../apicalls/delivery.operations';
import { connect } from 'react-redux';
import { Navigation } from 'react-native-navigation';
import Field from '../components/Field';
import { ItemView, ItemHightLight, ItemLabel } from '../components'
import {
    searchShipment, startConfirmation, shipmentConfirmation, printShipment,
    searchShipmentBackup, deleteBackup, addShipmentBackup, confirmLineBackup,
    searchAlmacenista, confirmAlmacenista
} from '../apicalls/pickup.operations';
import { actionUpdateStack, actionSetTransactionMode, actionSetArticlesMap, actionSetSucursal } from '../store/actions/actions.creators';
import { transactionModes } from '../constants'
import { componentstyles } from '../styles';
import backgroundImage from '../assets/labmicroBg.jpg';
import { businessUnit, unidadMedida } from '../apicalls/business_unit.operations';

const initialState = {
    isLoading: false,
    ruta: '',
}

class Deliveries extends React.Component {
    constructor(props) {
        super(props);
        Navigation.events().bindComponent(this);

        this.state = {
            ...initialState
        }
    }

    navigationButtonPressed = ({ buttonId }) => {
        switch (buttonId) {
            case 'sideMenu':
                this.openSideBar();
                break;
            case 'barCode':
                this.openBarcode('BarcodeReader');
                break;
            case 'refresh':
                this.refreshScreen();
                break;
            default:
                this.openBarcode('PickupBarcodeInput');
        }
    }

    refreshScreen = () => {
        this.setState({ ...initialState });
        this.props.dispatch(actionSetArticlesMap(new Map()));
        this.setState({ isLoading: false });
    }

    componentDidAppear() {
        if (this.props.articles) {

            const search = this.props.articles.get("search");
            if (search) {
                this.setState({ orderNumber: search.value }, this.searchOrder);
            }
        }
    }

    openSideBar = () => {
        Navigation.mergeOptions('SideMenu', {
            sideMenu: {
                left: {
                    visible: true
                }
            }
        });
    }

    searchRuta = () => {
        const { ruta } = this.state;

        if (ruta !== "") {
            this.setState({ isLoading: true });
            searchRoute(ruta, this.props.token, (response) => {
                //Validar que no haya errores
                const errors = response.data.fs_P55R4201_W55R4201A.errors;
                
                if (errors.length === 0) {
                    const rawRows = response.data.fs_P55R4201_W55R4201A.subforms.s_W55R4201A_S55R4201A_55.data.gridData.rowset;
                    console.warn('Ruta:' , rawRows);
                }
                
            }, (error) => console.warn(error));
        }
    }

    render() {

        return (
            <ImageBackground source={backgroundImage} style={componentstyles.background}>
                <KeyboardAvoidingView
                    style={{ height: "100%", width: "100%" }} enabled behavior="padding">
                    <View style={componentstyles.containerView}>
                        {
                            this.state.isLoading ?
                                <ActivityIndicator color="#ffffff"
                                    animating={true} size={"large"} />
                                :
                                null
                        }
                        <Field
                            label="No. de Ruta"
                            autoFocus
                            placeholder={"####"}
                            keyboardType={"numeric"}
                            onChangeText={(ruta) => this.setState({ ruta })}
                            defaultValue={this.state.ruta}
                            onSubmitEditing={this.searchRuta}
                            blurOnSubmit={true}
                        />
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
    }, linea: {
        flexDirection: 'row',
        justifyContent: "space-between",
    },
});

export default connect(mapStateToProps)(Deliveries);