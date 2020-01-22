import React from 'react';
import { Button, View, TextInput, KeyboardAvoidingView, ShadowPropTypesIOS } from 'react-native';
import { ItemView, ItemHightLight, ItemLabel } from '../components';
import Field from './Field';

export const ArticleCard = ({ item, handleAccept, qty, setQty, setPrice, price, setLocation, location, qtyLabel, etiqueta }) => {
    let size = setPrice ? 150 : 100;
    size += setLocation ? 150 : 100;
    const numero = etiqueta ? etiqueta : item.key;
    const total = item.qtyToPickUp ? item.qtyToPickUp : null;
    return (

        <ItemView index={0}>
            <KeyboardAvoidingView
                style={{ height: "100%", width: "100%" }} enabled behavior="padding">

                <View style={{
                    display: "flex", flexDirection: "row",
                    justifyContent: "space-between"
                }}>
                    <View style={{ width: "40%" }}>
                        <ItemLabel text={"No.: " + numero} />
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
                        {
                            item.stock ?
                                <ItemHightLight text={"Disp.: " + item.stock + " " + item.um} />
                                :
                                null
                        }
                    </View>
                    <View style={{ width: "60%" }}>
                        <ItemLabel text={"Ubicación : " + item.location} />
                    </View>

                </View>

                <View style={{ height: size, marginTop: 15, marginBottom: 10 }}>
                    {
                        handleAccept ?
                            <Field label={qtyLabel ? qtyLabel : "Cantidad"} placeholder="#" defaultValue={String(qty)}
                                onChangeText={(text) => setQty(text)} keyboardType="numeric" />
                            :
                            <View>
                                <ItemHightLight text={(qtyLabel ? qtyLabel : "Cantidad") + ' : ' + qty + ' ' + item.um} />
                                <ItemHightLight text={" de " + (total ? total : '') + ' ' + item.um} />
                            </View>
                    }
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
                {
                    handleAccept ?
                        <Button onPress={handleAccept}
                            title="Aceptar" />
                        : null
                }

            </KeyboardAvoidingView>
        </ItemView>
    )
}


