import React from 'react';
import { View, Text, Switch } from 'react-native';
import { componentstyles } from '../styles/'

const ArticleScanMode = ({ confirmMode,changeMode}) => (
    <View style={{ display: "flex", flexDirection: "row", alignItems:"center", justifyContent:"flex-start" }}>
        <Text style={componentstyles.label}> Capturar cantidades al leer producto </Text>
        <Switch style={{ marginRight: 20 }} onValueChange={(value) => changeMode(value)}
            value={confirmMode} />
    </View>
)
export default ArticleScanMode;