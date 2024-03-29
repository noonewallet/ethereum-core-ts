export interface IDecodeParams {
  [key: string]: any
}

export interface IDecodedInputData {
  [key: string]: any
}

export type Address = string
export type AssetId = string
export type Contract = string
export type PrivateKey = string | Buffer
export type ChainId = number

export interface ITxSync {
  blockNumber: number
  timeStamp: number
  hash: number
  input: string
  gas: number
  gasPrice: number
  contractAddress: string
  confirmations: string
  to: string
  decodedInput?: IDecodedInputData
  receiptStatus?: string
  methodId?: string
}

export interface IRawTokenTxSync {
  address: Address
  topics: string[]
  data: string
  blockNumber: string
  timeStamp: string
  gasPrice: string
  gasUsed: string
  transactionHash: string
}

export interface ITokenTxSync {
  timeStamp: number
  gasUsed: number
  amount: string
  blockNumber: number
  action: string
  from: string
  to: string
  hash: string
  gasPrice: number
}

export interface RawTokenTxMap {
  [key: string]: IRawTokenTxSync[]
}

// TX
export interface ITxClass {
  address: Address
  balance: number
  gasPrice: number
  unit: string
  maxPriorityFeePerGas?: number
  maxFeePerGas?: number
  estimatedBaseFee?: number
  l1GasPrice?: number
  l1DataFee?: number
  gasLimit?: number
  type?: string
  token?: IToken | undefined
  infuraUrl?: string | undefined
}

export interface IRawTxData {
  address: Address
  amount: number | string
  nonce: number | string
  privateKey: PrivateKey
  fee: IFeeTx
  token?: IToken
  data?: string
  chainId?: ChainId
}

export interface ITxData {
  to: Address
  value: number | string
  nonce: number | string
  privateKey: PrivateKey
  from?: string
  type?: number | string
  gasPrice?: number | string
  gasLimit?: number | string
  gas?: number | string
  data?: string
  input?: string
  chainId?: ChainId
  maxPriorityFeePerGas?: number | string
  maxFeePerGas?: number | string
  estimatedBaseFee?: number | string
  l1GasPrice?: number | string
  l1DataFee?: number | string
}

export interface IFeeTx {
  id: string
  gasPrice: number
  gasLimit: number
  unit: string
  gasPriceGwei?: number
  coinValue?: number
  value?: number
  custom?: boolean
  maxPriorityFeePerGas?: number | string
  maxFeePerGas?: number | string
  estimatedBaseFee?: number | string
  l1GasPrice?: number | string
  l1DataFee?: number | string
  type?: string
}

export interface IToken {
  contract: string
  decimals: number
}

export interface ISignedTx {
  tx: string
  hash: string
  txData: {
    [key: string]: any
  }
}
