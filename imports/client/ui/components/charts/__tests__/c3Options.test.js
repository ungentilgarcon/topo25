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

  it('merges dataLabels into data.labels', () => {
    const opts = buildC3Options({ data: { columns: [] }, dataLabels: { format: (v) => String(v) } })
    expect(opts.data).to.have.property('labels')
    expect(opts.data.labels).to.be.an('object')
    expect(opts.data.labels).to.have.property('format')
  })

  it('sets legendPosition via convenience prop without overwriting legend object', () => {
    const opts = buildC3Options({ data: { columns: [] }, legend: { show: true }, legendPosition: 'right' })
    expect(opts.legend && opts.legend.show).to.equal(true)
    expect(opts.legend && opts.legend.position).to.equal('right')
  })
})

describe.skip('buildC3Options (deprecated)', () => {
  it('is deprecated and throws', () => {
    expect(() => buildC3Options({})).toThrow()
  })
})
