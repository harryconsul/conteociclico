import axios from 'axios';

const actionStartTransfer = () => {
    return {
        formName: "P4112_W4112D",
        version: "DICIPA008",
        formActions: [
            {
                command: "DoAction",
                controlID: "23",
            }
        ]
    }
}

const actionFillForm = (form) => {
    return {
        formOID: "W4112A",
        formActions: [
            {
                command: "SetControlValue",
                value: form.unidadOrigen,
                controlID: "15"
            },
            {
                command: "SetControlValue",
                value: form.motivo,
                controlID: "13"
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
                                    "columnID": "38"
                                },
                                {
                                    "value": row.qty,
                                    "command": "SetGridCellValue",
                                    "columnID": "28"
                                },
                                {
                                    "value": row.location,
                                    "command": "SetGridCellValue",
                                    "columnID": "73"
                                },
                                {
                                    "value": row.serial,
                                    "command": "SetGridCellValue",
                                    "columnID": "31"
                                },
                                {
                                    "value": form.razonCodigo,
                                    "command": "SetGridCellValue",
                                    "columnID": "279"
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
        formOID: "W4112A",
        formActions: [
            {
                command: "DoAction",
                controlID: "4"
            },


        ],
    }
}

export const startExit = (token, callback) => {

    callStackService(createStack(token, actionStartTransfer()), callback);

}
export const fillTransfer = (token, stack, form, callback) => {
    
    const action = pushStack(token, actionFillForm(form), stack);
    callStackService(action, (response)=>{
        
        const stackConfirm = {
            stackId: response.data.stackId,
            stateId: response.data.stateId,
            rid: response.data.rid,
            currentApplication: "P564113_W564113B_DICIPA003",

        }
        const actionConfirm=pushStack(token, actionConfirmTransfer(), stackConfirm);
        callStackService(actionConfirm,callback);        

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