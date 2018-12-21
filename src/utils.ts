import { calculateRangeProjection } from './calculations'
import {
  Attributes,
  Range,
  RangesConstraint,
  Viewport,
  ViewportCoordinate
} from './types'

export function throttle<T extends (...args: any[]) => any>(fn: T, time: number): T {
  let pending = false

  const throttled = (...args: any[]) => {
    if (pending) return
    pending = true
    setTimeout(() => {
      fn(...args)
      pending = false
    }, time)
  }

  return throttled as T
}

export function createSVGElement(type: string, attributes: Attributes = {}): SVGElement {
  const el = window.document.createElementNS('http://www.w3.org/2000/svg', type)
  setAttributes(el, attributes)
  return el
}

export function createElement(type: string, attributes: Attributes = {}): HTMLElement {
  const el = window.document.createElement(type)
  setAttributes(el, attributes)
  return el
}

export function setAttributes(el: SVGElement | HTMLElement, attributes: Attributes = {}) {
  Object.keys(attributes).forEach(key => el.setAttribute(key, attributes[key].toString()))
}

export function convertToPath(coordinates: ViewportCoordinate[]): string {
  const head = coordinates[0]
  const tail = coordinates.slice(1)

  return [
    `M ${head[0]} ${head[1]}`
  ].concat(
    tail.map(pair => `L ${pair[0]} ${pair[1]}`)
  ).join(',')
}

export function convertToCoordinates(
  samples: number[],
  viewport: Viewport,
  rangesConstraint: RangesConstraint
): ViewportCoordinate[] {
  return samples.map((sample: number, index: number) => {
    return convertToCoordinate(index, sample, viewport, rangesConstraint)
  })
}

export function convertToCoordinate(
  x: number,
  y: number,
  viewport: Viewport,
  rangesConstraint: RangesConstraint
): ViewportCoordinate {

  const yByViewport: Range = { min: 0, max: viewport.height }
  const xByViewport: Range =  { min: 0, max: viewport.width }

  return [
    calculateRangeProjection(rangesConstraint.xValues, xByViewport, x),
    // For y axis - we need to invert the coordinate as SVG starts from the top-left corner.
    viewport.height - calculateRangeProjection(rangesConstraint.yValues, yByViewport, y)
  ]
}

export function formatNumber(value: number): string {
  const coefficient = Math.pow(10, value.toString().length - 1)

  if (coefficient >= 1000000000000) return (value / 1000000000000).toString() + 't'
  if (coefficient >= 1000000000) return (value / 1000000000).toString() + 'b'
  if (coefficient >= 1000000) return (value / 1000000).toString() + 'm'
  if (coefficient >= 1000) return (value / 1000).toString() + 'k'
  return value.toString()
}
