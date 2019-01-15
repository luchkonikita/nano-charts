import { calculateRangeProjection, extendRange } from '../src/calculations'

describe('Calculations', () => {
  describe('extendRange', () => {
    it('extend the range to round convenient values', () => {
      expect(extendRange({min: -10, max: 110})).toEqual({min: -20, max: 200})
      expect(extendRange({min: 0, max: 99})).toEqual({min: 0, max: 100})
      expect(extendRange({min: -99, max: 0})).toEqual({min: -100, max: 0})
      expect(extendRange({min: 21, max: 99})).toEqual({min: 10, max: 100})
    })
  })

  describe('calculateRangeProjection', () => {
    it('returns a correct projection', () => {
      const baseRange = {min: -10, max: 10}
      const targetRange = {min: 0, max: 40}
      // expect(calculateRangeProjection(baseRange, targetRange, -5)).toEqual(10)
      expect(calculateRangeProjection(baseRange, targetRange, 5)).toEqual(30)
    })
  })
})
