import {ToastAndroid,Alert} from 'react-native';
import {callLogin} from './navigation.helpers';
import RNFS from 'react-native-fs';

export const handleErrors=(form)=>{
    if(form.errors.length){
        
        const msg = form.errors.map((value)=>value.MOBILE).join(",");
        Alert.alert("Error en formulario", msg);
        return true
    }
    
    return false;
}

export const handleServerErrors= (error) =>{
    const now = new Date();
    const pathErrorLog = RNFS.ExternalDirectoryPath + '/error-log-' + now.getTime().toString() + '.txt';

    // mensaje al usario 
    Alert.alert("Error de Servidor", "Tuvimos un error en nuestro servidor JD Edwards");

    RNFS.writeFile(pathErrorLog, JSON.stringify(error), 'utf8').then(()=>{
          //Llamar iniciar sesion
        callLogin();

    });

    
    
  
   
}