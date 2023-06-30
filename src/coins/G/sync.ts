import {Address, IHeader} from '@helpers/types'
import {BaseSyncWithMethods} from '@modules/base-sync'
// @ts-ignore
import {CoinsNetwork} from '@noonewallet/network-js'
import {
  DEFAULT_GAS_LIMIT,
  DEFAULT_GAS_PRICE,
  FEE_CONTRACT_ADDR,
  FILTER_CONTRACT_ADDR,
  KYC_CONTRACT_ADDR,
  METHOD_IDS,
} from '@coins/G/config'

/**
 * Class XdcSync
 * This class allows you to get information about the balance on a XinFin wallet,
 * the list of transactions and optimal gas price
 * @class
 */
// type KycLevel = 0 | 1 | 2 | 3

interface IGInfo {
  active: boolean
  kycFilterLevel: number
  kycLevel: number
}

export class GSync extends BaseSyncWithMethods {
  private info: IGInfo
  private gasLimit: number

  constructor(address: Address, headers: IHeader) {
    super(address, headers)
    this.info = {
      active: false,
      kycFilterLevel: 0,
      kycLevel: 0,
    }
    this.gasLimit = DEFAULT_GAS_LIMIT
    this.setReqHandler(CoinsNetwork.graphite)
  }

  async Start(): Promise<void> {
    await super.Start()
    await this.getAddressInfo()
  }

  async getTransactions(): Promise<void> {
    await super.getTransactions()
    this.transactions = await this.reqHandler.getTransactions(
      this.address,
      this.headers,
    )
    this.processTransactions()
  }

  processTransactions(): void {
    for (const tx of this.transactions) {
      if (!tx.input) continue

      if (
        tx.input.endsWith(METHOD_IDS.ACTIVATION) &&
        tx.to === FEE_CONTRACT_ADDR &&
        tx.receiptStatus === '1'
      ) {
        tx.methodId = 'activation'
      }
      if (
        tx.input.endsWith(METHOD_IDS.KYC_LEVEL) &&
        tx.to === KYC_CONTRACT_ADDR &&
        tx.receiptStatus === '1'
      ) {
        tx.methodId = 'level'
      }
      if (
        tx.input.endsWith(METHOD_IDS.KYC_FILTER) &&
        tx.to === FILTER_CONTRACT_ADDR &&
        tx.receiptStatus === '1'
      ) {
        tx.methodId = 'filter'
      }
    }
  }

  async getGasPrice(): Promise<void> {
    const res = await this.reqHandler.getGasPrice(this.address, this.headers)

    if (res) {
      this.gasPrice = res.gasPrice || DEFAULT_GAS_PRICE
      const limit = Math.max(res.estimateGas, res.lastEstimateGas)
      this.gasLimit = limit > 0 ? limit : DEFAULT_GAS_LIMIT
    }
  }

  async getAddressInfo() {
    const {balance, ...info} = await this.reqHandler.getAddressInfo(
      this.address,
      this.headers,
    )
    this.balance = parseInt(balance)
    this.info = {
      active: info.active,
      kycFilterLevel: +info.kycFilterLevel,
      kycLevel: +info.kycLevel,
    }
  }

  get DATA() {
    return {
      ...super.DATA,
      gasLimit: this.gasLimit,
      info: this.info,
    }
  }
}
