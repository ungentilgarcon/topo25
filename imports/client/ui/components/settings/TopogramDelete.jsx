import React from 'react'
import PropTypes from 'prop-types'

import { MenuItemCompat as MenuItem, DialogCompat as Dialog } from '/imports/startup/client/muiCompat'
import Button from '@mui/material/Button'
import Delete from '@mui/icons-material/Delete'
import { defineMessages, FormattedMessage, useIntl } from 'react-intl'
import { red } from '@mui/material/colors'

import { topogramDelete } from '../../../../api/topograms/topogramsMethods.js'

const messages = defineMessages({
  confirmQuestion : {
    'id': 'topogram.index.card.deleteDialog.confirmQuestion',
    'defaultMessage': 'Are you sure you want to delete this topogram ?',
    'message': ''
  },
  cancel : {
    'id': 'topogram.deleteDialog.button.cancel',
    'defaultMessage': 'Cancel',
    'message': ''
  },
  delete : {
    'id': 'topogram.deleteDialog.button.delete',
    'defaultMessage': 'Delete',
    'message': ''
  }
})

function TopogramDelete({ topogramTitle = '', topogramId = '', router }) {
  const intl = useIntl()
  const { formatMessage } = intl
  const [open, setOpen] = React.useState(false)

  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)
  const deleteItem = () => {
    topogramDelete.call({ topogramId })
    router.push('/')
  }

  const actions = [
    <Button key="cancel" variant="text" onClick={handleClose}>{formatMessage(messages.cancel)}</Button>,
    <Button key="delete" variant="contained" onClick={deleteItem} sx={{ bgcolor: 'rgba(69,90,100 ,0.9)', color: '#F2EFE9', '&:hover': { bgcolor: 'rgba(55,71,79,0.9)' }}}>
      {formatMessage(messages.delete)}
    </Button>,
  ]

  return (
    <div>
      <MenuItem
        style={{backgroundColor: 'rgba(69,90,100 ,0.9)', color:'#F2EFE9',}}
        primaryText={formatMessage(messages.delete)}
        onClick={handleOpen}
        leftIcon={<Delete sx={{ color: red[500] }} />}
      />
      <Dialog
        title={topogramTitle}
        actions={actions}
        modal={false}
        open={open}
        onRequestClose={handleClose}
      >
        <FormattedMessage {...messages.confirmQuestion} />
      </Dialog>
    </div>
  )
}

TopogramDelete.propTypes = {
  topogramTitle: PropTypes.string,
  topogramId: PropTypes.string.isRequired,
  router: PropTypes.object.isRequired,
}

export default TopogramDelete
