import React from 'react';
import {
    View, Button, FlatList,
    ImageBackground, StyleSheet, TouchableOpacity,
    ActivityIndicator, KeyboardAvoidingView,
} from 'react-native';
import { connect } from 'react-redux';
import { Navigation } from 'react-native-navigation';
import { BusinessUnit } from '../../components/BusinessUnit';
import { ItemView, ItemHightLight, ItemLabel } from '../../components'
import { listCyclicCount, selectCyclicCount } from '../../apicalls/count.operations';
import { transactionModes } from '../../constants'
import { actionUpdateStack, actionSetArticlesMap, actionSetTransactionMode } from '../../store/actions/actions.creators';
import { componentstyles } from '../../styles';
import backgroundImage from '../../assets/labmicroBg.jpg';
import { topBarButtons } from '../../constants'
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

        listCyclicCount(this.props.user.token, this.state.businessUnit, (response) => {

            const rawRows = response.data.fs_P5541240_W5541240A.data.gridData.rowset;

            const rows = rawRows.map(item => ({
                key: item.mnCycleNumber_25.value,
                number: item.mnCycleNumber_25.value,
                description: item.sDescription_30.value,
            }));
            this.setState({ rows, isLoading: false });
            const stack = {
                stackId: response.data.stackId,
                stateId: response.data.stateId,
                rid: response.data.rid,
                currentApplication: "P5541240_W5541240A",
            }
            this.props.dispatch(actionUpdateStack(stack));
        }, (reason) => console.warn("error", reason));
    }
    handleSelectRow = (rowId) => {
        this.setState({ isLoading: true });
        selectCyclicCount(this.props.user.token, this.props.stack, rowId, (response) => {
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
                    rowId: current.rowIndex,
                });

                return previous;
            }, new Map());

            this.setState({ isLoading: false });
            this.props.dispatch(actionSetArticlesMap(articlesMap));
            const stack = {
                stackId: response.data.stackId,
                stateId: response.data.stateId,
                rid: response.data.rid,

            }
            this.props.dispatch(actionUpdateStack(stack));
            this.props.dispatch(actionSetTransactionMode(transactionModes.READ_ADD));
            Navigation.push(this.props.componentId, {
                component: {
                    name: 'EnterCycleCount',
                    id: 'EnterCycleCount',
                    passProps: {
                        cycleCountNumber
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

                        <FlatList data={this.state.rows}
                            renderItem={({ item, index }) =>
                                <TouchableOpacity onPress={() => this.handleSelectRow(index)}>
                                    <ItemView index={index} >
                                        <ItemLabel text={"Numero: " + item.number} />
                                        <ItemHightLight text={"Descripcion: " + item.description} />

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
    }
});
export default connect(mapStateToProps)(CountList);
