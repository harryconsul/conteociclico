import barCodeIcon from '../assets/iconbarcode.png';
import cameraIcon from '../assets/iconcamera.png';
import closeIcon from '../assets/iconclose.png';
export const rightButtons = {
    rightButtons:[
        {
            id:"barCode",
            icon:cameraIcon,
        },
        {
            id:"inputCode",
            icon:barCodeIcon,
        }
    ]

};

export const rightButtonsOnlyCamera = {
    rightButtons:[
        {
            id:"barCode",
            icon:cameraIcon,
        },        
    ]

};

export const rightButtonsCameraClose = {
    rightButtons:[
        {
            id:"barCode",
            icon:cameraIcon,
        },
        {
            id:'close',
            icon:closeIcon,
        },        
    ]

};