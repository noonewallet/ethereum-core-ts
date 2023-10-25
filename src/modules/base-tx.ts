import bigDecimal from 'js-big-decimal'
import converter from '@helpers/converters'
import CustomError from '@helpers/error/custom-error'
import {makeRawEthTx} from '@modules/transaction'
import {DEFAULT_ETH_GAS_LIMIT} from '@helpers/config'
import {ITxClass, IFeeTx, IRawTxData, ITxData, ISignedTx} from '@helpers/types'
import {ICurrency} from '@helpers/currencies'

export type FeeId = 'optimal' | 'custom'
export const FeeIds: FeeId[] = ['optimal', 'custom']

/**
 * Class EthereumTx.
 * This class is responsible for calculating the fee and generating and signing a Ethereum transaction
 * @class
 */

export class BaseTx {
  protected address: string
  protected balance: number
  protected gasPrice: number
  protected gasLimit: number
  protected maxPriorityFeePerGas: number
  protected maxFeePerGas: number
  protected estimatedBaseFee: number
  protected l1GasPrice: number
  protected l1DataFee: number
  protected unit: string
  protected type: string
  protected feeList: IFeeTx[]
  protected currency: ICurrency | undefined
  protected feeIds: FeeId[]
  private hasCustom: boolean

  /**
   * Create a EthereumTx
   * @param {Object} data - Input data for generating a transaction or calculating a fee
   * @param {string} data.address - Ethereum wallet address
   * @param {number} data.balance - Ethereum wallet balance
   * @param {number} data.gasPrice - Gas price for transaction
   */
  constructor(data: ITxClass) {
    this.address = data.address
    this.balance = data.balance
    this.gasPrice = data.gasPrice
    this.gasLimit = data.gasLimit || DEFAULT_ETH_GAS_LIMIT
    this.maxPriorityFeePerGas = data.maxPriorityFeePerGas || 0
    this.estimatedBaseFee = data.estimatedBaseFee || 0
    this.maxFeePerGas = data.maxFeePerGas || 0
    this.l1GasPrice = data.l1GasPrice || 0
    this.l1DataFee = data.l1DataFee || 0
    this.type = data.type || ''
    this.unit = data.unit
    this.feeList = []
    this.feeIds = FeeIds
    this.hasCustom = this.feeIds.some((item) => item === 'custom')
  }

  setCurrency(currency: ICurrency) {
    this.currency = currency
  }

  setFeeList(list: FeeId[]) {
    this.feeIds = list
    this.hasCustom = this.feeIds.some((item) => item === 'custom')
  }

  /**
   * Calculating the fee amount
   * @param {number} customGasPriceGwei - Amount of custom gas price (in GWEI)
   * @param {number} customGasLimit - Amount of custom gas limit
   * @returns {Array} A list with the optimal and custom fee
   */

  calcFee(
    customGasPriceGwei = 0,
    customGasLimit = 0,
    customMaxFeePerGasGwei = 0,
    customMaxPriorityFeePerGasGwei = 0,
  ) {
    const feeInGwei = +converter.wei_to_gwei(this.gasPrice)
    const maxFeePerGas =
      this.type === 'eip1559'
        ? +bigDecimal.add(+this.maxPriorityFeePerGas, +this.estimatedBaseFee)
        : 0
    let value =
      this.type === 'eip1559'
        ? +bigDecimal.multiply(+maxFeePerGas, +this.gasLimit)
        : +bigDecimal.multiply(+this.gasPrice, +this.gasLimit)
    if (+this.l1DataFee) {
      value = +bigDecimal.add(value, +this.l1DataFee)
    }
    this.feeList = [
      {
        id: 'optimal',
        gasPrice: +this.gasPrice,
        gasLimit: +this.gasLimit,
        l1GasPrice: +this.l1GasPrice,
        l1DataFee: +this.l1DataFee,
        maxPriorityFeePerGas: +this.maxPriorityFeePerGas,
        maxFeePerGas: maxFeePerGas,
        estimatedBaseFee: +this.estimatedBaseFee,
        type: this.type,
        gasPriceGwei: feeInGwei > 1 ? feeInGwei : 1,
        coinValue: +converter.wei_to_eth(value, 8),
        value: value,
        unit: this.unit,
      },
    ]

    if (this.hasCustom) {
      const customFee = this.getCustomFee(
        customGasPriceGwei,
        customGasLimit,
        customMaxFeePerGasGwei,
        customMaxPriorityFeePerGasGwei,
      )
      this.feeList.push(customFee)
    }
    return this.feeList
  }

  getCustomFee(
    customGasPriceGwei = 0,
    customGasLimit = 0,
    customMaxFeePerGasGwei = 0,
    customMaxPriorityFeePerGasGwei = 0,
  ) {
    customGasPriceGwei = +customGasPriceGwei
    customGasLimit = +customGasLimit
    const customGasPriceWei = converter.gwei_to_wei(customGasPriceGwei)
    const customMaxFeePerGasWei = converter.gwei_to_wei(customMaxFeePerGasGwei)
    const customMaxPriorityFeePerGasWei = converter.gwei_to_wei(
      customMaxPriorityFeePerGasGwei,
    )
    let value =
      this.type === 'eip1559'
        ? +bigDecimal.multiply(+customMaxFeePerGasWei, +customGasLimit)
        : +bigDecimal.multiply(+customGasPriceWei, +customGasLimit)

    if (+this.l1DataFee) {
      value = +bigDecimal.add(value, +this.l1DataFee)
    }
    const customFee: IFeeTx = {
      custom: true,
      id: 'custom',
      l1GasPrice: +this.l1GasPrice,
      l1DataFee: +this.l1DataFee,
      maxFeePerGas: customMaxFeePerGasWei,
      maxPriorityFeePerGas: customMaxPriorityFeePerGasWei,
      gasPrice: +customGasPriceWei,
      gasPriceGwei: +customGasPriceGwei,
      gasLimit: +customGasLimit,
      coinValue: +converter.wei_to_eth(value, 8),
      value: value,
      unit: this.unit,
    }

    return customFee
  }

  /**
   * Creating a transaction
   * @param {Object} data - Input data for a transaction
   * @param {string} data.addressTo - Recipient address
   * @param {number} data.amount - Transaction amount in ETH
   * @param {Object} data.fee - Object with amount of gas price and gas limit
   * @param {number} data.nonce - Nonce, transaction count of an account
   * @returns {Promise<Object>} Return a raw transaction in hex to send and transaction hash
   */

  make(data: IRawTxData): ISignedTx {
    const {address, amount, fee, nonce, privateKey, chainId} = data
    const amountInWei = converter.eth_to_wei(+amount)
    const finalAmount = +bigDecimal.add(amountInWei, fee.value)
    const surrender = +bigDecimal.subtract(this.balance, finalAmount)

    if (surrender < 0) {
      throw new CustomError('err_tx_eth_balance')
    }
    const finalChainId = chainId || this.currency?.chainId || 1

    const params: ITxData = {
      to: address,
      value: amountInWei,
      maxPriorityFeePerGas: fee.maxPriorityFeePerGas,
      maxFeePerGas: fee.maxFeePerGas,
      gasPrice: fee.gasPrice,
      gasLimit: fee.gasLimit,
      type: this.type === 'eip1559' ? 2 : 0,
      nonce,
      privateKey,
      chainId: finalChainId,
    }
    return makeRawEthTx(params)
  }

  get DATA() {
    return {
      fee: this.feeList,
    }
  }
}
