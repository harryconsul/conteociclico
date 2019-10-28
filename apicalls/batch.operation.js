/*
    Request Form: generar reporte y enviar a impresora, 
*/
import axios from 'axios';

export const buscarBatch = (batch , sucursal , token, callback) => {
    const _formAction = formAction(token, batch , sucursal);
    formServiceRequest(_formAction, callback);
}

const formServiceRequest = (formAction, callback) => {
    axios.post("formservice", formAction)
    .then((response) => {
        callback(response.data);
    })
    .catch((error) => console.warn("ERROR al buscar el batch", error));
}

const formAction = (token , batch , sucursal) => (
    {
        token,
        version: "ZJDE0001",
        "formActions": [
            {
                command: "SetControlValue",
                value: batch,
                controlID: "11"
            },
            {
                "command": "SetQBEValue",
                "value": "*" + sucursal,
                "controlID": "1[25]"
            },
            {
                "command": "SetQBEValue",
                "value": "NO USAR*",
                "controlID": "1[26]"
            },
            {
                "command": "DoAction",
                "controlID": "9"
            }
        ],
        "deviceName": "RESTclient",
        "formName": "P98305W_W98305WA"
    }
)
