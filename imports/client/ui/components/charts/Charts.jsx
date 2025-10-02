import React from 'react'
import PropTypes from 'prop-types'
import ui from '/imports/client/legacyUi'
import { CardCompat as Card, CardTitleCompat as CardTitle, CardActionsCompat as CardActions } from '/imports/startup/client/muiCompat'
import C3Chart from './C3ChartCompat.jsx';
import { buildSparklinePath } from './sparkline'
import Button from '@mui/material/Button'
import Popup from '/imports/client/ui/components/common/Popup.jsx'


import './c3.css';
//import Tooltip from 'rc-tooltip';
//import Slider from 'rc-slider';
import d3  from 'd3/d3';
//import { scaleLinear } from 'd3-scale'
//import {schemeCategory10} from 'd3/d3'

//math.sqrt(float(my_nodesdict[idd]["data"].get("weight"))+1) ,
//import 'rc-slider/assets/index.css';
/*APPLYS TO NODES AND EDGES SELECTED ON SCREEN, SO CY IS THE TARGET OF IMPLANT :)*/
const CHARTS_DIV_ID = "charts"
const divChartsStyle = {
  position: 'fixed',
  top: '0',
  zIndex : -1
}
//const mountNode = document.getElementById('react-c3js');

//const createSliderWithTooltip = Slider.createSliderWithTooltip;
//const Range = createSliderWithTooltip(Slider.Range);

// Robust percentile helper (0..1). Returns NaN for empty arrays.
function percentile(arr, p) {
  if (!Array.isArray(arr) || arr.length === 0) return NaN
  const a = arr.slice().sort((x,y) => x - y)
  const pos = (a.length - 1) * p
  const lo = Math.floor(pos)
  const hi = Math.ceil(pos)
  if (lo === hi) return a[lo]
  const h = pos - lo
  return a[lo] * (1 - h) + a[hi] * h
}



@ui()

class Charts extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      hasCharts : true,
      alpha: 0.05,
      showT: true,
      showChi2: true
    }
  }

  componentDidMount() {
    // Nudge C3 to compute dimensions once the popup is visible
    const fire = () => { try { window.dispatchEvent(new Event('resize')) } catch (e) {} }
    if (typeof requestAnimationFrame === 'function') requestAnimationFrame(fire)
    setTimeout(fire, 50)
    // Try to force a C3 refresh shortly after mount in case colors changed
    setTimeout(() => { try { window.dispatchEvent(new Event('resize')) } catch(e) {} }, 180)
    // After initial render, enforce high-contrast labels and tooltip theme
    setTimeout(() => {
      try {
        // Ensure tooltip container has our dark theme even if C3 injects new nodes later
        const tt = document.querySelectorAll('.c3-tooltip')
        tt.forEach(n => { n.style.setProperty('background-color','rgba(33,33,33,0.95)','important'); n.style.setProperty('color','#F2EFE9','important') })
        // Improve arc label contrast dynamically: if text sits on a light slice, use dark text with light stroke
        const labels = document.querySelectorAll('.c3-chart-arc text')
        labels.forEach(t => {
          const fill = (t.style && t.style.fill) || window.getComputedStyle(t).fill
          // For very light colors or yellow-ish, prefer dark text
          const isLight = (() => {
            try {
              const m = /rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(fill)
              if (m) {
                const r = parseInt(m[1],10), g = parseInt(m[2],10), b = parseInt(m[3],10)
                const lum = (0.2126*r + 0.7152*g + 0.0722*b)/255
                return lum > 0.75 || (r > 230 && g > 230 && b < 120) // bright/yellow-ish
              }
            } catch (_) {}
            return false
          })()
          if (isLight) {
            t.style.fill = '#263238'
            t.style.stroke = 'rgba(255,255,255,0.85)'
            t.style.strokeWidth = '1.8px'
            t.style.paintOrder = 'stroke fill'
          }
        })
      } catch (e) { /* noop */ }
    }, 120)
  }



  static propTypes = {
    //minWeight : PropTypes.number,
    //maxWeight : PropTypes.number,
    //edges : PropTypes.array.isRequired,
    // isolateMode : PropTypes.bool,
    //handleClickChartNodeElement : PropTypes.func,
    // onFocusElement : PropTypes.func.isRequired,
    // onUnfocusElement : PropTypes.func.isRequired,
    selectElement : PropTypes.func,
    unselectElement : PropTypes.func
  }

  selectElement = (el) => {

    el.data.selected = true

    const { cy } = this.props.ui
    let filter = `${el.group.slice(0,-1)}[id='${el.data.id}']`
    cy.filter(filter).data('selected', true)

    this.props.updateUI(
      'selectedElements',
      [...this.props.ui.selectedElements, el]
    )

  }

  unselectElement = (el) => {

    el.data.selected = false

    const { cy, isolateMode } = this.props.ui
    let filter = `${el.group.slice(0,-1)}[id='${el.data.id}']`
    cy.filter(filter).data('selected', false)

    const {selectedElements} = this.props.ui

    const remainingElements = [...
      selectedElements.filter(n =>
        !(
          n.data.id === el.data.id
          &&
          n.group === el.group
        )
      )
    ]

    this.props.updateUI('selectedElements', remainingElements)
    // console.log(remainingElements, isolateMode);

    if(!remainingElements.length && isolateMode)
    this.handleExitIsolateMode()
  }

  unselectAllElements = () => {
    const { cy, selectedElements } = this.props.ui

    cy.elements().data('selected', false)
    selectedElements.forEach(el=> el.data.selected = false)

    this.props.updateUI('selectedElements', [])

  }


