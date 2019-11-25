/**
 * @format
 */
/*
import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
*/
import  axios from 'axios';
import React from 'react';
import { Navigation } from 'react-native-navigation';
import Auth from './screens/Auth';
import CountList from './screens/CountList/CountList';
import EnterCycleCount from './screens/CountList/EnterCycleCount';
import BarcodeReader from './screens/BarcodeReader';
import BarcodeInput from './screens/BarcodeInput';
import SaleOrder from './screens/SaleOrder'
import InventoryTransfer from './screens/InventoryTransfer';
import InventoryExpire from './screens/InventoryExpire';
import SideMenu from './screens/SideMenu';
import QueryArticles from './screens/QueryArticles';
import ProductsPickup from './screens/ProductsPickup';
import PlaceSign from './screens/PlaceSign';
import ArticleSetup from './screens/ArticleSetup';
import TransferOrder from './screens/TransferOrder';
import store from './store/store';
import { actionSetCurrentScreen } from './store/actions/actions.creators';
import { Provider } from 'react-redux';
import AddProduct from './screens/AddProduct';
import {navigationHelpers} from './helpers'

axios.defaults.baseURL="http://207.249.158.84:91/jderest/";
axios.defaults.headers.post['Content-Type'] = 'application/json;charset=UTF-8';
axios.defaults.timeout = 4 * 60 * 1000;

Navigation.registerComponent("Auth", () => (props) => (
  <Provider store={store}>
    <Auth  {...props} />
  </Provider>
));
Navigation.registerComponent("CyclicCountList", () => (props) => (
  <Provider store={store}>
    <CountList  {...props} />
  </Provider>
));
Navigation.registerComponent("EnterCycleCount", () => (props) => (
  <Provider store={store}>
    <EnterCycleCount  {...props} />
  </Provider>
));

Navigation.registerComponent("BarcodeReader", () => (props) => (
  <Provider store={store}>
    <BarcodeReader  {...props} />
  </Provider>
));

Navigation.registerComponent("BarcodeInput", () => (props) => (
  <Provider store={store}>
    <BarcodeInput  {...props} />
  </Provider>
));

Navigation.registerComponent("SideMenu", () => (props) => (
  <Provider store={store}>
    <SideMenu  {...props} />
  </Provider>
));

Navigation.registerComponent("QueryArticles", () => (props) => (
  <Provider store={store}>
    <QueryArticles  {...props} />
  </Provider>
));

Navigation.registerComponent("ArticleSetup", () => (props) => (
  <Provider store={store}>
    <ArticleSetup  {...props} />
  </Provider>
));



Navigation.registerComponent("PlaceSign", () => (props) => (
  <Provider store={store}>
    <PlaceSign  {...props} />
  </Provider>
));

Navigation.registerComponent("ProductsPickup", () => (props) => (
  <Provider store={store}>
    <ProductsPickup  {...props} />
  </Provider>
));
Navigation.registerComponent("InventoryTransfer", () => (props) => (
  <Provider store={store}>
    <InventoryTransfer  {...props} />
  </Provider>
));
Navigation.registerComponent("SaleOrder", () => (props) => (
  <Provider store={store}>
    <SaleOrder  {...props} />
  </Provider>
));

Navigation.registerComponent("InventoryExpire", () => (props) => (
  <Provider store={store}>
    <InventoryExpire  {...props} />
  </Provider>
));

Navigation.registerComponent("AddProduct", () => (props) => (
  <Provider store={store}>
    <AddProduct  {...props} />
  </Provider>
));

Navigation.registerComponent("TransferOrder", () => (props) => (
  <Provider store={store}>
    <TransferOrder  {...props} />
  </Provider>
));




// Subscribe
const screenEventListener = Navigation.events().registerComponentDidAppearListener(({ componentId, componentName, passProps }) => {
  
  if (componentId !== "SideMenu") {
    store.dispatch(actionSetCurrentScreen(componentId))
  }
});

Navigation.events().registerAppLaunchedListener(() => {
  navigationHelpers.callLogin();
 
});




