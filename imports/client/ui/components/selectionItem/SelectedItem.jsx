import React from 'react'
import PropTypes from 'prop-types'
import { CardCompat as Card, CardTitleCompat as CardTitle, CardTextCompat as CardText, IconButtonCompat as IconButton } from '/imports/startup/client/muiCompat'
import ClearIcon from '@mui/icons-material/Clear'

import ReactMarkdown from 'react-markdown'
import gfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import 'github-markdown-css'
import './SelectedItem.css'

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
      className="selected-item-card"
      style={{
        borderBottomRightRadius:"16px",
        borderTopRightRadius:"6px",
        borderBottomLeftRadius:"6px",
        boxShadow: '0 8px 18px rgba(0,0,0,0.35)',
        border: '1px solid rgba(0,0,0,0.5)',
        backgroundColor: 'rgba(69,90,100,0.95)',
        color: '#F2EFE9'
      }}
      >
      <CardTitle


        style={{fontSize: "11pt", fontWeight: 'bold', color: '#F2EFE9' }}
        title={title}
        titleStyle={{
          lineHeight :'1.2em',
          fontSize:'0.8em',
          color: '#F2EFE9'
        }}
        subtitle={el.group}
        action={
          <IconButton onClick={() => onUnfocusElement(el)}>
            <ClearIcon sx={{ color: '#b999d6' }} />
          </IconButton>
        }
      />
    <CardText className="selected-item-notes" style={{fontSize: "10pt", color:'#F2EFE9'}}>
        {/* {
          el.group === 'nodes' ?
            <p>lat/lng : {`${lat}/${lng}`}</p>
            :
            <p>lat/lng : {`${lat}/${lng}`}</p>
        } */}
        {el.data.notes ? (
          <div className="markdown-body">
            <ReactMarkdown
              remarkPlugins={[gfm]}
              rehypePlugins={[rehypeRaw]}
              components={{
                a: ({node, ...props}) => (
                  <a
                    {...props}
                    className="selected-item-link"
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                ),
                p: ({node, ...props}) => (
                  <p {...props} className="selected-item-paragraph" />
                )
              }}
            >
              {el.data.notes}
            </ReactMarkdown>
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
