import React, { useState } from 'react';
import {
    View, StyleSheet,Text
} from 'react-native';
import Field from './Field';
import {businessUnit} from '../apicalls/business_unit.operations';

export const BusinessUnit = (props) => {
    const [unidad, setUnidad] = useState({valor:"",nombre:""});

    search = () => {
        //Buscar la unidad de negocio por número
        businessUnit(unidad.valor, props.token , (data) => {
            const rawRows = data.fs_P0006S_W0006SA.data.gridData.rowset;
            
            if(rawRows.length > 0){
                setUnidad({valor:unidad.valor,nombre:rawRows[0].sDescription_41.value});                
            }

        }, (reason) => console.warn("ERROR", reason));
            props.unidad(unidad.valor );
    }

    return (
        <View style={styles.inline} >
            <Field
                label={props.label}
                keyboardType={"numeric"}
                defaultValue={props.defaultValue}
                placeholder={props.placeholder}
                onChangeText={(text) => setUnidad({valor:text,nombre:""})}
                onSubmitEditing={search}
            />
            <Text>{unidad.nombre}</Text>
        </View>
    )

}

const styles = StyleSheet.create({
    inline: {
        flexDirection: 'column',
        justifyContent: "space-between",
    }
});
