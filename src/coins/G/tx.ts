// @ts-ignore
import {CoinsNetwork} from '@noonewallet/network-js'
import bigDecimal from 'js-big-decimal'

import {BaseTx} from '@modules/base-tx'
import {ITxClass, ITxData, IHeader, IRawTxData, ISignedTx} from '@helpers/types'
import {currencies} from '@helpers/currencies'
import converter from '@helpers/converters'
import {web3} from '@helpers/utils'
import {makeRawEthTx} from '@modules/transaction'
import {DEFAULT_GAS_LIMIT, SEPARATOR, FEE_CONTRACT_ADDR, LEVELS} from './config'
import {FeeContractAbi} from '@helpers/abi/g-activate-account'
import CustomError from '@helpers/error/custom-error'
// @ts-ignore

const CHAIN_ID = currencies.G.chainId

interface IEntrypoint {
  isAnonymousNode: string
  entrypointNode: string
}

interface ITxClassGraphite extends ITxClass {
  entrypoint: IEntrypoint
  header: IHeader
}

interface IActivationData {
  from: string
  to: string
  data: string
  gas: number
  value?: number
}

interface IKycData {
  from: string
  to: string
  data: string
  gas: number
  value?: number
  coinValue?: number
}

export class GTx extends BaseTx {
  private entrypoint: IEntrypoint
  private header: IHeader
  public reqHandler: any

  constructor(data: ITxClassGraphite) {
    super(data)
    super.setCurrency(currencies.G)
    super.setFeeList(['optimal', 'custom'])
    this.entrypoint = {
      isAnonymousNode: data.entrypoint.isAnonymousNode,
      entrypointNode: data.entrypoint.entrypointNode,
    }
    this.reqHandler = CoinsNetwork.graphite
    this.header = data.header
  }

  make(txData: IRawTxData): ISignedTx {
    const {address, amount, fee, privateKey, nonce, data} = txData
    const amountInWei = converter.eth_to_wei(+amount)
    const finalAmount = +bigDecimal.add(amountInWei, fee.value)
    const surrender = +bigDecimal.subtract(this.balance, finalAmount)

    if (surrender < 0) {
      throw new CustomError('err_tx_eth_balance')
    }

    let finalData
    if (data) {
      finalData = data
    } else if (!this.entrypoint.isAnonymousNode) {
      finalData = SEPARATOR.concat(
        web3.utils.hexToBytes(this.entrypoint.entrypointNode),
      )
    }

    if (finalData && typeof finalData !== 'string') {
      finalData = web3.utils.bytesToHex(finalData)
    }

    const params = {
      from: this.address,
      to: address,
      value: amountInWei,
      nonce,
      gasPrice: fee.gasPrice,
      gasLimit: fee.gasLimit,
      privateKey,
      data: finalData,
      chainId: CHAIN_ID,
    }

    return makeRawEthTx(params)
  }

  async getEstimateGas(
    to: string,
    value: string,
    data: string,
  ): Promise<string> {
    try {
      if (!data) {
        if (!this.entrypoint.isAnonymousNode) {
          const concatData = SEPARATOR.concat(
            web3.utils.hexToBytes(this.entrypoint.entrypointNode),
          )
          data = web3.utils.bytesToHex(concatData)
        }
      }

      const params = {
        from: this.address,
        value: value || '0x0',
        to: to || this.address,
        data,
      }
      const gasAmount = await this.reqHandler.getEstimateGas(
        params,
        this.header,
      )

      return gasAmount || DEFAULT_GAS_LIMIT
    } catch (e) {
      console.log('getEstimateGas e', e)
      return ''
    }
  }

  async getDataForKycRequest(level: number): Promise<IKycData | string> {
    if (!LEVELS.includes(+level)) {
      throw Error('Level must be a number from 1 to 3')
    }
    try {
      const data: IKycData = await this.reqHandler.createKycRequest(
        this.address,
        level,
        this.header,
      )
      const fee = +data.gas * this.gasPrice
      let finalValue = fee
      if (data?.value) {
        finalValue += +data.value
      }
      data.coinValue = +converter.wei_to_eth(finalValue)

      return data
    } catch (e) {
      if (e instanceof Error) {
        console.log('getDataForKycRequest e', e.message)
        return e.message
      }
      return ''
    }
  }

  async getDataForFilterRequest(level: number) {
    if (!LEVELS.includes(+level)) {
      throw Error('Level must be a number from 0 to 3')
    }
    try {
      const data = await this.reqHandler.createFilterRequest(
        this.address,
        level,
        this.header,
      )
      const fee = +data.gas * this.gasPrice
      data.coinValue = +converter.wei_to_eth(fee)

      return data
    } catch (e) {
      if (e instanceof Error) {
        console.log('getDataForFilterRequest e', e.message)
        return e.message
      }
    }
  }

  changeKycOrFilterLevel(
    reqData: IActivationData,
    privateKey: string,
    nonce: number,
  ): ISignedTx {
    const {data, from, gas, to, value} = reqData

    const params: ITxData = {
      value: value || 0,
      from,
      to,
      nonce,
      gasPrice: this.gasPrice,
      gasLimit: gas,
      privateKey,
      data,
      chainId: CHAIN_ID,
    }

    return makeRawEthTx(params)
  }

  getActivateAccountData(): string {
    // @ts-ignore
    const feeContract = new web3.eth.Contract(FeeContractAbi, FEE_CONTRACT_ADDR)
    const tx = feeContract.methods.pay()
    const methodEncoded = tx.encodeABI()
    let data = ''

    if (!this.entrypoint.isAnonymousNode) {
      const concatData = SEPARATOR.concat(
        web3.utils.hexToBytes(this.entrypoint.entrypointNode),
      ).concat(web3.utils.hexToBytes(methodEncoded))
      data = web3.utils.bytesToHex(concatData)
    }

    return data
  }

  async calcActivationAmount() {
    const activationData: string = this.getActivateAccountData()
    const initialFee = await this.reqHandler.getInitialFee(this.header)
    const initialFeeData = web3.utils.toHex(+initialFee)
    const estimateGas = await this.getEstimateGas(
      FEE_CONTRACT_ADDR,
      initialFeeData,
      activationData,
    )
    const value = +bigDecimal.multiply(this.gasPrice, estimateGas)
    return {
      value, // TODO: check value + initialFee
      initialFee,
      coinValue: +converter.wei_to_eth(value + initialFee),
      gasPrice: this.gasPrice,
      gasLimit: estimateGas,
    }
  }

  async activateAccount(privateKey: string, nonce: number, getParams = false) {
    const data = this.getActivateAccountData()
    const fee = await this.calcActivationAmount()
    const params: ITxData = {
      from: this.address,
      to: FEE_CONTRACT_ADDR,
      chainId: CHAIN_ID,
      value: fee.initialFee,
      gasPrice: +fee.gasPrice,
      gasLimit: +fee.gasLimit,
      nonce,
      privateKey,
      data,
    }

    if (getParams) {
      return params
    } else {
      return makeRawEthTx(params)
    }
  }
}
