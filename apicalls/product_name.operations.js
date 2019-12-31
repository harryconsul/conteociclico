/*
    Request Form: buscar el nombre del producto, 
    cuando el usuario ingrese el número
*/
import axios from 'axios';

export const productName = (product, token, callback) => {
    const _formAction = formAction(product, token);
    formServiceRequest(_formAction, callback);
}

const formServiceRequest = (formAction, callback) => {
    axios.post("formservice", formAction).then((response) => {
            callback(response.data);
        })
        .catch((error) => console.warn("ERROR al buscar el producto", error));
}

const formAction = (product, token) => (
    {
        token,
        version: "",
        "formActions": [

            {
                "command": "SetQBEValue",
                "value": product,
                "controlID": "1[50]"
            },
            {
                "command": "DoAction",
                "controlID": "13"
            }
        ],
        "deviceName": "RESTclient",
        "formName": "P40ITM1_W40ITM1A"
    }
)
