/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */
import React from 'react';
import { Navigation } from 'react-native-navigation';
import Auth from './screens/Auth';
import CountList from './screens/CountList/CountList';
import EnterCycleCount from './screens/CountList/EnterCycleCount';
import BarcodeReader from './screens/BarcodeReader';
import BarcodeInput from './screens/BarcodeInput';
import SideMenu from './screens/SideMenu';
import QueryArticles from './screens/QueryArticles';
import ProductsPickup from './screens/ProductsPickup';
import PlaceSign from './screens/PlaceSign';
import store from './store/store';
import { actionSetCurrentScreen } from './store/actions/actions.creators';
import { Provider } from 'react-redux';


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


// Subscribe
const screenEventListener = Navigation.events().registerComponentDidAppearListener(({ componentId, componentName, passProps }) => {
  
  if (componentId !== "SideMenu") {
    store.dispatch(actionSetCurrentScreen(componentId))
  }
});

Navigation.events().registerAppLaunchedListener(() => {

  Navigation.setRoot({
    root: {
      stack: {

        children: [
          {
            component: {
              name: 'Auth',

            },


          }
        ],
        options: {
          topBar: {
            visible: false,
            height: 0,
          }
        }

      }
    }


  });
});
