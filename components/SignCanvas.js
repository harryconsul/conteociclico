import React from 'react';
import { View, Alert, Button } from 'react-native';
import { SketchCanvas } from '@terrylinla/react-native-sketch-canvas';
import { componentstyles } from '../styles/';
import {uploadSignature} from '../apicalls/signature.uploads';


class SignCanvas extends React.Component {
    handleSave = () => {
        this.canvas.save("png",false,"firmas","test",false,false,false);
    }
    render() {
        return (
            <View style={componentstyles.containerView}>
                 <SketchCanvas style={{ marginBottom:30,borderColor:"#8c30f1c7",borderWidth:5,borderStyle:"solid",height:240}}                    
                    permissionDialogTitle="Permiso Requerido"
                    permissionDialogMessage="Permiso para guardar firmas en tu telefono"
                    onSketchSaved={(success, path) => {
                        if(success){
                            uploadSignature(22471,path,this.props.token);
                        }else{
                            Alert.alert("Error al guardar la firma");
                        }

                        }}
                    strokeColor={'black'}
                    ref={ref => this.canvas = ref}
                    strokeWidth={7} />
                <Button onPress={this.handleSave} title="Guardar" />
               
            </View>
        )
    }

}


export default SignCanvas;