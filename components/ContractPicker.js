import React from 'react';
import { View, Picker,Text , Button,StyleSheet} from 'react-native';
import { searchContracts } from '../apicalls/client.operations';
import {componentstyles} from '../styles';

class ContractPicker extends React.Component {
    
     state = {
         contracts:[],
         refreshByContracts:false,
     }

    runSearchContracts = ()=>  {

            searchContracts(this.props.clientNumber, this.props.token, (data) => {
                const rawRows = data.fs_P5942CSC_W5942CSCA.data.gridData.rowset;
               
                if (rawRows.length) {
                    // setClientAlias(rawRows[0].sAlphaName_8.value);
                     this.setState({contracts: rawRows.map(row=>({
                        value:row.sNoContrato_25.value,
                        label: row.sNoContrato_25.value +  " - " + row.sDescription1_71.value,
                    })),
                    refreshByContracts:true,
                        });
                }else {
                    this.setState({
                        contracts:[],
                        refreshByContracts:true,
                    })
                }
            })
        
    }

    shouldComponentUpdate(nextProps,nextState){
        
        if(this.props.contract !== nextProps.contract ||
            nextState.refreshByContracts===true    
        ) {
            return true;
        }

        return false;
    }

    componentDidUpdate(){
        this.setState({refreshByContracts:false});
    }

    render (){
        return (
            <View>
                <Text style={componentstyles.label} >Contrato</Text>
                <Picker
                    selectedValue={this.props.contract}
                    onValueChange={(itemValue) => this.props.setContract(itemValue)}
                    style={componentstyles.textbox}
                >
                    {
                        this.state.contracts.map(
                            item => <Picker.Item key={item.value}  {...item} />
                        )
                    }
                </Picker>
                <View style={styles.buttonSearch} > 
                    <Button title="Buscar Contratos" onPress={this.runSearchContracts} color="#ccb82e" />
                </View>
                
            </View>
        )
    }
    

}
const styles = StyleSheet.create({
   buttonSearch: {
        width: 200,

    }
})

export default ContractPicker;