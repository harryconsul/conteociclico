import React, { useState } from 'react';
import {
    View, StyleSheet, Text
} from 'react-native';
import Field from './Field';
import { razonMovimiento } from '../apicalls/codigo.razon';

export const RazonMovimiento = (props) => {
    const [razon, setRazon] = useState({ codigo: "" , descripcion: "" });

    search = () => {
        //Buscar la unidad de negocio por número
        if (razon.codigo.length != 0) {
            razonMovimiento(razon.codigo, props.token, (data) => {
                
                const rawRows = data.fs_P0004A_W0004AA.data.gridData.rowset;
                
                if (rawRows.length > 0) {
                    setRazon({ 
                        codigo: rawRows[0].sCodes_10.value,
                        descripcion: rawRows[0].sDescription01_11.value });

                        props.razon(rawRows[0].sCodes_10.value ,
                            rawRows[0].sDescription01_11.value );
                }

            }, (reason) => console.warn("ERROR", reason));
        }

    }
    
    return (
        <View style={styles.inline} >
            <Field
                label={props.label}
                defaultValue={props.defaultValue}
                placeholder={props.placeholder}
                onChangeText={(text) => setRazon({ codigo: text, descripcion: null })}
                onSubmitEditing={search}
                onBlur={search}
            />
            <Text style={{ color: 'white' }}>
            {
                razon.descripcion?
                razon.descripcion
                :
                null
            }</Text>
        </View>
    )

}

const styles = StyleSheet.create({
    inline: {
        flexDirection: 'column',
        justifyContent: "space-between",
    }
});
