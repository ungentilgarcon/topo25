
import './timeline.css'

import React from 'react'
import PropTypes from 'prop-types'
import ui from '/imports/client/legacyUi'
import moment from 'moment'
import Slider from '@mui/material/Slider'
import debounce from 'lodash/debounce'


// rc-slider CSS and tooltip HOC removed; using MUI Slider with built-in value labels

function dateFormatter(v) {
  return moment(v).format('MMM D, YYYY')
}

@ui()
export default class TimeSlider extends React.Component {

  static propTypes = {
    minTime : PropTypes.number,
    maxTime : PropTypes.number
  }

  constructor(props) {
    super(props)
    // debounce UI updates to avoid thrashing during drags
    this._debouncedUpdate = debounce((value) => {
      this.props.updateUI({ valueRange: value })
    }, 80)
  }

  onSliderChange = (value) => {
    this._debouncedUpdate(value)
  }



  render() {
    const { minTime, maxTime
     } = this.props
    const { valueRange } = this.props.ui
    const rangeValid = Array.isArray(valueRange) && valueRange.length === 2 &&
      isFinite(valueRange[0]) && isFinite(valueRange[1])
    const currentRange = rangeValid ? valueRange : [minTime, maxTime]

    const minYear = moment(minTime).year(),
      maxYear = moment(maxTime).year()

    // generate list of years (in ms) for MUI Slider marks
    const marksYears = Array(maxYear - minYear + 1)
      .fill(0)
      .map((_, i) => minYear + i)
      .map((year) => ({ value: new Date(year, 0, 1).getTime(), label: String(year) }))

      //let valueRange = [{currentSliderTimeMin},{currentSliderTime}]


    return (
      <div>

          <div>

            <Slider
              sx={{
                zIndex: 1000,
                color: '#b999d6',
                '& .MuiSlider-rail': { color: 'rgba(255,255,255,0.25)' },
                '& .MuiSlider-track': { color: '#b999d6' },
                '& .MuiSlider-thumb': {
                  color: '#aa8dc6',
                  border: '2px solid #F2EFE9',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
                  '&:hover, &.Mui-focusVisible, &.Mui-active': {
                    boxShadow: '0 0 0 6px rgba(170,141,198,0.20)'
                  }
                },
                '& .MuiSlider-mark': {
                  backgroundColor: '#b999d6',
                  height: 3,
                  width: 3,
                  borderRadius: '50%'
                },
                '& .MuiSlider-markLabel': {
                  color: '#F2EFE9',
                  opacity: 0.9,
                  fontSize: '10px',
                  textShadow: '0 1px 1px rgba(0,0,0,0.5)'
                },
                '& .MuiSlider-valueLabel': {
                  background: 'rgba(69,90,100,0.95)',
                  color: '#F2EFE9',
                  border: '1px solid #78909C',
                  fontSize: '10px',
                  padding: '2px 6px',
                  borderRadius: '4px'
                }
              }}
              value={currentRange}
              min={minTime}
              max={maxTime}
              step={1}
              marks={marksYears}
              valueLabelDisplay="auto"
              valueLabelFormat={dateFormatter}
              onChange={(_, v) => this.onSliderChange(v)}
            />
          </div>
        </div>


    )
  }
}
