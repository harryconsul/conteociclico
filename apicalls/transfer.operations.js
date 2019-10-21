import axios from 'axios';
import { errorHelpers } from '../helpers'

const actionStartTransfer = () => {
    return {
        formName: "P564113_W564113A",
        version: "DICIPA003",
        formActions: [
            {
                command: "DoAction",
                controlID: "16",
            }
        ]
    }
}

const actionFillForm = (form) => {
    return {
        formOID: "W564113B",
        formActions: [
            {
                command: "SetControlValue",
                value: form.explicacion,
                controlID: "26"
            },
            {
                command: "SetControlValue",
                value: form.unidadOrigen,
                controlID: "46"
            },
            {
                command: "SetControlValue",
                value: form.unidadDestino,
                controlID: "201"
            },
            {
                "gridAction": {
                    "gridID": "1",
                    "gridRowInsertEvents": form.rows.map(row => (
                        {
                            "gridColumnEvents": [
                                {
                                    "value": row.itemNumber,
                                    "command": "SetGridCellValue",
                                    "columnID": "14"
                                },
                                {
                                    "value": row.qty,
                                    "command": "SetGridCellValue",
                                    "columnID": "6"
                                },
                                {
                                    "value": row.location,
                                    "command": "SetGridCellValue",
                                    "columnID": "215"
                                },
                                {
                                    "value": row.locationTo,
                                    "command": "SetGridCellValue",
                                    "columnID": "218"
                                },
                                {
                                    "value": row.serial,
                                    "command": "SetGridCellValue",
                                    "columnID": "42"
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
const actionConfirmTransfer = () => {
    return {
        formOID: "W564113B",
        formActions: [
            {
                command: "DoAction",
                controlID: "4"
            },


        ],
    }
}



export const startTransfer = (token, callback) => {

    callStackService(createStack(token, actionStartTransfer()), callback);

}
export const fillTransfer = (token, stack, form, callback) => {
    const formPayload = actionFillForm(form);
    
    const action = pushStack(token,formPayload , stack);
    callStackService(action, (response) => {
        if (!errorHelpers.handleErrors(response.data.fs_P564113_W564113B)) {
            const stackConfirm = {
                stackId: response.data.stackId,
                stateId: response.data.stateId,
                rid: response.data.rid,
                currentApplication: "P564113_W564113B_DICIPA003",

            }
            const documentNumber=response.data.fs_P564113_W564113B.data.txtPrevDocNo_37.value;
            const actionConfirm = pushStack(token, actionConfirmTransfer(), stackConfirm);
            callStackService(actionConfirm, (response)=>callback(documentNumber));
        } else {
            callback(null);
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

    axios.post("appstack", action).then(callback).catch(() => console.warn("Error en la petición"));
}