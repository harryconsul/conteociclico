import axios from 'axios';
import RNFS from 'react-native-fs';
import { offlineCount } from '../helpers'
export const uploadSignature = (key, path, token, fileName, callback, realm, signatureType) => {

    const pathJson = RNFS.DocumentDirectoryPath + '/' + fileName + '.txt';

    const finalPath = 'file://' + path;
   
    const data = {
        "token": token,
        "deviceName": "RESTclient",
        "ssoEnabled": false,
        "moStructure": "GT5541240",
        "moKey": [
            key
        ],
        "formName": "P5541240_W5541240A",
        "version": "",
        "file": {
            "fileLocation": finalPath,
            "fileName": fileName + ".png",
            "itemName": fileName,
            "sequence": 0
        }
    }

    const json = JSON.stringify(data);

    if (token) {       

        RNFS.writeFile(pathJson, json, 'utf8').then(() => {

            const formData = new FormData();
            formData.append('file', {
                uri: finalPath,
                type: 'image/png',
                name: fileName + ".png",
            }, fileName + ".png");


            formData.append("moAdd", {
                uri: 'file://' + pathJson,
                type: 'application/json',
                name: fileName + ".txt",
            });

            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            }

            axios.post("file/upload", formData, config).then((response) => callback(response))
                .catch(error => console.warn(error));

        });
    } else {
        offlineCount.updateCyclicCountSignatures(realm, key, signatureType, path, fileName)
        callback("");
    }




}

export const uploadComments = (token,key,comment,callback) =>{
    
    const data = {
        "token": token,
        "deviceName": "RESTclient",       
        "moStructure": "GT4301",
        "moKey": [
            key
        ],
        "formName": "P594312B_W594312BA",
        "version": "DICIPA01",
        "inputText": comment,
        "appendText": true,
    }
    
    axios.post("file/updatetext", data)
    .then(callback)
    .catch((error) => console.warn("Error en la petición", error));
}

export const uploadAgreementSignature = (key, path, token, fileName, callback ) => {

    const pathJson = RNFS.DocumentDirectoryPath + '/' + fileName + '.txt';

    const finalPath = 'file://' + path;
   
    const data = {
        "token": token,
        "deviceName": "RESTclient",
        "ssoEnabled": false,
        "moStructure": "GT4301",
        "moKey": [
            key
        ],
        "formName": "P594312B_W594312BA",
        "version": "DICIPA01",
        "file": {
            "fileLocation": finalPath,
            "fileName": fileName + ".png",
            "itemName": fileName,
            "sequence": 0
        }
    }

    const json = JSON.stringify(data);

    if (token) {       

        RNFS.writeFile(pathJson, json, 'utf8').then(() => {

            const formData = new FormData();
            formData.append('file', {
                uri: finalPath,
                type: 'image/png',
                name: fileName + ".png",
            }, fileName + ".png");


            formData.append("moAdd", {
                uri: 'file://' + pathJson,
                type: 'application/json',
                name: fileName + ".txt",
            });

            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            }

            axios.post("file/upload", formData, config).then((response) => callback(response))
                .catch(error => console.warn("Error en la peticion",error));

        });
    } 




}