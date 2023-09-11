import Web3 from 'web3'
import bigDecimal from 'js-big-decimal'
import {BaseTx} from '@modules/base-tx'
import {makeRawEthTx} from '@modules/transaction'
import {ITxClass, IRawTxData, ITxData, IToken} from '@helpers/types'
import {currencies} from '@helpers/currencies'
import {abi} from '@helpers/abi/abi-erc20'
import CustomError from '@helpers/error/custom-error'

export class EthTx extends BaseTx {
  protected infuraUrl: string | undefined
  protected token: IToken | undefined
  protected web3: any

  constructor(data: ITxClass) {
    super(data)
    this.feeIds = ['optimal', 'custom']
    this.infuraUrl = data?.infuraUrl
    this.token = data?.token

    super.setCurrency(currencies.ETH)
  }

  createWeb3() {
    if (!this.infuraUrl) {
      throw new Error('No infura url')
    }

    this.web3 = new Web3(this.infuraUrl)
  }

  async makeTokenTx(data: IRawTxData) {
    const {token} = data
    if (!token) {
      throw new CustomError('err_tx_eth_contract')
    }

    if (!this.web3) {
      await this.createWeb3()
    }
    let contract
    try {
      contract = new this.web3.eth.Contract(abi, token.contract, {
        from: this.address,
      })
    } catch (e) {
      if (e instanceof Error) {
        throw new Error(e.message)
      }
    }

    const {address, fee, privateKey, nonce, chainId} = data
    let decimals = token.decimals || 0
    let amount = data.amount
    if (typeof amount === 'string') {
      amount = parseFloat(amount)
    }
    const transferAmount = +bigDecimal.multiply(amount, decimals)
    const surrender = this.balance - transferAmount

    if (surrender < 0) {
      throw new CustomError('err_tx_eth_balance')
    }

    let amountFormat

    if (!Number.isInteger(amount)) {
      let countDecimals = amount.toString().split('.')[1].length
      countDecimals = countDecimals < decimals ? countDecimals : decimals

      amountFormat = Math.floor(amount * Math.pow(10, countDecimals))
      decimals -= countDecimals
    } else {
      amountFormat = amount
    }
    const decimalsBN = this.web3.utils.toBN(decimals)
    const amountBN = this.web3.utils.toBN(amountFormat)
    const amountHex =
      '0x' +
      amountBN.mul(this.web3.utils.toBN(10).pow(decimalsBN)).toString('hex')

    const params: ITxData = {
      from: this.address,
      to: token.contract,
      gasPrice: +fee.gasPrice,
      gasLimit: +fee.gasLimit,
      data: contract.methods.transfer(address, amountHex).encodeABI(),
      value: 0,
      nonce,
      privateKey,
      chainId,
    }
    return makeRawEthTx(params)
  }
}
