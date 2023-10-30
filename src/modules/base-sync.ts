import {restoreClass, IRestoreData} from '@helpers/restore-class'
import {Address, AssetId, ITxSync} from '@helpers/types'

/**
 * Class EthereumSync
 * This class allows you to get information about the balance on an ethereum wallet,
 * the list of transactions and optimal gas price
 * @class
 */

export class BaseSync {
  protected address: Address
  protected balance: number
  protected transactions: ITxSync[]
  protected internalTransactions: ITxSync[]
  protected blockNumber: number
  protected reqHandler: any

  /**
   * Create a EthereumSync
   * @param {string} address - Ethereum wallet address
   */
  constructor(address: Address) {
    this.address = address
    this.balance = 0
    this.transactions = []
    this.internalTransactions = []
    this.blockNumber = 0
    this.reqHandler = null
  }

  restore(data: IRestoreData) {
    restoreClass(this, data)
  }

  protected setReqHandler(handler: any) {
    this.reqHandler = handler
  }

  get DATA() {
    return {
      address: this.address,
      balance: this.balance,
      transactions: this.transactions,
      internalTransactions: this.internalTransactions,
      blockNumber: this.blockNumber,
    }
  }
}

export class BaseSyncWithMethods extends BaseSync {
  constructor(address: Address) {
    super(address)
  }

  async Start(): Promise<void> {
    await Promise.all([
      await this.getBalance(),
      await this.getTransactions(),
      await this.getInternalTransactions(),
      // await this.getGasPrice(),
      await this.getBlockNumber(),
    ])
  }

  async getBalance(): Promise<number> {
    this.balance = await this.reqHandler.getBalance(this.address)
    return this.balance
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  async getTransactions(): Promise<any> {}

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  async getInternalTransactions(): Promise<any> {}

  async getBlockNumber(): Promise<void> {
    this.blockNumber = await this.reqHandler.getBlockNumber()
  }
}
