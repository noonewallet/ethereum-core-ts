import {Chain, Common} from '@ethereumjs/common'
import {Transaction, TxData} from '@ethereumjs/tx'
import * as ethUtil from 'ethereumjs-util'
import CustomError from '@helpers/error/custom-error'
import {ISignedTx, ITxData} from '@helpers/types'

export const makeRawEthTx = (data: ITxData): ISignedTx => {
  let {to} = data
  const {value, nonce, gasPrice, gasLimit, privateKey, chainId} = data

  if (isNaN(nonce) || isNaN(gasPrice) || isNaN(gasLimit)) {
    throw new CustomError('err_tx_eth_invalid_params')
  }

  try {
    // XDC fix
    if (to.startsWith('xdc')) {
      to = to.replace('xdc', '0x')
    }
    const bigIntValue = new ethUtil.BN(value.toString())
    const params: TxData = {
      to,
      nonce: ethUtil.intToHex(nonce),
      value: ethUtil.bnToHex(bigIntValue),
      gasPrice: ethUtil.intToHex(gasPrice),
      gasLimit: ethUtil.intToHex(gasLimit),
    }
    if (data.hasOwnProperty('data') && data.data) {
      params.data = data.data
    }
    let common
    if (chainId) {
      common = Common.custom({chainId})
    } else {
      common = new Common({chain: Chain.Mainnet})
    }
    const tx = Transaction.fromTxData(params, {common})

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
      gasLimit: gasLimit.toString(),
      gasPrice: gasPrice.toString(),
      value: value.toString(),
      nonce: nonce.toString(),
      input: data.data,
      from: data.from,
      to,
    }
    return {
      hash: `0x${hash}`,
      tx: `0x${serializedTx.toString('hex')}`,
      txData,
    }
  } catch (e) {
    console.log(e)
    throw new CustomError('err_tx_eth_build')
  }
}
