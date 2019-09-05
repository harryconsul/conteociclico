import * as actionTypes from '../actions/action.codes';
import { transactionModes } from '../../constants'
const initialState = {
    user: {
        username: null,
        name: "",
        token: null,
        profile: "",
    },
    articles: new Map(),
    currentScreen: null,
    products: null,
    transactionMode: transactionModes.READ_ADD,
    stack:{

    },

}
const updateArticle = (articles, article) => {
    const articlesMap = new Map( [...articles ]);
    articlesMap.set(article.key,{ ...article });
    return articlesMap;
}
const reducer = (state = initialState, action) => {

    switch (action.type) {
        case actionTypes.USER_LOGIN:
            return {
                ...state,
                user: action.user
            }
        case actionTypes.UPDATE_STACK:
            return {
                ...state,
                stack: action.stack
            }
        case actionTypes.SET_ARTICLES_MAP:
            return {
                ...state,
                articles: action.articles,
            }
        case actionTypes.SET_TRANSMODE:
            return {
                ...state,
                transactionMode: action.transactionMode,
            }
        case actionTypes.SET_ARTICLE:
            return {
                ...state,
                articles: updateArticle(state.articles,action.article),
            }
        case actionTypes.SET_CURRENT_SCREEN:
            return {
                ...state,
                currentScreen: action.screenId,
            }
        case actionTypes.SET_PRODUCTS_PICKUP:

            return {
                ...state,
                products: action.products,
            }

    }
    return state;

}

export default reducer;