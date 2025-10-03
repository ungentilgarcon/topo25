import React from 'react'
import PropTypes from 'prop-types'
//import { topogramTogglePublic } from '../../../../api/topograms/topogramsMethods.js'
//import WorldIcon from '@mui/icons-material/Public'
import CheckIcon from '@mui/icons-material/Check'
import { MenuItemCompat as MenuItem, SubheaderCompat as Subheader, CheckboxCompat as Checkbox } from '/imports/startup/client/muiCompat'
// Importing compat wrappers for fast migration
import { TextFieldCompat as TextField } from '/imports/startup/client/muiCompat'
import ui from '/imports/client/legacyUi'


@ui()

export default class GraphicalTweaks extends React.Component {

  constructor(props) {
   super(props)

this.state = {
  fontSizeNetwork : 11,
  //SaveNodeMovesToDB : false

}
}




  handleChangefontSizeNetwork = (e) => {
    const fontSizeNetwork = e.target.value
    // console.log(fontSizeNetwork);
    // console.log(e.target.value);
    this.setState({ fontSizeNetwork })
//console.log(this.state)
//console.log(this.props)

    this.props.updateUI({fontSizeNetwork :  this.state.fontSizeNetwork })

    const {cy} = this.props.ui


    cy.nodes().style({'font-size': this.props.ui.fontSizeNetwork})

    //this.props.ui.fontSizeNetwork=this.state.fontSizeNetwork

  }
  toggleChangeSaveNodeMovesToDB () {

 //console.log(this.props.ui.SaveNodeMovesToDB);
 //this.setState({ SaveNodeMovesToDB })
 this.props.updateUI( 'SaveNodeMovesToDB', !this.props.ui.SaveNodeMovesToDB)
  }






  render() {
    const {fontSizeNetwork}=this.props.ui

    return (
      <div style={{ backgroundColor: 'rgba(69,90,100,0.9)', color: '#F2EFE9', padding: '8px 12px', borderRadius: 4 }}>
      <Subheader style={{ backgroundColor: 'transparent', color: '#F2EFE9', fontWeight: 600 }}>
        Font Size and DB Settings
      </Subheader>
        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '8px 6px' }}>
          <tbody>
            <tr>
        <td>
      <TextField
      style={{ backgroundColor: 'transparent', color:'#F2EFE9', width : '4.5em', margin: '0 1em' }}
        name='CytoscapeJsFontSizeSetter'
        type='number'
        className=''
        min={0.1}
        max={1000}
        step={.5}
        autoComplete={'on'}
        floatingLabelFixed={true}
        floatingLabelText='Network font size'

        value={this.state.fontSizeNetwork}

        onChange={ this.handleChangefontSizeNetwork}
          />
      </td>

      <td>
        <Checkbox
          label={'Save\nGraph\nNodes\nMove\nToDB'}
          style={{ backgroundColor: 'transparent', color:'#F2EFE9' }}
          checked={this.props.ui.SaveNodeMovesToDB}
          //disabled={!SaveNodeMovesToDB}
          onClick={ () => this.toggleChangeSaveNodeMovesToDB()}
          />

      </td>
      </tr>
      </tbody>
</table>


      </div>
    )
  }
}
