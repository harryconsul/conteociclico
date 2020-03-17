import axios from 'axios';


const actionSearchShipment = (orderNumber) => {
    return {
        formName: "P554205A_W554205AD",
        version: "DICIPA25",
        maxPageSize: 500,
        formActions: [
            {
                command: "SetControlValue",
                value: orderNumber,
                "controlID": "71"
            },
            {
                command: "SetControlValue",
                value: "*",
                "controlID": "20"
            },
            {
                command: "DoAction",
                controlID: "15",
            }
        ]
    }
}

//Buscar en la pantalla respaldo de RECOLECCION.
const actionSearchBackup = (orderNumber) => {
    return {
        formName: "P574211U_W574211UA",
        version: "",
        maxPageSize: 500,
        formActions: [
            {
                command: "SetControlValue",
                value: orderNumber,
                "controlID": "46"
            },
            {
                command: "DoAction",
                controlID: "15",
            }
        ]
    }
}

//el arreglo rows, se prepara desde donde se invoco.
const actionDeleteBackup = (rows) => (
    {
        formOID: "W574211UA",
        formActions: [
            ...rows
            ,
            {
                ".type": "com.oracle.e1.jdemf.FormAction",
                command: "DoAction",
                controlID: "44"
            }
        ]
    }
);

const actionAddBackup = (orderNumber) => {
    return {
        formName: "P574211U_W574211UB",
        version: "",
        maxPageSize: 500,
        formActions: [
            {
                command: "SetControlValue",
                value: orderNumber,
                "controlID": "15"
            },
            {
                command: "DoAction",
                controlID: "17",
            }
        ]
    }
};

const actionStartConfirmation = (rowId) => {
    return {
        formOID: "W554205AD",
        formActions: [
            {
                ".type": "com.oracle.e1.jdemf.FormAction",
                command: "DoAction",
                controlID: "80"
            }
        ]
    }
}
const actionShipmentConfirmation = (rows) => (
    {
        formOID: "W554205AE",
        formActions: [
            {

                "gridAction": {
                    "gridID": "1",
                    "gridRowUpdateEvents": rows.map(row => (
                        {
                            "rowNumber": Number(row.rowId),
                            "gridColumnEvents": [
                                {
                                    "value": row.set,
                                    "command": "SetGridCellValue",
                                    "columnID": "33"
                                },

                            ]
                        })
                    ),
                }

            },
            {
                ".type": "com.oracle.e1.jdemf.FormAction",
                command: "DoAction",
                controlID: "12"
            }
        ]
    }
)

const actionClickOk = (rows) => (
    {
        formOID: "W554205AE",
        formActions: [
            {
                ".type": "com.oracle.e1.jdemf.FormAction",
                command: "DoAction",
                controlID: "12"
            }
        ]
    }
)

const actionClickPrint = (rows) => (
    {
        formOID: "W554205AD",
        formActions: [
            rows.map(row => ({
                "command": "SelectRow",
                "controlID": "1." + row.rowId.toString()
            })
            ),
            {
                ".type": "com.oracle.e1.jdemf.FormAction",
                command: "DoAction",
                controlID: "93"
            }
        ]
    }
)

export const printShipment = (token, stack, rows, callback) => {
    const actionPrint = pushStack(token, actionClickPrint(rows), stack);
    callStackService(actionPrint, callback);
}

export const shipmentConfirmation = (token, stack, rows, callback) => {
    const formAction = actionShipmentConfirmation(rows);

    const action = pushStack(token, formAction, stack);
    callStackService(action, (response) => {
        if (response.data.fs_P554205A_W554205AE) {

            const stackConfirm = {
                stackId: response.data.stackId,
                stateId: response.data.stateId,
                rid: response.data.rid,

            }
            const actionConfirm = pushStack(token, actionClickOk(), stackConfirm);
            callStackService(actionConfirm, callback);

        } else {
            callback(response)
        }
    }, (reason) => console.warn(reason));
}
export const searchShipment = (orderNumber, token, callback, errorHandler) => {

    callStackService(createStack(token, actionSearchShipment(orderNumber)), callback, errorHandler);

}

export const searchShipmentBackup = (orderNumber, token, callback, errorHandler) => {
    callStackService(createStack(token, actionSearchBackup(orderNumber)), callback, errorHandler);
}

export const addShipmentBackup = (orderNumber, token, callback, errorHandler) => {
    callStackService(createStack(token, actionAddBackup(orderNumber )), callback, errorHandler);
}

export const startConfirmation = (token, stack, callback) => {
    const action = pushStack(token, actionStartConfirmation(), stack);
    callStackService(action, callback, (reason) => console.warn(reason));
}

export const deleteBackup = (token, stack, rows, callback) => {
    const deleteBackup = pushStack(token, actionDeleteBackup(rows), stack);
    callStackService(deleteBackup, callback);
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