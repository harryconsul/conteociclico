import axios from 'axios';


const actionSearchShipment = (orderNumber) => {
    return {
        formName: "P554205_W554205D",
        version: "DICIPA25",
        formActions: [
            {
                command: "SetControlValue",
                value: orderNumber,
                "controlID": "71"
            },
            {
                command: "SetControlValue",
                value: "*",
                "controlID": "20"
            },
            {
                command: "DoAction",
                controlID: "15",
            }
        ]
    }
}

const actionStartConfirmation=(rowId)=>{
    return{
            formOID: "W554205D",
            formActions: [
                {
                    ".type": "com.oracle.e1.jdemf.FormAction",
                    command: "DoAction",
                    controlID: "80"
                }
            ]        
    }
}
const actionShipmentConfirmation=(rows)=>(
    {
        formOID: "W554205E",
            formActions: [
                {
               
                    "gridAction":{
                        "gridID":"1",
                        "gridRowUpdateEvents":rows.map(row=>(
                            {
                                "rowNumber": Number(row.rowId),
                                "gridColumnEvents": [
                                    {
                                        "value": row.set,
                                        "command": "SetGridCellValue",
                                        "columnID": "33"
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

const actionClickOk=(rows)=>(
    {
        formOID: "W554205E",
            formActions: [
                {
                    ".type": "com.oracle.e1.jdemf.FormAction",
                    command: "DoAction",
                    controlID: "12"
                }
            ]   
    }
)

export const shipmentConfirmation=(token,stack ,rows,callback)=>{
    const formAction = actionShipmentConfirmation(rows);
    
    const action = pushStack(token,formAction,stack);
    callStackService(action,(response)=>{
        if(response.data.fs_P554205_W554205E){
                      
            const stackConfirm = {
                    stackId: response.data.stackId,
                    stateId: response.data.stateId,
                    rid: response.data.rid,
    
                }
                const actionConfirm = pushStack(token, actionClickOk(), stackConfirm);
                callStackService(actionConfirm, callback);
            
        }else{
            callback(response)
        }
    },(reason)=>console.warn(reason));
}
export const searchShipment=(orderNumber,token,callback,errorHandler)=>{
    
    callStackService(createStack(token,actionSearchShipment(orderNumber)),callback,errorHandler);
    
}
export const startConfirmation =(token,stack,callback)=>{
    const action = pushStack(token,actionStartConfirmation(),stack);
    callStackService(action,callback,(reason)=>console.warn(reason));
        
    
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