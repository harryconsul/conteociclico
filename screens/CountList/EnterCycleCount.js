import React from 'react';
import { View, TextInput, Text, Button, FlatList, StyleSheet, Alert, ImageBackground, ActivityIndicator } from 'react-native';
import { connect } from 'react-redux';
import { ItemView, ItemHightLight, ItemLabel } from '../../components'
import { Navigation } from 'react-native-navigation'
import { enterCyclicCount, processReview } from '../../apicalls/count.operations'
import { componentstyles } from '../../styles';
import backgroundImage from '../../assets/labmicroBg.jpg';
import { actionSetTransactionMode, actionUpdateStack, actionSetArticlesMap, actionSetSucursal } from '../../store/actions/actions.creators';
import { transactionModes, topBarButtons } from '../../constants/';
import { mapHelpers,offlineCount } from '../../helpers';

class EnterCycleCount extends React.Component {
    constructor(props) {
        super(props);
        Navigation.events().bindComponent(this);
        this.state = {
            search: "",
            articles: [],
            mapIndex: {},
            review: null,
            isLoading: false,
            waitingForSign: 0,

        }
    }
    componentDidMount(){
        this.props.dispatch(actionSetSucursal(this.props.businessUnit));
        
    }

    navigationButtonPressed = ({ buttonId }) => {
        switch (buttonId) {
            case 'sideMenu':
                this.openSideBar();
                break;
            case 'barCode':
                this.openBarcode('BarcodeReader');
                break;
            default:
                this.openBarcode(this.props.conteoSucursal?'PickupBarcodeInput':'BarcodeInput');
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

    openBarcode = (screen) => {

        this.props.dispatch(actionSetTransactionMode(transactionModes.READ_ADD));

        Navigation.showModal({
            stack: {
                children: [
                    {
                        component: {
                            name: screen,  
                            passProps:{
                                hasSerial:this.props.conteoSucursal,
                            },
                                                   
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
    saveEntry = () => {

        const list = [];

        for (let article of this.props.articles.values()) {
            //const article = this.props.articles[key]
            if (article.qty) {
                list.push(article);
            } else {
                list.push({ ...article, qty: "0" });
            }
        }
        this.setState({ isLoading: true });
        if(this.props.user.token){
            enterCyclicCount(this.props.user.token, this.props.stack, list,
                (response) => {
                    const stack = {
                        stackId: response.data.stackId,
                        stateId: response.data.stateId,
                        rid: response.data.rid,
                        currentApplication: response.data.currentApp,
                    }
                    this.props.dispatch(actionUpdateStack(stack));
    
                    if (response.data.currentApp === 'P5541240_W5541240A') {
                        Alert.alert("Exito", "Conteo Registrado , se procede a validar las variaciones", [
                            {
                                text: "Continuar",
                                onPress: () => {
                                    
                                    processReview(response,this.props.cycleCountNumber,this.props.user.token,this.props.stack)
                                        .then((review)=>{
                                            this.setState({ review, isLoading: false });
                                            offlineCount.deleteCyclicCount(this.props.realm,this.props.cycleCountNumber);
                                        })
                                        .catch((error)=>{
                                            Alert.alert(error);
                                            this.setState({isLoading:false});
                                        });
                                    
    
                                }
                            }
                        ])
    
                    }
                });

        }else{
            offlineCount.updateCyclicCountArticles(this.props.realm,this.props.cycleCountNumber,list);            
            this.setState({ isLoading: false });
            Alert.alert("Conteo Guardado","La revision de varaciones se hara en automatico cuando se sincronize",
                [
                    {
                        text:"Firmar",
                        onPress:this.authorizeCounting
                    }
                ]
            )
            
        }
       
    }
    showPlaceSign = (signType) => {

        Navigation.showModal({
            stack: {
                children: [
                    {
                        component: {
                            name: "PlaceSign",
                            passProps: {
                                itemKey: this.props.cycleCountNumber,
                                fileName: "firma-" + signType + "-" + this.props.cycleCountNumber,
                                title: 'Firma de quien ' + signType,
                                signatureType:signType,
                                closeOnSave: true,
                            }
                        },
                        options: {
                            topBar: {
                                title: {
                                    text: 'Firma de quien ' + signType
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
    componentDidAppear() {
        switch (this.state.waitingForSign) {
            case 1:
                this.setState({ waitingForSign: 2 });
                this.showPlaceSign("cuenta");
                break;
            case 2:
                this.setState({ waitingForSign: 3 });
                this.registerAutorization();
            default:
                break;
        }
    }
    registerAutorization = () => {
        if(this.props.user.token){
        Alert.alert("Aviso", "Conteo Ciclico Autorizado", [
            this.props.conteoSucursal
                ?null
                :{
                    text: "Crear Orden de Venta",
                    onPress: this.createSaleOrder

                },
            {
                text: "Cerrar",
                onPress: () => Navigation.pop(this.props.componentId)

            }
        ])
    }else{

        Alert.alert("Aviso", "Conteo Ciclico Autorizado", [
          
            {
                text: "Cerrar",
                onPress: () => Navigation.pop(this.props.componentId)

            }
        ]);

    }

    }
    createSaleOrder = () => {

        const articlesToOrder = mapHelpers.reviewToArticles(this.state.review,this.props.isWareHouse);

        this.props.dispatch(actionSetArticlesMap(articlesToOrder));
                
        Navigation.push(this.props.componentId, {
            component: {
                name: 'SaleOrder',
                id: 'SaleOrder',
                passProps: {
                    fromCyclicCount: true,
                    clienteEntrega: this.props.businessUnit,
                },
                options: {
                    topBar: {
                        title: {
                            text: 'Orden de Venta',
                            color: '#ffffff'
                        },
                        ...topBarButtons.rightButtons
                    }
                }
            },

        });

    }
    authorizeCounting = () => {
        this.setState({ waitingForSign: 1 });
        this.showPlaceSign("autoriza");

    }
    render() {
        const list = [];
        const { review } = this.state;
        if (!review) {
            for (let article of this.props.articles.values()) {
                //const article = this.props.articles[key]
                if (article.qty) {
                    list.push(article);
                }
            }
        }
        return (
            <ImageBackground source={backgroundImage} style={componentstyles.background} >
                <View style={componentstyles.containerView} >
                    {
                        this.state.isLoading ?
                            <ActivityIndicator color="#ffffff" animating={true} size={"large"} />
                            : null
                    }
                    <Text style={componentstyles.title}> {"Numero de Conteo Ciclico: " + this.props.cycleCountNumber} </Text>
                    <View style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
                        <View style={styles.buttonSave}>
                            <Button disabled={review ? true : false} color="#ccb82e" onPress={this.saveEntry} title="Guardar" />
                        </View>
                        <View style={styles.buttonSave}>
                            <Button disabled={review ? false : true} onPress={this.authorizeCounting} title="Autorizar" />
                        </View>
                    </View>

                    {review ?
                        <Review list={review} isWareHouse={this.props.isWareHouse} /> :
                        <Articles list={list} />
                    }

                </View >
            </ImageBackground>


        )
    }

}
const styles = StyleSheet.create({
    textBuscar: {
        marginBottom: 10,
        borderBottomColor: "#000000",
        borderBottomWidth: 1,
    },
    buttonSearch: {
        marginBottom: 10
    },
    buttonSave: {
        width: "50%",

    }
})
const mapStateToProps = state => {
    return {
        articles: state.articles,
        stack: state.stack,
        user: state.user,
        realm: state.countRealm,
    };
}
export default connect(mapStateToProps)(EnterCycleCount);

const Articles = ({ list }) => (
    <View style={{ marginTop: 15 }} >
        <Text style={componentstyles.title}> Conteo de Articulos </Text>
        <FlatList data={list}
            renderItem={({ item, index }) => {
                return <ItemView key={index} index={index}>
                    <View style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
                        <ItemLabel text={"Catalogo " + item.itemNumber} />
                        <ItemLabel text={"Numero Único: " + item.key} />
                    </View>
                    <View style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
                        <ItemLabel text={"Lote/Serie: " + item.serial} />
                        <ItemLabel text={"Ubicación: " + item.location} />
                    </View>
                    <ItemHightLight text={item.description} />
                    <View style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
                        <ItemLabel text={"UM: " + item.um} />
                        <ItemLabel text={"Cantidad Contada: " + item.qty} />
                    </View>

                </ItemView>
            }}
        />
    </View>

);
const Review = ({ list, isWareHouse }) => (
    <View style={{ marginTop: 15 }}>
        <Text style={componentstyles.title}> Diferencias </Text>

        <FlatList data={list}
            renderItem={({ item, index }) => {
                const itemClass = item.isItem ? 1 : 2;
                return <ItemView key={index} index={itemClass}>
                    {item.isItem ?
                        <View style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
                            <ItemLabel text={"Lote/Serie : " + item.serial} />
                            <ItemLabel text={"Ubicación: " + item.location} />
                            {isWareHouse ? <ItemLabel text={"Inventario Seguridad: " + item.safetyStock} />
                                : null
                            }
                        </View> : null
                    }
                    <View style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
                        <ItemHightLight text={item.description} />
                        <ItemLabel text={"Cantidad Esperada: " + item.qtyOnHand} />
                    </View>

                    <View style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
                        <ItemLabel text={"Cantidad Contada: " + item.qtyCounted} />
                        <ItemHightLight text={"Variación: " + item.qtyVariance} />

                    </View>

                </ItemView>
            }}
        />
    </View>
);
