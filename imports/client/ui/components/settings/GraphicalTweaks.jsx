import React from 'react'
import PropTypes from 'prop-types'
//import { topogramTogglePublic } from '../../../../api/topograms/topogramsMethods.js'
//import WorldIcon from '@mui/icons-material/Public'
import CheckIcon from '@mui/icons-material/Check'
import { MenuItemCompat as MenuItem, SubheaderCompat as Subheader, CheckboxCompat as Checkbox } from '/imports/startup/client/muiCompat'
// Importing compat wrappers for fast migration
import { TextFieldCompat as TextField } from '/imports/startup/client/muiCompat'
import ui from 'redux-ui'


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
      <div style={{backgroundColor: '#D4E6CC!important', color:'rgb(242, 239, 233)'}}>
      <Subheader style={{backgroundColor: '#D4E6CC!important', color:'rgb(242, 239, 233)'}}>
      Font Size and DB Settings
        </Subheader>
        <table>
          <tbody>
            <tr>
        <td>
      <TextField
      style={{backgroundColor: '#D4E6CC!important', color:'rgb(242, 239, 233)',width : '3em', margin: '0 2em'}}
        name='CytoscapeJsFontSizeSetter'
        type='number'
        className=''
        min={0.1}
        max={1000}
        step={.5}
        autoComplete={'on'}
        floatingLabelFixed={true}
        floatingLabelText='Network'

        value={this.state.fontSizeNetwork}

        onChange={ this.handleChangefontSizeNetwork}
          />
      </td>

      <td>
        <Checkbox
          label={'Save\nGraph\nNodes\nMove\nToDB'}
style={{backgroundColor: '#D4E6CC!important', color:'rgb(242, 239, 233)'}}
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
