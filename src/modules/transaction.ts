import {Chain, Common} from '@ethereumjs/common'
import {Transaction, FeeMarketEIP1559Transaction, JsonTx} from '@ethereumjs/tx'
import * as ethUtil from 'ethereumjs-util'
import CustomError from '@helpers/error/custom-error'
import {ISignedTx, ITxData} from '@helpers/types'

export const makeRawEthTx = (data: ITxData): ISignedTx => {
  let {to, value} = data
  const {
    nonce,
    gas,
    type,
    gasPrice,
    gasLimit,
    privateKey,
    chainId,
    maxPriorityFeePerGas,
    maxFeePerGas,
  } = data

  if (isNaN(+nonce) || !to) {
    throw new CustomError('err_tx_eth_invalid_params')
  }

  try {
    // XDC fix
    if (to.startsWith('xdc')) {
      to = to.replace('xdc', '0x')
    }
    value = +value
    const bigIntValue = new ethUtil.BN(value.toString())
    const finalGasLimit = gasLimit || gas
    const params: JsonTx = {
      to,
      nonce: nonce ? ethUtil.intToHex(+nonce) : '',
      value: ethUtil.bnToHex(bigIntValue),
      gasPrice: gasPrice ? ethUtil.intToHex(+gasPrice) : '',
      gasLimit: finalGasLimit ? ethUtil.intToHex(+finalGasLimit) : '',
    }
    if (maxPriorityFeePerGas) {
      params.maxPriorityFeePerGas = ethUtil.intToHex(+maxPriorityFeePerGas)
    }
    if (maxFeePerGas) {
      params.maxFeePerGas = ethUtil.intToHex(+maxFeePerGas)
    }
    if (data.hasOwnProperty('data') && data.data) {
      params.data = data.data
    }

    let common
    if (chainId) {
      common = Common.custom({chainId: +chainId})
    } else {
      common = new Common({chain: Chain.Mainnet})
    }

    let tx
    if (type && +type === 2) {
      // @ts-ignore
      tx = FeeMarketEIP1559Transaction.fromTxData(params, {common})
    } else {
      tx = Transaction.fromTxData(params, {common})
    }
    let buffer
    if (typeof privateKey === 'string') {
      buffer = Buffer.from(privateKey?.replace('0x', ''), 'hex')
    } else {
      buffer = privateKey
    }
    const privateKeyBuffer = ethUtil.toBuffer(buffer)
    const signedTx = tx.sign(privateKeyBuffer)
    const serializedTx = signedTx.serialize()
    const hash = signedTx.hash().toString('hex')
    const txData = {
      gasLimit: gasLimit?.toString(),
      gasPrice: gasPrice?.toString(),
      value: value?.toString(),
      nonce: nonce?.toString(),
      input: data?.data,
      from: data?.from,
      to,
    }
    return {
      hash: `0x${hash}`,
      tx: `0x${serializedTx.toString('hex')}`,
      txData,
    }
  } catch (e) {
    console.log('makeRawEthTx e', e)
    throw new CustomError('err_tx_eth_build')
  }
}
