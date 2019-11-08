import axios from 'axios';
import RNFS from 'react-native-fs';
export const uploadSignature=(key,path,token,fileName,callback)=>{
    const formData = new FormData();
    const pathJson = RNFS.DocumentDirectoryPath + '/' + fileName + '.txt';
    
    const finalPath = 'file://' + path;
    
    const data={
        "token":token,
        "deviceName":"RESTclient",
        "ssoEnabled":false,
        "moStructure":"GT5541240",
        "moKey":[
           key
        ],
        "formName":"P5541240_W5541240A",
        "version":"",
        "file":{
            "fileLocation":finalPath,
            "fileName":fileName + ".png",
            "itemName": fileName,  
            "sequence":0          
        }
    }
    
    const json = JSON.stringify(data);
    
    RNFS.writeFile(pathJson,json,'utf8').then(()=>{
        formData.append('file',{
            uri:finalPath,
            type:'image/png',
            name: fileName+ ".png",
            },fileName + ".png");      
       
        
        formData.append("moAdd",{
            uri:'file://'+pathJson,
            type:'application/json',
            name: fileName + ".txt",
            });
        
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        }
    
        axios.post("file/upload",formData,config).then((response)=>callback(response))
        .catch(error=>console.warn(error));
    })
   
    
}