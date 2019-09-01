import React from 'react';
import {
    View, FlatList, ImageBackground,
    StyleSheet, ActivityIndicator, TouchableOpacity,
} from 'react-native';
import { connect } from 'react-redux';
import { Navigation } from 'react-native-navigation';
import { ItemView, ItemLabel } from '../components';
import { componentstyles } from '../styles';
import Field from '../components/Field';
import backgroundImage from '../assets/labmicroBg.jpg';
import { queryArticle } from '../apicalls/query.operation';
import { BusinessUnit } from '../components/BusinessUnit';


class QueryArticles extends React.Component {

    constructor(props) {
        super(props);
        if (!props.notScreen) {
            Navigation.events().bindComponent(this);
        }
        this.state = {
            producto: "",
            unidad: props.businessUnit?props.businessUnit:"",
            unidadNombre: "",
            rows: [],
            isLoading: false,
        }
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

    unidadNegocio = (unidad) => {
        //Los datos de esta función, se alimentan desde BusinessUnit
        this.setState({ unidad });
    }

    search = () => {
        this.setState({ isLoading: true });
        queryArticle(this.state.unidad, this.state.producto, this.props.user.token, (data) => {
            const rawRows = data.fs_P5541001_W5541001A.data.gridData.rowset;

            const rows = rawRows.map((item, index) => ({
                key: index,
                etiqueta: item.mnNmeronico_24.value,
                producto: item.sDescription_38.value,
                unidadNegocio: item.sBusinessUnit_48.value,
                ubicacion: item.sLocation_55.value,
                lote: item.sLotSerialNumber_37.value,
                cantidad: item.mnQuantityOnHand_46.value,
                caducidad: item.dtExpirationDateMonth_53.value,
                unidadMedida: item.sUM_54.value,
                shortNumber: item.mnShortItemNo_25.value,
            }));

            this.setState({ rows, isLoading: false });


        }, (reason) => console.warn("error", reason));
    }
    
    render() {
        return (
            <ImageBackground source={this.props.notScreen ? null : backgroundImage} style={componentstyles.background}>
                <View style={componentstyles.containerView}>
                    <View style={styles.linea} >
                        <View style={{ width: "40%" }}>
                            <BusinessUnit token={this.props.user.token}
                                label={"Unidad de Negocio"} placeholder={"####"}
                                defaultValue={this.props.businessUnit}
                                unidad={this.unidadNegocio} />
                        </View>
                        <View style={{ width: "60%" }}>
                            <Field onChangeText={(text) => this.setState({ producto: text })}
                                onSubmitEditing={this.search}
                                placeholder="#####" label="Número único" />
                        </View>
                    </View>

                    {
                        this.state.isLoading ?
                            <ActivityIndicator color="#ffffff"
                                animating={this.state.isLoading} size={"large"} />
                            :
                            null
                    }

                    <FlatList data={this.state.rows}
                        renderItem={({ item, index }) =>
                            <TouchableOpacity 
                            onPress={this.props.handleClickRow?()=>this.props.handleClickRow(item):null} >
                                <ItemView index={index} >
                                    <View style={styles.linea}>
                                        <View style={{ width: "35%" }}>
                                            <ItemLabel text={"No. " + item.etiqueta} />
                                        </View>
                                        <View style={{ width: "65%" }}>
                                            <ItemLabel text={item.producto} />
                                        </View>
                                    </View>
                                    <View style={styles.linea}>
                                        <View style={{ width: "35%" }}>
                                            <ItemLabel style={{ fontWeight: 'bold', }} text={"Cantidad: " + item.cantidad + " " + item.unidadMedida} />
                                        </View>
                                        <View style={{ width: "65%" }}>
                                            <ItemLabel text={"Ubicación: " + item.ubicacion?item.ubicacion:""} />
                                        </View>
                                    </View>
                                    <View style={styles.linea}>
                                        <View style={{ width: "50%" }}>
                                            <ItemLabel text={"Lote: " + item.lote} />
                                        </View>
                                        <View style={{ width: "65%" }}>
                                            <ItemLabel text={"Caducidad: " + item.caducidad} />
                                        </View>

                                    </View >

                                </ItemView>
                            </TouchableOpacity>
                        } />
                </View>
            </ImageBackground>

        )
    }
}
const mapStateToProps = (state) => {
    return {
        user: state.user,
        stack: state.stack
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
    }

});
export default connect(mapStateToProps)(QueryArticles);
