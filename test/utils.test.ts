import { formatNumber, throttle } from '../src/utils'

describe('Utils', () => {
  describe('formatNumber', () => {
    it('keeps a small representation for numbers', () => {
      expect(formatNumber(0.1)).toEqual('0.1')
      expect(formatNumber(10)).toEqual('10')
      expect(formatNumber(99100)).toEqual('99.1k')
      expect(formatNumber(99100000)).toEqual('99.1m')
      expect(formatNumber(99100000000)).toEqual('99.1b')
      expect(formatNumber(99100000000000)).toEqual('99.1t')
    })
  })

  describe('throttle', () => {
    it('throttles the execution', done => {
      const fn = jest.fn()
      const throttled = throttle(fn, 50)

      throttled()
      throttled()

      setTimeout(() => {
        throttled()
        expect(fn).toHaveBeenCalledTimes(2)
        done()
      }, 100)
    })
  })
})
