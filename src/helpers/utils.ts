import * as ethUtil from 'ethereumjs-util'
import CustomError from '@helpers/error/custom-error'
import Web3 from 'web3'
import {HDNode, derive} from '@noonewallet/core-js'
import {
  Address,
  IDecodedInputData,
  IDecodeParams,
  IEthBasedCore,
} from '@helpers/types'
import {
  DERIVATION_PATH,
  DECODE_PARAMS,
  TRANSFER_METHOD_ID,
} from '@helpers/config'
import {currencies} from '@helpers/currencies'

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
 * Getting a Ethereum wallet address by public key
 * @param {Buffer} publicKey - Ethereum public key
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
