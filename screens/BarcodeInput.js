import React from 'react';
import {
    View, Button,  StyleSheet, Alert,KeyboardAvoidingView
     ,TextInput,ImageBackground
} from 'react-native';
import Field from '../components/Field';
import { ItemView, ItemHightLight, ItemLabel } from '../components'
import { connect } from 'react-redux';
import { Navigation } from 'react-native-navigation';
import { actionSetArticle } from '../store/actions/actions.creators';
import { transactionModes } from '../constants';
import backgroundImage from '../assets/labmicroBg.jpg';
import { componentstyles } from '../styles';


class BarcodeInput extends React.Component {
    state = {
        editingItem: null,
        isEditing: false,
        qty: 0,
    }
    handleAccept = () => {
        const { editingItem, qty } = this.state;
        const item = { ...editingItem, qty };




        this.props.dispatch(actionSetArticle(item));

        this.setState(
            {
                editingItem: null,
                searchCode: "",
                isEditing: false,
                qty: 0,

            }
        )
    }
    barCodeHandler = () => {
        //Get the item
        if (this.props.transactionMode === transactionModes.READ_RETURN) {
            const item = {
                key: "search",
                value: this.state.searchCode,
            }
            this.props.dispatch(actionSetArticle(item));
            Navigation.dismissModal(this.props.componentId);

        } else {//busqueda del elemento en la lista
            const item = this.props.list.get(this.state.searchCode);

            if (item) {

                const editingItem = { ...item };



                if (!editingItem.qty) {
                    editingItem.qty = 0;
                }
                if (this.props.transactionMode === transactionModes.READ_ADD) {
                    editingItem.qty++;
                } else {
                    if (editingItem.qty) {
                        editingItem.qty--;
                    }
                }



                this.setState({
                    editingItem,
                    qty: editingItem.qty,
                    isEditing: true,
                });


            } else {
                this.setState({ isEditing: true });
                Alert.alert("No encontrado ", "No hemos podido encontrar " + this.state.searchCode,
                    [{
                        text: "Continuar",
                        onPress: () => this.setState({ isEditing: false }),
                    }]);
            }
        }

    }
    render() {
        const item = this.state.editingItem;
        const qty = this.state.qty;
        return (
            <ImageBackground source={backgroundImage} style={componentstyles.background}>
                <KeyboardAvoidingView
                    style={{ height: "100%", width: "100%" }} keyboardVerticalOffset={20} behavior="padding">
                    <View style={componentstyles.containerView}>
                        <Field onChangeText={(text) => this.setState({ searchCode: text })}
                            onSubmitEditing={this.barCodeHandler}
                            autoFocus={true}
                            placeholder="#####" label="Busqueda por Handheld" />
                        {

                            item ?
                                <ItemView index={0}>
                                    <View style={{ flex: 1, justifyContent: "space-between" }}>
                                        <ItemLabel text={item.serial} />
                                        <ItemLabel text={item.location} />
                                        <ItemLabel text={"Unidad de Medida: " + item.um} />
                                    </View>
                                    <ItemHightLight text={item.description} />
                                    <View style={{ flex: 1, justifyContent: "space-between" }}>
                                        <TextInput value={String(qty)} onChangeText={(text) => this.setState({ qty: text })} />
                                    </View>
                                    <Button title="Aceptar" onPress={this.handleAccept} />

                                </ItemView>
                                : null
                        }


                    </View>
                </KeyboardAvoidingView>
            </ImageBackground >
        )
    }
}
const mapStateToProps = state => {
    return {
        list: state.articles,
        transactionMode: state.transactionMode,
    };
}
const styles = StyleSheet.create({
    barcodeGuide: {
        alignSelf: "center",
        borderStyle: "solid",
        borderColor: "#ffffff",
        borderWidth: 1,
        height: "30%",
        width: "70%",



    }
})
export default connect(mapStateToProps)(BarcodeInput);
