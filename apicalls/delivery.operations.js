import axios from 'axios';

const actionSearchRoute = (ruta) => {
    return {
        formName: "P55R4202_W55R4202B",
        version: "",
        maxPageSize: 500,
        formActions: [
            {
                "command": "SetControlValue",
                "value": ruta,
                "controlID": "13"
            },
            {
                "command": "SetControlValue",
                "value": "*",
                "controlID": "19"
            },
            {
                "command": "SetControlValue",
                "value": "*",
                "controlID": "17"
            },
            {
                "command": "DoAction",
                "controlID": "30",
            }
        ]
    }
}

const actionSelectInvoice = (row) => {
    return {
        formOID: "W55R4202B",
        formActions: [
            {
                command: "ClickGridCell",
                controlID: "22." + row + ".25"
            },


        ],
    }
}

const actionSearchUser = (user) =>{
    return {
        formName: "P0092_W0092D",
        version: "ZJDE0001",
        maxPageSize: 1,
        formActions: [
            {
                "command": "SetControlValue",
                "value": "on",
                "controlID": "80"
            },
            {
                "command": "SetQBEValue",
                "value": user,
                "controlID": "1[7]"
            },
            {
                "command": "DoAction",
                "controlID": "35",
            }
        ]
    }
}

const actionSaveDocument = (rows) => (
    {
        formOID: "W55R4202A",
        formActions: [
            rows.map(row => (
            {
                "command": "SelectRow",
                "controlID": row.rowId
            },
            {
                command: "SetQBEValue",
                value: rows.entregado,
                "controlID": "19[28]"
            }
            )
            ),
            {
                ".type": "com.oracle.e1.jdemf.FormAction",
                command: "DoAction",
                controlID: "38"
            }
        ]
    }
)

export const saveDocument = (token, stack, rows, callback) => {
    const actionSave = pushStack(token, actionSaveDocument(rows), stack);
    callStackService(actionSave, callback);
}

export const searchRoute = (ruta, token, callback, errorHandler) => {
    callStackService(createStack(token, actionSearchRoute(ruta)), callback, errorHandler);
}

export const selectInvoice = (row,token,stack,callback,errorHandler) => {
    const formAction = actionSelectInvoice(row);    
    callStackService(pushStack(token,formAction,stack),callback,errorHandler)
}

export const searchUser = (user, token, callback, errorHandler) => {
    callStackService(createStack(token, actionSearchUser(user)), callback, errorHandler);
}

const createStack = (token, formRequest) => {
    return {
        token,
        formRequest,
        action: "open",
        deviceName: "RESTclient",
    }
}
const pushStack = (token, actionRequest, stack) => {
    return {
        token,
        actionRequest,
        ...stack,
        action: "execute",
        deviceName: "RESTclient",
    }
}
const callStackService = (action, callback, errorHandler) => {

    axios.post("appstack", action).then(callback).catch(errorHandler);
}