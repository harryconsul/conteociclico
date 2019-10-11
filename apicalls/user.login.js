import axios from 'axios';
import {Alert} from 'react-native';

const userLogin=(username,password,callback)=>{
    axios.post("tokenrequest", {
        username,
        password,
        "deviceName": "RESTclient",
        "role": "*ALL"
    }).then(callback).catch((error)=>{
        Alert.alert("Error en la peticion");
        console.warn(error);
    })
    

}
export default userLogin;