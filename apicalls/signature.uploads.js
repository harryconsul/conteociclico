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
            "fileName": fileName + ".jpg",
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
                type: 'image/jpeg',
                name: fileName + ".jpg",
            }, fileName + ".jpg");


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
    uploadText(data,callback);
    
}
export const uploadCyclicCountErrors =  (token,key,errorText,callback) =>{
    const data = {
        "token": token,
        "deviceName": "RESTclient",       
        "moStructure": "GT5541240",
        "moKey": [
            key
        ],
        "formName": "P5541240_W5541240A",
        "version": "",
        "inputText": errorText,
        "appendText": true,
    }
    uploadText(data,callback);

}
const uploadText = (data,callback)=>{
    axios.post("file/updatetext", data)
    .then(callback)
    .catch((error) => console.warn("Error en la petición", error));
};

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
            "fileName": fileName + ".jpg",
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
                type: 'image/jpg',
                name: fileName + ".jpg",
            }, fileName + ".jpg");


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

export const uploadDeliverySignature = (key, path, token, fileName, callback ) => {

    const pathJson = RNFS.DocumentDirectoryPath + '/' + fileName + '.txt';

    const finalPath = 'file://' + path;
   
    const data = {
        "token": token,
        "deviceName": "RESTclient",
        "ssoEnabled": false,
        "moStructure": "GT55R4202",
        "moKey": [
            key
        ],
        "formName": "P55R4202_W55R4202B",
        "version": "",
        "file": {
            "fileLocation": finalPath,
            "fileName": fileName + ".jpg",
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
                type: 'image/jpg',
                name: fileName + ".jpg",
            }, fileName + ".jpg");


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

export const uploadDeliveryComments = (token,key,comment,callback) =>{
    
    const data = {
        "token": token,
        "deviceName": "RESTclient",       
        "moStructure": "GT55R4202",
        "moKey": [
            key
        ],
        "formName": "P55R4202_W55R4202B",
        "version": "",
        "inputText": comment,
        "appendText": true,
    }
    uploadText(data,callback);
    
}
