import React from 'react'

import { CardTextCompat as CardText } from '/imports/startup/client/muiCompat'

import NodeCategoriesMenu from '../filters/NodeCategoriesMenu.jsx'
import QueryBox from '../queryBox/QueryBox.jsx'

const PanelFilters = ({
  nodes,
  nodeCategories,
  selectElement
}) => (
  <CardText
  style={{backgroundColor: 'rgba(69,90,100 ,0.9)',
  color:'#F2EFE9',}}>
    <QueryBox
      nodes={nodes}
      selectElement={selectElement}
      />
    {
      !!nodeCategories.length ?
        <NodeCategoriesMenu
          nodeCategories={nodeCategories}
          />
        :
        null
    }
  </CardText>
)

export default PanelFilters
