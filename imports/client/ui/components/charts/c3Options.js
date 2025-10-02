// Testable builder for c3.generate options
// Accepts a props-like object and returns the options passed to c3.generate

function buildC3Options({
  bindto,
  data,
  color,
  legend,
  size,
  title,
  // Additional optional configs
  axis,
  tooltip,
  grid,
  interaction,
  padding,
  transition,
  pie,
  donut,
  // Event hooks
  oninit,
  onrender,
  onmouseover,
  onmouseout,
  onresize,
  onresized,
} = {}) {
  const opts = {
    bindto,
    data,
    color,
    legend,
    size,
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
  }

  // Donut title convenience when using donut chart type
  try {
    const isDonut = data && (data.type === 'donut' || (Array.isArray(data.types) && data.types.indexOf('donut') >= 0))
    if (isDonut && title) {
      opts.donut = Object.assign({}, opts.donut, { title: String(title) })
    }
  } catch (_) {}

  return opts
}

module.exports = { buildC3Options }
