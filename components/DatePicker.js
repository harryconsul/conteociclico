import React from 'react';
import { View, DatePickerAndroid, Text, TouchableOpacity } from 'react-native';
import { componentstyles } from '../styles';
import {dateHelpers} from '../helpers'
const DatePicker = ({ date, setDate, label }) => {
    const showPicker = async () => {
        const { action, year, month, day } = await DatePickerAndroid.open({
            date
        });
        if (action !== DatePickerAndroid.dismissedAction) {
            setDate(new Date(year, month, day));
        }
    }
    const charDate =  dateHelpers.dateToLatinString(date);

    return (
         <View>
            <Text style={componentstyles.label}>{label}</Text>
            <TouchableOpacity onPress={showPicker}>
                <View style={componentstyles.textbox}>
                    <Text style={{ color: "#000" }}>
                        { charDate }
                    </Text>

                </View>
            </TouchableOpacity>
        </View>
    )
}
export default DatePicker;
