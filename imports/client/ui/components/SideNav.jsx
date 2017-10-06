import React, { PropTypes } from 'react'
import ui from 'redux-ui'

import { Card, CardTitle } from 'material-ui/Card'
import MenuItem from 'material-ui/MenuItem'

// import QueryBox from './queryBox/QueryBox.jsx'
import NetworkOptions from './networkOptions/NetworkOptions.jsx'
import GeoMapOptions from './geoMapOptions/GeoMapOptions.jsx'
import NodeCategoriesMenu from './filters/NodeCategoriesMenu.jsx'
import QueryBox from './queryBox/QueryBox.jsx'

import Settings from './settings/Settings.jsx'

@ui()
class SideNav extends React.Component {


  static propTypes = {
    nodes : PropTypes.array,
    edges : PropTypes.array,
    authorIsLoggedIn : PropTypes.bool,
    userId : PropTypes.string,
    topogramId : PropTypes.string,
    topogramTitle : PropTypes.string,
    topogramIsPublic : PropTypes.bool,
    router : PropTypes.object
  }

  constructor(props) {
    super(props)
    this.state = { open: false }
  }

  handleToggleSelectionMode = () => {
    this.props.updateUI('selectionModeOn', !this.props.ui.selectionModeOn)
  }

  handleExpandChange = () => {
    const { open } = this.state
    this.setState({ open : !open })
  }

  render() {
    const {
      nodes,
      edges,
      authorIsLoggedIn,
      nodeCategories,
      topogramId,
      topogramTitle,
      topogramIsPublic
    } = this.props

    const {
      selectionModeOn,
      geoMapVisible
    } = this.props.ui

    const settings =
      authorIsLoggedIn ?
        (
          <Settings
          topogramId={topogramId}
          topogramTitle= {topogramTitle}
          topogramSharedPublic={topogramIsPublic}
          router={this.props.router}
          />
        )
        :
        null


    console.log(nodeCategories);
    return (
      <Card
        style={{ maxWidth : '30%', minWidth : '25%', float : 'left' }}
        onExpandChange={this.handleExpandChange}
      >
        <CardTitle
          showExpandableButton={true}
          title={this.props.topogramTitle}
          titleStyle={{ fontSize : '14pt', lineHeight : '1em' }}
          subtitle={`${nodes.length} nodes, ${edges.length} edges`}
        />

        { this.state.open ?
          <span>
            { geoMapVisible ? <GeoMapOptions/> : null }
            <NetworkOptions/>
            { !!nodeCategories.length ?
              <NodeCategoriesMenu
              nodeCategories={nodeCategories}
              />
              :
              null
            }
            <MenuItem>
              <QueryBox
                nodes={nodes}
                />
            </MenuItem>
            <MenuItem
              primaryText="Selection Mode"
              onClick={this.handleToggleSelectionMode}
              checked={selectionModeOn}
            />
            {settings}
          </span>
          :
          null
        }

      </Card>
    )
  }
}

export default SideNav
