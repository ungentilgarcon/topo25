const { expect } = require('chai')
const { buildC3Options } = require('../c3Options')

describe('buildC3Options', () => {
  it('builds basic options and maps donut title', () => {
    const opts = buildC3Options({
      bindto: '#el',
      data: { type: 'donut', columns: [['a', 1]] },
      title: 'My Donut',
      legend: { show: true },
    })
    expect(opts.bindto).to.equal('#el')
    expect(opts.data && opts.data.type).to.equal('donut')
    expect(opts.legend && opts.legend.show).to.equal(true)
    expect(opts.donut && opts.donut.title).to.equal('My Donut')
  })

  it('passes through axis and tooltip configs', () => {
    const axis = { x: { show: false }, y: { show: false } }
    const tooltip = { grouped: false }
    const opts = buildC3Options({ data: { columns: [] }, axis, tooltip })
    expect(opts.axis).to.deep.equal(axis)
    expect(opts.tooltip).to.deep.equal(tooltip)
  })
})
