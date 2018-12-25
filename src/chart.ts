import { getRangesConstraint, getValuesForRange } from './calculations'
import DEFAULTS from './defaults'
import Tooltip, { defaultTooltipRenderer } from './tooltip'
import {
  ChartData,
  TooltipRendererSample,
  ViewportCoordinate
} from './types'
import {
  convertToCoordinate,
  convertToCoordinates,
  convertToPath,
  createElement,
  createSVGElement,
  formatNumber,
  setAttributes,
  throttle
} from './utils'

function reduceCollection<T>(collection: T[]): T[] {
  return collection.reduce((memo, item, index) => {
    if (index === 0 || index % 2 === 0) memo.push(item)
    return memo
  }, [] as T[])
}

function mapLabel(label: string | number, index: number) {
  return {label, index}
}

function createStylesheet(settings = DEFAULTS): HTMLStyleElement {
  const {
    cssClassName,
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
      line-height: ${DEFAULTS.maxLabelHeight};
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
      transition-delay: 150ms;
      transition-duration: 150ms;
      transition-property: opacity;
    }
    .${cssClassName}-tooltip.is-visible {
      opacity: 1;
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

export default class Chart {

  private get rangesConstraint() {
    return getRangesConstraint(this.data)
  }

  private get paddedViewport() {
    return {
      height: this.height - (DEFAULTS.paddingV * 2),
      width: this.width - (DEFAULTS.paddingH * 2)
    }
  }

  private get height() {
    return this.clientRect.height
  }

  private get width() {
    return this.clientRect.width
  }

  private get clientRect() {
    if (!this.cachedClientRect) this.cachedClientRect = this.el.getBoundingClientRect()
    return this.cachedClientRect
  }

  private resizeHandler = throttle(() => {
    this.resetCache()
    this.setSize()
    this.render()
  }, DEFAULTS.resizeTimeout)

  // TODO: Calculations in this function can be nicely cached...
  private mousemoveHandler = throttle((e: MouseEvent) => {
    if (!this.hovered) return

    const {
      clientRect,
      data,
      getIndexForXOffset,
      getSamplesForIndex,
      hoverCirclesAtIndex,
      paddedViewport,
      rangesConstraint,
      tooltip
    } = this

    const index = getIndexForXOffset(e.clientX)
    if (index < 0) return

    const label = data.labels[index]
    const {samples, values} = getSamplesForIndex(index)

    tooltip.update(label, samples)

    const meanValue = values.reduce((memo: number, current: number) => memo += current, 0) / values.length
    const coordinates = convertToCoordinate(index, meanValue, paddedViewport, rangesConstraint)

    const tooltipRect = tooltip.getBoundingClientRect()

    let x = coordinates[0] + DEFAULTS.paddingH + DEFAULTS.tooltipOffsetX
    let y = coordinates[1] + DEFAULTS.paddingV - tooltipRect.height / 2

    // Make sure the tooltip is not overlapping the chart:
    // 1. Stick to the top if needed
    if (y < 0) {
      y = 0
    }
    // 2. Stick to the bottom if needed
    if (y + tooltipRect.height > clientRect.height) {
      y = clientRect.height - tooltipRect.height
    }
    // 3. Flip to the left if needed
    if (x + tooltipRect.width > clientRect.width) {
      x = x - tooltipRect.width - DEFAULTS.tooltipOffsetX * 2
    }

    hoverCirclesAtIndex(index)
    tooltip.moveTo(x, y)
  }, DEFAULTS.mousemoveTimeout)

  // Elements
  private el: HTMLElement
  private svg: SVGElement
  private mainArea: SVGElement
  private expandedArea: SVGElement
  private tooltip: Tooltip
  private style: HTMLStyleElement
  private hoverOverlay: HTMLDivElement
  private destroyed = false

  // Data
  private data: ChartData = {
    labels: [],
    samples: {}
  }

  // Misc, caching, etc...
  private cachedClientRect?: ClientRect
  private hovered = false
  private hoveredIndex = -1
  private points: SVGCircleElement[][] = []

  constructor(el: HTMLElement, data?: ChartData) {
    this.el = el
    // TODO: Avoid touching the wrapper if possible.
    if (!el.style.height) el.style.height = DEFAULTS.minContainerHeight + 'px'
    if (!el.style.position) el.style.position = 'relative'

    // Render SVG
    this.svg = createSVGElement('svg', {class: DEFAULTS.cssClassName})
    this.el.appendChild(this.svg)

    // Render main chart area
    this.mainArea = createSVGElement('g', {transform: `translate(${DEFAULTS.paddingH}, ${DEFAULTS.paddingV})`})
    this.svg.appendChild(this.mainArea)

    // Render expanded area
    this.expandedArea = createSVGElement('g')
    this.svg.appendChild(this.expandedArea)

    // Render the tooltip

    this.tooltip = new Tooltip(defaultTooltipRenderer)
    this.el.appendChild(this.tooltip.el)

    // Render overlay for hover events tracking
    this.hoverOverlay = createElement('div', {class: DEFAULTS.cssClassName + '-overlay'}) as HTMLDivElement
    this.el.appendChild(this.hoverOverlay)

    // Render CSS
    this.style = createStylesheet()
    this.el.appendChild(this.style)

    this.resetCache()
    this.setSize()
    this.setHandlers()

    if (data) this.setData(data)
  }

  setData(data: ChartData) {
    this.data = data
    this.render()
  }

  destroy() {
    const {
      el,
      destroyed,
      hoverOverlay,
      mouseenterHandler,
      mouseleaveHandler,
      mousemoveHandler,
      resizeHandler,
      style,
      svg,
      tooltip
    } = this

    // Do nothing if the instance was previously destroyed
    if (destroyed) return

    window.removeEventListener('resize', resizeHandler)
    hoverOverlay.removeEventListener('mouseenter', mouseenterHandler)
    hoverOverlay.removeEventListener('mouseleave', mouseleaveHandler)
    hoverOverlay.removeEventListener('mousemove', mousemoveHandler)

    el.removeChild(svg)
    el.removeChild(tooltip.el)
    el.removeChild(hoverOverlay)
    el.removeChild(style)

    this.destroyed = true
    // TODO: Check if there's anything missing.
  }

  private setHandlers() {
    window.addEventListener('resize', this.resizeHandler)
    this.hoverOverlay.addEventListener('mouseenter', this.mouseenterHandler)
    this.hoverOverlay.addEventListener('mouseleave', this.mouseleaveHandler)
    this.hoverOverlay.addEventListener('mousemove', this.mousemoveHandler)
  }

  private mouseenterHandler = (e: MouseEvent) => {
    this.hovered = true
    this.tooltip.show()
  }

  private mouseleaveHandler = (e: MouseEvent) => {
    this.hovered = false
    this.tooltip.hide()
  }

  private setSize() {
    setAttributes(this.svg, {
      height: this.height,
      width: this.width,
      viewBox: `0 0 ${this.width} ${this.height}`
    })
  }

  private resetCache() {
    this.cachedClientRect = undefined
    this.mainArea.innerHTML = ''
    this.expandedArea.innerHTML = ''
    this.points = []
  }

  private render() {
    const {rangesConstraint} = this

    // Prepare labels
    let xLabels = this.data.labels.map(mapLabel)
    let yLabels = getValuesForRange(rangesConstraint.yValues).map(mapLabel)

    const totalXLabels = xLabels.length
    const totalYLabels = yLabels.length

    const getAvailableWidth = () => this.width - (DEFAULTS.paddingH * 2) + (DEFAULTS.xGridOverflowSize * 2)
    const getAvailableHeight = () => this.height - (DEFAULTS.paddingV * 2) + (DEFAULTS.yGridOverflowSize * 2)
    const getUsedWidth = () => xLabels.length * DEFAULTS.maxLabelWidth
    const getUsedHeight = () => yLabels.length * DEFAULTS.maxLabelHeight

    // Reduce the number of labels if they cannot fit
    while (getUsedWidth() > getAvailableWidth()) {
      xLabels = reduceCollection(xLabels)
    }

    while (getUsedHeight() > getAvailableHeight()) {
      yLabels = reduceCollection(yLabels)
    }

    xLabels.forEach(labelData => {
      const offset = this.paddedViewport.width / (totalXLabels - 1) * labelData.index
      this.drawXLabel(labelData.label as string, offset + DEFAULTS.paddingH)
      this.drawGridXLine(offset)
    })

    yLabels.forEach(labelData => {
      const offset = this.paddedViewport.height / (totalYLabels - 1) * labelData.index
      this.drawYLabel(formatNumber(labelData.label as number), offset - DEFAULTS.paddingV)
      this.drawGridYLine(offset)
    })

    // Draw data lines
    Object.keys(this.data.samples).forEach(key => {
      const samples = this.data.samples[key]
      const coordinates = convertToCoordinates(samples, this.paddedViewport, rangesConstraint)
      const strokeColor = this.getStrokeColorFor(key)
      const fillColor = this.getFillColorFor(key)

      this.drawDataLine(coordinates, strokeColor)

      const points = this.drawDataPoints(coordinates, strokeColor)

      // Store the points so they can be highlighted later.
      points.forEach((point: SVGCircleElement, index: number) => {
        if (!this.points[index]) this.points[index] = []
        this.points[index].push(point)
      })

      // Fill the polygon with the color only is specified.
      if (!fillColor) return
      const areaCoordinates = coordinates.concat([
        convertToCoordinate(samples.length - 1, 0, this.paddedViewport, rangesConstraint),
        convertToCoordinate(0, 0, this.paddedViewport, rangesConstraint)
      ])
      this.drawDataArea(areaCoordinates, fillColor)
    })
  }

  private drawXLabel(label: string, offset: number): SVGTextElement {
    const {paddedViewport, expandedArea} = this
    const text = createSVGElement('text', {
      'font-size': DEFAULTS.labelFontSize,
      'x': offset,
      'y': (paddedViewport.height + DEFAULTS.paddingV * 1.5), // Place in the middle of the bottom padding area
      'text-anchor': 'middle',
      'alignment-baseline': 'middle'
    }) as SVGTextElement

    text.textContent = label

    expandedArea.appendChild(text)
    this.truncateLabel(text, DEFAULTS.maxLabelWidth)

    return text
  }

  private drawYLabel(label: string, offset: number): SVGTextElement {
    const {paddedViewport, expandedArea} = this
    const text = createSVGElement('text', {
      'font-size': DEFAULTS.labelFontSize,
      'y': (paddedViewport.height - offset),
      'x': (DEFAULTS.paddingH / 2),
      'text-anchor': 'end',
      'alignment-baseline': 'middle'
    }) as SVGTextElement

    text.textContent = label
    expandedArea.appendChild(text)

    return text
  }

  private drawDataLine(
    coordinates: ViewportCoordinate[],
    color: string
  ): SVGPathElement {
    const {mainArea} = this
    const line = createSVGElement('path', {
      'stroke-width': 1,
      'fill': 'transparent',
      'stroke': color,
      'd': convertToPath(coordinates)
    }) as SVGPathElement

    mainArea.appendChild(line)
    return line
  }

  private drawDataArea(
    coordinates: ViewportCoordinate[],
    color: string
  ): SVGPathElement {
    const {mainArea} = this
    const area = createSVGElement('path', {
      'stroke-width': 1,
      'fill': color,
      'stroke': 'transparent',
      'd': convertToPath(coordinates)
    }) as SVGPathElement

    mainArea.appendChild(area)
    return area
  }

  private drawDataPoints(
    coordinates: ViewportCoordinate[],
    color: string
  ): SVGCircleElement[] {
    const {mainArea} = this
    const points: SVGCircleElement[] = []

    // Draw points
    coordinates.forEach(coordinate => {
      const circle = createSVGElement('circle', {
        r: DEFAULTS.pointRadius,
        fill: color,
        cx: coordinate[0],
        cy: coordinate[1]
      }) as SVGCircleElement

      mainArea.appendChild(circle)
      points.push(circle)
    })

    return points
  }

  private drawGridXLine(offset: number): SVGLineElement {
    const {paddedViewport, mainArea} = this
    const line = createSVGElement('line', {
      x1: offset,
      x2: offset,
      y1: -DEFAULTS.yGridOverflowSize,
      y2: (paddedViewport.height + DEFAULTS.yGridOverflowSize),
      stroke: DEFAULTS.gridColor
    }) as SVGLineElement

    mainArea.appendChild(line)
    return line
  }

  private drawGridYLine(offset: number): SVGLineElement {
    const {paddedViewport, mainArea} = this
    const line = createSVGElement('line', {
      x1: -DEFAULTS.xGridOverflowSize,
      x2: (paddedViewport.width + DEFAULTS.xGridOverflowSize),
      y1: (paddedViewport.height - offset),
      y2: (paddedViewport.height - offset),
      stroke: DEFAULTS.gridColor
    }) as SVGLineElement

    mainArea.appendChild(line)
    return line
  }

  private truncateLabel(labelEl: SVGTextElement, maxLabelWidth: number) {
    const defaultText = labelEl.textContent || ''
    let truncatedSymbols = 0

    while (maxLabelWidth < labelEl.textLength.baseVal.value) {
      truncatedSymbols++
      labelEl.textContent = defaultText.slice(0, defaultText.length - truncatedSymbols) + '...'

      if (truncatedSymbols === defaultText.length) {
        break
      }
    }
  }

  private hoverCirclesAtIndex = (index: number) => {
    const {hoveredIndex, points} = this
    const hoveredBefore = points[hoveredIndex]
    if (hoveredBefore) hoveredBefore.forEach(point => setAttributes(point, { r: DEFAULTS.pointRadius }))
    const hoveredPoints = points[index]
    hoveredPoints.forEach(point => setAttributes(point, { r: DEFAULTS.pointHoverRadius }))
    this.hoveredIndex = index
  }

  private getOptionsFor = (dataset: string) => {
    return this.data.options && this.data.options[dataset]
  }

  private getStrokeColorFor = (dataset: string) => {
    const options = this.getOptionsFor(dataset)
    return options && options.stroke || DEFAULTS.strokeColor
  }

  private getFillColorFor = (dataset: string) => {
    const options = this.getOptionsFor(dataset)
    return options && options.fill
  }

  // Get the closest metrics index for the chosen X position
  private getIndexForXOffset = (xOffset: number) => {
    const position = xOffset - DEFAULTS.paddingH - this.clientRect.left
    const total = this.paddedViewport.width
    const maxIndex = this.data.labels.length - 1
    const percentage = Math.ceil(position / total * 100)
    if (percentage < 0) return 0
    if (percentage > 100) return maxIndex
    return Math.round(maxIndex / 100 * percentage)
  }

  private getSamplesForIndex = (index: number) => {
    const {data, getStrokeColorFor} = this
    const values: number[] = []
    const samples: TooltipRendererSample[] = []

    Object.keys(data.samples).forEach(key => {
      const value = data.samples[key][index]
      const color = getStrokeColorFor(key)
      samples.push({color, key, value: value.toString()})
      values.push(value)
    })

    return {samples, values}
  }
}
