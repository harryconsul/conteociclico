/*
    Request Form: buscar el código del motivo de salida del producto, 
*/
import axios from 'axios';

export const razonMovimiento = (codigo, token, callback) => {
    const _formAction = formAction(token, codigo);
    formServiceRequest(_formAction, callback);
}

const formServiceRequest = (formAction, callback) => {
    axios.post("formservice", formAction)
    .then((response) => {
        callback(response.data);
    })
    .catch((error) => console.warn("ERROR código del motivo", error));
}

const formAction = (token , codigo) => (
    {
        token,
        version: "",
        "formActions": [
            {
                command: "SetComboValue",
                value: "42",
                "controlID": "16"
            },
            {
                command: "SetControlValue",
                value: "RC",
                "controlID": "18"
            },
            {
                "command": "SetQBEValue",
                "value": codigo,
                "controlID": "1[10]"
            },
            {
                "command": "DoAction",
                "controlID": "22"
            }
        ],
        "deviceName": "RESTclient",
        "formName": "P0004A_W0004AA"
    }
)
