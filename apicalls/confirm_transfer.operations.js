import axios from 'axios';

const actionSearchOrder = (number) => {
    return {
        formName: "P594312B_W594312BD",
        version: "DICIPA01",
        maxPageSize: 500,
        formActions: [
            {
                command: "SetControlValue",
                value: number,
                "controlID": "7"
            },
            {
                command: "SetControlValue",
                value: "*",
                "controlID": "9"
            },
            {
                command: "SetControlValue",
                value: "*",
                "controlID": "37"
            },
            {
                command: "DoAction",
                controlID: "21",
            }
        ]
    }
}

const actionStartConfirmation = (rowId) => {
    return {
        formOID: "W594312BD",
        formActions: [
            {
                ".type": "com.oracle.e1.jdemf.FormAction",
                command: "DoAction",
                controlID: "4"
            }
        ]
    }
}

export const searchOrder=(number,token,callback,errorHandler)=>{
    
    callStackService(createStack(token,actionSearchOrder(number)),callback,errorHandler);
    
}

export const startConfirmation = (token, stack, callback) => {
    const action = pushStack(token, actionStartConfirmation(), stack);
    callStackService(action, callback, (reason) => console.warn(reason));
}

export const transferConfirmation = (token, stack, rows, callback) => {
    const formAction = actionTransferConfirmation(rows);

    const action = pushStack(token, formAction, stack);
    callStackService(action, (response) => {
        if (response.data.fs_P594312B_W594312BA) {

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

const actionTransferConfirmation = (rows) => (
    {
        formOID: "W594312BA",
        formActions: [
            {

                "gridAction": {
                    "gridID": "1",
                    "gridRowUpdateEvents": rows.map(row => (
                        {
                            "rowNumber": parseInt(row.rowId),
                            "gridColumnEvents": [
                                {
                                    "value": "1",
                                    "command": "SetGridCellValue",
                                    "columnID": "382"
                                },
                                {
                                    "value": parseInt(row.confirmed),
                                    "command": "SetGridCellValue",
                                    "columnID": "116"
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

const actionClickOk = () => (
    {
        formOID: "W594312BA",
        formActions: [
            {
                ".type": "com.oracle.e1.jdemf.FormAction",
                command: "DoAction",
                controlID: "4"
            }
        ]
    }
)

const createStack = (token,formRequest) => {
    return {
        token,
        formRequest,
        action: "open",        
        deviceName: "RESTclient",
    }
}
const pushStack = (token,actionRequest,stack) => {
    return {
        token,
        actionRequest,
        ...stack,
        action: "execute",        
        deviceName: "RESTclient",
    }
}

const callStackService = (action,callback,errorHandler)=>{
    
    axios.post("appstack",action).then(callback).catch(errorHandler);
}