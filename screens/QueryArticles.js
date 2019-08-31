import React from 'react';
import {
    View, FlatList, ImageBackground,
    StyleSheet, ActivityIndicator,
} from 'react-native';
import { connect } from 'react-redux';
import { Navigation } from 'react-native-navigation';
import { ItemView, ItemHightLight, ItemLabel } from '../components';
import { componentstyles } from '../styles';
import Field from '../components/Field';
import backgroundImage from '../assets/labmicroBg.jpg';
import { queryArticle } from '../apicalls/query.operation';


class QueryArticles extends React.Component {

    constructor(props) {
        super(props);
        Navigation.events().bindComponent(this);
        this.state = {
            item: "",
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
    search = () => {
        this.setState({ isLoading: true });
        queryArticle(this.state.item, this.props.user.token, (data) => {
            const rawRows = data.fs_P5541001_W5541001A.data.gridData.rowset;
            
            const rows = rawRows.map((item, index) => ({
                key: index,
                number: item.mnNmeronico_24.value, 
                shortNumber: item.mnShortItemNo_25.value,
                description: item.sDescription_38.value,
                bussinessUnit: item.sBusinessUnit_48.value,
                location: item.sLocation_55.value,
                lotNumber: item.sLotSerialNumber_37.value,
                quantity: item.mnQuantityOnHand_46.value,
                expirationDate: item.dtExpirationDateMonth_53.value,
            }));

            this.setState({ rows, isLoading: false });
            

        }, (reason) => console.warn("error", reason));
    }
    
    render() {
        return (
            <ImageBackground source={backgroundImage} style={componentstyles.background}>
                <View style={componentstyles.containerView}>
                    <Field onChangeText={(text) => this.setState({ item: text })}
                        onSubmitEditing={this.search}
                        placeholder="#####" label="No. de artículo" />
                    {
                        this.state.isLoading ?
                            <ActivityIndicator color="#ffffff"
                                animating={this.state.isLoading} size={"large"} />
                            :
                            null
                    }

                    <FlatList data={this.state.rows}
                        renderItem={({ item, index }) =>
                            <ItemView index={index} >
                                <ItemHightLight text={item.description} />
                                <View style={styles.enLinea}>
                                    <ItemLabel text={"Lote: " + item.lotNumber} />
                                    <ItemLabel text={"Caducidad: " + item.expirationDate} />
                                    <ItemLabel style={{ fontWeight: 'bold', }} text={"Cantidad: " + item.quantity} />
                                </View >
                                <View style={styles.enLinea}>
                                    <ItemLabel text={"Ubicación: " + item.location} />
                                </View>
                                <View style={styles.enLinea}>
                                    <ItemLabel text={"Unidad de Negocio: " + item.bussinessUnit} />
                                </View>

                            </ItemView>

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
    enLinea: {
        flexDirection: 'row',
        justifyContent: "space-between",
    }
});
export default connect(mapStateToProps)(QueryArticles);
