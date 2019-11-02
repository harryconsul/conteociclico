import axios from 'axios'

export const printOrder=(orden,token,callback)=>{
    const _formAction =formAction(orden , token); 
    formServiceRequest(_formAction,callback);
}


const formServiceRequest=(formAction,callback)=>{
    axios.post("v2/report/execute",formAction).then((response)=>{
        callback(response.data);
    }).catch((error)=>console.warn("Error al buscar artículos",error));
}

const formAction = (orden,  token) => (
    {
        token,
        reportVersion: "XJDE0022",
        reportName:"R5942565",
        "dataSelection": {
            "criteria": [{
                "subject": {
                   "dictItem": "DOCO",
                    "table": "F4211"
                },
                "predicate": {
                    "literalType": "SINGLE",
                    "values": [orden]
                },
                "comparisonType": "EQUAL"
            }]
        },
        "deviceName": "RESTclient",

    }
)
