import axios from 'axios'

export const queryArticle=(unidad,producto,token,callback)=>{
    const _formAction =formAction(unidad , producto , token); 
    formServiceRequest(_formAction,callback);
}

const formServiceRequest=(formAction,callback)=>{
    axios.post("formservice",formAction).then((response)=>{
        callback(response.data);
    }).catch((error)=>console.warn("Error al buscar artículos",error));
}

///payload -- cuerpo de la peticion

const formAction = (unidad, producto , token) => (
    {
        token,
        version: "",
        "formActions": [
            
            {
                "command": "SetControlValue",
                "value": producto,
                "controlID": "40"
            }, 
            {
                "command": "SetControlValue",
                "value": unidad,
                "controlID": "49"
            },         
            {
                "command": "DoAction",
                "controlID": "15"
            }
        ],
        "deviceName": "RESTclient",
        "formName": "P5541001_W5541001A"
    }
)
