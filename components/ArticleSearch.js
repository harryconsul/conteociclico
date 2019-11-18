import React from 'react';
import {
    View, FlatList, ImageBackground, Text,
    StyleSheet, ActivityIndicator, TouchableOpacity, Alert,
} from 'react-native';
import { connect } from 'react-redux';

import { ItemView, ItemLabel } from '../components';
import { componentstyles } from '../styles';
import Field from '../components/Field';

import { queryArticle } from '../apicalls/query.operation';
import { BusinessUnit } from '../components/BusinessUnit';


class ArticleSearch extends React.Component {

    constructor(props) {
        super(props);
       
        this.state = {
            producto: "",
            unidad: props.businessUnit ? props.businessUnit : "",
            unidadNombre: "",
            rows: [],
            isLoading: false,
            pedingSearch:true,
            articleRef: React.createRef(),
        }
    }

      

    unidadNegocio = (unidad) => {
        //Los datos de esta función, se alimentan desde BusinessUnit
        this.setState({ unidad });
    }

    search = () => {
        this.setState({isLoading:true});
       searchArticle(this.state.unidad,this.state.producto,this.props.user.token)
        .then(response=>this.setState({isLoading:false,rows:response})).catch(error=>{
            this.setState({isLoading:false});
            Alert.alert(error);
        });
       
    }
    

    render() {
        const  rows = this.state.rows.length ? this.state.rows : this.props.queryRows;
        
        return (
            <View  style={componentstyles.background}>
                <View style={{ ...componentstyles.containerView, width: '100%', margin: 5 }}>
                    {
                        this.props.businessUnitNombre ?
                            <View style={styles.shadow}>
                                <View style={styles.header}>
                                    <Text style={styles.headerTitle}>{this.props.businessUnitNombre}</Text>
                                </View>
                                <Field
                                    onChangeText={(text) => this.setState({ producto: text })}
                                    keyboardType={"numeric"}
                                    onSubmitEditing={this.search}
                                    inputRef={this.state.articleRef}
                                    placeholder="#####" label="Número único" />
                            </View>
                            :
                            <View style={styles.linea} >
                                <View style={{ width: "40%" }}>
                                    <BusinessUnit token={this.props.user.token}
                                        label={"Unidad de Negocio"} placeholder={"####"}
                                        defaultValue={this.props.businessUnit}
                                        defaultValueNombre={this.props.businessUnitNombre}
                                        unidad={this.unidadNegocio} />

                                </View>
                                <View style={{ width: "60%" }}>
                                    <Field
                                        onChangeText={(text) => this.setState({ producto: text })}
                                        keyboardType={"numeric"}
                                        onSubmitEditing={this.search}
                                        defaultValue = {this.state.producto}
                                        inputRef={this.state.articleRef}
                                        placeholder="#####" label="Número único" />
                                </View>
                            </View>
                    }

                    {
                        this.state.isLoading ?
                            <ActivityIndicator color="#ffffff"
                                animating={this.state.isLoading} size={"large"} />
                            :
                            null
                    }
                    {
                        this.state.rows ?
                            <FlatList data={rows}
                                renderItem={({ item, index }) =>
                                    <TouchableOpacity key={item.key}
                                        onPress={this.props.handleClickRow ? () => this.props.handleClickRow(item) : null} >
                                        <ItemView index={index} >
                                            <View style={styles.linea}>
                                                <View style={{ width: "33%" }}>
                                                    <ItemLabel text={"No. " + item.etiqueta} />
                                                </View>
                                                <View style={{ width: "67%" }}>
                                                    <ItemLabel text={"Catálogo: " + item.itemNumber} />
                                                </View>
                                            </View>
                                            <View style={styles.linea}>
                                                <View style={{ width: "100%" }}>
                                                    <ItemLabel text={item.producto} />
                                                </View>
                                            </View>
                                            <View style={styles.linea}>
                                                <View style={{ width: "33%" }}>
                                                    <ItemLabel style={{ fontWeight: 'bold', }} text={"Disp.: " + item.disponible + " " + item.unidadMedida} />
                                                </View>
                                                <View style={{ width: "33%" }}>
                                                    <ItemLabel text={"Exis.: " + item.existencia + " " + item.unidadMedida} />
                                                </View>
                                                <View style={{ width: "34%" }}>
                                                    <ItemLabel text={"Comp.: " + item.comprometido + " " + item.unidadMedida} />
                                                </View>
                                            </View>
                                            <View style={styles.linea}>
                                                <View style={{ width: "65%" }}>
                                                    <ItemLabel text={"Ubicación: " + (item.ubicacion ? item.ubicacion : "")} />
                                                </View>
                                            </View>
                                            <View style={styles.linea}>
                                                <View style={{ width: "40%" }}>
                                                    <ItemLabel text={"Cad.: " + item.caducidad} />
                                                </View>
                                                <View style={{ width: "60%" }}>
                                                    <ItemLabel text={"Lote: " + item.lote} />
                                                </View>
                                            </View >

                                        </ItemView>
                                    </TouchableOpacity>
                                } />
                            :
                            null
                    }
                </View>
            </View>

        )
    }
}
const mapStateToProps = (state) => {
    return {
        user: state.user,
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
    },
    linea: {
        flexDirection: 'row',
        justifyContent: "space-between",
        marginLeft: 7,
        marginRight: 7,
    },
    titulo: {
        color: "#ffffff",
        fontSize: 16,
        fontWeight: 'bold',
    },
    shadow: {
        shadowColor: 'black',
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 6,
        shadowOpacity: 0.5,
        backgroundColor: 'transparent',
        elevation: 5,
        padding: 10,
        borderRadius: 10,
    },
    header: {
        width: '100%',
        height: 45,
        padding: 5,
        backgroundColor: 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        color: 'white',
        fontSize: 20,

    }

});
export default connect(mapStateToProps)(ArticleSearch);

export const searchArticle = (unidad,producto,token) => {
    return new Promise( (resolve,reject)=>{
        if (unidad != 0) {
            //1ero debe existir la unidad de negocio
            if (producto.length != 0) {
                //2do siempre debe ingresar un número de producto
                
                queryArticle(unidad, producto, token, (data) => {
                    const rawRows = data.fs_P5541001_W5541001A.data.gridData.rowset;
                    if (rawRows.length != 0) {
                        const rows = rawRows.map((item, index) => ({
                            key: index,
                            etiqueta: item.mnNmeronico_24.value,
                            producto: item.sDescription_38.value,
                            unidadNegocio: item.sBusinessUnit_48.value,
                            ubicacion: item.sLocation_55.value,
                            lote: item.sLotSerialNumber_37.value,
                            disponible: item.mnQuantityOnHand_46.value,
                            existencia: item.mnQuantitySinCalcular_57.value,
                            comprometido: item.mnQuantityHardCommitted_58.value,
                            caducidad: item.dtExpirationDateMonth_53.value,
                            unidadMedida: item.sUM_54.value,
                            shortNumber: item.mnShortItemNo_25.value,
                            itemNumber: item.s2ndItemNumber_33.value,
                        }));
    
                       resolve(rows);
                    } else {
                       reject("Número no encontrado, valide el dato");
                    }
    
                   
                }, (reason) =>reject(reason));
            }else{
                reject("Ingrese el número del producto");
            }
        } else {
            reject("Ingrese la unidad de negocio");
        }
    });
   
}