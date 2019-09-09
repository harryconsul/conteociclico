import React from 'react';
import { View, Picker,Text } from 'react-native';
import { searchContracts } from '../apicalls/client.operations';
import {componentstyles} from '../styles'
const ContractPicker = ({ contract, setContract, token, clientNumber }) => {

    const [contracts, setContracts] = React.useState([]);
    React.useEffect(() => {
        if (clientNumber.length > 2) {
            searchContracts(clientNumber, token, (data) => {
                const rawRows = data.fs_P5942CSC_W5942CSCA.data.gridData.rowset;
                if (rawRows.length) {
                    // setClientAlias(rawRows[0].sAlphaName_8.value);
                    setContracts(rawRows.map(row=>({
                        value:row.sNoContrato_25.value,
                        label: row.sNoContrato_25.value +  " - " + row.sDescription1_71.value,
                    })))
                }
            })
        }
    }, [clientNumber])
    return (
        <View>
            <Text style={componentstyles.label} >Contrato</Text>
            <Picker
                selectedValue={contract}
                onValueChange={(itemValue) => setContract(itemValue)}
                style={componentstyles.textbox}
            >
                {
                    contracts.map(
                        item => <Picker.Item key={item.value}  {...item} />
                    )
                }
            </Picker>
        </View>
    )

}
export default ContractPicker;