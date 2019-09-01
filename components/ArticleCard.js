import React from 'react';
import { Button, View, TextInput,KeyboardAvoidingView } from 'react-native';
import { ItemView, ItemHightLight, ItemLabel } from '../components';

export const ArticleCard = ({ item, handleAccept, qty, setQty }) => (
    <ItemView index={0}>
        <KeyboardAvoidingView
            style={{ height: "100%", width: "100%" }} keyboardVerticalOffset={20} behavior="padding">
            <View style={{ flex: 1, justifyContent: "space-between" }}>
                <ItemLabel text={item.serial} />
                <ItemLabel text={item.location} />
                <ItemLabel text={"Unidad de Medida: " + item.um} />
            </View>
            <ItemHightLight text={item.description} />
            <View style={{ flex: 1, justifyContent: "space-between" }}>
                <TextInput value={String(qty)} onChangeText={(text) => setQty(text)} />
            </View>
            <Button onPress={handleAccept}
                title="Aceptar" />
        </KeyboardAvoidingView>
    </ItemView>
)


