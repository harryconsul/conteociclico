import * as actionTypes from '../actions/action.codes';

const initialState = {
    user: {
        username: null,
        name: "",
        token: null,
        profile: "",
    },
    articlesMap:{},
    articlesArray:[],
    currentScreen:null,

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
                articlesMap: action.articlesMap,
            }
        case actionTypes.SET_ARTICLES_ARRAY:
            return {
                ...state,
                articlesArray: action.articlesArray,
            }
        case actionTypes.SET_CURRENT_SCREEN:
            return {
                ...state,
                currentScreen: action.screenId,
            }

    }
    return state;

}
export default reducer;