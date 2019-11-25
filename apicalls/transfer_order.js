import axios from 'axios';
import { errorHelpers } from '../helpers'

const actionStartTransferOrder = () => {
    return {

        formName: "P564210F_W564210FA",
        version: "DICIPA20",
        formInputs: [
           
        ],

    }
}


const actionConfirmDetail = () => {
    return {
        formOID: "W564210FA",
        formActions: [
            {
                command: "DoAction",
                controlID: "4"
            },


        ],
    }
}

const actionSetTransferDetail = (form,rows) => {
    return {
        formOID: "W564210FA",
        formActions: [
            {
                command: "SetControlValue",
                value: form.clienteOrigen,
                controlID: "716"
            },
            {
                command: "SetControlValue",
                value: form.clienteDestino,
                controlID: "718"
            },
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

export const startTransferOrder = (token,callback) => {
    const _action = actionStartTransferOrder();
    const _stack = createStack(token, _action)
    
    callStackService(_stack, callback);

}



export const fillOrderDetail = (token, stack, form,rows, callback) => {

    const action = pushStack(token, actionSetTransferDetail(form,rows), stack);
    callStackService(action, (response) => {
        console.warn(response);
        if (!errorHelpers.handleErrors(response.data.fs_P564210F_W564210FA)) {
            const stackConfirm = {
                stackId: response.data.stackId,
                stateId: response.data.stateId,
                rid: response.data.rid,

            }
            const doco = response.data.fs_P564210F_W564210FA.data.txtOrderNumber_17.value;

            const finalCallback = ()=>{
                callback(doco);
            }
            const actionConfirm = pushStack(token, actionConfirmDetail(), stackConfirm);
            callStackService(actionConfirm, finalCallback);
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
