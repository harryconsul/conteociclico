import React from 'react';
import { componentstyles } from '../styles';
import {View,Text,TextInput} from 'react-native';

const Field = props=>{

    return(
        <View style={{display:'flex'}}>
            <Text style={{marginBottom:5,color:'#f1bb57'}}>{props.label}</Text>
            <TextInput placeholder={props.placeholder} value={props.value}
                placeholderTextColor={"#fffa"}
                style={componentstyles.textbox} />
        </View>
    )
}
export default Field;