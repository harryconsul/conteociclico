import axios from 'axios';


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
                                    "columnID": "29"
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
    const action = pushStack(token, actionFillForm(form), stack);
    callStackService(action, (response)=>{
        console.warn("first Call",response.data);
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