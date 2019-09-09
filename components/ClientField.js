import React from 'react';
import {View,Text} from 'react-native';
import Field from './Field';
import {searchClientAlias} from '../apicalls/client.operations';

const ClientField = ({clientNumber,setClientNumber,label,token,})=>{
    const [clientAlias,setClientAlias] = React.useState("");
    
    const search = ()=>{
        searchClientAlias(clientNumber,token,(data)=>{
            const rawRows = data.fs_P0101SL_W0101SLA.data.gridData.rowset;
            if(rawRows.length){
                setClientAlias(rawRows[0].sAlphaName_8.value);
            }
            //
        })
    }
    return(
        <View style={{
            flexDirection: 'column',
            justifyContent: "space-between",
        }}>
            <Field placeholder = {"####"} label={label}  
                onBlur={search}
                onSubmitEditing={search}
                keyboardType={"numeric"}
                defaultValue={clientNumber}
                onChangeText={(text)=>{
                    setClientNumber(text);                    
                    }}
                 />
            <Text>{clientAlias}</Text>
        </View>
    )
}
export default ClientField;