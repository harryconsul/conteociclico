import React from 'react';
import {
    View, Text, Button, FlatList,
    ImageBackground, StyleSheet, TouchableOpacity,
    ActivityIndicator, KeyboardAvoidingView, Alert,
} from 'react-native';
import { connect } from 'react-redux';
import { Navigation } from 'react-native-navigation';
import Field from '../components/Field';
import { ItemView, ItemHightLight, ItemLabel } from '../components'
import { searchOrder } from '../apicalls/confirm_transfer.operations';
import { transactionModes } from '../constants'
import { componentstyles } from '../styles';
import backgroundImage from '../assets/labmicroBg.jpg';
import { businessUnit } from '../apicalls/business_unit.operations';

class ConfirmTransfer extends React.Component {

    constructor(props) {
        super(props);
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
                this.openBarcode('BarcodeInput');
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

    render() {
        return (
            <ImageBackground source={backgroundImage} style={componentstyles.background}>
                <KeyboardAvoidingView
                    style={{ height: "100%", width: "100%" }} enabled behavior="padding">
                    <View style={componentstyles.containerView}>

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
    }

}
export default connect(mapStateToProps)(ConfirmTransfer);