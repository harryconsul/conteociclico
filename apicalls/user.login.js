import axios from 'axios';
import {Alert} from 'react-native';
import {clearAllJDEScreens} from './clean_jde.operations';
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
    }).then((response)=>{
        clearAllJDEScreens(response.data.userInfo.token,username);
        callback(response);
    }).catch(()=>{
        if(fallback){
            fallback();
        }else{
            Alert.alert("Error en la petición " + error);
        };
        
    })
    

}
export default userLogin;