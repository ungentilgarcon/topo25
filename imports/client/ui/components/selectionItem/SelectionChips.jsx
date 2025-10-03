import React from 'react'
import PropTypes from 'prop-types'

import { CardTextCompat as CardText, ChipCompat as Chip, MenuItemCompat as MenuItem } from '/imports/startup/client/muiCompat'

import { colors } from '/imports/client/helpers/colors.js'
import { textEllipsis } from '/imports/client/helpers/ellipsis.js'

import SelectedItem from '../selectionItem/SelectedItem.jsx'

const styles = {
  chip: {
    margin: 2,
    fontSize: "12px",
    //maxWidth:"10%",
   opacity: "0.9",
   textOpacity : 1
  },
  wrapper: {
    display: 'flex',
    flexWrap: 'wrap',
  },
};

const SelectionChips = ({
  cy,
  selectedElements,
  unselectElement,
  onFocusElement
}) => (
  <CardText style={styles.wrapper}>
    {
      selectedElements.map( (el,i) =>(
        <Chip
          key={`selected-item-${i}`}
          onRequestDelete={() => unselectElement(el)}


          backgroundColor={
            el.data.color ?
            //el.group === "nodes" ?
              //
              el.data.color
            :
              null
          }
          onClick={() => onFocusElement(el)}
          style={styles.chip}
          className="SelectionChips"
          >
            {
              el.group === "nodes" ?
                textEllipsis(el.data.name, 20)
              :
                textEllipsis(cy.filter(`node[id="${el.data.source}"]`).data('name'), 10) + '->' + textEllipsis(cy.filter(`node[id="${el.data.target}"]`).data('name'), 10)

            }
        </Chip>
      ))
    }
  </CardText>
)

export default SelectionChips
