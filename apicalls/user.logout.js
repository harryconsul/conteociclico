import axios from 'axios';
import {Alert} from 'react-native';

const userLogOut = (callback) => {
    axios.post("tokenrequest/logout")
    .then(callback)
    .catch((error)=>{
        Alert.alert("No fue posible cerrar su sesión");
    });
}

export default userLogOut;