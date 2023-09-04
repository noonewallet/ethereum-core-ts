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

  calcFee(customGasPriceGwei = 0, customGasLimit = 0) {
    this.feeList = [
      {
        id: 'optimal',
        gasPrice: +this.gasPrice,
        gasLimit: +this.gasLimit,
        gasPriceGwei: +converter.wei_to_gwei(this.gasPrice),
        coinValue: +converter.wei_to_eth(
          +bigDecimal.multiply(this.gasPrice, this.gasLimit),
        ),
        value: +bigDecimal.multiply(this.gasPrice, this.gasLimit),
      },
    ]
    if (this.hasCustom) {
      const customFee = this.getCustomFee(customGasPriceGwei, customGasLimit)
      this.feeList.push(customFee)
    }
    return this.feeList
  }

  getCustomFee(customGasPriceGwei = 0, customGasLimit = 0) {
    customGasPriceGwei = +customGasPriceGwei
    customGasLimit = +customGasLimit
    const customGasPriceWei = converter.gwei_to_wei(customGasPriceGwei)

    const customFee: IFeeTx = {
      custom: true,
      id: 'custom',
      gasPrice: +customGasPriceWei,
      gasPriceGwei: +customGasPriceGwei,
      gasLimit: +customGasLimit,
      coinValue: +converter.wei_to_eth(
        +bigDecimal.multiply(customGasPriceWei, customGasLimit),
      ),
      value: +bigDecimal.multiply(customGasPriceWei, customGasLimit),
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
    const {address, amount, fee, nonce, privateKey} = data
    const amountInWei = converter.eth_to_wei(+amount)
    const finalAmount = +bigDecimal.add(amountInWei, fee.value)
    const surrender = +bigDecimal.subtract(this.balance, finalAmount)

    if (surrender < 0) {
      throw new CustomError('err_tx_eth_balance')
    }

    const params: ITxData = {
      to: address,
      value: amountInWei,
      gasPrice: fee.gasPrice,
      gasLimit: fee.gasLimit,
      nonce,
      privateKey,
      chainId: this.currency?.chainId,
    }
    return makeRawEthTx(params)
  }

  get DATA() {
    return {
      fee: this.feeList,
    }
  }
}
