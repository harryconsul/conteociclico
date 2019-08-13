/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import  axios from 'axios';

axios.defaults.baseURL="http://207.249.158.84:91/jderest/";
axios.defaults.headers.post['Content-Type'] = 'application/json';

AppRegistry.registerComponent(appName, () => App);
