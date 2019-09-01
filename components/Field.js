import React from 'react';
import { componentstyles } from '../styles';
import {View,Text,TextInput} from 'react-native';

const Field = ({label,defaultValue,autoFocus,onSubmitEditing,onChangeText,placeholder,keyboardType})=>{

    return(
        <View style={{display:'flex'}}>
            <Text style={{marginBottom:5,color:'#f1bb57'}}>{label}</Text>
            <TextInput placeholder={placeholder} 
                autoFocus={autoFocus?true:false}
                onSubmitEditing={onSubmitEditing?onSubmitEditing:null}
                onChangeText={(text)=>onChangeText(text)}
                keyboardType={keyboardType?keyboardType:'default'}
                returnKeyType='search'
                defaultValue={defaultValue}
                placeholderTextColor={"#fffa"}
                style={componentstyles.textbox} />
        </View>
    )
}
export default Field;