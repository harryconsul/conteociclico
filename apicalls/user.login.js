import axios from 'axios';
import {Alert} from 'react-native';

const userLogin=(username,password,environment,callback)=>{
    if(environment==="PY"){
        axios.defaults.baseURL="http://207.249.158.84:91/jderest/";
    }else{
        axios.defaults.baseURL="http://207.249.158.84:89/jderest/";
    }
    axios.post("tokenrequest", {
        username,
        password,
        "deviceName": "RESTclient",
        "role": "*ALL"
    }).then(callback).catch(()=>{
        Alert.alert("Error en la petición " + error);
    })
    

}
export default userLogin;