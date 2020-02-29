/*
    Request Form: buscar el nombre de la unidad de negocio, 
    cuando el usuario ingrese el número
*/
import axios from 'axios';

export const businessUnit = (number, token, callback) => {
    const _formAction = formActionBU(token, number);
    formServiceRequest(_formAction, callback);
}

export const unidadMedida = (producto, token, callback) => {
    const _formAction = formActionUM(token,producto);
    formServiceRequest(_formAction,callback);
}

const formServiceRequest = (formAction, callback) => {
    axios.post("formservice", formAction)
        .then((response) => {
            callback(response.data);
        })
        .catch((error) => console.warn("ERROR al buscar la unidad de negocio", error));
}

const formActionBU = (token, number) => (
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

const formActionUM = (token, producto) => (
    {
        token,
        version: "",
        "formActions": [

            {
                command: "SetControlValue",
                value: producto,
                "controlID": "41"
            },
            {
                "command": "DoAction",
                "controlID": "29"
            }
        ],
        "deviceName": "RESTclient",
        "formName": "P41002_W41002A"
    }
)


export const buscarConversiones = (itemNumber,token) => {
    const _itemNumber = itemNumber;
    const _token = token
    return new Promise((resolve, reject) => {
        unidadMedida(_itemNumber, _token, (data) => {
            const rawRows = data.fs_P41002_W41002A.data.gridData.rowset;
            
            const conversiones =rawRows.map((row)=>({
                valor: row.chVC_38.value,
                unidad: row.sFromUOM_6.value,
                valorConversion: row.mnConversionFactor_7.value,
                valorUnidad: row.sToUOM_8.value,
            }));
            
            resolve(conversiones);

        }, (reason) => reject(reason));
    });
}