import {ToastAndroid,Alert} from 'react-native';
import {callLogin} from './navigation.helpers';
export const handleErrors=(form)=>{
    if(form.errors.length){
        console.warn(form);
        form.errors.forEach((value)=>{
            ToastAndroid.show(value.TITLE,ToastAndroid.LONG);
        });
        return true
    }
    
    return false;
}

export const handleServerErrors= () =>{
    // mensaje al usario 
    Alert.alert("Error de Servidor", "Tuvimos un error en nuestro servidor JD Edwards");
    
    //Llamar iniciar sesion
    callLogin();
   
}