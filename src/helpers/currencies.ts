export interface ICurrency {
  shortName: string
  name: string
  checksumAddress: boolean
  chainId: number
  prefix?: string
}

export interface ICurrencyList {
  [key: string]: ICurrency
}

export const currencies: ICurrencyList = {
  ETH: {
    shortName: 'ETH',
    name: 'Ethereum',
    prefix: '',
    checksumAddress: false,
    chainId: 1,
  },
  XDC: {
    shortName: 'XDC',
    name: 'XinFin',
    prefix: 'xdc',
    checksumAddress: false,
    chainId: 50,
  },
  G: {
    shortName: 'G',
    name: 'Graphite',
    prefix: '',
    checksumAddress: true,
    chainId: 1338,
  },
  PLTE: {
    shortName: 'PLTE',
    name: 'Pyrolite',
    prefix: '',
    checksumAddress: true,
    chainId: 1338,
  },
}