/*
  onSliderWChange = (valueWeight) => {
      this.props.updateUI({ //

        valueRangeWeight : valueWeight

       })
       //console.log('VRW',this.props.ui.valueRangeWeight);
     }
*/

   handleClickChartNodeElement(el) {
     const {cy} = this.props.ui
       //console.log("elelel",el);
       //console.log(cy);
       //console.log("FILT",this.props.ui.cy.filter('node'));
       var cyFIL=this.props.ui.cy.filter('node')
       //console.log(cyFIL[0]["_private"]);
       //console.log(cyFIL[1]["_private"]);
       //console.log(cyFIL.length);

      // Build the set of matching nodes for this legend/bin
      const matches = []
      for (var i = 0; i < cyFIL.length; i++) {
        var group = 'node'
        const filter = `${group}[id='${cyFIL[i]["_private"]["data"]["id"]}']`
        const cyEl = cy.filter(filter)
        if (Math.round(Math.pow(cyEl.data('weight'),2)) == el['name']) {
          matches.push(cyEl)
        }
      }
      // Decide action: if all currently selected, unselect all; else select all
      const allSelected = matches.length > 0 && matches.every(elc => !!elc.data('selected'))
      const run = () => {
        matches.forEach(elc => {
          allSelected ? this.unselectElement(elc.json()) : this.selectElement(elc.json())
        })
      }
      if (typeof requestAnimationFrame === 'function') requestAnimationFrame(run)
      else setTimeout(run, 0)
      console.log("LOOP ENDED");
     }

   handleClickChartEdgeElement(el) {
     const { cy } = this.props.ui
     const cyEdges = cy.filter('edge')
     // C3 can pass id as d.id; keep backward compat with d.name
     const target = (el && (el.id != null ? el.id : el.name != null ? el.name : el))
     // Build the set of matching edges by weight/bin
     const matches = []
     for (let i = 0; i < cyEdges.length; i++) {
       const id = cyEdges[i] && cyEdges[i]._private && cyEdges[i]._private.data && cyEdges[i]._private.data.id
       if (!id) continue
       const cyEl = cy.filter(`edge[id='${id}']`)
       const w = cyEl && cyEl.data && cyEl.data('weight')
       if (w == target) matches.push(cyEl)
     }
     const allSelected = matches.length > 0 && matches.every(elc => !!(elc && elc.data && elc.data('selected')))
     const run = () => {
       matches.forEach(elc => {
         allSelected ? this.unselectElement(elc.json()) : this.selectElement(elc.json())
       })
     }
     if (typeof requestAnimationFrame === 'function') requestAnimationFrame(run)
     else setTimeout(run, 0)
   }




