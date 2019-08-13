import React from 'react';
import {View,Alert,Button} from 'react-native';
import { SketchCanvas } from '@terrylinla/react-native-sketch-canvas';
import {componentstyles} from '../styles/'
const SignCanvas=props=>{
    const handleSave=()=>{
        SketchCanvas.save();
    }
    return(
        <View style={componentstyles.containerView}>
            <Button onPress={handleSave} title="Guardar" />
            <SketchCanvas style={{ flex: 1 }}
                onSketchSaved={(success,path)=>Alert.alert("path",path)}
                strokeColor={'red'}
                strokeWidth={7} />
        </View>
    )

}
export default SignCanvas;