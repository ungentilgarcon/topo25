import React from 'react'
import PropTypes from 'prop-types'
import ui from '/imports/client/legacyUi'

// import SelectField from 'material-ui/SelectField';

import Menu from '@mui/material/Menu'
import List from '@mui/material/List'
import { DividerCompat as Divider, SubheaderCompat as Subheader, MenuItemCompat as MenuItem } from '/imports/startup/client/muiCompat'

import LensIcon from '@mui/icons-material/Lens'
import { colors } from '/imports/client/helpers/colors.js'

@ui()
export default class NodeCategoriesMenu extends React.Component {

  static propTypes = {
    nodeCategories : PropTypes.array
  }

  handleSelectNodeCategory = (category) => {
    const selectedNodeCategories = [... this.props.ui.selectedNodeCategories]

    let i = selectedNodeCategories.indexOf(category)
    if (i > -1) selectedNodeCategories.splice(i, 1)
    else selectedNodeCategories.push(category)

    this.props.updateUI('selectedNodeCategories', selectedNodeCategories)
  }

  render() {

    const {nodeCategories} = this.props
    const {selectedNodeCategories} = this.props.ui

    const menuItems = nodeCategories.map((d,i) => (
      <MenuItem
        value={d}
        key={d}
        insetChildren={true}
        primaryText={d.charAt(0).toUpperCase() + d.slice(1)}
        onClick={() => this.handleSelectNodeCategory(d)}
        leftIcon={<LensIcon color={colors(d)}/>}
        style={
          !selectedNodeCategories.includes(d) ? { color : '#ccc'} : {}
        }
      />
    ))

    return (
      <List sx={{ maxWidth: '100%' }}>
        <Subheader>Categories</Subheader>
        {menuItems}
        <Divider />
      </List>
    )
  }
}
