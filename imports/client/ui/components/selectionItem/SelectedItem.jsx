import React from 'react'
import PropTypes from 'prop-types'
import { CardCompat as Card, CardTitleCompat as CardTitle, CardTextCompat as CardText, IconButtonCompat as IconButton } from '/imports/startup/client/muiCompat'
import ClearIcon from '@mui/icons-material/Clear'

import ReactMarkdown from 'react-markdown'
import gfm from 'remark-gfm'
import 'github-markdown-css'

const SelectedItem = ({
  el,
  cy,
  onUnfocusElement
}) => {

  const source= cy.filter(`node[id="${el.data.source}"]`),
    target=cy.filter(`node[id="${el.data.target}"]`)

  const title = el.group === 'nodes' ?
    el.data.name
    :
    `${source.data('name')} -> ${target.data('name')}`

  return (
    <Card
      style={{
        //bottom: 5,

        borderBottomRightRadius:"20px",
        borderTopRightRadius:"5px",
        borderBottomLeftRadius:"5px",
        boxShadow: '1px 1px 8px  #000',
        border: '1px solid #222',
        backgroundColor: el.data.color? el.data.color : 'rgb(69,90,100)',
        opacity: "0.7"

      }}
      >
      <CardTitle


        style={{fontSize: "11pt", fontWeight: 'bold' }}
        title={title}
        titleStyle={{
          lineHeight :'1.2em',
          fontSize:'0.8em'
        }}
        subtitle={el.group}
        action={
          <IconButton onClick={() => onUnfocusElement(el)}>
            <ClearIcon />
          </IconButton>
        }
      />
    <CardText style={{fontSize: "9pt",color:"white"}}>
        {/* {
          el.group === 'nodes' ?
            <p>lat/lng : {`${lat}/${lng}`}</p>
            :
            <p>lat/lng : {`${lat}/${lng}`}</p>
        } */}
        {el.data.notes ? (
          <div className="markdown-body">
            <ReactMarkdown remarkPlugins={[gfm]}>{el.data.notes}</ReactMarkdown>
          </div>
        ) : null}
      </CardText>
    </Card>
  )
}

SelectedItem.propTypes = {
  el : PropTypes.object.isRequired,
  cy : PropTypes.object.isRequired,
  onUnfocusElement : PropTypes.func.isRequired
}

export default SelectedItem
