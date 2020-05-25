import axios from 'axios';

const actionSearchRoute = (ruta) => {
    return {
        formName: "P55R4202_W55R4202B",
        version: "",
        maxPageSize: 500,
        formActions: [
            {
                "command": "SetControlValue",
                "value": ruta,
                "controlID": "13"
            },
            {
                "command": "SetControlValue",
                "value": "*",
                "controlID": "19"
            },
            {
                "command": "SetControlValue",
                "value": "*",
                "controlID": "17"
            },
            {
                "command": "DoAction",
                "controlID": "30",
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