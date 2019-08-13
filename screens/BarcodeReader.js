import React from 'react';
import { View, Text, Button, FlatList, StyleSheet, Alert, TouchableOpacity, TextInput } from 'react-native';
import { RNCamera } from 'react-native-camera';
import { ItemView, ItemHightLight, ItemLabel } from '../components'
import { connect } from 'react-redux';
import {actionSetArticlesArray,actionSetArticlesMap} from '../store/actions/actions.creators';

const PendingView = () => (
  <View
    style={{
      flex: 1,
      backgroundColor: 'lightgreen',
      justifyContent: 'center',
      alignItems: 'center',
    }}
  >
    <Text>Inicializando</Text>
  </View>
);

class BarcodeReader extends React.Component {
  state = {
    editingItem: null,
    isEditing: false,
    qty: 0,   
  }
  handleAcept=()=>{
    const {editingItem,qty} = this.state;
    editingItem.qty = qty;
   

    const array = [...this.props.list];
    if(editingItem.indexOfItem){
      array[editingItem.indexOfItem]=editingItem;
    }else{
      editingItem.indexOfItem=array.length-1;
      array.push(editingItem);
    }
    this.props.dispatch(actionSetArticlesArray(array));
    
    const map = {...this.props.listMap};
    map[editingItem.key] = editingItem;
    this.props.dispatch(actionSetArticlesMap(map));

    this.setState(
      {
        editingItem: null,
        isEditing: false,
        qty: 0,       
        
      }
    )
  }
  barCodeHandler = event => {
    const item = this.props.listMap[event.data];

    if (item) {
      
      const editingItem={...item};
      const indexOfItem=editingItem.indexOfItem;
      
      if (indexOfItem) {
        editingItem.qty++;
       

      } else {
       
        editingItem.qty = 1;
        
        editingItem.key = item.serial;     
       
       

      }
      this.setState({ 
        editingItem, 
        qty: editingItem.qty ,        
        isEditing:true,
      });
      //this.setState({ articles, mapIndex });

    } else {
      this.setState({ isEditing: true });
      Alert.alert("No encontrado ", "No hemos podido encontrar " + event.data,
        [{
          text: "Continuar",
          onPress: () => this.setState({ isEditing: false }),
        }]);
    }


  }
  render() {
    return (
      <View style={{ height: "100%", flex: 1, flexDirection: 'column', backgroundColor: 'black' }} >
        <RNCamera captureAudio={false}
          type={RNCamera.Constants.Type.back}
          onBarCodeRead={this.state.isEditing ? null : this.barCodeHandler}
          flashMode={RNCamera.Constants.FlashMode.off}
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center'
          }
          }
          androidCameraPermissionOptions={{
            title: 'Permiso para usar tu camara',
            message: 'Necesitamos tu permiso para usar la camara de tu dispositivo,aceptas?',
            buttonPositive: 'Si',
            buttonNegative: 'No',
          }}

        >
          {({ camera, status, recordAudioPermissionStatus }) => {
            const item = this.state.editingItem;
            const qty = this.state.qty;
            if (status !== 'READY') return <PendingView />;
            return (
              <View style={{ height:"100%", flexDirection: 'row', justifyContent: 'center' ,alignItems:'center'}}>
                {item ? <View style={{height:"80%"}}><ItemView index={0}>
                  <View style={{ flex: 1, justifyContent: "space-between" }}>
                    <ItemLabel text={item.serial} />
                    <ItemLabel text={item.location} />
                    <ItemLabel text={"Unidad de Medida: " + item.um} />
                  </View>
                  <ItemHightLight text={item.description} />
                  <View style={{ flex: 1, justifyContent: "space-between" }}>
                    <TextInput value={String(qty)} onChangeText={(text) => this.setState({ qty: text })} />
                  </View>
                  <TouchableOpacity onPress={this.handleAcept} >
                    <Text style={{ fontSize: 14 }}> Aceptar </Text>
                  </TouchableOpacity>
                </ItemView>
                  
                </View>
                  :
                  <View style={styles.barcodeGuide}></View>
                }
              </View>
            );
          }}
        </RNCamera>
      </View>
    )
  }
}
const mapStateToProps = state => {
  return {
    listMap: state.articlesMap,
    list: state.articlesArray,
  };
}
const styles = StyleSheet.create({
  barcodeGuide:{
    alignSelf:"center",
    borderStyle:"solid",
    borderColor:"#ffffff",
    borderWidth:1,
    height:"30%",
    width:"70%",
    
    
   
  }
})
export default connect(mapStateToProps)(BarcodeReader);
