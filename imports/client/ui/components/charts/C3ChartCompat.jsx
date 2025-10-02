import React, { useEffect, useRef } from 'react'
import c3 from 'c3'

// Lightweight React 18-compatible wrapper for c3
// Props supported: data, color, legend, size, title, className, style, onReady
export default function C3ChartCompat({ data, color, legend, size, title, className, style, onReady }) {
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

    const options = {
      bindto: ref.current,
      data,
      color,
      legend,
      size,
    }

    // If donut chart, map title prop to c3's donut.title
    if (data && (data.type === 'donut' || (Array.isArray(data.types) && data.types.includes('donut'))) && title) {
      options.donut = Object.assign({}, options.donut, { title: String(title) })
    }

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
  }, [data, color, legend, size])

  // Nudge chart on window resize in case container listener is unavailable
  useEffect(() => {
    const handler = () => { try { chartRef.current && chartRef.current.flush() } catch (e) {} }
    if (typeof window !== 'undefined') window.addEventListener('resize', handler)
    return () => { if (typeof window !== 'undefined') window.removeEventListener('resize', handler) }
  }, [])

  return (
    <div className={className} style={style} role="img" aria-label={title ? String(title) : 'chart'}>
      {title ? <div className="c3-title" style={{ marginBottom: 6 }}>{String(title)}</div> : null}
      <div ref={ref} />
    </div>
  )
}
