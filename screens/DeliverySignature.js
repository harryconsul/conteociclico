import React from 'react';
import SignCanvas from '../components/SignCanvas';
import { uploadDeliveryComments, uploadDeliverySignature } from '../apicalls/signature.uploads'
import { Navigation } from 'react-native-navigation'
import { View, TextInput, Text, Button } from 'react-native';
import { connect } from 'react-redux';
import { componentstyles } from '../styles/';
class PlaceAgreement extends React.Component {
    state = {
        savingComments: true,
        comments: "",
        recibe: "",
    }
    close = (response) => {
        this.props.closeAfterSign(true);
        Navigation.dismissModal(this.props.componentId);

    }
    saveComments = () => {
        uploadDeliveryComments(this.props.user.token, this.props.itemKey, this.state.comments, this.state.recibe, (response) => {
            this.setState({ savingComments: false });
        });
    }
    onSaveSignature = (filepath) => {
        uploadDeliverySignature(this.props.itemKey, filepath, this.props.user.token, "rececibido",
            (response) => {
                this.close();
            })
    }
    componentDidMount() {
        Navigation.mergeOptions(this.props.componentId, {
            topBar: {
                title: {
                    text: this.props.title
                },
                drawBehind: true,
                background: {
                    color: '#8c30f1c7',
                    translucent: true,
                    blur: false
                },
                visible: true,
            },
        });
    }
    render() {
        return (
            <View style={componentstyles.containerView}>
                {
                    this.state.savingComments ? null: <Text>Firmar de Recibido</Text>
                }
                {
                    this.state.savingComments
                        ?
                        <View>
                            <Text>¿Quién Recibe?</Text>
                            <TextInput style={{ borderColor: "#000", borderStyle: "solid", borderWidth: 1 }}
                                value={this.state.recibe}
                                onChangeText={(recibe) => this.setState({ recibe })}
                            />
                            <Text>Ingrese sus comentarios</Text>
                            <TextInput style={{ borderColor: "#000", borderStyle: "solid", borderWidth: 1 }}
                                value={this.state.comments}
                                multiline={true}
                                numberOfLines={4}
                                onChangeText={(comments) => this.setState({ comments })} />
                            <Button title="Guardar Comentarios" onPress={this.saveComments} />
                        </View>
                        : <SignCanvas itemKey={this.props.itemKey}
                            fileName={this.props.fileName}
                            close={this.close}
                            onSave={this.onSaveSignature}
                            token={this.props.user.token}
                            signatureType={this.props.signatureType}
                            realm={this.props.realm}
                        />

                }

            </View>
        )
    }
}
const mapStateToProps = (state) => {
    return {
        user: state.user,
        realm: state.countRealm,
    }

}

export default connect(mapStateToProps)(PlaceAgreement);