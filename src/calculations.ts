import {
  ChartData,
  Range,
  RangesConstraint
} from './types'

export function getValuesForRange(range: Range): number[] {
  const diff = range.max - range.min

  // Don't bother with prettifying too small numbers
  if (diff < 1) return [range.min, range.max]

  // Define default step which is diff divided by 10
  let steps = 2
  let step = diff / steps

  // Dividers considered nice, values like 0, 5, 10, 15 are usually looking good
  const dividers = [2, 5]

  // Try applying them all, splitting in smaller parts will win
  dividers.forEach(divider => {
    for (let index = 1; index <= 10; index++) {
      const maybeBetterStep = diff / index
      const isDividable = maybeBetterStep % divider === 0

      if (isDividable) {
        steps = index
        step = maybeBetterStep
      }
    }
  })

  let current = range.min
  const result = [range.min]

  // We need to fill the range between min and max values
  for (let index = 0; index < (steps - 1); index++) {
    current += step
    result.push(Math.floor(current))
  }
  result.push(range.max)

  return result
}

function extendNumber(n: number, round: 'floor' | 'ceil'): number {
  if (n === 0) return 0
  const str = Math.floor(Math.abs(n)).toString()
  const factor = n === 0 ? 0 : n / Math.abs(n)
  let firstNum = parseInt(str[0], 10) * factor
  if (round === 'ceil') {
    firstNum = firstNum + 1
  } else {
    firstNum = firstNum - 1
  }
  return firstNum * Math.pow(10, str.length - 1)
}

export function extendRange(range: Range): Range {
  return {
    min: extendNumber(range.min, 'floor'),
    max: extendNumber(range.max, 'ceil')
  }
}

export function getRangesConstraint(data: ChartData): RangesConstraint  {
  const firstKey = Object.keys(data.samples)[0]

  // Get a real sample so the chart lines will fill the container
  let minYData: number = data.samples[firstKey][0]
  let maxYData: number = data.samples[firstKey][0]
  const minXData = 0
  const maxXData = data.labels.length - 1

  // Calculate min and max values
  Object.keys(data.samples).forEach(key => {
    const samples = data.samples[key]
    samples.forEach(sample => {
      if (sample > maxYData) maxYData = sample
      if (sample < minYData) minYData = sample
    })
  })

  return {
    yValues: extendRange({ min: minYData, max: maxYData }),
    xValues: { min: minXData, max: maxXData }
  }
}

export function calculateRangeProjection(baseRange: Range, targetRange: Range, value: number): number {
  if (value < baseRange.min || value > baseRange.max) {
    throw new Error('Value is not within the range')
  }
  if (baseRange.max < baseRange.min || targetRange.max < targetRange.min) {
    throw new Error('Invalid range range')
  }

  if (value === baseRange.min) return targetRange.min
  if (value === baseRange.max) return targetRange.max

  const baseRangeTotal = baseRange.max - baseRange.min
  const targetRangeTotal = targetRange.max - targetRange.min

  const baseDelta = Math.abs(
    value < 0
      ? value - baseRange.min
      : value - Math.abs(baseRange.min)
  )
  const coefficient = baseDelta / baseRangeTotal
  return targetRange.min + (targetRangeTotal * coefficient)
}
