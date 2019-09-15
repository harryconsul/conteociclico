import axios from 'axios';
import {Alert} from 'react-native';

const userLogOut = (token,callback) => {
    axios.post("tokenrequest/logout",{
        token
    })
    .then(callback)
    .catch(() => {
        Alert.alert("No fue posible cerrar su sesión");
    });
}

export default userLogOut;