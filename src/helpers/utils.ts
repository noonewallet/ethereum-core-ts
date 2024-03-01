import * as ethUtil from 'ethereumjs-util'
import CustomError from '@helpers/error/custom-error'
import Web3 from 'web3'
import {HDNode} from '@noonewallet/crypto-core-ts'
import {Address, IDecodedInputData, IDecodeParams} from '@helpers/types'
import {DERIVATION_PATH, DECODE_PARAMS} from '@helpers/config'
import {currencies} from '@helpers/currencies'
import {Transaction, FeeMarketEIP1559Transaction} from '@ethereumjs/tx'

export const web3 = new Web3()

/**
 * Getting a Ethereum public key by private key
 * @param {Buffer} privateKey - Ethereum private key
 * @returns {Buffer} Ethereum public key in Uint8Array format
 */

export const getEthPublicKey = (privateKey: Buffer): Buffer => {
  try {
    return ethUtil.privateToPublic(privateKey)
  } catch (e) {
    console.log(e)
    throw new CustomError('err_core_eth_private_key')
  }
}

/**
 * Getting an Ethereum wallet address by public key
 * @param {Buffer} publicKey - Ethereum public key
 * @param {boolean} checksumAddress - If true converts Ethereum address to Checksum address
 * @returns {string} Ethereum wallet address
 */

export const getEthAddress = (
  publicKey: Buffer,
  checksumAddress?: boolean,
): string => {
  try {
    const addr = ethUtil.Address.fromPublicKey(publicKey)

    if (checksumAddress) {
      return toChecksumAddress(addr.toString())
    }

    return addr.toString()
  } catch (e) {
    console.log(e)
    throw new CustomError('err_core_eth_public_key')
  }
}
export const recoverAddressFromRawTx = (rawTx: string): string => {
  try {
    const formattedRawTx = rawTx.startsWith('0x') ? rawTx : `0x${rawTx}`

    // Recover the public key
    const fromAddress = web3.eth.accounts.recoverTransaction(formattedRawTx)
    return fromAddress
  } catch (e) {
    if (e instanceof Error) {
      console.error('Error recovering public key:', e.message)
    }
    return ''
  }
}

export const recoverPublicKeyFromRawTx = (rawTx: string): string => {
  try {
    const type = rawTx.slice(0, 4)
    const txBuffer = Buffer.from(rawTx.slice(2), 'hex')
    let tx
    let finalTx

    if (type === '0x02') {
      tx = FeeMarketEIP1559Transaction.fromSerializedTx(txBuffer)
      finalTx = FeeMarketEIP1559Transaction.fromTxData(tx)
    } else {
      tx = Transaction.fromSerializedTx(txBuffer)
      finalTx = tx
    }

    const recoverPublicKey = ethUtil.bufferToHex(finalTx.getSenderPublicKey())

    return recoverPublicKey
  } catch (error) {
    console.error('Error recovering public key:', error)
    return ''
  }
}

export const toChecksumAddress = (address: string): string => {
  if (!address) return ''
  try {
    return ethUtil.toChecksumAddress(address)
  } catch (e) {
    console.log('Invalid address', e)
    return ''
  }
}

export const isValidChecksumAddress = (address: string): boolean => {
  if (!address) return false

  return ethUtil.isValidChecksumAddress(address)
}

/**
 * Getting Ethereum wallet address by node
 * @param {Object} node - Ethereum node
 * @param {boolean} checksumAddress
 * @returns {string} Ethereum wallet address
 */

export const getEthAddressByNode = (
  node: HDNode,
  checksumAddress: boolean,
): string => {
  try {
    const privateKey = node.privateKey
    const publicKey = getEthPublicKey(privateKey)
    return getEthAddress(publicKey, checksumAddress)
  } catch (e) {
    console.log(e)
    throw new CustomError('err_core_eth_public_key')
  }
}

export const decodeInputData = (
  input: string,
  decodeParams?: IDecodeParams[],
): IDecodedInputData => {
  try {
    const input_data = '0x' + input.slice(10)
    const methodId = input.slice(0, 10)
    const params =
      decodeParams || DECODE_PARAMS[methodId] || DECODE_PARAMS.default
    return web3.eth.abi.decodeParameters(params, input_data)
  } catch (e) {
    if (e instanceof Error) {
      console.log('decodeInputData error', e.message)
    }
    return {}
  }
}

export const getEntrypointTxData = (
  separator: number[],
  nodeAddress: Address,
) => {
  const data = separator.concat(web3.utils.hexToBytes(nodeAddress))
  return web3.utils.bytesToHex(data)
}

export const signMessage = (data: string, key: string): string => {
  const buffer = Buffer.from(data)
  const message = ethUtil.toBuffer(buffer)
  const msgHash = ethUtil.hashPersonalMessage(message)
  let privateKeyBuff: Buffer | null = new Buffer(key.replace('0x', ''), 'hex')
  const signedMessage = ethUtil.ecsign(msgHash, privateKeyBuff)
  privateKeyBuff = null
  const signedHash = ethUtil
    .toRpcSig(signedMessage.v, signedMessage.r, signedMessage.s)
    .toString()
  return signedHash
}

export const getEthCore = (node: HDNode, coin?: string) => {
  const currency =
    coin && coin in currencies ? currencies[coin] : currencies.ETH
  const ethNode = node.derive(DERIVATION_PATH)
  const privateKey = ethNode.privateKey
  const publicKey = getEthPublicKey(privateKey)
  const privateKeyHex = '0x' + privateKey.toString('hex')
  const publicKeyHex = '0x' + publicKey.toString('hex')
  let externalAddress = getEthAddress(publicKey, currency.checksumAddress)

  if (currency.prefix) {
    externalAddress = externalAddress.replace('0x', currency.prefix)
  }

  return {
    node: ethNode,
    privateKey: privateKeyHex,
    publicKey: publicKeyHex,
    externalAddress,
  }
}

export const encodeInputData = (toAddress: string, amountInWei: string) => {
  if (!toAddress || !amountInWei) {
    throw Error('Parameters are required')
  }

  const params = web3.eth.abi
    .encodeParameters(['address', 'uint256'], [toAddress, amountInWei])
    .replace(/^(0x)/, '')
  return params
}

const IdList = {
  '0x095ea7b3': 'approve',
  '0xa9059cbb': 'transfer',
  '0x3eca9c0a': 'fillOrderRFQ',
}
export const getFunctionNameByMethodId = (methodId: string) => {
  if (!methodId) return ''
  if (methodId.length !== 10) return ''
  // @ts-ignore
  return methodId in IdList ? IdList[methodId] : ''
}
