import React from 'react';
import { View, TextInput, Text, Button, FlatList, StyleSheet, Alert, ImageBackground, ActivityIndicator } from 'react-native';
import { connect } from 'react-redux';
import { ItemView, ItemHightLight, ItemLabel } from '../../components'
import { Navigation } from 'react-native-navigation'
import { enterCyclicCount, reviewCyclicCount } from '../../apicalls/count.operations'
import { componentstyles } from '../../styles';
import backgroundImage from '../../assets/labmicroBg.jpg';
import { actionSetTransactionMode, actionUpdateStack, actionSetArticlesMap } from '../../store/actions/actions.creators';
import { transactionModes, topBarButtons } from '../../constants/';
import { mapHelpers } from '../../helpers';

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

    navigationButtonPressed = ({ buttonId }) => {
        switch (buttonId) {
            case 'sideMenu':
                this.openSideBar();
                break;
            case 'barCode':
                this.openBarcode('BarcodeReader');
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

    openBarcode = (screen) => {

        this.props.dispatch(actionSetTransactionMode(transactionModes.READ_ADD));

        Navigation.showModal({
            stack: {
                children: [
                    {
                        component: {
                            name: screen,
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
            }else{
                list.push({...article,qty:"0"});
            }
        }
        this.setState({ isLoading: true });
        
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
                                const rows = response.data.fs_P5541240_W5541240A.data.gridData.rowset;
                                const cyclicCount = rows.filter(item => item.mnCycleNumber_25.value === this.props.cycleCountNumber)
                                if (cyclicCount) {
                                    reviewCyclicCount(this.props.user.token, this.props.stack, cyclicCount.rowIndex, (response) => {

                                        const rawRows = response.data.fs_P41241_W41241A.data.gridData.rowset;
                                       
                                        const review = rawRows.map((item,index) => (
                                            {
                                                key: index,
                                                serial: item.sLotSerial_21.value,
                                                description: item.sDescription_28.value,
                                                location: item.sLocation_61.value,
                                                itemNumber: item.sItemNumber_42.value,
                                                rowId: item.rowIndex,
                                                qtyCounted: item.mnQuantityCounted_25.value,
                                                qtyOnHand:  item.mnQuantityOnHand_23.value,
                                                qtyVariance:  item.mnQuantityVariance_31.value,
                                                safetyStock:item.mnSafetyStock_97.value,
                                                isItem: item.sDescription_28.value === 'TOTALS' || item.sDescription_28.value === 'TOTALES' ? false : true,
                                            }
                                        ));

                                        this.setState({ review, isLoading: false });


                                    })
                                }

                            }
                        }
                    ])

                }
            });
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
        Alert.alert("Aviso", "Conteo Ciclico Autorizado", [
            {
                text: "Crear Orden de Venta",
                onPress: this.createSaleOrder

            },
            {
                text: "Cerrar",
                onPress: () => Navigation.pop(this.props.componentId)

            }
        ])

    }
    createSaleOrder = () => {

        const articlesToOrder = mapHelpers.reviewToArticles(this.state.review);

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
                        <Review list={review}  isWareHouse={this.props.isWareHouse} /> :
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
    };
}
export default connect(mapStateToProps)(EnterCycleCount);

const Articles = ({ list }) => (
    <View style={{ marginTop: 15 }} >
        <Text style={componentstyles.title}> Conteo de ArticSulos </Text>
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
const Review = ({ list,isWareHouse }) => (
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
                            { isWareHouse?null
                              :<ItemLabel text={"Inventario Seguridad: " + item.safetyStock} />
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
