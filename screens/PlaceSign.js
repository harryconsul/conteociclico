import React from 'react';
import SignCanvas from '../components/SignCanvas';
import {Navigation} from 'react-native-navigation'
import {View} from 'react-native';
import {connect} from 'react-redux';
class PlaceSign extends React.Component{
    close=(response)=>{
        
        if(this.props.closeOnSave){
            Navigation.dismissModal(this.props.componentId);
        }
    }
    componentDidMount(){
        Navigation.mergeOptions(this.props.componentId, {
            topBar: {
                title: {
                    text: this.props.title
                },
                drawBehind: true,
                background: {
                    color: '#8c30f1c7',
                    translucent: true,
                    blur: false
                },
                visible: true,
            },
        });
    }
    render(){
        return(
            <View>
                <SignCanvas itemKey={this.props.itemKey}
                    fileName={this.props.fileName}
                    close={this.close}                    
                    token={this.props.user.token}
                    signatureType={this.props.signatureType}
                    realm={this.props.realm}
                    />
            </View>
        )
    }
}
const mapStateToProps = (state) => {
    return {
        user: state.user,      
        realm: state.countRealm,  
    }

}

export default connect(mapStateToProps)(PlaceSign);