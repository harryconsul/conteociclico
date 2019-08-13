import * as actionTypes from './action.codes';

export const actionLogin=(user)=>{
    return{
        type:actionTypes.USER_LOGIN,
        user,
    }

}
export const actionUpdateStack=(stack)=>{
    return{
        type:actionTypes.UPDATE_STACK,
        stack,
    }
}
export const actionSetArticlesMap=(articlesMap)=>{
    return{
        type:actionTypes.SET_ARTICLES_MAP,
        articlesMap,
    }
}

export const actionSetArticlesArray=(articlesArray)=>{
    return{
        type:actionTypes.SET_ARTICLES_ARRAY,
        articlesArray,
    }
}

export const actionSetCurrentScreen=(screenId)=>{
    return{
        type:actionTypes.SET_CURRENT_SCREEN,
        screenId,
    }
}
