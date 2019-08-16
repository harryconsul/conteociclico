import React from 'react';
import SignCanvas from '../components/SignCanvas';
import {View} from 'react-native';
import {connect} from 'react-redux';
class PlaceSign extends React.Component{

    render(){
        return(
            <View>
                <SignCanvas token={this.props.user.token} />
            </View>
        )
    }
}
const mapStateToProps = (state) => {
    return {
        user: state.user,        
    }

}

export default connect(mapStateToProps)(PlaceSign);