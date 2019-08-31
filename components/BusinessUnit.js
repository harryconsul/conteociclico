import React from 'react';
import {Text} from 'react-native';

export const BusinessUnit = (props) => {
    if(props.numero > 0){
        businessUnit(props.number , props.token , (data) => {
            const rawRows = data.fs_P0006S_W0006SA.data.gridData.rowset;
            return <Text>{rawRows.item(0).sDescription_41.value}</Text>

        },(reason) => console.warn("ERROR", reason));
    }

    return <Text></Text>
    
}