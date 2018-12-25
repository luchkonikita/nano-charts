export type Settings = {
  cssClassName: string
  strokeColor: string
  gridColor: string
  labelFontSize: number
  maxLabelHeight: number
  maxLabelWidth: number
  minContainerHeight: number
  mousemoveTimeout: number
  overlayOverlap: number
  paddingH: number
  paddingV: number
  pointHoverRadius: number
  pointRadius: number
  resizeTimeout: number
  tooltipOffsetX: number
  xGridOverflowSize: number
  yGridOverflowSize: number
}

export type Range = {
  min: number
  max: number
}

export type ChartData = {
  labels: string[]
  samples: {
    [index: string]: number[]
  }
  options?: {
    // TODO: Write better type
    [index: string]: {
      stroke?: string
      fill?: string
    }
  }
}

export type ViewportCoordinate = [number, number]

export type Viewport = {
  height: number
  width: number
}

export type RangesConstraint = {
  yValues: Range,
  xValues: Range
}

export type Attributes = {
  [index: string]: string | number
}

export type TooltipRendererSample = {
  key: string
  value: string
  color: string
}

export type TooltipRenderer = (label: string, samples: TooltipRendererSample[]) => string
