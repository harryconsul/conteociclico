import React from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { RNCamera } from 'react-native-camera';
import { ArticleCard } from '../components'
import { connect } from 'react-redux';
import { Navigation } from 'react-native-navigation';
import { actionSetArticle } from '../store/actions/actions.creators';
import { transactionModes } from '../constants'
import ArticleScanMode from '../components/ArticleScanMode';
import closeIcon from '../assets/iconclose.png';
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
  constructor(props) {
    super(props);
    Navigation.events().bindComponent(this);
    this.state = {
      editingItem: null,
      isEditing: false,
      qty: 0,
      confirmMode: false,
    }
  }
  close=()=>{
    Navigation.dismissModal(this.props.componentId);
  }
  navigationButtonPressed = ({ buttonId }) => {
    switch(buttonId){
           case 'close':
               this.close();
               break;              
           default:
                this.close();
    } 
}
  handleAccept = () => {
    const { editingItem, qty } = this.state;
    const item = { ...editingItem, qty };




    this.props.dispatch(actionSetArticle(item));

    this.setState(
      {
        editingItem: null,
        isEditing: false,
        qty: 0,

      }
    )
  }
  componentDidMount = () => {
    Navigation.mergeOptions(this.props.componentId, {
      topBar: {
        title: {
          text: 'Lectura de Codigo de Barras'
        },
        drawBehind: true,
        background: {
          color: '#8c30f1c7',
          translucent: true,
          blur: false
        },
        visible: true,
        rightButtons:[
          {
              id:'close',
              icon:closeIcon,
          }
      ]
      },
    });
  }
  barCodeHandler = event => {
    //Get the item
    if (this.props.transactionMode === transactionModes.READ_RETURN) {
      const item = {
        key: "search",
        value: event.data,
      }
      this.props.dispatch(actionSetArticle(item));
      Navigation.dismissModal(this.props.componentId);

    } else {//busqueda del elemento en la lista
      const item = this.props.list.get(event.data);

      if (item) {

        const editingItem = { ...item };



        if (!editingItem.qty) {
          editingItem.qty = 0;
        }
        if (this.props.transactionMode === transactionModes.READ_ADD) {
          editingItem.qty++;
        } else {
          if (editingItem.qty) {
            editingItem.qty--;
          }
        }



        this.setState({
          editingItem,
          qty: editingItem.qty,
          isEditing: true,
        }, () => {
          if (!this.state.confirmMode) {
            setTimeout(this.handleAccept,1000);
            
          }
        });


      } else {
        this.setState({ isEditing: true });
        Alert.alert("No encontrado ", "No hemos podido encontrar " + event.data,
          [{
            text: "Continuar",
            onPress: () => this.setState({ isEditing: false }),
          }]);
      }
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
            const { qty, confirmMode } = this.state;
            if (status !== 'READY') return <PendingView />;
            return (
              <View style={{ height: "100%", flexDirection: 'row', flexWrap: "wrap", justifyContent: 'center', alignItems: 'center' }}>
                <View style={{ backgroundColor: "#0e0000e3", marginBottom: "30%", marginTop: 60, flexBasis: "80%", height: 50, padding: 20 }}>
                  <ArticleScanMode confirmMode={confirmMode} changeMode={(confirmMode) => this.setState({ confirmMode })} />
                </View>
                {item ? <View style={{ height: "80%", flexBasis: "80%" }}>
                  <ArticleCard handleAccept={this.handleAccept}
                    item={item} qty={qty}
                    setQty={(qty) => this.setState({ qty })} />
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
    flexBasis: "80%",



  }
})
export default connect(mapStateToProps)(BarcodeReader);
