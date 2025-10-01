import React from 'react'
import PropTypes from 'prop-types'
import ui from 'redux-ui'
import { Card, CardTitle, CardActions } from 'material-ui/Card'
import Divider from 'material-ui/Divider'
import d3 from 'd3'
import { CircleMarker } from 'react-leaflet'
import Popup from '/imports/client/ui/components/common/Popup.jsx'


const LEGEND_DIV_ID = "legend"
const divLegendStyle = {
  //position: 'fixed',
  top: '0',
  //zIndex : -1,
  fontSize: "60%"

}



@ui()

export default class Legend extends React.Component {
  static propTypes = {
    minWeight : PropTypes.number,
    maxWeight : PropTypes.number

  }






  constructor(props) {
    super(props)
    this.state = {

    }
  }



render() {
  const {
    topogramId,
    nodes,
    edges,
    nodesforLegend,
    edgesforLegend,
    minWeight,
    maxWeight,
    minEdgesWeight,
    maxEdgesWeight,
    height,
    width


   } = this.props

const right = width === '50vw' ? '50vw' : 0
   const { cy } = this.props.ui

  // if (this.props.ui.cy && !!this.props.ui.cy.initrender ){console.log("THISCY",this.props.ui.cy)}
   if (this.props.ui.cy && (this.props.ui.cy._private.initrender == false)) {


  const {
    legendVisible
  } = this.state


return (
  <Popup
    show
    title={'Legend'}
    onClose={() => this.props.updateUI('legendVisible', false)}
    onPopOut={() => this.setState({ poppedOut: true })}
    width={460}
    height={420}
  >
  <div>

    {/* <CardTitle

      title='BandsTour (Beta.1) GPL V3 by Gregory Bahde'
      titleStyle={{ fontSize : '10pt', lineHeight : '1em',  fontWeight: 'bold' }}

    /> */}
<Divider/>
    <a style={{ fontSize : '8pt' }}>Network Legends</a>
<Divider/>
<br/>


<table>
    <tbody  style= {{fontSize: "8pt"}}>

<tr>
  <td colSpan="2">
    <svg height="40" width="180" style={{ display:'block' }}>
      {/* circles */}
      <circle cx="20" cy="20" r="12" stroke="black" strokeWidth="1" fill="blue" />
      <circle cx="20" cy="8" r="4" stroke="black" strokeWidth="1" fill="red" />
      {/* labels aligned to circle centers */}
      <text x="40" y="10" fill="#F2EFE9" style={{ fontSize: '10pt' }}>1 date</text>
      <text x="40" y="22" fill="#F2EFE9" style={{ fontSize: '10pt' }}>10 dates</text>
    </svg>
  </td>
</tr>



    </tbody>
</table>
<Divider/>
  <a style={{ display:'inline-block', marginTop:'10px', fontSize : '9pt', fontWeight:'bold' }}>Map Legends</a>
<Divider/>

<div  style= {{fontSize: "8pt" ,textAlign:'center', marginTop:'6px'}}> map scale =&gt; bottom right</div>
<br/>

    <table>
    <tbody  style= {{fontSize: "8pt"}}>


    <tr>
    <td>
        <div
        style= {{
          boxSizing: 'border-box',
           border: '3px solid red',

            borderRadius: '10px',
             width: '15px',
              height: '15px',
            }}
        />
    </td>
    <td>
    <div> 1 date</div>
    </td>
    </tr>
    <tr>
    <td>
        <div
        style= {{
          boxSizing: 'border-box',
           border: '3px solid red',
            borderRadius: '10px',

             width: '20px',
              height: '20px',
            }}
        />
    </td>
    <td>
      <div>
      10 dates
      </div>
    </td>
    </tr>
    <tr>
    <td>
        <div>
        <svg
        style= {{height:"5px", width:"40px"}}>
    <line x1="0" y1="0" x2="40" y2="0"
    style={{stroke:"rgb(255,0,0)",strokeWidth:4}} />
    </svg>
        </div>
    </td>
    <td>
      <div style={{paddingLeft: "10px"}}>
    tournée ni optimisée ni optimisable
      </div>
    </td>
    </tr>
    <tr>
    <td>
        <div>
        <svg
        style= {{height:"5px", width:"40px"}}>
 <line x1="0" y1="0" x2="40" y2="0"
  style={{stroke:"rgb(255,0,0)",strokeWidth:4, strokeDasharray:"9 2"}} />
</svg>
        </div>
    </td>
    <td>
      <div style={{paddingLeft: "10px"}}>
    tournée grandement optimisable (D2)
      </div>
    </td>
    </tr>
    <tr>
    <td>
        <div>
        <svg
        style= {{height:"5px", width:"40px"}}>
 <line x1="0" y1="0" x2="40" y2="0"
  style={{stroke:"rgb(255,0,0)",strokeWidth:4, strokeDasharray:"5 4"}} />
</svg>
        </div>
    </td>
    <td>
      <div style={{paddingLeft: "10px"}}>
    tournée optimisable (D1)
      </div>
    </td>
    </tr>
    <tr>
    <td>
        <div>
        <svg
        style= {{height:"5px", width:"40px"}}>
 <line x1="0" y1="0" x2="40" y2="0"
  style={{stroke:"rgb(255,0,0)",strokeWidth:4,strokeDasharray:"5 2 2 5 2 2 5"}} />
</svg>
        </div>
    </td>
    <td>
      <div style={{paddingLeft: "10px"}}>
    tournée déjà grandement optimisée (D-2)
      </div>
    </td>
    </tr>
    <tr>
    <td>
        <div>
        <svg
        style= {{height:"5px", width:"40px"}}>
 <line x1="0" y1="0" x2="40" y2="0"
  style={{stroke:"rgb(255,0,0)",strokeWidth:4, strokeDasharray:"7 1 7 7 1 7 7 1 7"}} />
</svg>
        </div>
    </td>
    <td>
      <div style={{paddingLeft: "10px"}}>
    tournée déjà optimisée (D-1)
      </div>
    </td>
    </tr>
    </tbody>
    </table>



</div>



  </Popup>


)
}
}
}
