import React from 'react'
import PropTypes from 'prop-types'
import { SubheaderCompat as Subheader } from '/imports/startup/client/muiCompat'

import TopogramTogglePublic from './TopogramTogglePublic.jsx'
import TopogramEditTitle from './TopogramEditTitle.jsx'
import TopogramDelete from './TopogramDelete.jsx'




const Settings = ({
  topogramTitle,
  topogramId,
  router,
  topogramSharedPublic
}) => (
  <span>
    <Subheader>Settings</Subheader>
    <TopogramTogglePublic
      topogramId={topogramId}
      topogramSharedPublic={topogramSharedPublic}
      key="ToggleTopogramPublicButton"
    />
    <TopogramEditTitle
      topogramTitle= {topogramTitle}
      topogramId={topogramId}
      key="EditTopogramTitle"
    />
    <TopogramDelete
      topogramTitle= {topogramTitle}
      topogramId={topogramId}
      router={router}
      key="DeleteTopogram"
    />

  </span>
)

Settings.propTypes = {
  topogramId: PropTypes.string.isRequired,
  topogramTitle: PropTypes.string.isRequired,
  topogramSharedPublic: PropTypes.bool.isRequired,
  router: PropTypes.object.isRequired
}

export default Settings
