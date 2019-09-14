import {ToastAndroid} from 'react-native';

export const handleErrors=(form)=>{
    if(form.errors.length){
        form.errors.forEach((value)=>{
            ToastAndroid.show(value.TITLE,ToastAndroid.LONG);
        });
        return true
    }
    
    return false;
}