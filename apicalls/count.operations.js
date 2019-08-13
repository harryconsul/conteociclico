import axios from 'axios';


const searchCyclicCount = () => {
    return {
        formName: "P41240_W41240A",
        version: "ZJDE0001",
        formActions: [
            {
                command: "SetQBEValue",
                value: "20",
                "controlID": "1[26]"
            },
            {
                command: "DoAction",
                controlID: "19",
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
const actionSelectCyclicCount=(rowId)=>{
    return{
            formOID: "W41240A",
            formActions: [
                {
                    ".type": "com.oracle.e1.jdemf.FormAction",
                    command: "SelectRow",
                    controlID: "1." + rowId
                },
                {
                    ".type": "com.oracle.e1.jdemf.FormAction",
                    command: "DoAction",
                    controlID: "45"
                }
            ]        
    }
}
export const listCyclicCount=(token,callback,errorHandler)=>{
    
    callStackService(createStack(token,searchCyclicCount()),callback,errorHandler)
    
}
export const selectCyclicCount =(token,stack,rowId,callback)=>{
    const action = pushStack(token,actionSelectCyclicCount(rowId),stack);
    callStackService(action,callback,(reason)=>console.warn(reason));
        
    
}
export const enterCyclicCount =(token,stack,rows,callback)=>{
    const action = pushStack(token,actionEnterCyclicCount(rows),stack);
    console.log(JSON.stringify(action));
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