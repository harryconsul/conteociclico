import React from 'react';
import SignCanvas from '../components/SignCanvas';
import {View} from 'react-native';
import {connect} from 'react-redux';
class PlaceSign extends React.Component{

    render(){
        return(
            <View>
                <SignCanvas />
            </View>
        )
    }
}

export default connect()(PlaceSign);