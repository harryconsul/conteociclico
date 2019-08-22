import React from 'react';
import { View } from 'react-native';
import SideMenuItem from '../components/SideMenuItem'
import {Navigation} from 'react-native-navigation'
import {connect} from 'react-redux';
import barCodeIcon from '../assets/iconbarcode.png'
class SideMenu extends React.Component {
    optionClickHandle=(option)=>{
        Navigation.push(this.props.currentScreen, {
            component: {
                id:option,
                name: option,
                options: {
                    topBar: {
                        title: {
                            text: 'Consulta de Existencias',
                            color:'#ffffff'
                        },
                        rightButtons:[
                            {
                                id:"barCode",
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
               <SideMenuItem optionClickHandle={()=>this.optionClickHandle("QueryArticles")}
                    optionName="Conteo Ciclico" />
               <SideMenuItem optionClickHandle={()=>this.optionClickHandle("QueryArticles")} 
                    optionName="Consulta de Existensias"/>
                <SideMenuItem optionClickHandle={()=>this.optionClickHandle("PlaceSign")} 
                    optionName="Firma Algo"/>
                <SideMenuItem optionClickHandle={()=>this.optionClickHandle("ProductsPickup")} 
                    optionName="Recoleccion de Producto"/>
               <SideMenuItem optionName="Salidas por Caducidad" />
               
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