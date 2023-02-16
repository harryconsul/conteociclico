import React from 'react';
import {
    View, Button, FlatList,
    ImageBackground, StyleSheet, TouchableOpacity,
    ActivityIndicator, KeyboardAvoidingView,Alert
} from 'react-native';
import { connect } from 'react-redux';
import { Navigation } from 'react-native-navigation';
import { BusinessUnit } from '../../components/BusinessUnit';
import { ItemView, ItemHightLight, ItemLabel } from '../../components'
import { listCyclicCount, selectCyclicCount ,processReview} from '../../apicalls/count.operations';
import { transactionModes } from '../../constants'
import { actionUpdateStack, actionSetArticlesMap, actionSetTransactionMode ,actionSetCountRealm } from '../../store/actions/actions.creators';
import { componentstyles } from '../../styles';
import backgroundImage from '../../assets/labmicroBg.jpg';
import { topBarButtons } from '../../constants';
import {offlineCount,syncronizeCount,mapHelpers} from '../../helpers'
class CountList extends React.Component {

    constructor(props) {
        super(props);
        Navigation.events().bindComponent(this);
        this.state = {
            rows: [],
            businessUnit: "",
            isLoading: false,
        }
    }

    componentDidMount(){
        
        offlineCount.initCyclicCount().then(realm=>{
            this.props.dispatch(actionSetCountRealm(realm));

        }).catch((error)=>console.warn(error));
        
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


    searchCyclicCount = () => {
        this.setState({ isLoading: true });
        if(this.props.user.token){

            listCyclicCount(this.props.user.token, this.state.businessUnit, (response) => {

                const rawRows = response.data.fs_P5541240_W5541240A.data.gridData.rowset;                
                const rows = rawRows.map(item => ({
                    key: item.mnCycleNumber_25.value,
                    number: item.mnCycleNumber_25.value,
                    description: item.sDescription_30.value,
                    businessUnit:Number(this.state.businessUnit),
                    rowId: item.rowIndex,
                }));
                const rowsOffline = offlineCount.listCyclicCounts(this.props.realm,Number(this.state.businessUnit));
                
                const finalRows = new Map();
                rows.forEach(row=>finalRows.set(row.key,{...row}));
                rowsOffline.forEach(row=>{
                    const onlineRow  = finalRows.get(row.key);

                    finalRows.set(row.key,{
                        ...row,
                        rowId:onlineRow?onlineRow.rowId:row.rowId,
                    });
                });
               
                this.setState({ rows:[...finalRows.values()], isLoading: false });
                const stack = {
                    stackId: response.data.stackId,
                    stateId: response.data.stateId,
                    rid: response.data.rid,
                    currentApplication: "P5541240_W5541240A",
                }
                this.props.dispatch(actionUpdateStack(stack));
            });

        }else{
            if(!this.props.conteoSucursal){
                const rows = offlineCount.listCyclicCounts(this.props.realm,Number(this.state.businessUnit));
            }    
              
            this.setState({rows,isLoading:false});    
        }
       
    }

    onlineArticleSetup=(response,row)=>{
        
        const rowsData = response.data.fs_P4141_W4141A.data.gridData.rowset;
        const cycleCountNumber = response.data.fs_P4141_W4141A.data.txtCycleCountNumber_8.value;
        
        const articlesMap = rowsData.reduce((previous, current, index) => {
            const key = current.mnNmeroEtiqueta_182.value;
            previous.set(key, {
                key,
                serial: current.sLotSerial_27.value,
                description: current.sDescription_30.value,
                location: current.sLocation_82.value,
                um: current.sUM_32.value,
                itemNumber : current.sItemNumber_125.value,
                rowId: current.rowIndex,
                qty:0,
                
            });

            return previous;
        }, new Map());

                
        if(!this.props.conteoSucursal){
            offlineCount.insertCyclicCount(this.props.realm,{
                ...row,
                articles:articlesMap 
            });
        }
        

        const stack = {
            stackId: response.data.stackId,
            stateId: response.data.stateId,
            rid: response.data.rid,

        }
        this.props.dispatch(actionUpdateStack(stack));

        this.startCount(articlesMap,cycleCountNumber);

    }
    handleSelectRow = (row) => {
        this.setState({ isLoading: true });
        if(this.props.user.token){
            try{
                selectCyclicCount(this.props.user.token, this.props.stack, row.rowId, (response) => {
                    const sincronizar = row.needsSyncronize == undefined ? false : row.needsSyncronize;
                    if(!sincronizar){
                        this.onlineArticleSetup(response,row);
                    }else{
                        
                        const stack = {
                            stackId: response.data.stackId,
                            stateId: response.data.stateId,
                            rid: response.data.rid,
            
                        }
                        this.props.dispatch(actionUpdateStack(stack));
    
                        Alert.alert('Sincronizacíon Requerida','Este conteo sera enviado al sistema JD Edwards',
                          [
                              {
                                  text:"Sincronizar",
                                  onPress:()=>{
                                        syncronizeCount.uploadCount(this.props.user.token,
                                            this.props.stack,row.key,row.articles,row.whoCountsSignature,row.whoCountsSignatureTxt,
                                            row.whoAutorizeSignature,row.whoAutorizeSignatureTxt,(enterCountResponse)=>{
                                                const stack = {
                                                    stackId: enterCountResponse.data.stackId,
                                                    stateId: enterCountResponse.data.stateId,
                                                    rid: enterCountResponse.data.rid,
                                    
                                                }
                                                
                                                this.props.dispatch(actionUpdateStack(stack));
                                                processReview(enterCountResponse,row.key,this.props.user.token,stack)
                                                .then((review)=>{
                                                   
                                                    offlineCount.deleteCyclicCount(this.props.realm,row.key);
                                                    Alert.alert("Aviso", "Conteo Ciclico Autorizado", [
                                                        {
                                                            text: "Crear Orden de Venta",
                                                            onPress:()=>this.createSaleOrder(review),
                                            
                                                        },
                                                        {
                                                            text: "Cerrar",
                                                            onPress: () => Navigation.pop(this.props.componentId)
                                            
                                                        }
                                                    ])
    
    
                                                })
                                                .catch((error)=>{
                                                    Alert.alert(error);
                                                    this.setState({isLoading:false});
                                                });
    
                                                
    
                                            });
                                  }
                              }
                          ]
                        )
    
                    }
                   
                });
            }catch(e){
                console.log("Exception: ",e);
            }
            

        }else{
           
            if(row.articles){

                const articlesMap = row.articles.reduce((previous, current, index) => {
                    const key = current.key;
                    previous.set(key, {
                        ...current
                        
                    });

                    return previous;
                }, new Map());
                
                this.startCount(articlesMap,row.number);

            }
        }
       
    }
    createSaleOrder = (review) => {
        
        const articlesToOrder = mapHelpers.reviewToArticles(review);

        this.props.dispatch(actionSetArticlesMap(articlesToOrder));
                
        Navigation.push(this.props.componentId, {
            component: {
                name: 'SaleOrder',
                id: 'SaleOrder',
                passProps: {
                    fromCyclicCount: true,
                    clienteEntrega: this.state.businessUnit,
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
    startCount=(articlesMap,cycleCountNumber)=>{
        this.setState({ isLoading: false });
        this.props.dispatch(actionSetArticlesMap(articlesMap));
        
      
        this.props.dispatch(actionSetTransactionMode(transactionModes.READ_ADD));
        Navigation.push(this.props.componentId, {
            component: {
                name: 'EnterCycleCount',
                id: 'EnterCycleCount',
                passProps: {
                    cycleCountNumber,
                    businessUnit:this.state.businessUnit,
                    isWareHouse:this.props.conteoSucursal,
                },
                options: {
                    topBar: {
                        title: {
                            text: 'Registra entradas conteo',
                            color: '#ffffff'
                        },
                        ...topBarButtons.rightButtons
                    }
                }
            },

        });

    }
    render() {
        return (
            <ImageBackground source={backgroundImage} style={componentstyles.background}>
                <KeyboardAvoidingView
                    style={{ height: "100%", width: "100%" }} keyboardVerticalOffset={20} behavior="padding">
                    <View style={componentstyles.containerView}>
                        {
                            this.state.isLoading ?
                                <ActivityIndicator color="#ffffff" animating={true} size={"large"} />
                                : null
                        }
                        <BusinessUnit label="Unidad de Negocio" placeholder="#####"
                            token={this.props.user.token}
                            unidad={(businessUnit) => this.setState({ businessUnit })} />
                        <Button title="Buscar Conteo"
                            onPress={this.searchCyclicCount}
                            disabled={this.state.businessUnit ? false : true}
                        />

                        <FlatList style={{ marginTop: 6}} data={this.state.rows}
                            renderItem={({ item, index }) =>
                                <TouchableOpacity onPress={() => this.handleSelectRow(item)}>
                                    <ItemView index={index} >
                                        <ItemLabel text={"Número: " + item.number} />
                                        <ItemHightLight text={"Descripcion: " + item.description} />
                                        {
                                            item.needsSyncronize?
                                            <View style={{display:"flex",flexDirection:"row",justifyContent:"flex-end"}}>
                                                <ItemLabel text={"Sincronización Pendiente"} />
                                            </View>
                                            :null
                                        }
                                       
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
        stack: state.stack,
        realm: state.countRealm,
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
export default connect(mapStateToProps)(CountList);
