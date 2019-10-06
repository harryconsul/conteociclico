import {Navigation} from 'react-native-navigation';

export const callLogin=()=>{
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
}