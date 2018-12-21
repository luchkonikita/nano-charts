import Chart from '../src/chart'
import { ChartData } from '../src/types'
import { createMockDiv, resizeMockDiv } from './helpers'

const chartData: ChartData = {
  labels: ['January', 'February', 'March'],
  samples: {
    'Metric A': [0, 5, 10],
    'Metric B': [-10, 5, 20]
  },
  options: {
    'Metric A': {
      color: 'violet'
    }
  }
}

describe('Chart', () => {
  let element: HTMLElement
  let chart: Chart

  beforeEach(() => {
    // HACK: jsdom does not implement this, so we need to mimic the browser behaviour.
    // Let's say each character spans 5 pixels regardless of font settings and other circumstances.
    Object.defineProperty(SVGElement.prototype, 'textLength', {
      configurable: true,
      get() {
        const imaginaryCharWidth = 10
        const charCount = this.textContent.length
        return {baseVal: {value: charCount * imaginaryCharWidth}}
      }
    })

    window.document.body.innerHTML = ''
    element = createMockDiv(1000, 200)
    window.document.body.appendChild(element)
    chart = new Chart(element)
  })

  afterEach(() => {
    chart.destroy()
  })

  describe('initialization', () => {
    it('appends the SVG', () => {
      expect(element).toMatchSnapshot()
    })
  })

  describe('setData', () => {
    it('sets the data', () => {
      chart.setData(chartData)
      expect(element).toMatchSnapshot()
    })
  })

  describe('destroy', () => {
    it('cleans up the target node', () => {
      chart.destroy()
      expect(element).toMatchSnapshot()
    })
  })

  describe('resize', () => {
    it('re-calculates the coordinates', done => {
      chart.setData(chartData)
      resizeMockDiv(element as HTMLDivElement, 800, 200)
      window.dispatchEvent(new Event('resize'))

      setTimeout(() => {
        expect(element).toMatchSnapshot()
        done()
      }, 400)
    })
  })

  describe('mouseenter and mouseleave', () => {
    it('sets flags', () => {
      chart.setData(chartData)
      const overlay = element.querySelector('.nano-charts-overlay') as HTMLElement
      const tooltip = element.querySelector('.nano-charts-tooltip') as HTMLElement

      expect(tooltip.className).not.toContain('is-visible')

      overlay.dispatchEvent(new Event('mouseenter'))
      expect(tooltip.className).toContain('is-visible')

      overlay.dispatchEvent(new Event('mouseleave'))
      expect(tooltip.className).not.toContain('is-visible')
    })
  })

  describe('mousemove', () => {
    it('highlights the metrics in the hovered are', async () => {
      chart.setData(chartData)
      const overlay = element.querySelector('.nano-charts-overlay') as HTMLElement

      async function assertRadiuses(asserted: string[]) {
        return new Promise(resolve => {
          setTimeout(() => {
            const circles = element.querySelectorAll('circle')
            const radiuses = Array.prototype.map.call(circles, (circle: SVGCircleElement) => circle.getAttribute('r'))
            expect(radiuses).toStrictEqual(asserted)
            resolve()
          }, 400)
        })
      }

      overlay.dispatchEvent(new MouseEvent('mouseenter'))
      overlay.dispatchEvent(new MouseEvent('mousemove', { clientX: 0 }))
      await assertRadiuses(['4', '2', '2', '4', '2', '2'])

      overlay.dispatchEvent(new MouseEvent('mousemove', { clientX: 500 }))
      await assertRadiuses(['2', '4', '2', '2', '4', '2'])

      overlay.dispatchEvent(new MouseEvent('mousemove', { clientX: 1000 }))
      await assertRadiuses(['2', '2', '4', '2', '2', '4'])
    })

    it.skip('renders the tooltip with relevant data', () => {
      // Implement this...
    })
  })
})
