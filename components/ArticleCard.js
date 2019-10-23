import React from 'react';
import { Button, View, TextInput, KeyboardAvoidingView } from 'react-native';
import { ItemView, ItemHightLight, ItemLabel } from '../components';
import Field from './Field';

export const ArticleCard = ({ item, handleAccept, qty, setQty, setPrice, price, setLocation, location }) => {
    let size = setPrice ? 150 : 100;
    size += setLocation ? 150 : 100;

    return (

        <ItemView index={0}>
            <KeyboardAvoidingView
                style={{ height: "100%", width: "100%" }} enabled behavior="padding">

                <View style={{
                    display: "flex", flexDirection: "row",
                    justifyContent: "space-between"
                }}>
                    <View style={{ width: "40%" }}>
                        <ItemLabel text={"No.: " + item.key} />
                    </View>
                    <View style={{ width: "60%" }}>
                        <ItemLabel text={"Catálogo : " + item.itemNumber} />
                    </View>
                </View>
                <ItemHightLight text={item.description} />
                <View style={{
                    display: "flex", flexDirection: "row",
                    justifyContent: "space-between"
                }}>
                    <View style={{ width: "40%" }}>
                        <ItemHightLight text={"Disp.: " + item.stock + " " + item.um} />
                    </View>
                    <View style={{ width: "60%" }}>
                        <ItemLabel text={"Ubicación : " + item.location} />
                    </View>

                </View>
                
                <View style={{ height: size, marginTop: 15, marginBottom: 10 }}>
                    <Field label="Cantidad" placeholder="#" defaultValue={String(qty)}
                        onChangeText={(text) => setQty(text)} keyboardType="numeric" />
                    {setPrice ?
                        <Field label="Precio" placeholder="$$" defaultValue={price}
                            onChangeText={(text) => setPrice(text)} keyboardType="numeric" />
                        : null
                    }
                    {setLocation ?
                        <Field label="Ubicación" placeholder="" defaultValue={location}
                            onChangeText={(text) => setLocation(text)} />
                        : null
                    }
                </View>
                <Button onPress={handleAccept}
                    title="Aceptar" />
            </KeyboardAvoidingView>
        </ItemView>
    )
}


