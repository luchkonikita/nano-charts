import { calculateRangeProjection } from './calculations'
import {
  Attributes,
  Range,
  RangesConstraint,
  Settings,
  Viewport,
  ViewportCoordinate
} from './types'

export function throttle<T extends (...args: any[]) => any>(fn: T, time: number): T {
  let pending = false

  const throttled = (...args: any[]) => {
    if (pending) return
    pending = true

    fn(...args)

    setTimeout(() => {
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
  ).join(' ')
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

export function reduceCollection<T>(collection: T[]): T[] {
  return collection.reduce((memo, item, index) => {
    if (index === 0 || index % 2 === 0) memo.push(item)
    return memo
  }, [] as T[])
}

export function mapLabel(label: string | number, index: number) {
  return {label, index}
}

export function createStylesheet(settings: Settings): HTMLStyleElement {
  const {
    cssClassName,
    maxLabelHeight,
    overlayOverlap,
    paddingH,
    paddingV
  } = settings

  const stylesheet = document.createElement('style')
  stylesheet.innerHTML = `
    .${cssClassName} {
      font-family:Arial, Helvetica, sans-serif;
    }
    .${cssClassName}-label {
      line-height: ${maxLabelHeight};
    }
    .${cssClassName}-legend {
      background-color: #f9f9f9;
      display: flex;
      font-family:Arial, Helvetica, sans-serif;
      font-size: 12px;
      flex-wrap: wrap;
      justify-content: center;
      padding: 10px;
    }
    .${cssClassName}-legend-item {
      margin: 0 10px;
    }
    .${cssClassName}-legend-item-badge {
      border-radius: 4px;
      display: inline-block;
      height: 8px;
      margin-right: 6px;
      position: relative;
      width: 8px;
    }
    .${cssClassName}-legend-item-badge:before {
      background-color: currentColor;
      content: '';
      display: block;
      height: 2px;
      left: -3px;
      position: absolute;
      top: 3px;
      width: 14px;
    }
    .${cssClassName}-tooltip {
      background-color: rgba(0, 0, 0, 0.8);
      border: 1px solid #000;
      border-radius: 2px;
      color: #fafafa;
      font-family:Arial, Helvetica, sans-serif;
      font-size: 12px;
      left: 0;
      line-height: 16px;
      opacity: 0;
      padding: 16px;
      pointer-events: none;
      position: absolute;
      top: 0;
    }
    .${cssClassName}-tooltip.is-visible {
      opacity: 1;
    }
    .${cssClassName}-tooltip.is-visible:empty {
      opacity: 0;
    }
    .${cssClassName}-overlay {
      bottom: ${paddingV - overlayOverlap}px;
      left: ${paddingH - overlayOverlap}px;
      position: absolute;
      right: ${paddingH - overlayOverlap}px;
      top: ${paddingV - overlayOverlap}px;
    }
    .${cssClassName}-title {
      font-weight: 600;
      margin: 0 0 8px 0;
    }
    .${cssClassName}-item {
      margin: 0;
    }
    .${cssClassName}-badge {
      border-radius: 4px;
      display: inline-block;
      height: 8px;
      margin-right: 4px;
      width: 8px;
    }
  `
  return stylesheet
}
