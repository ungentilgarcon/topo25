// Legacy C3 wrapper removed during Recharts migration.
// This stub remains only to avoid import churn; it renders nothing.
import React from 'react'
export default function C3ChartCompat() {
  if (process && process.env && process.env.NODE_ENV !== 'production') {
    try { console.warn('C3ChartCompat is deprecated and no longer used.'); } catch (e) {}
  }
  return null
}
