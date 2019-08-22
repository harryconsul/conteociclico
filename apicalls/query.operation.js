//Pendiente codigo JFRA
import axios from 'axios'

export const queryArticle=(item,token,callback)=>{
    const _formAction =formAction(token,item); 
    formServiceRequest(_formAction,callback);
}

const formServiceRequest=(formAction,callback)=>{
    axios.post("formservice",formAction).then((response)=>{
        callback(response.data);
    }).catch((error)=>console.warn("Error al buscar articulos",error));
}

///payload -- cuerpo de la peticion

const formAction = (token,item) => (
    {
        token,
        version: "",
        "formActions": [
            
            {
                "command": "SetControlValue",
                "value": item,
                "controlID": "27"
            },          
            {
                "command": "DoAction",
                "controlID": "15"
            }
        ],
        "deviceName": "RESTclient",
        "formName": "P574102E_W574102EA"
    }
)
