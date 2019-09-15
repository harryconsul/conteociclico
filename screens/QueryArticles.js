import React from 'react';
import {
    View, FlatList, ImageBackground, Text,
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
            unidad: props.businessUnit ? props.businessUnit : "",
            unidadNombre: "",
            rows: [],
            isLoading: false,
            articleRef: React.createRef(),
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
                itemNumber: item.s2ndItemNumber_33.value,
            }));

            this.setState({ rows, isLoading: false });


        }, (reason) => console.warn("error", reason));
    }
    componentDidMount() {
        /*if (this.props.notScreen) {
            this.state.articleRef.current.focus();
        }*/
    }

    render() {
        return (
            <ImageBackground source={this.props.notScreen ? null : backgroundImage} style={componentstyles.background}>
                <View style={{ width: '100%', margin: 5 }}>
                    {
                        this.props.businessUnitNombre ?
                            <View style={styles.shadow}>
                                <View style={styles.header}>
                                    <Text style={styles.headerTitle}>{this.props.businessUnitNombre}</Text>
                                </View>
                                <Field onChangeText={(text) => this.setState({ producto: text })}
                                    onSubmitEditing={this.search}
                                    inputRef={this.state.articleRef}
                                    placeholder="#####" label="Número único" />
                            </View>
                            :
                            <View style={componentstyles.containerView}>
                                <View style={styles.linea} >
                                    <View style={{ width: "40%" }}>
                                        <BusinessUnit token={this.props.user.token}
                                            label={"Unidad de Negocio"} placeholder={"####"}
                                            defaultValue={this.props.businessUnit}
                                            defaultValueNombre={this.props.businessUnitNombre}
                                            unidad={this.unidadNegocio} />

                                    </View>
                                    <View style={{ width: "60%" }}>
                                        <Field onChangeText={(text) => this.setState({ producto: text })}
                                            onSubmitEditing={this.search}
                                            inputRef={this.state.articleRef}
                                            placeholder="#####" label="Número único" />
                                    </View>
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

                    <FlatList data={this.state.rows}
                        renderItem={({ item, index }) =>
                            <TouchableOpacity key={item.key}
                                onPress={this.props.handleClickRow ? () => this.props.handleClickRow(item) : null} >
                                <ItemView index={index} >
                                    <View style={styles.linea}>
                                        <View style={{ width: "30%" }}>
                                            <ItemLabel text={"No. " + item.etiqueta} />
                                        </View>
                                        <View style={{ width: "70%" }}>
                                            <ItemLabel text={item.producto} />
                                        </View>
                                    </View>
                                    <View style={styles.linea}>
                                        <View style={{ width: "35%" }}>
                                            <ItemLabel style={{ fontWeight: 'bold', }} text={"Cantidad: " + item.cantidad + " " + item.unidadMedida} />
                                        </View>
                                        <View style={{ width: "65%" }}>
                                            <ItemLabel text={"Ubicación: " + (item.ubicacion ? item.ubicacion : "")} />
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
export default connect(mapStateToProps)(QueryArticles);
