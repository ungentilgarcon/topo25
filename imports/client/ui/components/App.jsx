import React from 'react'
import PropTypes from 'prop-types'

import '/imports/css/topogram.css'

import { IntlProvider } from '../../../i18n-shim.js'
import { messages as i18nMessages } from '../../../i18n.js'

import MuiV5Provider from '/imports/startup/client/MuiV5Provider.jsx'

// react-tap-event-plugin removed; use standard onClick handlers instead

// import UserMenu from '../components/UserMenu.jsx'

// Legacy MUI v0 theme provider removed; using MUI v5 provider only


export class App extends React.Component {

  componentDidMount = () => {
    this.props.loadUser() // load current user
  }

  render = () => {
    const {
     children,
     classNames,
     user,
     router
   } = this.props
    const locale = this.props.locale || 'en'
    const intlMessages = this.props.messages || i18nMessages['en']
    return (
      <IntlProvider locale={locale}
        messages={intlMessages}>
        <MuiV5Provider>
            <div className={ classNames }>
              {React.cloneElement(children, {user, router})}
            </div>
        </MuiV5Provider>
      </IntlProvider>
    )
  }
}

App.propTypes = {
  children : PropTypes.node,
  classNames : PropTypes.string,
  locale : PropTypes.string,
  messages : PropTypes.object,
  user : PropTypes.object,
  router : PropTypes.object,
  loadUser : PropTypes.func
}

// default props removed; AppV6 supplies locale/messages; provide fallbacks in AppV6

export default App
