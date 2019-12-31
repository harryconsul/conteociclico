import axios from 'axios';

const actionSearchOrder = (number) => {
    return {
        formName: "P594312B_W594312BD",
        version: "DICIPA01",
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

export const searchOrder=(number,token,callback,errorHandler)=>{
    
    callStackService(createStack(token,actionSearchOrder(number)),callback,errorHandler);
    
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