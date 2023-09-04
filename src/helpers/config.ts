export const TRANSFER_METHOD_ID = '0xa9059cbb'
export interface DecodeParamsI {
  [key: string]: any
}

export const DECODE_PARAMS: DecodeParamsI = {
  '0xa9059cbb': [
    {
      type: 'address',
      name: 'receiver',
    },
    {
      type: 'uint256',
      name: 'amount',
    },
  ],
  '0x3eca9c0a':
    // fillOrderRFQ((uint256,address,address,address,address,uint256,uint256),bytes,uint256)
    [
      {
        type: 'uint256',
        name: 'order',
      },
      {
        type: 'address',
        name: 'contract',
      },
      {
        type: 'address',
        name: 'param1',
      },
      {
        type: 'address',
        name: 'param2',
      },
      {
        type: 'address',
        name: 'receiver',
      },
      {
        type: 'uint256',
        name: 'amount2',
      },
      {
        type: 'uint256',
        name: 'amount3',
      },
    ],
  '0x0502b1c5': [
    // unoswap(address,uint256,uint256,uint256[])
    {
      type: 'address',
      name: 'srcToken',
    },
    {
      type: 'uint256',
      name: 'amount',
    },
    {
      type: 'uint256',
      name: 'minReturn',
    },
    {
      type: 'bytes32[]',
      name: 'pools',
    },
  ],
  default: [
    {
      type: 'address',
      name: 'receiver',
    },
    {
      type: 'uint256',
      name: 'amount',
    },
  ],
}

export const DERIVATION_PATH = `m/44'/60'/0'/0/0`
export const EMPTY_INPUT_MARKER = '0x'
export const CHAIN_IDS = {
  ETH: 1,
  XDC: 50,
  G: 1338,
  SEPOLIA: 11155111,
}

export const DEFAULT_ETH_GAS_LIMIT = 21000
