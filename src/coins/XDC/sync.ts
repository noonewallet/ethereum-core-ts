import {Address} from '@helpers/types'
import {BaseSyncWithMethods} from '@modules/base-sync'
// @ts-ignore
import {CoinsNetwork} from '@noonewallet/network-js'

/**
 * Class XdcSync
 * This class allows you to get information about the balance on a XinFin wallet,
 * the list of transactions and optimal gas price
 * @class
 */

export class XdcSync extends BaseSyncWithMethods {
  /**
   * Create a XdcSync
   * @param {string} address - Xinfin wallet address
   */
  constructor(address: Address) {
    super(address)
    this.setReqHandler(CoinsNetwork.xdc)
  }

  async getTransactions() {
    this.transactions = await this.reqHandler.getTransactions(this.address)

    return this.transactions
  }
}
