import React from 'react'
import PropTypes from 'prop-types'

import { MenuItemCompat as MenuItem } from '/imports/startup/client/muiCompat'
import { topogramTogglePublic } from '../../../../api/topograms/topogramsMethods.js'
import PublicIcon from '@mui/icons-material/Public'
import CheckIcon from '@mui/icons-material/Check'


export default class TopogramTogglePublic extends React.Component {

  static propTypes = {
    topogramId : PropTypes.string.isRequired,
    topogramSharedPublic : PropTypes.bool.isRequired
  }

  handleOnClick = () =>
    topogramTogglePublic.call({
      topogramId : this.props.topogramId
    })

  render() {
    return (
      <MenuItem
        rightIcon={
          this.props.topogramSharedPublic ? <CheckIcon /> : null
        }
        style={
          this.props.topogramSharedPublic
            ? { backgroundColor: 'rgba(69,90,100,0.9)', color: '#BDBDBD' }
            : { backgroundColor: 'rgba(69,90,100,0.9)', color: '#F2EFE9' }
        }
        primaryText={this.props.topogramSharedPublic ? 'Is Visible Online' : 'Share Publicly'}
        onClick={this.handleOnClick}
  leftIcon={<PublicIcon />}
      />
    )
  }
}
