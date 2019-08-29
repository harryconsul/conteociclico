import React from 'react';
import { Text , StyleSheet } from 'react-native';

export const ItemLabel = (props) => {

    return (
        <Text style={{...styles.texto , ...props.style}} >
            {props.text}
        </Text >
    )

}

const styles = StyleSheet.create({
    texto: {
        color: "#000000",
        fontSize: 15,
    }
});
