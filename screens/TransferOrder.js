import React from 'react';
import { ClientField,ItemView,ItemHightLight,ItemLabel } from '../components';
import {BusinessUnit} from '../components/BusinessUnit';
import { componentstyles } from '../styles'
import { View, ImageBackground, ActivityIndicator, Button, Alert, FlatList,KeyboardAvoidingView ,TouchableOpacity} from 'react-native';
import { Navigation } from 'react-native-navigation'
import backgroundImage from '../assets/labmicroBg.jpg';
import {topBarButtons} from '../constants/'
import { startTransferOrder, fillOrderDetail } from '../apicalls/transfer_order';
import { connect } from 'react-redux';
import { actionUpdateStack, actionSetArticlesMap } from '../store/actions/actions.creators'

class TransferOrder extends React.Component {

    constructor(props) {
        super(props);
        Navigation.events().bindComponent(this);
       

        this.state = {
            clienteOrigen: "",
            clienteDestino: props.clienteDestino,
            isLoading: false,
        }


    }
    navigationButtonPressed = ({ buttonId }) => {
        
        switch(buttonId){
               case 'close':
                   this.close();
                   break; 
                case 'refresh':
                    this.resetComponent();
                    break;                 
               default:
                Navigation.mergeOptions('SideMenu', {
                    sideMenu: {
                        left: {
                            visible: true
                        }
                    }
                });
        } 

    }

    resetComponent = () => {
        this.setState( {
            clienteOrigen: "",
            clienteDestino: this.props.clienteDestino,
            isLoading: false,
        });
        if ( this.props.standaloneProcess) {
            this.props.dispatch(actionSetArticlesMap(new Map()));            
        }
    }
    close=()=>{

        Navigation.dismissModal(this.props.componentId);
      
      
    }
  
    componentDidMount() {
        if(this.props.standaloneProcess){

            Navigation.mergeOptions(this.props.componentId, {
                topBar: {                  
                  ...topBarButtons.rightButtonsRefreshOnly,                
                },
              });
            
        } else {
            Navigation.mergeOptions(this.props.componentId, {
                topBar: {
                  title: {
                    text: 'Orden de Transferencia'
                  },
                  drawBehind: true,
                  background: {
                    color: '#8c30f1c7',
                    translucent: true,
                    blur: false
                  },
                  visible: true,
                  ...topBarButtons.rightButtonsClose
                
                },
              });
        }
      
        startTransferOrder(this.props.token, (response) => {
            const stack = {
                stackId: response.data.stackId,
                stateId: response.data.stateId,
                rid: response.data.rid,
            }

            this.props.dispatch(actionUpdateStack(stack));
        })
    }
    saveOrder = () => {
        this.setState({ isLoading: true });
        const list = [];

        const articles = this.props.standaloneProcess?this.props.captureArticules:this.props.articles;

        for (let article of articles.values()) {
            //const article = this.props.articles[key]
            if (article.qty) {
                list.push(article);
            }
        }

        const { token, stack, clienteEntrega, fromCyclicCount } = this.props;
        const {clienteOrigen,clienteDestino}  = this.state;

        fillOrderDetail(token, stack,{clienteOrigen,clienteDestino}, list, (doco) => {
            this.setState({ isLoading: false })
            Alert.alert("Se ha generado la orden de transferencia #" + doco );
        });

    }
    setupArticles = () => {
        Navigation.showModal({
            stack: {
                children: [
                    {
                        component: {
                            name: 'ArticleSetup',
                            passProps: {
                                businessUnit: this.state.clienteOrigen,
                                setupPrice: false,
                            }
                        },

                    }
                ]
            }
        });
    }
    render() {
        const list = [];

        const articles = this.props.standaloneProcess?this.props.captureArticules:this.props.articles;

        if(articles){
            for (let article of articles.values()) {
                //const article = this.props.articles[key]
                if (article.qty) {
                    list.push(article);
                }
            }
        }

        return (
            <ImageBackground source={backgroundImage} style={componentstyles.background}>
                <KeyboardAvoidingView style={{ height: "100%", width: "100%" }}
                    behavior="padding" enabled>
                    <View style={componentstyles.containerView}>
                        {
                            this.state.isLoading ?
                                <ActivityIndicator color="#ffffff"
                                    animating={true} size={"large"} />
                                : null
                        }
                        <BusinessUnit label="De : " placeholder="#####"
                            token={this.props.token}
                            defaultValue = {this.state.clienteOrigen}
                            unidad={(cliente) => {
                                this.setState({
                                    clienteOrigen: cliente,
                                });
                            }} />   
                        <BusinessUnit label="Para : " placeholder="#####"
                        token={this.props.token}
                        defaultValue = {this.state.clienteDestino}
                        unidad={(cliente) => {
                            this.setState({
                                clienteDestino: cliente,
                            });
                        }} />   
                                                
                        {
                            this.props.standaloneProcess
                                ?<View style={{marginBottom:5,marginTop:10,padding:10}} >
                                    <Button  title="Agregar Articulos" onPress={this.setupArticles} />

                                </View> 
                                :null
                        }

                        {
                            list.length 
                                ?<View style={{marginBottom:20,marginTop:10,padding:10}} >
                                    <Button  title="Guardar Orden de Transferencia" onPress={this.saveOrder} />

                                </View> 
                                :null
                        }
                        
                        
                        <FlatList data={list}
                        renderItem={({ item, index }) =>
                            <TouchableOpacity key={item.key} index={index} onPress={() => this.handleSelectRow(item.key)}>
                                <ItemView index={index} >
                                    <View style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }} >
                                        <ItemLabel text={"Catalogo: " + item.itemNumber} />
                                        <ItemHightLight text={"Ubicación: " + item.location} />
                                    </View>
                                    <View style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }} >
                                        <ItemLabel text={"Lote: " + item.serial} />
                                        {item.expirationDate ?
                                            <ItemLabel text={"Caducidad: " + item.expirationDate} />
                                            : null
                                        }
                                    </View>

                                    <ItemHightLight text={"Descripcion: " + item.description} />
                                    <View style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }} >
                                        <ItemHightLight text={"Cantidad: " + item.qty} />
                                        <ItemHightLight text={"Precio: " + item.price} />
                                    </View>

                                </ItemView>
                            </TouchableOpacity>

                        } />
                    </View>
                   
                </KeyboardAvoidingView>

            </ImageBackground>
        );
    }

}
const mapStateToProps = (state) => {
    return {
        user: state.user,
        token: state.user.token,
        stack: state.stack,
        captureArticules : state.articles

    }

}
export default connect(mapStateToProps)(TransferOrder);