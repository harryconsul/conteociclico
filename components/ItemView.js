import React from 'react';
import { View , StyleSheet} from 'react-native';
const styles = StyleSheet.create({
    
    itemEven: {
        flex: 1,
        flexDirection:'column',        
        backgroundColor: "#ccccccb8",
        marginBottom: 5,
        padding: 10
    },
    itemOdd: {
        flex: 1,
        flexDirection:'column',        
        backgroundColor: "#ffffffb8",
        marginBottom: 5,
        padding: 10
    },
   
});

export const ItemView = ({index,children}) => {
    const itemStyle = (index%2)===0?styles.itemEven:styles.itemOdd;
    return (
        <View style={itemStyle} >
            {children}
        </View>
    )


}


