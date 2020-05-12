import axios from 'axios';

const actionSearchRoute = (ruta) => {
    return {
        formName: "P55R4201_W55R4201A",
        version: "",
        maxPageSize: 500,
        returnControlIDs:"55_24[25,26,27,28,29,30,31,32]",
        formActions: [
            {
                "command": "SetControlValue",
                "value": ruta,
                "controlID": "55_33"
            },
            {
                "command": "SetControlValue",
                "value": "*",
                "controlID": "55_35"
            },
            {
                "command": "SetControlValue",
                "value": "*",
                "controlID": "55_39"
            },
            {
                "command": "DoAction",
                "controlID": "55_37",
            }
        ]
    }
}

export const searchRoute = (ruta, token, callback, errorHandler) => {
    callStackService(createStack(token, actionSearchRoute(ruta)), callback, errorHandler);
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