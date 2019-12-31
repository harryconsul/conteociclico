import axios from 'axios'

export const queryArticle = (unidad, producto, token, callback) => {
    const _formAction = formAction(unidad, producto, token);
    formServiceRequest(_formAction, callback);
}

export const queryArticleByItemNumber = (unidad, producto, token, callback) => {
    const _formAction = formActionByItemNumber(unidad, producto, token);
    formServiceRequest(_formAction, callback);
}

export const queryArticleByNumber = (unidad, producto, token, callback) => {
    const _formAction = formActionByArticleNumber(unidad, producto, token);
    formServiceRequest(_formAction, callback);
}

const formServiceRequest = (formAction, callback) => {
    axios.post("formservice", formAction).then((response) => {
        callback(response.data);
    }).catch((error) => console.warn("Error al buscar artículos", error));
}

///payload -- cuerpo de la peticion

const formAction = (unidad, producto, token) => (
    {
        token,
        version: "",
        maxPageSize: 500,
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


const formActionByItemNumber = (unidad, producto, token) => (
    {
        token,
        version: "DICIPA22",
        maxPageSize: 500,
        "formActions": [

            {
                "command": "SetControlValue",
                "value": producto,
                "controlID": "38"
            },
            {
                "command": "SetControlValue",
                "value": unidad,
                "controlID": "9"
            },
            {
                "command": "DoAction",
                "controlID": "56"
            }
        ],
        "deviceName": "RESTclient",
        "formName": "P57LOCN_W57LOCNB"
    }
)

//Buscar artículos por número de catálogo (omitir cantidades en cero)
const formActionByArticleNumber = (unidad, producto, token) => ({
    token,
    version: 'ZJDE0001',
    maxPageSize: 500,
    "formActions": [

        {
            "command": "SetControlValue",
            "value": producto,
            "controlID": "17"
        },
        {
            "command": "SetControlValue",
            "value": unidad,
            "controlID": "7"
        },
        {
            "command": "SetCheckboxValue",
            "value": "on",
            "controlID": "31"
        },
        {
            "command": "DoAction",
            "controlID": "14"
        }
    ],
    "deviceName": "RESTclient",
    "formName": "P41202_W41202A"
});