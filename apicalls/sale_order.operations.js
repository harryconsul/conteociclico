import axios from 'axios';
import { errorHelpers } from '../helpers'

const actionStartSaleOrder = (fromCyclicCount) => {
    return {

        formName: "P574210F_W574210FG",
        version: fromCyclicCount?"DICIPA022":"DICIPA22",
        formInputs: [
            {
                id: "84",
                value: fromCyclicCount?"S9":"S8"
            }
        ],

    }
}

const actionFillForm = (form) => {
    return {
        formOID: "W574210FG",
        formActions: [
            {
                command: "SetControlValue",
                value: form.clienteVenta,
                controlID: "458"
            },
            {
                command: "SetControlValue",
                value: form.clienteEntrega,
                controlID: "460"
            },
            {
                command: "SetControlValue",
                value: form.contrato,
                controlID: "92"
            },
            {
                command: "SetControlValue",
                value: form.sucursal,
                controlID: "98"
            },
            {
                command: "SetControlValue",
                value: form.fechaEntrega,
                controlID: "562"
            },
            {
                command: "DoAction",
                controlID: "3"
            }
        ]
    }
}
const actionConfirmHeader = () => {
    return {
        formOID: "W574210FG",
        formActions: [
            {
                command: "DoAction",
                controlID: "3"
            },


        ],
    }
}
const actionConfirmDetail = () => {
    return {
        formOID: "W574210FA",
        formActions: [
            {
                command: "DoAction",
                controlID: "4"
            },


        ],
    }
}

const actionSetSaleDetail = (rows,businessUnit) => {
    return {
        formOID: "W574210FA",
        formActions: [
            {
                "gridAction": {
                    "gridID": "1",
                    "gridRowInsertEvents": rows.map(row => (
                        {
                            "gridColumnEvents": [
                                {
                                    "value": row.itemNumber,
                                    "command": "SetGridCellValue",
                                    "columnID": "89"
                                },
                                {
                                    "value": row.qty,
                                    "command": "SetGridCellValue",
                                    "columnID": "53"
                                },
                                {
                                    "value": row.price,
                                    "command": "SetGridCellValue",
                                    "columnID": "57"
                                },
                                {
                                    "value": row.location,
                                    "command": "SetGridCellValue",
                                    "columnID": "132"
                                },
                                {
                                    "value": row.serial,
                                    "command": "SetGridCellValue",
                                    "columnID": "133"
                                },
                                {
                                    "value": businessUnit,
                                    "command": "SetGridCellValue",
                                    "columnID": "35"
                                },

                            ]
                        })
                    ),
                }
            },
            {
                command: "DoAction",
                controlID: "4"
            }
        ]
    }
}

export const startSaleOrder = (token,fromCyclicCount=false,callback) => {
    const _action = actionStartSaleOrder(fromCyclicCount);
    const _stack = createStack(token, _action)
    
    callStackService(_stack, callback);

}

export const fillOrderHeader = (token, stack, form, callback) => {

    const action = pushStack(token, actionFillForm(form), stack);
    callStackService(action, (response) => {
        if(!errorHelpers.handleErrors(response.data.fs_P574210F_W574210FG) ){

            const stackConfirm = {
                stackId: response.data.stackId,
                stateId: response.data.stateId,
                rid: response.data.rid,
    
            }
            const actionConfirm = pushStack(token, actionConfirmHeader(), stackConfirm);
            callStackService(actionConfirm, callback);
            
        }
        

    });


}

export const fillOrderDetail = (token, stack, rows,businessUnit, callback) => {

    const action = pushStack(token, actionSetSaleDetail(rows,businessUnit), stack);
    callStackService(action, (response) => {

        if (!errorHelpers.handleErrors(response.data.fs_P574210F_W574210FA)) {
            const stackConfirm = {
                stackId: response.data.stackId,
                stateId: response.data.stateId,
                rid: response.data.rid,

            }

            const actionConfirm = pushStack(token, actionConfirmDetail(), stackConfirm);
            callStackService(actionConfirm, callback);
        }else{
            callback(null)
        }

    });


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
const callStackService = (action, callback) => {

    axios.post("appstack", action)
        .then(callback)
        .catch((error) => console.warn("Error en la petición", error));
}