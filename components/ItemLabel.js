import React from 'react';
import { Text } from 'react-native';

export const ItemLabel = (props) => {

    return (
        <Text style={{ color: "#000000", fontSize: 15, }} >

            { props.text }
        </Text >
    )

}
