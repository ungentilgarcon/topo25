import React from 'react'
import PropTypes from 'prop-types'
import ui from '/imports/client/legacyUi'
import { defineMessages, injectIntl } from '/imports/i18n-shim.js'
import { SubheaderCompat as SubHeader, TextFieldCompat as TextField, CheckboxCompat as Toggle } from '/imports/startup/client/muiCompat'
import MUIAutocomplete from '@mui/material/Autocomplete'
import Button from '@mui/material/Button'
import TopogramListItem from './TopogramListItem.jsx'
import './TopogramList.css'

const messages = defineMessages({
  hint: {
    id: 'queryBox.hint',
    defaultMessage: 'Search for a Map'
  },
  label: {
    id: 'queryBox.label',
    defaultMessage: 'Map search'
  }
})

class TopogramList extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      anonymousOnly: false,
      pageTopos: 1
    }
  }

  static propTypes = {
    title: PropTypes.string.isRequired,
    showFilters: PropTypes.bool.isRequired,
    topograms: PropTypes.array.isRequired,
    router: PropTypes.object.isRequired,
    ui: PropTypes.object
  }

  handleOnToggle = () => {
    this.setState((s) => ({ anonymousOnly: !s.anonymousOnly }))
  }

  handlePageTopoUp = (pageTopos, numbTopopages) => {
    if (this.state.pageTopos < numbTopopages) {
      this.setState((s) => ({ pageTopos: s.pageTopos + 1 }))
    }
  }

  handlePageTopoDown = (pageTopos, numbTopopages) => {
    if (this.state.pageTopos > 1) {
      this.setState((s) => ({ pageTopos: s.pageTopos - 1 }))
    }
  }

  handleNewRequest = ({ value, text, topogram }, index) => {
    window.open(`/topograms/${topogram._id}`, '_blank')
  }

  render() {
    const { formatMessage } = this.props.intl
    const { anonymousOnly } = this.state
    const { showFilters, title } = this.props
    const topograms = this.props.topograms || []

    // Build light-weight options for autocomplete, cap to avoid heavy rendering
    const filteredForOpts = []
    const cap = 1000
    for (const d of topograms) {
      if (anonymousOnly && d.userId !== null) continue
      const title = (d.title || '')
      filteredForOpts.push({
        value: title.substring(0, 20),
        text: title.substring(0, 20),
        topogram: d
      })
      if (filteredForOpts.length >= cap) break
    }
    // Sort newest first for suggestions
    filteredForOpts.sort((a, b) => new Date(b.topogram?.createdAt) - new Date(a.topogram?.createdAt))
    const dataSource = filteredForOpts

    // Build the full list items, but in a single pass and after sort
    const visible = topograms
      .filter((d) => (anonymousOnly ? d.userId === null : true))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    const topogramItems = visible.map((topogram) => {
        const title = topogram.title || ''
        // Safely derive title/desc/version if a "BETA" marker is present; otherwise fall back to plain title
        const titleParts = title.split(/\SBETA.*/gm)
        const safeTitle = titleParts[0] || title
        const safeDesc = titleParts[1] || ''
        const versionMatch = title.match(/BETA..../)
        const safeVersion = versionMatch ? versionMatch[0] : ''

        return (
          <TopogramListItem
            key={topogram._id}
            topogramId={topogram._id}
            topogramTitle={safeTitle}
            topogramDesc={safeDesc}
            topogramVersion={safeVersion}
            author={topogram.author && topogram.author.username ? topogram.author.username : null}
            topogramSharedPublic={topogram.sharedPublic}
            router={this.props.router}
            lastModified={new Date(topogram.createdAt)}
          />
        )
      })

  const numbTopopages = Math.ceil(topogramItems.length / 128) || 1

    return (
      <div style={{ backgroundColor: '#D6EBE6', color: '#000  !important' }}>
        <MUIAutocomplete
          options={dataSource}
          getOptionLabel={(o) => o.text || ''}
          onChange={(e, value) => value && this.handleNewRequest(value)}
          filterOptions={(options) => options}
          renderInput={(params) => (
            <TextField
              {...params}
              floatingLabelText={formatMessage(messages.label)}
              hintText={formatMessage(messages.hint)}
            />
          )}
        />

        <section className="home-public-list" style={{ width: '80vw', margin: '0 auto 1em auto' }}>
          <SubHeader>{title}</SubHeader>
          {showFilters ? (
            <div style={{ maxWidth: 250, paddingBottom: '1em' }}>
              <Toggle label="Show only anonymous" checked={anonymousOnly} onChange={this.handleOnToggle} />
            </div>
          ) : null}

          {topogramItems.length > 128 ? (
            <div>
              <div className="gridlist" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {topogramItems.slice(0 + 128 * this.state.pageTopos, 128 + 128 * this.state.pageTopos)}
              </div>
              <Button
                variant="contained"
                onClick={() => this.handlePageTopoDown(this.state.pageTopos, numbTopopages)}
                sx={{ bgcolor: '#aa8dc6', '&:hover': { bgcolor: '#9a7cb6' } }}
              >
                previous
              </Button>
              <Button
                variant="contained"
                onClick={() => this.handlePageTopoUp(this.state.pageTopos, numbTopopages)}
                sx={{ ml: 1, bgcolor: '#aa8dc6', '&:hover': { bgcolor: '#9a7cb6' } }}
              >
                next
              </Button>
              <p>
                {this.state.pageTopos}/{numbTopopages}{' '}
              </p>
            </div>
          ) : topogramItems.length ? (
            <div className="gridlist" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {topogramItems}
            </div>
          ) : (
            <p>No topograms yet!</p>
          )}
        </section>
      </div>
    )
  }
}

export default ui()(injectIntl(TopogramList))
