import axios from 'axios';


const actionSearchShipment = (orderNumber) => {
    return {
        formName: "P554205_W554205D",
        version: "DICIPA25",
        formActions: [
            {
                command: "SetControlValue",
                value: orderNumber,
                "controlID": "19"
            },
            {
                command: "DoAction",
                controlID: "15",
            }
        ]
    }
}
const actionEnterCyclicCount=(rows)=>{
    return{
        formOID:"W4141A",
        formActions:[
            {
               
                "gridAction":{
                    "gridID":"1",
                    "gridRowUpdateEvents":rows.map(row=>(
                        {
                            "rowNumber": Number(row.rowId),
                            "gridColumnEvents": [
                                {
                                    "value":row.qty,
                                    "command": "SetGridCellValue",
                                    "columnID": "29"
                                },                                
                            ]
                        })
                    ),  
                }

            },
            {   ".type": "com.oracle.e1.jdemf.FormAction",
                command: "DoAction",
                controlID: "4"
                
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
export const searchShipment=(orderNumber,token,callback,errorHandler)=>{
    
    callStackService(createStack(token,actionSearchShipment(orderNumber)),callback,errorHandler);
    
}
export const startConfirmation =(token,stack,callback)=>{
    const action = pushStack(token,actionStartConfirmation(),stack);
    callStackService(action,callback,(reason)=>console.warn(reason));
        
    
}
export const enterCyclicCount =(token,stack,rows,callback)=>{
    const action = pushStack(token,actionEnterCyclicCount(rows),stack);
    
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