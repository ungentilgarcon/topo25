import React, { useEffect, useRef } from 'react'
import c3 from 'c3'
import { buildC3Options } from './c3Options'

// Lightweight React 18-compatible wrapper for c3
// Props supported: data, color, legend, size, title, className, style, onReady
export default function C3ChartCompat({
  data,
  color,
  legend,
  size,
  title,
  className,
  style,
  onReady,
  // Convenience props
  dataLabels,
  legendPosition,
  // Provide access to container element for export features
  onContainer,
  // Additional c3 config passthroughs
  axis,
  tooltip,
  grid,
  interaction,
  padding,
  transition,
  pie,
  donut,
  oninit,
  onrender,
  onmouseover,
  onmouseout,
  onresize,
  onresized,
}) {
  const ref = useRef(null)
  const chartRef = useRef(null)

  // Resize observer to keep chart responsive to container size changes
  useEffect(() => {
    if (!ref.current) return
    let ro
    try {
      ro = new ResizeObserver(() => {
        try { chartRef.current && chartRef.current.resize() } catch (e) {}
      })
      ro.observe(ref.current)
    } catch (e) {
      // ResizeObserver not available; fallback to window resize below
    }
    return () => { if (ro) try { ro.disconnect() } catch (e) {} }
  }, [])

  useEffect(() => {
    // Destroy previous instance before creating a new one
    if (chartRef.current) {
      try { chartRef.current.destroy() } catch (e) {}
      chartRef.current = null
    }

    const options = buildC3Options({
      bindto: ref.current,
      data,
      color,
      legend,
      size,
      title,
      dataLabels,
      legendPosition,
      axis,
      tooltip,
      grid,
      interaction,
      padding,
      transition,
      pie,
      donut,
      oninit,
      onrender,
      onmouseover,
      onmouseout,
      onresize,
      onresized,
    })

    try {
      chartRef.current = c3.generate(options)
      if (typeof onReady === 'function') {
        try { onReady(chartRef.current) } catch (e) {}
      }
    } catch (e) {
      // fail silently; component using this should handle missing chart
    }

    return () => {
      if (chartRef.current) {
        try { chartRef.current.destroy() } catch (e) {}
        chartRef.current = null
      }
    }
    // Recreate chart whenever inputs change; objects are new most renders in caller
  }, [data, color, legend, size, title, axis, tooltip, grid, interaction, padding, transition, pie, donut, oninit, onrender, onmouseover, onmouseout, onresize, onresized])

  // Nudge chart on window resize in case container listener is unavailable
  useEffect(() => {
    const handler = () => { try { chartRef.current && chartRef.current.flush() } catch (e) {} }
    if (typeof window !== 'undefined') window.addEventListener('resize', handler)
    return () => { if (typeof window !== 'undefined') window.removeEventListener('resize', handler) }
  }, [])

  // Expose container element for export/download use-cases
  useEffect(() => {
    if (typeof onContainer === 'function' && ref.current) {
      try { onContainer(ref.current) } catch (e) {}
    }
  }, [onContainer, ref.current])

  return (
    <div className={className} style={style} role="img" aria-label={title ? String(title) : 'chart'}>
      {title ? <div className="c3-title" style={{ marginBottom: 6 }}>{String(title)}</div> : null}
      <div ref={ref} />
    </div>
  )
}