render() {
  const {
    topogramId,
    nodes,
    //edges
    nodesforCharts,
    edgesforCharts,
    minWeigh,
    maxWeigh,


   } = this.props















   const { cy, /*valueRangeWeight*/ } = this.props.ui










//console.log("THISUI=",this.props.ui);
//    function sizeObj(obj) {
//   return Object.keys(obj).length;
// }
//##FILTERNODES AND CREATE DATASET
  // if (this.props.ui.cy && !!this.props.ui.cy.initrender ){console.log("THISCY",this.props.ui.cy)}
   if (this.props.ui.cy && (this.props.ui.cy._private.initrender == false)) {




// console.log(this.props.maxWeight,"this.props.maxWeight-this.props.minWeight",this.props.minWeight);
//      const marksWeight = {}
//      Array(this.props.maxWeight-this.props.minWeight)
//        .fill(0)
//        .map((n,i) => minWeight+i)
//        .forEach(n => marksWeight[n] = n)



//EASY NODES
        this.nodes=this.props.ui.cy.filter('node')
        //console.log(this.nodes.length);
//HARD EDGES
        var edges =[]
        var j =0
        for ( ;  j < this.nodes.length ; j++) {
          //console.log(this.nodes[j]["_private"])
           edges.push(this.nodes[j]["_private"])
        }
        var j =0
        var edges2 =[]
        //console.log(edges.length);
         for (;  j < edges.length ; j++)
         {
         //console.log(edges[j]["edges"])//edges ={edges}
         edges2.push(edges[j]["edges"])
       }

       var edges3 =[]
       var edgtmp =[]
       //console.log(edges2.length);
        for (var k =0;  k < edges2.length ; k++)
        {
          //console.log("k",k);
          //console.log("2K",edges2[k]);
          edgtmp = edges2[k]
          var edgesbk= edges3
          //console.log("edgtmp",edgtmp.keys())
           edges3 = edgesbk.concat(edgtmp)
          //console.log("edges3",edges3)
        }

        let edges4 = [...new Set(edges3)];


var regenerale= /.*/g;
// 0: "distance : 4205.973563 km  "
// 1: ""
// 2: "source : infinity-hall41-73  target : daniel-street41-73  "
// 3: ""
// 4: "datesource : 2010-12-18T19:00:00  "
// 5: ""
// 6: "datetarget : 2010-12-19T19:00:00  "
// 7: ""
// 8: "group: 6  "
// 9: ""
// 10: " tournée déjà grandement optimisée  "
// 11: ""
// 12: "Distance parcourue pendant le tour: 13762.3555564 km  "
// 13: ""
// 14: "Distance recalculée: 19362.6829578 km  "
// 15: ""
// 16: "Taux d'optimisation -0.406930875931 %  "
// 17: ""
// 18: "counted 1  times"

// 19: ""

      const edgesforCharts = edges4.map((n,i) =>{
          return(
             {data: n._private.data,
             key : `edge-${i}`,
              notes: n._private.data.notes,
              distance : n._private.data.notes.match(regenerale)[0].split(": ")[1].split(" km")[0],
              group: n._private.data.notes.match(regenerale)[8].split(": ")[1].split("  ")[0],

            }

   )
   }
  )


        //console.log("THISEDGES",edges)
        //console.log("THISEDGES2",edges2)
        //console.log("THISEDGES3",edges3)
        //console.log("EDGES:",edgesforCharts)
      //  #YEAH GOT IT
      //\HARD EDGES

//#UNDER PRIVATE.DATA FOR NODES AND DATA FOR EDGE

   const nodesforCharts = this.nodes.map((n,i) => {

     return (


           { 'data' : n._private.data,
             'key':`node-${i}`,
              'center': {'lat':n._private.data.lat,'lng' :n._private.data.lng},
              'color' : n._private.data.selected ? 'yellow' : n._private.data.color,

              //'notes' :  n._private.data.notes
              //''

           }
     )
   }
   )


  console.log("NODES",nodesforCharts)
//  console.log("EDGES",edgesforCharts)
  //console.log(this.nodes[i]["_private"]["data"])

  // Build clean numeric arrays
  const resweig = nodesforCharts
    .map(n => Number.isFinite(n?.data?.weight) ? Math.round(Math.pow(n.data.weight, 2)) : null)
    .filter(v => typeof v === 'number' && isFinite(v))

  console.log("NODE WEIGHT LIST/RESULT N",resweig);


var resweigUniquesPoids={}

//var resweigUniquesStr = []
// for (var i = 0; i < resweigUniques.length; i++) {
//   resweigUniquesStr.push(resweigUniques[i].toString())
// }
// var resweigStr = []
// for (var i = 0; i < resweig.length; i++) {
//   resweigUniquesStr.push(resweigUniques[i].toString())
// }
// console.log("resweigUniques",resweigUniques);
// console.log("resweigUniquesStr",resweigUniquesStr);
// console.log("resweigStr",resweigStr);


for (var i = 0; i < resweig.length; i++) {
  // console.log(resweig[i].toString());
  // if (typeof resweig[i].toString() === 'string' || resweig[i].toString() instanceof String)
  // {console.log("string");}


  if (!resweigUniquesPoids.hasOwnProperty(resweig[i].toString()))
  {resweigUniquesPoids[resweig[i].toString()]=1
//  console.log("strTYPE",resweigUniquesPoids[resweig[i].toString()]);
}
else  {
  //console.log(resweigUniquesPoids[resweig[i].toString()]);
  resweigUniquesPoids[resweig[i].toString()]=parseInt(resweigUniquesPoids[resweig[i].toString()])+1
}
// else {
//   console.log("ERROR");
// }
}
//console.log("resweigUniquesPoids",resweigUniquesPoids);
var ArrayresweigUniquesPoids=[]
var ArrayresweigUniquesPoidsDATA=[]
var ArrayValresweigUniquesPoids=[]
for (var key in resweigUniquesPoids) {
  ArrayresweigUniquesPoids.push(resweigUniquesPoids[key])
  ArrayresweigUniquesPoidsDATA.push([Number(key),resweigUniquesPoids[key]])

}
//HERE WE FINALLY GET OCCURENCE OF WEIGHT
var resweigUniques = [...new Set(resweig)];
for (var i = 0; i < resweigUniques.length; i++) {
  //console.log(resweigUniques[i]);
  resweigUniques[i]=resweigUniques[i].toString().substring(0,5)
}
ArrayresweigUniquesPoidsDATA.sort()
 //console.log(resweigUniques);
ArrayValresweigUniquesPoids =Object.keys(resweigUniquesPoids)
 //console.log("ArrayresweigUniquesPoids",ArrayresweigUniquesPoids);
 //console.log("ArrayValresweigUniquesPoids",ArrayValresweigUniquesPoids);
 console.log("ArrayresweigUniquesPoidsDATA",ArrayresweigUniquesPoidsDATA);



//===============================================================>

  const resweigEdges = edgesforCharts
    .map(n => Number.isFinite(n?.data?.weight) ? Number(n.data.weight) : null)
    .filter(v => typeof v === 'number' && isFinite(v))

  console.log("EDGE WEIGHT LIST/RESULT N",resweigEdges);


var resweigEdgesUniquesPoids={}

//var resweigUniquesStr = []
// for (var i = 0; i < resweigUniques.length; i++) {
//   resweigUniquesStr.push(resweigUniques[i].toString())
// }
// var resweigStr = []
// for (var i = 0; i < resweig.length; i++) {
//   resweigUniquesStr.push(resweigUniques[i].toString())
// }
// console.log("resweigUniques",resweigUniques);
// console.log("resweigUniquesStr",resweigUniquesStr);
// console.log("resweigStr",resweigStr);


for (var i = 0; i < resweigEdges.length; i++) {
  // console.log(resweig[i].toString());
  // if (typeof resweig[i].toString() === 'string' || resweig[i].toString() instanceof String)
  // {console.log("string");}


  if (!resweigEdgesUniquesPoids.hasOwnProperty(resweigEdges[i].toString()))
  {resweigEdgesUniquesPoids[resweigEdges[i].toString()]=1
//  console.log("strTYPE",resweigUniquesPoids[resweig[i].toString()]);
}
else  {
  //console.log(resweigUniquesPoids[resweig[i].toString()]);
  resweigEdgesUniquesPoids[resweigEdges[i].toString()]=parseInt(resweigEdgesUniquesPoids[resweigEdges[i].toString()])+1
}
// else {
//   console.log("ERROR");
// }
}
//console.log("resweigUniquesPoids",resweigUniquesPoids);
var ArrayresweigEdgesUniquesPoids=[]
var ArrayresweigEdgesUniquesPoidsDATA=[]
for (var key in resweigEdgesUniquesPoids) {
  ArrayresweigEdgesUniquesPoids.push(resweigEdgesUniquesPoids[key])
  ArrayresweigEdgesUniquesPoidsDATA.push([Number(key),resweigEdgesUniquesPoids[key]])
}
//HERE WE FINALLY GET OCCURENCE OF WEIGHT
var resweigEdgesUniques = [...new Set(resweigEdges)];
for (var i = 0; i < resweigEdgesUniques.length; i++) {
  resweigEdgesUniques[i]=resweigEdgesUniques[i]/*.toString().substring(0,5)*/
}
console.log(resweigEdgesUniques);
console.log(ArrayresweigEdgesUniquesPoids);

ArrayresweigEdgesUniquesPoidsDATA.sort()
console.log(ArrayresweigEdgesUniquesPoidsDATA);


//================================================================>
//#WE NEED TO FIGURE OUT HOW OT INSTALL STDLIBs
//ChiSquare Calculation
// var ChiSquare = require( '@stdlib/stats/base/dists/chisquare' ).ChiSquare;
// var chisquare = new ChiSquare( resweig );
// var mu = chisquare.mean;
// console.log("mu",mu);

//#SO WE SWITCH TO js-statsXXX NOPE Statistical-js
//const statistical = require('statistical-js');

  const statistical = require('statistical-js');
  try{
    // Guard against empty arrays
    const safe = (arr) => Array.isArray(arr) && arr.length > 0 ? arr : [0]
    const nodesArr = safe(resweig)
    const edgesArr = safe(resweigEdges)

    const summaryNodes = statistical.methods.summary(nodesArr);
    const summaryEdges = statistical.methods.summary(edgesArr);

    console.log(" SUMMARY NODES  RESULTS",summaryNodes);
    console.log(" SUMMARY EDGES  RESULTS",summaryEdges);
  // If sample size is too small, t-test can be unstable; wrap in try
  let ttestN = null
  try { ttestN = statistical.methods.tTestOneSample(nodesArr, 4) } catch (_) {}
    console.log("Student NW",ttestN);
  let ttestE = null
  try { ttestE = statistical.methods.tTestOneSample(edgesArr, 4) } catch (_) {}
    console.log("Student EW",ttestE);

  const distributionType = statistical.methods.poisson;
  const distributionTypeEdges = statistical.methods.poisson;

    // Chi-squared expects observed counts per bin; ensure non-empty
    const chiSquaredGoodnessOfFit = ArrayresweigUniquesPoids.length
      ? statistical.methods.chiSquaredGoodnessOfFit(ArrayresweigUniquesPoids, distributionType, this.state.alpha)
      : null;
    console.log("chi2 Nodes",chiSquaredGoodnessOfFit);
    const chiSquaredGoodnessOfFitEdges = ArrayresweigEdgesUniquesPoids.length
      ? statistical.methods.chiSquaredGoodnessOfFit(ArrayresweigEdgesUniquesPoids, distributionTypeEdges, this.state.alpha)
      : null;
    console.log("chi2 Edges",chiSquaredGoodnessOfFitEdges);

    // Save a compact stats snapshot for rendering
    this._stats = {
      nodes: {
        mean: summaryNodes.mean,
        median: Array.isArray(nodesArr) ? nodesArr.slice().sort((a,b)=>a-b)[Math.floor(nodesArr.length/2)] : undefined,
        p25: Array.isArray(nodesArr) ? percentile(nodesArr, 0.25) : undefined,
        p75: Array.isArray(nodesArr) ? percentile(nodesArr, 0.75) : undefined,
        stdev: summaryNodes.standardDeviation || summaryNodes.stddev || summaryNodes.sd,
        n: summaryNodes.count || summaryNodes.n,
        t: ttestN && (ttestN.t || ttestN.statistic),
        p: ttestN && (ttestN.p || ttestN.pvalue || ttestN.pValue)
      },
      edges: {
        mean: summaryEdges.mean,
        median: Array.isArray(edgesArr) ? edgesArr.slice().sort((a,b)=>a-b)[Math.floor(edgesArr.length/2)] : undefined,
        p25: Array.isArray(edgesArr) ? percentile(edgesArr, 0.25) : undefined,
        p75: Array.isArray(edgesArr) ? percentile(edgesArr, 0.75) : undefined,
        stdev: summaryEdges.standardDeviation || summaryEdges.stddev || summaryEdges.sd,
        n: summaryEdges.count || summaryEdges.n,
        t: ttestE && (ttestE.t || ttestE.statistic),
        p: ttestE && (ttestE.p || ttestE.pvalue || ttestE.pValue)
      },
      chi2: {
        nodes: chiSquaredGoodnessOfFit,
        edges: chiSquaredGoodnessOfFitEdges
      }
    }
  }
catch(error)
{//console.log(error);
}
///HERE WE FORMAT DATAS FOR CHART BY ADDIJNG A HEADER TO OUR ARRAYS
  resweigUniques.unshift('nodes weight elements')
  ArrayresweigUniquesPoids.unshift('nodes weight count')
  resweig.unshift('nodes weight')
  resweigEdgesUniques.unshift('edges weight elements')
  ArrayresweigEdgesUniquesPoids.unshift('edges weight count')
  resweigEdges.unshift('edges weight')
//      console.log("NODESWEIGHT",resweig)
//console.log("NODESWEIGHT2",resweig2)
}


//IDEM FOR EDGES SO THAT WE HAVE DATAS FOR EDGES AND NODES


  // NOW DATA's HERE IS AN EXAMPLE:
  // let data = {
  //   columns: [
  //     ['nodes Weight', 30, 200, 100, 400, 150, 250],
  //     ['Tour distances', 50, 20, 10, 40, 15, 25]
  //   ]
  // };


  const {
    chartsVisible
  } = this.state
  const { alpha, showT, showChi2 } = this.state
/*var colorsNode= scaleLinear(schemeCategory10)
  .domain(ArrayresweigUniquesPoidsDATA)
  .range([5,15])*/
/*  var colorsNode= ['red','green','blue','yellow','black','red']*/
  /*['#2d335b', '#535b2d', '#494949', '#d7d7d7', '9ad4ce']*/
//console.log(colorsNode);
console.log(resweigUniques,"resweigUniques");
  let data = {

    columns:
      (this.props.ui.cy && (this.props.ui.cy._private.initrender==false)) ?  /*[ArrayresweigUniquesPoids]*/ ArrayresweigUniquesPoidsDATA : [['nodes weight', 30, 200, 100, 400, 150, 250]]

      ,
          type: 'donut'/*,

        color:function(d){
                return colorsNode[d.index];
        }*/
        ,
                onclick: (e) => this.handleClickChartNodeElement(e)
                ,


          /*pie: {
            title:{
  text: 'My Title'
}
        }
*/

        }
        let data2 = {

          columns:
            (this.props.ui.cy && (this.props.ui.cy._private.initrender==false)) ?  /*[ArrayresweigUniquesPoids]*/ ArrayresweigEdgesUniquesPoidsDATA : [['edges weight', 30, 200, 100, 400, 150, 250]]

            ,
                type: 'donut',
                onclick: (e) => this.handleClickChartEdgeElement(e)
                ,
                /*pie: {
                  title:{
        text: 'My Title'
        }
              }
        */

              }


/*    var firstLegend = d3.select(".c3-title");
    console.log("firstLegend",firstLegend);
    var legendCon = d3.select(firstLegend.node().parentNode);
    legendCon
  .append('text')
  .text('Legend Title')*/
/*  , bar: {
        width: {
            ratio: 0.5 // this makes bar width 50% of length between ticks
        }
      }
  ,axis: {
  x: {
label: 'nodes weight',
type: "category",
categories:resweigUniques,
  tick: {
      fit: true,
      multiline: true,
      values: ArrayValresweigUniquesPoids
    },
  },
  y: {
            label: 'number of shows per venue'
        },
}


};*/
if (this.props.ui.cy && (this.props.ui.cy._private.initrender==false)&&data){
//#SO WE SWITCH TO js-statsXXX NOPE Statistical-js
const sample = [1, 2, 3, 4, 19, 5, 6, 6, 15, 50, 23, 14, 45];

}






//const mountNode = document.getElementById('react-c3js');

// Use a stable color pattern so legend tiles receive explicit fills
// Palette aligned with app theme: blue, orange, green, red, purple, teal, yellow, grey
const c3Colors = { pattern: ['#1976D2','#FB8C00','#43A047','#E53935','#8E24AA','#00897B','#FDD835','#78909C'] }

// Highlight selected series (bins) in fluorescent yellow using a dynamic color callback
try {
  const selected = (this.props.ui && this.props.ui.selectedElements) ? this.props.ui.selectedElements : []
  const nodeBins = new Set(
    selected
      .filter(el => el && el.group === 'nodes' && el.data && el.data.weight != null)
      .map(el => String(Math.round(Math.pow(el.data.weight, 2))))
  )
  const edgeBins = new Set(
    selected
      .filter(el => el && el.group === 'edges' && el.data && el.data.weight != null)
      .map(el => String(el.data.weight))
  )
  const yellow = '#EEFF41'
  // Build explicit color maps so selected bins are yellow; others fall back to pattern
  if (!data.colors) data.colors = {}
  if (!data2.colors) data2.colors = {}
  // Reset previous maps each render to avoid lingering highlights
  data.colors = {}
  data2.colors = {}
  nodeBins.forEach(bin => { data.colors[bin] = yellow })
  edgeBins.forEach(bin => { data2.colors[bin] = yellow })
  // Keys to force chart instance re-creation when selection changes, ensuring colors refresh
  this._nodesBinsKey = Array.from(nodeBins).sort().join(',')
  this._edgesBinsKey = Array.from(edgeBins).sort().join(',')
} catch (e) { /* best-effort highlight */ }

// Compute an initial size that fits most viewports without needing a drag
const vw = (typeof window !== 'undefined') ? window.innerWidth : 1200
const vh = (typeof window !== 'undefined') ? window.innerHeight : 800
const popupWidth = Math.min(900, Math.max(600, Math.round(vw * 0.7)))
const popupHeight = Math.min(900, Math.max(560, Math.round(vh * 0.8)))

// Legend clicks should select items instead of toggling visibility
const legendNodes = {
  item: {
    onclick: (id) => {
      const payload = { name: id }
      const run = () => this.handleClickChartNodeElement(payload)
      if (typeof requestAnimationFrame === 'function') requestAnimationFrame(run)
      else setTimeout(run, 0)
    }
  }
}
const legendEdges = {
  item: {
    onclick: (id) => {
      const payload = { name: id }
      const run = () => this.handleClickChartEdgeElement(payload)
      if (typeof requestAnimationFrame === 'function') requestAnimationFrame(run)
      else setTimeout(run, 0)
    }
  }
}

return (
  <Popup
    show
    title={'Charts'}
    onClose={() => this.props.updateUI('chartsVisible', false)}
    onPopOut={() => this.setState({ poppedOut: true })}
    width={popupWidth}
    height={popupHeight}
  >
  <div>
    <CardTitle

      title='Charts'
      titleStyle={{ fontSize : '12pt', lineHeight : '1em', color: '#F2EFE9' }}
      subtitle='Nodes repartition (how often the band has played the same venue)'
      subtitleStyle={{ fontSize : '9pt', lineHeight : '1.2em', color: '#F2EFE9' }}

    />

  <C3Chart
    data={data}
  color={c3Colors}
    key={`nodes-${this._nodesBinsKey || 'none'}`}
    legend={legendNodes}
    title={"nodes"}
    dataLabels={{ show: false }}
    legendPosition="right"
    tooltip={{ grouped: false }}
    axis={{ x: { show: false }, y: { show: false } }}
    onContainer={(el) => { this._nodesContainer = el }}
    onReady={(chart) => { this._nodesChart = chart }}
    unselectAllElements={this.unselectAllElements}
    unselectElement={this.unselectElement}
    selectElement={this.selectElement}
    style={{




    size: { width :10}
    }}
    />
    {/* Show compact stats summary for nodes */}
    {this._stats && this._stats.nodes ? (
      <div style={{ color:'#F2EFE9', fontSize:'9pt', marginTop: 8 }}>
        <strong>Nodes stats:</strong>
        <span style={{ marginLeft: 8 }}>n={this._stats.nodes.n}</span>
        <span style={{ marginLeft: 8 }}>mean={Number(this._stats.nodes.mean).toFixed(3)}</span>
        <span style={{ marginLeft: 8 }}>sd={Number(this._stats.nodes.stdev || 0).toFixed(3)}</span>
        <span style={{ marginLeft: 8 }}>p25={this._stats.nodes.p25 != null ? Number(this._stats.nodes.p25).toFixed(2) : '—'}</span>
        <span style={{ marginLeft: 8 }}>p50={this._stats.nodes.median != null ? Number(this._stats.nodes.median).toFixed(2) : '—'}</span>
        <span style={{ marginLeft: 8 }}>p75={this._stats.nodes.p75 != null ? Number(this._stats.nodes.p75).toFixed(2) : '—'}</span>
        {showT ? (
          <>
            <span style={{ marginLeft: 8 }}>t≈{this._stats.nodes.t != null ? Number(this._stats.nodes.t).toFixed(3) : '—'}</span>
            <span style={{ marginLeft: 8 }}>p≈{this._stats.nodes.p != null ? Number(this._stats.nodes.p).toExponential(2) : '—'}</span>
          </>
        ) : null}
        {showChi2 && this._stats.chi2 && this._stats.chi2.nodes ? (
          <span style={{ marginLeft: 8 }}>chi2={JSON.stringify(this._stats.chi2.nodes)}</span>
        ) : null}
        {/* sparkline for nodes */}
        {Array.isArray(resweig) && resweig.length > 0 ? (() => {
          const numeric = resweig.filter(v => typeof v === 'number' && isFinite(v))
          const s = buildSparklinePath(numeric)
          return (
            <svg width={s.width} height={s.height} style={{ marginLeft: 8, verticalAlign: 'middle' }}>
              <path d={s.path} stroke="#80CBC4" strokeWidth="1.5" fill="none" />
            </svg>
          )
        })() : null}
      </div>
    ) : null}
    </div>
    <div>
    <CardTitle

      //title='Charts'
      //titleStyle={{ fontSize : '12pt', lineHeight : '1em' }}
      subtitle='Edges repartition (how often the band has followed the same route)'
      subtitleStyle={{ fontSize : '9pt', lineHeight : '1.2em', color: '#F2EFE9' }}
  />
  <C3Chart
  data={data2}
  color={c3Colors}
  key={`edges-${this._edgesBinsKey || 'none'}`}
  legend={legendEdges}
  title={"edges"}
  dataLabels={{ show: false }}
  legendPosition="right"
  tooltip={{ grouped: false }}
  axis={{ x: { show: false }, y: { show: false } }}
  onContainer={(el) => { this._edgesContainer = el }}
  onReady={(chart) => { this._edgesChart = chart }}
  style={{



  size: { width :10}
  }}
  />
  {/* Show compact stats summary for edges */}
  {this._stats && this._stats.edges ? (
    <div style={{ color:'#F2EFE9', fontSize:'9pt', marginTop: 8 }}>
      <strong>Edges stats:</strong>
      <span style={{ marginLeft: 8 }}>n={this._stats.edges.n}</span>
      <span style={{ marginLeft: 8 }}>mean={Number(this._stats.edges.mean).toFixed(3)}</span>
      <span style={{ marginLeft: 8 }}>sd={Number(this._stats.edges.stdev || 0).toFixed(3)}</span>
      <span style={{ marginLeft: 8 }}>p25={this._stats.edges.p25 != null ? Number(this._stats.edges.p25).toFixed(2) : '—'}</span>
      <span style={{ marginLeft: 8 }}>p50={this._stats.edges.median != null ? Number(this._stats.edges.median).toFixed(2) : '—'}</span>
      <span style={{ marginLeft: 8 }}>p75={this._stats.edges.p75 != null ? Number(this._stats.edges.p75).toFixed(2) : '—'}</span>
      {showT ? (
        <>
          <span style={{ marginLeft: 8 }}>t≈{this._stats.edges.t != null ? Number(this._stats.edges.t).toFixed(3) : '—'}</span>
          <span style={{ marginLeft: 8 }}>p≈{this._stats.edges.p != null ? Number(this._stats.edges.p).toExponential(2) : '—'}</span>
        </>
      ) : null}
      {showChi2 && this._stats.chi2 && this._stats.chi2.edges ? (
        <span style={{ marginLeft: 8 }}>chi2={JSON.stringify(this._stats.chi2.edges)}</span>
      ) : null}
      {/* sparkline for edges */}
      {Array.isArray(resweigEdges) && resweigEdges.length > 0 ? (() => {
        const numeric = resweigEdges.filter(v => typeof v === 'number' && isFinite(v))
        const s = buildSparklinePath(numeric)
        return (
          <svg width={s.width} height={s.height} style={{ marginLeft: 8, verticalAlign: 'middle' }}>
            <path d={s.path} stroke="#FFCC80" strokeWidth="1.5" fill="none" />
          </svg>
        )
      })() : null}
    </div>
  ) : null}
</div>
<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, margin: '18px 0 46px', flexWrap: 'wrap' }}>
  {/* Controls */}
  <div style={{ display: 'flex', alignItems: 'center', gap: 10, color:'#F2EFE9' }}>
    <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      alpha
      <input type="number" step="0.005" min="0.0001" max="0.5" value={alpha} onChange={(e)=> this.setState({ alpha: Math.max(0.0001, Math.min(0.5, Number(e.target.value) || 0.05)) })} style={{ width: 70, padding: '2px 4px', background: '#263238', color:'#F2EFE9', border:'1px solid #455A64' }} />
    </label>
    <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <input type="checkbox" checked={showT} onChange={(e)=> this.setState({ showT: !!e.target.checked })} /> t-test
    </label>
    <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <input type="checkbox" checked={showChi2} onChange={(e)=> this.setState({ showChi2: !!e.target.checked })} /> chi-square
    </label>
  </div>
  <Button
    variant="contained"
    onClick={this.unselectAllElements}
    sx={{
      bgcolor: '#546E7A',
      color: '#F2EFE9',
      boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
      height: 40,
      lineHeight: '40px',
      px: 2,
      borderRadius: 1,
      fontSize: '12pt',
      fontWeight: 'bold',
      letterSpacing: '0.3px',
      '&:hover': { bgcolor: '#455A64' }
    }}
  >
    Reset selection
  </Button>
  <Button
    variant="outlined"
    onClick={() => {
      // Export current nodes chart as PNG; best-effort
      try {
        const container = this._nodesContainer
        if (!container) return
        const svg = container.querySelector('svg')
        if (!svg) return
        const clone = svg.cloneNode(true)
        // Inline styles for better fidelity may be added here if needed
        const xml = new XMLSerializer().serializeToString(clone)
        const svgBlob = new Blob([xml], { type: 'image/svg+xml;charset=utf-8' })
        const url = URL.createObjectURL(svgBlob)
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          canvas.width = img.width
          canvas.height = img.height
          const ctx = canvas.getContext('2d')
          ctx.drawImage(img, 0, 0)
          URL.revokeObjectURL(url)
          canvas.toBlob((blob) => {
            const a = document.createElement('a')
            a.href = URL.createObjectURL(blob)
            a.download = 'nodes-chart.png'
            a.click()
          }, 'image/png')
        }
        img.src = url
      } catch (_) {}
    }}
    sx={{ color:'#F2EFE9', borderColor:'#546E7A', height: 40 }}
  >
    Export PNG
  </Button>
</div>



    </Popup>


)
}

}

export default Charts

/*  <div>

  <Range

          style={{ zIndex : 100 }}
          value={this.props.ui.valueRangeWeight}
          min={this.props.minWeight}
          max={this.props.maxWeight}
          //defaultValue={[ 1281214800000, 1284866786842 ]}
          step={1}
          //marks={marksWeight}
          // tipFormatter={dateFormatter}
          tipProps={{ overlayClassName: 'foo' }}
          //onClick={this.onSliderWChange}
          onChange={this.onSliderWChange}
          //pushable={true}
          allowCross={true}


          />



  </div>*/
