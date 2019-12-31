import React, { useState } from 'react';
import {
    View, StyleSheet, Text , ActivityIndicator , Alert ,
} from 'react-native';
import Field from './Field';
import { businessUnit } from '../apicalls/business_unit.operations';

export const BusinessUnit = (props) => {
    const [unidad, setUnidad] = useState({ valor: "", nombre: "" });
    const [loading, setLoading] = useState(false);

    search = () => {
        //Buscar la unidad de negocio por número
        if (unidad.valor != 0) {
            setLoading(true);
            if(props.token){
                businessUnit(unidad.valor, props.token, (data) => {
                    const rawRows = data.fs_P0006S_W0006SA.data.gridData.rowset;
    
                    if (rawRows.length > 0) {
                        setUnidad({
                            valor: rawRows[0].sBusinessUnit_5.value,
                            nombre: rawRows[0].sDescription_41.value
                        });
                        props.unidad(rawRows[0].sBusinessUnit_5.value,
                            rawRows[0].sDescription_41.value);
                    }
                    setLoading(false);
    
                }, (reason) =>{
                    setLoading(false);
                    props.unidad(unidad.valor,
                        "");
                });
            }else{
                setLoading(false);
                props.unidad(unidad.valor,
                    "");
            }
            
        }else{
            Alert.alert("Ingrese la unidad de negocio");
        }

    }

    return (
        <View style={styles.inline} >
            {
                loading ?
                    <ActivityIndicator color="#ffffff"
                        animating={true} size={"large"} />
                    :
                    null
            }
            <Field
                label={props.label}
                keyboardType={"numeric"}
                defaultValue={props.defaultValue}
                placeholder={props.placeholder}
                onChangeText={(text) => setUnidad({ valor: text, nombre: "" })}
                onSubmitEditing={search}
                onBlur={search}
            />
            <Text style={{ color: 'white' }}>
                {
                    props.defaultValueNombre ?
                        props.defaultValueNombre
                        :
                        unidad.nombre
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
