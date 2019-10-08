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
           "22478"
        ],
        "formName":"P5541240_W5541240A",
        "version":"",
        "file":{
            "fileLocation":finalPath,
            "fileName":"test.png",
            "itemName":"test",  
            "sequence":0          
        }
    }
    const json = JSON.stringify(data);
    
    RNFS.writeFile(pathJson,json,'utf8').then(()=>{
        formData.append('file',{
            uri:finalPath,
            type:'image/png',
            name:"test.png",
            },"test.png");      
       
        
        formData.append("moAdd",{
            uri:'file://'+pathJson,
            type:'application/json',
            name:"test1.txt",
            });
        
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        }
    
        axios.post("file/upload",formData,config).then((response)=>callback())
        .catch(error=>console.warn(error));
    })
   
    
}