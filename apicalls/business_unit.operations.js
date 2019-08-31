/*
    Request Form: buscar el nombre de la unidad de negocio, 
    cuando el usuario ingrese el número
*/
import axios from 'axios';

export const businessUnit = (number, token, callback) => {
    const _formAction = formAction(token, number);
    formServiceRequest(_formAction, callback);
}

const formServiceRequest = (formAction, callback) => {
    axios.post("formservice", formAction)
    .then((response) => {
        callback(response.data);
    })
    .catch((error) => console.warn("ERROR al buscar la unidad de negocio", error));
}

const formAction = (token , number) => (
    {
        token,
        version: "",
        "formActions": [

            {
                "command": "SetQBEValue",
                "value": number,
                "controlID": "1[5]"
            },
            {
                "command": "DoAction",
                "controlID": "9"
            }
        ],
        "deviceName": "RESTclient",
        "formName": "P0006S_W0006SA"
    }
)
