import React from 'react';
import { View, Text, Button, FlatList, StyleSheet, Alert, TouchableOpacity, TextInput } from 'react-native';
import { RNCamera } from 'react-native-camera';
import { ItemView, ItemHightLight, ItemLabel } from '../components'
import { connect } from 'react-redux';
import { Navigation } from 'react-native-navigation';
import { actionSetArticle } from '../store/actions/actions.creators';
import { transactionModes } from '../constants'
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
  handleAccept = () => {
    const { editingItem, qty } = this.state;
    const item = { ...editingItem.qty, qty };




    this.props.dispatch(actionSetArticle(item));

    this.setState(
      {
        editingItem: null,
        isEditing: false,
        qty: 0,

      }
    )
  }
  barCodeHandler = event => {
    //Get the item
    const item = this.props.list[event.data];

    if (item) {

      const editingItem = { ...item };

      if (this.props.transactionMode === transactionModes.READ_RETURN) {
          this.props.dispatch(actionSetArticle(editingItem));
          Navigation.pop(this.props.componentId);
      } else { // en los demas modos debo mostrar algo
        if (!editingItem.qty) {
          editingItem.qty = 0;
        }
        editingItem.qty += this.props.transactionMode === transactionModes.READ_ADD ? 1 : -1;

        this.setState({
          editingItem,
          qty: editingItem.qty,
          isEditing: true,
        });
      }

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
              <View style={{ height: "100%", flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                {item ? <View style={{ height: "80%" }}><ItemView index={0}>
                  <View style={{ flex: 1, justifyContent: "space-between" }}>
                    <ItemLabel text={item.serial} />
                    <ItemLabel text={item.location} />
                    <ItemLabel text={"Unidad de Medida: " + item.um} />
                  </View>
                  <ItemHightLight text={item.description} />
                  <View style={{ flex: 1, justifyContent: "space-between" }}>
                    <TextInput value={String(qty)} onChangeText={(text) => this.setState({ qty: text })} />
                  </View>
                  <TouchableOpacity onPress={this.handleAccept} >
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
    list: state.articles,
    transactionMode: state.transactionMode,
  };
}
const styles = StyleSheet.create({
  barcodeGuide: {
    alignSelf: "center",
    borderStyle: "solid",
    borderColor: "#ffffff",
    borderWidth: 1,
    height: "30%",
    width: "70%",



  }
})
export default connect(mapStateToProps)(BarcodeReader);
