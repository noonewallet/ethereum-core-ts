import bigDecimal from 'js-big-decimal'

/**
 * Ethereum converter
 */
const ETH_FACTOR = Math.pow(10, 18)
const GWEI_FACTOR = Math.pow(10, 9)
const PRECISION = 10

export default {
  wei_to_eth(
    wei: number,
    customPrecision?: number,
    returnNumber?: boolean,
  ): number | string {
    if (!wei) return 0
    const stringValue = wei.toString()
    const n1 = new bigDecimal(stringValue)
    const n2 = new bigDecimal(ETH_FACTOR)
    const num = n1.divide(n2, customPrecision || PRECISION)
    const value = num.getValue()
    return returnNumber ? +value : removeLastZero(+value)
  },
  wei_to_gwei(wei: number, precision?: number): number {
    if (!wei) return 0
    const stringValue = wei.toString()
    const n1 = new bigDecimal(stringValue)
    const n2 = new bigDecimal(GWEI_FACTOR)
    const num = n1.divide(n2, precision || 0)
    const value = num.getValue()
    return +value
  },
  gwei_to_wei(gwei: number): number {
    if (!gwei) return 0
    const stringValue = gwei.toString()
    const n1 = new bigDecimal(stringValue)
    const n2 = new bigDecimal(GWEI_FACTOR)
    const num = n1.multiply(n2)
    const value = bigDecimal.floor(num.getValue())
    return +value
  },
  /**
   * Convert Ethereum to WEI
   * @param {string} eth
   * @returns {number} wei
   */
  eth_to_wei(eth: number): number {
    if (!eth) return 0
    const stringValue = eth.toString()
    const n1 = new bigDecimal(stringValue)
    const n2 = new bigDecimal(ETH_FACTOR)
    const num = n1.multiply(n2)
    const value = bigDecimal.floor(num.getValue())
    return +value
  },
}

function removeLastZero(value: number): string {
  if (!value) return '0'

  let num = value.toString()
  if (!num.includes('.')) return num

  while (num[num.length - 1] === '0') {
    num = num.slice(0, -1)
  }

  if (num[num.length - 1] === '.') {
    num = num.slice(0, -1)
  }

  return num
}
