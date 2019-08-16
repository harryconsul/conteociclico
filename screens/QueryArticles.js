import React from 'react';
import {
    View, Text, Button, TextInput, FlatList,
    ImageBackground, StyleSheet, TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { connect } from 'react-redux';
import { Navigation } from 'react-native-navigation';
import { ItemView, ItemHightLight, ItemLabel } from '../components';
import { componentstyles } from '../styles';
import Field from '../components/Field';
import backgroundImage from '../assets/labmicroBg.jpg';

class QueryArticles extends React.Component {

        constructor(props) {
            super(props);
            Navigation.events().bindComponent(this);
            this.state = {
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
        search() {
            this.setState({ isLoading: true });
            listCyclicCount(this.props.user.token, (response) => {

                const rawRows = response.data.fs_P41240_W41240A.data.gridData.rowset;
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
                    currentApplication: "P41240_W41240A",
                }
                this.props.dispatch(actionUpdateStack(stack));
            }, (reason) => console.warn("error", reason));
        }       
        render() {
            return (
                <ImageBackground source={backgroundImage} style={componentstyles.background}>
                    <View style={componentstyles.containerView}>
                        <Field placeholder="#####" label="No. de artículo" />
                        <Button title="Buscar" />

                        <ActivityIndicator color="#ffffff"
                            animating={this.state.isLoading} size={"large"} />
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
export default connect(mapStateToProps)(QueryArticles);
