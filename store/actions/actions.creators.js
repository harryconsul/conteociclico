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
export const actionSetArticlesMap=(articles)=>{
    return{
        type:actionTypes.SET_ARTICLES_MAP,
        articles,
    }
}

export const actionSetArticle=(article)=>{
    return{
        type:actionTypes.SET_ARTICLE,
        article
    }
}

export const actionSetTransactionMode=(transactionMode)=>{
    return{
        type:actionTypes.SET_TRANSMODE,
        transactionMode
    }
}


export const actionSetProductsToPickup=(products)=>{
    return{
        type:actionTypes.SET_PRODUCTS_PICKUP,
        products,
    }
}

export const actionSetCurrentScreen=(screenId)=>{
    return{
        type:actionTypes.SET_CURRENT_SCREEN,
        screenId,
    }
}

export const actionSetCountRealm = (countRealm)=>{
    return{
        type:actionTypes.SET_COUNT_REALM,
        countRealm,
    }
}

export const actionSetSucursal = (sucursal)=>{
    return{
        type:actionTypes.SET_SUCURSAL,
        sucursal,
    }
}
