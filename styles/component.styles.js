import {StyleSheet} from 'react-native';
export const componentstyles=StyleSheet.create({
    textboxLogin:{
        color:"#ffffff",
        borderColor:"#ffffff",
        borderWidth:1,
        borderStyle:"solid",   
        marginBottom:20,
        width:"80%"    ,
        textAlign:"center",
        fontSize:15, 
        height: 40       
    },
    textbox:{
        color:"#ffffff",
        borderColor:"#ffffff",
        borderWidth:1,
        borderStyle:"solid",   
        marginBottom:10,
        width:"90%" ,        
        fontSize:13,
        height: 37,
    },
    background:{
        height: "100%",
        width: "100%",
        display:"flex",        
        alignItems: 'center',
        
    },
    containerView:{
        flex: 1,
        paddingTop:"17%",
        paddingLeft:10,
        paddingRight:10,
        width:"100%",
        height:"100%"
    },
    label:{
        marginBottom:5,
        color:'#f1bb57',
    },
    title:{
        marginBottom:5,
        color:'#f1bb57',
        fontSize:22,
        fontWeight:"bold",
        
    },
    opacity:{
        flex: 1,
        backgroundColor: 'rgba(0,0,0, 0.45)',
        height: "100%",
        width: "100%",
    },


})