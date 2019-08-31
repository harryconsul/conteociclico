import React, { useState } from 'react';
import {
    View, StyleSheet,
} from 'react-native';
import Field from './Field';
import {businessUnit} from '../apicalls/business_unit.operations';

export const BusinessUnit = (props) => {
    const [unidad, setUnidad] = useState("");

    search = () => {
        //Buscar la unidad de negocio por número
        businessUnit(unidad, props.token , (data) => {
            const rawRows = data.fs_P0006S_W0006SA.data.gridData.rowset;
            if(rawRows.length > 0){
                props.unidad(unidad , rawRows[0].sDescription_41.value);
            }else{
                props.unidad(0 , "");
            }

        }, (reason) => console.warn("ERROR", reason));
    }

    return (
        <View style={styles.inline} >
            <Field
                label="Unidad de Negocio"
                placeholder=""
                onChangeText={(text) => setUnidad(text)}
                onSubmitEditing={search}
            />
        </View>
    )

}

const styles = StyleSheet.create({
    inline: {
        flexDirection: 'row',
        justifyContent: "space-between",
    }
});
