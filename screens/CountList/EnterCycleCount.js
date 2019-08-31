import React from 'react';
import { View, TextInput, Text, Button, FlatList, StyleSheet, Alert, ImageBackground } from 'react-native';
import { connect } from 'react-redux';
import { ItemView, ItemHightLight, ItemLabel } from '../../components'
import { Navigation } from 'react-native-navigation'
import { enterCyclicCount } from '../../apicalls/count.operations';
import Field from '../../components/Field';
import { componentstyles } from '../../styles';
import backgroundImage from '../../assets/labmicroBg.jpg';
import { actionSetTransactionMode } from '../../store/actions/actions.creators';
import { transactionModes } from '../../constants/';

class EnterCycleCount extends React.Component {
    state = {
        search: "",
        articles: [],
        mapIndex: {},

    }
    searchItem = () => {
        const item = this.props.listMap[event.data];

        if (item) {

            const editingItem = { ...item };
            const indexOfItem = editingItem.indexOfItem;

            if (indexOfItem) {
                editingItem.qty++;


            } else {

                editingItem.qty = 1;

                editingItem.key = item.serial;



            }
            this.setState({
                editingItem,
                qty: editingItem.qty,
                isEditing: true,
            });
            //this.setState({ articles, mapIndex });

        } else {
            this.setState({ isEditing: true });
            Alert.alert("No encontrado ", "No hemos podido encontrar " + event.data,
                [{
                    text: "Continuar",
                    onPress: () => this.setState({ isEditing: false }),
                }]);
        }
    }
    showBarcodeReader = () => {
        this.props.dispatch(actionSetTransactionMode(transactionModes.READ_ADD));
        Navigation.showModal({
            stack: {
                children: [
                    {
                        component: {
                            name: 'BarcodeReader',
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
        enterCyclicCount(this.props.user.token, this.props.stack, this.state.articles,
            (response) => console.warn(response));
    }
    render() {
        const list = [];

        for (let article of this.props.articles.values()) {
            //const article = this.props.articles[key]
            if (article.qty) {
                list.push(article);
            }
        }

        return (
            <ImageBackground source={backgroundImage} style={componentstyles.background} >
                <View style={componentstyles.containerView} >
                    <View style={styles.buttonSave}>
                        <Button color="#ccb82e" onPress={this.showBarcodeReader} title="Leer CB" />
                    </View>
                    <View style={styles.buttonSave}>
                        <Button color="#ccb82e" onPress={this.saveEntry} title="Guardar" />
                    </View>

                    <Field value={this.state.search} placeholder={"ejemplo: 7465"}
                        label={"Buscar por numero de Serie"}
                        onChangeText={(text) => this.setState({ search: text })} />
                    <Button style={styles.buttonSearch} onPress={this.searchItem} title="Buscar" />

                    <FlatList data={list}
                        renderItem={({ item, index }) => {
                            return <ItemView key={index} index={index}>
                                <View style={{ flex: 1, justifyContent: "space-between" }}>
                                    <ItemLabel text={item.serial} />
                                    <ItemLabel text={item.location} />
                                </View>
                                <ItemHightLight text={item.description} />
                                <View style={{ flex: 1, justifyContent: "space-between" }}>
                                    <ItemLabel text={item.um} />
                                    <ItemLabel text={item.qty} />
                                </View>

                            </ItemView>
                        }}
                    />
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

