import React, { PropTypes } from 'react'
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
    onPopOut={() => {
      if (typeof window === 'undefined') return
      const style = 'body{margin:0;font-family:Arial,Helvetica,sans-serif;background:#37474F;color:#F2EFE9;}header{background:rgba(69,90,100,1);padding:10px 14px;font-weight:bold;position:sticky;top:0;}main{padding:14px 16px;line-height:1.6;font-size:15px;}h1{font-size:16px;margin:0;color:#F2EFE9}h2{font-size:14px;color:#aa8dc6;margin:14px 0 6px;}a,button{cursor:pointer}'
      const w = window.open('', 'legend_popup', 'width=600,height=520,menubar=no,toolbar=no,location=no,status=no,resizable=yes,scrollbars=yes')
      if (!w || w.closed) { alert('Please allow pop-ups for this site to open the Legend window.'); return }
      try {
        w.document.open()
        // Simple HTML with a heading; legend in main app remains the source of truth
        w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Legend</title><style>${style}</style></head><body><header><h1>Legend</h1></header><main><p>Use this pop-out to keep Legends visible while working in the app.</p></main></body></html>`)
        w.document.close(); w.focus()
      } catch (e) {}
    }}
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

<tr display="inline">
<td>
<div>
  <svg height="36" width="36">

    <circle cx="15" cy="15" r="12" stroke="black" strokeWidth="1" fill="blue" />
    <circle cx="15" cy="7" r="4" stroke="black" strokeWidth="1" fill="red" />
  </svg>
</div>
</td>
<td >
<div>
<a>1 date </a>
<br/>
<a>10 dates</a>
</div>
</td>
</tr>



    </tbody>
</table>
<Divider/>
  <a style={{ fontSize : '8pt',textStyle:'bold' }}>Map Legends</a>
<Divider/>

<div  style= {{fontSize: "8pt" ,textAlign:'center'}}> map scale =&gt; bottom right</div>
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
