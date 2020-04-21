import axios from 'axios';


const actionSearchScreens = (user) => {
    return {
        formName: "P00095_W00095A",
        version: "",
        maxPageSize: 500,
        formActions: [
            {
                command: "SetControlValue",
                value: user,
                "controlID": "20"
            },            
            {
                command: "DoAction",
                controlID: "15",
            }
        ]
    }
}


const actionDelete = (rows) => (
    {
        formOID: "W00095A",
        formActions: [
            rows.map(row => ({
                "command": "SelectRow",
                "controlID": "1." + row.rowIndex
            })
            ),
            {
                ".type": "com.oracle.e1.jdemf.FormAction",
                command: "DoAction",
                controlID: "36"
            }
        ]
    }
)





export const clearAllJDEScreens = (token,  user) => {
   
    const searchScreens = createStack(token,actionSearchScreens(user))

   
    callStackService(searchScreens, (response)=>{
        const rawRows = response.data.fs_P00095_W00095A.data.gridData.rowset;
        const stack = {
            stackId: response.data.stackId,
            stateId: response.data.stateId,
            rid: response.data.rid,
            currentApplication: "P5541240_W5541240A",
        }
        if(rawRows.length){
            const pressDelete = pushStack(token,actionDelete(rawRows),stack);
            callStackService(pressDelete,(response)=>{
                
            },(error)=>console.warn(error));
    
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
const callStackService = (action, callback, errorHandler) => {

    axios.post("appstack", action).then(callback).catch(errorHandler);
}
