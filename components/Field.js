import React from 'react';
import { componentstyles } from '../styles';
import {View,Text,TextInput} from 'react-native';

const Field = ({label,defaultValue,autoFocus,onSubmitEditing,onChangeText,placeholder,keyboardType,onBlur,inputRef,value})=>{

    return(
        <View style={{display:'flex'}}>
            <Text style={componentstyles.label}>{label}</Text>
            <TextInput placeholder={placeholder} 
                autoFocus={autoFocus?true:false}
                onSubmitEditing={onSubmitEditing?onSubmitEditing:null}
                onBlur={onBlur?onBlur:null}
                value={value?value:null}
                onChangeText={(text)=>onChangeText(text)}
                keyboardType={keyboardType?keyboardType:'default'}
                returnKeyType={onSubmitEditing?'search':'done'}
                defaultValue={defaultValue}
                placeholderTextColor={"#fffa"}
                clearButtonMode='always'
                ref={inputRef}
                style={componentstyles.textbox} />
        </View>
    )
}
export default Field;