import React from 'react';
import { View } from 'react-native';
import SideMenuItem from '../components/SideMenuItem'
import {Navigation} from 'react-native-navigation'
import {connect} from 'react-redux';
import barCodeIcon from '../assets/iconbarcode.png'
class SideMenu extends React.Component {
    optionClickHandle=(option,title)=>{
        Navigation.push(this.props.currentScreen, {
            component: {
                id:option,
                name: option,
                options: {
                    topBar: {
                        title: {
                            text: title,
                            color:'#ffffff'
                        },
                        rightButtons:[
                            {
                                id:"barCode",
                                icon:barCodeIcon,
                            },
                            {
                                id:"inputCode",
                                icon:barCodeIcon,
                            }
                        ]
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
    render() {
        return (
            <View style={{ paddingTop:50,height:"100%",backgroundColor: '#8c30f1' }} >
               <SideMenuItem optionClickHandle={()=>this.optionClickHandle("CyclicCountList","Conteo Ciclico")}
                    optionName="Conteo Ciclico" />
               <SideMenuItem optionClickHandle={()=>this.optionClickHandle("QueryArticles","Consulta de Existensias")} 
                    optionName="Consulta de Existensias"/>
                <SideMenuItem optionClickHandle={()=>this.optionClickHandle("PlaceSign","Firma")} 
                    optionName="Firma Algo"/>
                <SideMenuItem optionClickHandle={()=>this.optionClickHandle("ProductsPickup","Recoleccion de Producto")} 
                    optionName="Recoleccion de Producto"/>
               <SideMenuItem optionName="Salidas por Caducidad" />
               <SideMenuItem optionName="Salidas por Transferencia" 
                 optionClickHandle={()=>
                    this.optionClickHandle("InventoryTransfer","Salidas por Transferencia")} 
                />
                <SideMenuItem optionName="Orden de Venta" 
                 optionClickHandle={()=>
                    this.optionClickHandle("SaleOrder","Orden de Venta")} 
                />
               
            </View>
        ) 
    }
}
const mapStateToProps=state=>{
    return {
        currentScreen:state.currentScreen,
    }
}
export default connect(mapStateToProps)(SideMenu);