
import axios from 'axios';

export const searchClientAlias = (number, token, callback) => {
    const _formAction = clientFormAction(token, number);
    
    formServiceRequest(_formAction, callback);
}
export const searchContracts = (clientNumber, token, callback) => {
    const _formAction = contractFormAction(token, clientNumber);
    
    formServiceRequest(_formAction, callback);
}

const formServiceRequest = (formAction, callback) => {
    axios.post("formservice", formAction)
    .then((response) => {
        callback(response.data);
    })
    .catch((error) => console.warn("ERROR al buscar el cliente", error));
}

const clientFormAction = (token , number) => (
    {
        token,
        version: "",
        "formActions": [

            {
                "command": "SetQBEValue",
                "value": number,
                "controlID": "1[7]"
            },
            {
                "command": "DoAction",
                "controlID": "13"
            }
        ],
        "deviceName": "RESTclient",
        "formName": "P0101SL_W0101SLA"
    }
)

const contractFormAction = (token , clientNumber) => (
    {
        token,
        version: "DICIPA22",
        formServiceAction: "R",        
        "formActions": [               
            {
                "command": "SetQBEValue",
                "value": clientNumber,
                "controlID": "1[27]"
            },

            {
                "command": "DoAction",
                "controlID": "14"
            }
        ],
        "deviceName": "RESTclient",
        "formName": "P5942CSC_W5942CSCA"
    }
)