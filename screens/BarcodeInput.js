import React from 'react';
import {
    View, StyleSheet, Alert, KeyboardAvoidingView
    , ImageBackground ,Switch,Text
} from 'react-native';
import Field from '../components/Field';
import { ArticleCard } from '../components'
import { connect } from 'react-redux';
import { Navigation } from 'react-native-navigation';
import { actionSetArticle } from '../store/actions/actions.creators';
import { transactionModes } from '../constants';
import backgroundImage from '../assets/labmicroBg.jpg';
import closeIcon from '../assets/iconclose.png';
import { componentstyles } from '../styles';
import ArticleScanMode from '../components/ArticleScanMode';


class BarcodeInput extends React.Component {
    constructor(props) {
        super(props);
        Navigation.events().bindComponent(this);
        this.state = {
            editingItem: null,
            isEditing: false,
            qty: 0,
            articleRef: React.createRef(),
            searchCode: "",
            confirmMode:false,
        }

    }

    componentDidMount = () => {
        Navigation.mergeOptions(this.props.componentId, {
            topBar: {
                title: {
                    text: 'Lectura de Codigo de Barras'
                },
                drawBehind: true,
                background: {
                    color: '#8c30f1c7',
                    translucent: true,
                    blur: false
                },
                visible: true,
                rightButtons:[
                    {
                        id:'close',
                        icon:closeIcon,
                    }
                ]

                
            },
        });
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

        this.state.articleRef.current.focus();
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
                },()=>{
                    if(!this.state.confirmMode){
                        this.handleAccept();
                    }
                });


            } else {
                this.setState({ isEditing: true });
                Alert.alert("No encontrado ", "No hemos podido encontrar " + this.state.searchCode,
                    [{
                        text: "Continuar",
                        onPress: () => {
                            this.setState({ isEditing: false,searchCode:"" });
                            this.state.articleRef.current.focus();
                        },
                    }]);
            }
        }

    }
    close=()=>{
        Navigation.dismissModal(this.props.componentId);
    }
    navigationButtonPressed = ({ buttonId }) => {
        switch(buttonId){
               case 'close':
                   this.close();
                   break;              
               default:
                    this.close();
        } 
   }
    render() {
        const item = this.state.editingItem;
        const {qty,confirmMode}=  this.state;
        return (
            <ImageBackground source={backgroundImage} style={componentstyles.background}>
                <KeyboardAvoidingView
                    style={{ height: "100%", width: "100%" }} keyboardVerticalOffset={20} behavior="padding">
                    <View style={componentstyles.containerView}>
                       <ArticleScanMode confirmMode={confirmMode} changeMode={(confirmMode)=>this.setState({confirmMode})} />
                        <Field onChangeText={(text) => this.setState({ searchCode: text })}
                            onSubmitEditing={this.barCodeHandler}
                            autoFocus={true}
                            value={this.state.searchCode}
                            inputRef={this.state.articleRef}
                            placeholder="#####" label="Busqueda por Handheld" />
                        {

                            item ?
                                <ArticleCard handleAccept={this.handleAccept}
                                    item={item} qty={qty}
                                    setQty={(qty) => this.setState({ qty })} />
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
