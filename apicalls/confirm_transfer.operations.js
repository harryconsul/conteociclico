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