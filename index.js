/**
 * @format
 */

import {AppRegistry} from 'react-native';
import {enableScreens} from 'react-native-screens';
import App from './App';
import {name as appName} from './app.json';

// Required by @react-navigation/native-stack for native screen transitions.
enableScreens();

AppRegistry.registerComponent(appName, () => App);
