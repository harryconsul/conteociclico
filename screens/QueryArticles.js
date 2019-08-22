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
import {queryArticle} from '../apicalls/query.operation';
import console = require('console');

class QueryArticles extends React.Component {

        constructor(props) {
            super(props);
            Navigation.events().bindComponent(this);
            this.state = {
                item:"",
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
            queryArticle(this.state.item,this.props.user.token,(data)=>{
                console.warn(data);
            })
        }       
        render() {
            return (
                <ImageBackground source={backgroundImage} style={componentstyles.background}>
                    <View style={componentstyles.containerView}>
                        <Field onChangeText={(text)=>this.setState({item:text})} placeholder="#####" label="No. de artículo" />
                        <Button title="Buscar" onPress={this.search} />

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
