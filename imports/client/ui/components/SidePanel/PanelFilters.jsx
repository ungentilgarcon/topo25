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
      labelMessageId="queryBox.label.venue"
      hintMessageId="queryBox.hint.venue"
      labelDefault="Venue search"
      hintDefault="Search for a venue"
      sx={{
        '& .MuiInputLabel-root': { color: '#F2EFE9' },
        '& .MuiInputLabel-root.Mui-focused': { color: '#F2EFE9' },
        '& .MuiInputBase-input': { color: '#F2EFE9' },
        '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(242,239,233,0.6)' },
        '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#b999d6' },
        '& .MuiSvgIcon-root': { color: '#aa8dc6' }
      }}
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
