import barCodeIcon from '../assets/iconbarcode.png';
import cameraIcon from '../assets/iconcamera.png';
import refreshIcon from '../assets/iconrefresh.png';
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
        },
        {
            id:"refresh",
            icon:refreshIcon,
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

export const rightButtonsClose = {
    rightButtons:[        
        {
            id:'close',
            icon:closeIcon,
        },        
    ]

};

export const rightButtonsRefreshOnly = {
    rightButtons:[
        {
            id:"refresh",
            icon:refreshIcon,
        }
    ]
}