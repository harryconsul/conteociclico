import axios from 'axios';
import {Alert} from 'react-native';

const userLogOut = (token,callback,environment,errorhandler) => {

    if(environment){
        if(environment==="PY"){
            axios.defaults.baseURL="http://hh.dicipa.xlynk.mx:91/jderest/";
        }else{
            axios.defaults.baseURL="http://hh.dicipa.xlynk.mx:89/jderest/";
        }
    }
    
    axios.post("tokenrequest/logout",{
        token
    })
    .then(callback)
    .catch((error) => {
        if(errorhandler){
            errorhandler(error);
        }else{
            Alert.alert("No fue posible cerrar su sesión");
        }
        
    });
}

export default userLogOut;