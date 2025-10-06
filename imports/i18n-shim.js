// Temporary English-only i18n shim to unblock major upgrade without react-intl
// Provides a minimal subset: IntlProvider (no-op), defineMessages (identity),
// injectIntl HOC (provides formatMessage), and a useIntl-like helper.

import React from 'react'

export const defineMessages = (defs) => defs

export const IntlProvider = ({ children }) => React.createElement(React.Fragment, null, children)

export const useIntl = () => ({
  formatMessage: ({ id, defaultMessage, message }, values) => {
    const base = (message || defaultMessage || id || '').toString()
    if (!values) return base
    return Object.keys(values).reduce((acc, k) => acc.replace(new RegExp(`{${k}}`, 'g'), String(values[k])), base)
  }
})

export const injectIntl = (Component) => {
  return function WithIntl(props) {
    const intl = useIntl()
    return <Component {...props} intl={intl} />
  }
}

export default { IntlProvider, defineMessages, injectIntl, useIntl }
