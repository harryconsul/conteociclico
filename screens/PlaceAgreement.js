import React from 'react';
import SignCanvas from '../components/SignCanvas';
import {uploadComments} from '../apicalls/signature.uploads'
import {Navigation} from 'react-native-navigation'
import {View,TextInput, Text,Button} from 'react-native';
import {connect} from 'react-redux';
import { componentstyles } from '../styles/';
class PlaceAgreement extends React.Component{
    state = {
        savingComments :true,
        comments:"",
    }
    close=(response)=>{
        
        if(this.props.closeOnSave){
            Navigation.dismissModal(this.props.componentId);
        }
    }
    saveComments=()=>{
        uploadComments(this.props.user.token,this.props.itemKey,this.state.comments,(response)=>{
            console.warn(response);
            this.setState({savingComments:false});
        });
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
            <View style={componentstyles.containerView}>
                    <Text>
                        {this.state.savingComments
                            ? "Escriba sus comentarios"
                            : "Firme de Recepción"}
                    </Text>
                    {
                        this.state.savingComments
                            ? 
                            <View>
                                <TextInput value={this.state.comments} 
                                onChangeText={(comments)=>this.setState({comments})}/>
                                <Button title="Guardar Comentarios" onPress={this.saveComments} />
                            </View>
                            :<SignCanvas itemKey={this.props.itemKey}
                            fileName={this.props.fileName}
                            close={this.close}                    
                            token={this.props.user.token}
                            signatureType={this.props.signatureType}
                            realm={this.props.realm}
                            />

                    }
                    
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

export default connect(mapStateToProps)(PlaceAgreement);