import React from 'react';
import {TouchableOpacity,Text} from 'react-native';
const SideMenuItem = props => {

    return (
        <TouchableOpacity onPress={props.optionClickHandle} style={{ height: 30,
            marginBottom:10,borderBottomColor:"#ffffff",borderBottomWidth:1}}>
            
            <Text style={{ color: "#ffffff",fontSize:12 }}>{props.optionName}</Text>
        </TouchableOpacity>
    )

}
export default SideMenuItem;