import React from 'react'
import PropTypes from 'prop-types'
import { SubheaderCompat as Subheader } from '/imports/startup/client/muiCompat'

import PanelSelector from '../panelSelector/PanelSelector.jsx'

import NetworkOptions from '../networkOptions/NetworkOptions.jsx'
import GeoMapOptions from '../geoMapOptions/GeoMapOptions.jsx'
import Settings from '../settings/Settings.jsx'
import GraphicalTweaks from '../settings/GraphicalTweaks.jsx'
const PanelSettings = ({
  geoMapVisible,
  chartsVisible,

  authorIsLoggedIn,
  topogramId,
  topogramTitle,
  topogramIsPublic,
  hasTimeInfo,
  hasGeoInfo,
  hasCharts,
  router
}) => (
  <span>
    <Subheader
      style={{
        backgroundColor: 'transparent',
        color: '#F2EFE9',
        fontWeight: 600,
        letterSpacing: '0.3px'
      }}
    >
      Settings
    </Subheader>

    <PanelSelector

      hasTimeInfo={ hasTimeInfo }
      hasGeoInfo={ hasGeoInfo }
      hasCharts={ hasCharts }
    />

  { geoMapVisible ? <GeoMapOptions/> : null }
    { chartsVisible ? <ChartsOptions/> : null }
  <NetworkOptions />

    {
      authorIsLoggedIn ?
      <Settings
        topogramId={topogramId}
        topogramTitle= {topogramTitle}
        topogramSharedPublic={topogramIsPublic}
        router={router}
      />
      :
      null
    }
    {
      <GraphicalTweaks />
    }
  </span>
)

export default PanelSettings
