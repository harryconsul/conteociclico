import React from 'react';
import { Button, View, TextInput, KeyboardAvoidingView } from 'react-native';
import { ItemView, ItemHightLight, ItemLabel } from '../components';
import Field from './Field';

export const ArticleCard = ({ item, handleAccept, qty, setQty, setPrice, price }) => {
    const size=setPrice?150:100;
    return (
        
        <ItemView index={0}>
            <KeyboardAvoidingView
                style={{ height: "100%", width: "100%" }} enabled behavior="padding">
                
                <ItemLabel text={"Serie Lote: " + item.serial} />
                <View style={{ display:"flex",flexDirection:"row",
                    justifyContent: "space-between" }}>
                    <ItemLabel text={"Stock: " + item.stock + " " +  item.um} />
                    <ItemLabel text={"Ubicación : " + item.location} />
                    
                </View>
                <ItemHightLight text={item.description} />                
                <View style={{height:size,marginTop:15,marginBottom:10}}>
                    <Field label="Cantidad" placeholder="#" defaultValue={String(qty)}
                        onChangeText={(text) => setQty(text)} keyboardType="numeric" />
                    {setPrice ?
                        <Field label="Precio" placeholder="$$" defaultValue={price}
                            onChangeText={(text) => setPrice(text)} keyboardType="numeric" />
                        : null
                    }
                </View>
                <Button onPress={handleAccept}
                    title="Aceptar" />
            </KeyboardAvoidingView>
        </ItemView>
    )
}


