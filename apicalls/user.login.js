import axios from 'axios';
import {Alert} from 'react-native';

const userLogin=(username,password,environment,callback,fallback)=>{
    if(environment==="PY"){
        axios.defaults.baseURL="http://hh.dicipa.xlynk.mx:91/jderest/";
    }else{
        axios.defaults.baseURL="http://hh.dicipa.xlynk.mx:89/jderest/";
    }
    axios.post("tokenrequest", {
        username,
        password,
        "deviceName": "RESTclient",
        "role": "*ALL"
    }).then(callback).catch(()=>{
        if(fallback){
            fallback();
        }else{
            Alert.alert("Error en la petición " + error);
        };
        
    })
    

}
export default userLogin;