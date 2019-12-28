import axios from 'axios';
import {Alert} from 'react-native';

const searchCyclicCount = (businessUnit) => {
    return {
        formName: "P5541240_W5541240A",        
        version: "",
        maxPageSize:1000,
        formActions: [
            {
                command: "SetComboValue",
                value: "20",
                "controlID": "70"
            },
            {
                command: "SetComboValue",
                value: "30",
                "controlID": "66"
            },
            {
                command: "SetControlValue",
                value: businessUnit,
                "controlID": "75"
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
            formOID: "W5541240A",
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
const actionReviewCyclicCount=(rowId)=>{
    return{
            formOID: "W5541240A",
            formActions: [
                {
                    ".type": "com.oracle.e1.jdemf.FormAction",
                    command: "SelectRow",
                    controlID: "1." + rowId
                },
                {
                    ".type": "com.oracle.e1.jdemf.FormAction",
                    command: "DoAction",
                    controlID: "4"
                }
            ]        
    }
}
export const listCyclicCount=(token,businessUnit,callback,errorHandler)=>{
    
    callStackService(createStack(token,searchCyclicCount(businessUnit)),callback,errorHandler)
    
}
export const selectCyclicCount =(token,stack,rowId,callback)=>{
    const action = pushStack(token,actionSelectCyclicCount(rowId),stack);
    callStackService(action,callback,(reason)=>console.warn(reason));
        
    
}
export const reviewCyclicCount =(token,stack,rowId,callback)=>{
    const action = pushStack(token,actionReviewCyclicCount(rowId),stack);
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
    
    axios.post("appstack",action).then(callback).catch((error)=>console.warn(error));
}


/// ******** unify review handling


export const processReview  = (previousReponse,cycleCountNumber,token,stack) => {

    return new Promise((resolve,reject)=>{
        
        const rows = previousReponse.data.fs_P5541240_W5541240A.data.gridData.rowset;
        const cyclicCount = rows.find(item => item.mnCycleNumber_25.value === cycleCountNumber);

        if (cyclicCount) {
            reviewCyclicCount(token, stack, cyclicCount.rowIndex, (response) => {
                
                const rawRows = response.data.fs_P41241_W41241A.data.gridData.rowset;
                
                const review = rawRows.map((item, index) => (
                    {
                        key: index,
                        serial: item.sLotSerial_21.value,
                        description: item.sDescription_28.value,
                        location: item.sLocation_61.value,
                        itemNumber: item.sItemNumber_42.value,
                        rowId: item.rowIndex,
                        qtyCounted: item.mnQuantityCounted_25.value,
                        qtyOnHand: item.mnQuantityOnHand_23.value,
                        qtyVariance: item.mnQuantityVariance_31.value,
                        safetyStock: item.mnSafetyStock_97.value,
                        isItem: item.sDescription_28.value === 'TOTALS' || item.sDescription_28.value === 'TOTALES' ? false : true,
                    }
                ));
                
                resolve(review);      
    
    
            })
        }else{
            reject("Error el conteo no esta disponible");
        }
    })
   

}
