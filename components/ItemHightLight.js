import React from 'react';
import { Text } from 'react-native';

export const ItemHightLight = (props) => {

    return (
        <Text style={{ color: "#000000", fontSize: 18,fontWeight:"bold" }} >

            { props.text }
        </Text >
    )

}
export default ItemHightLight;