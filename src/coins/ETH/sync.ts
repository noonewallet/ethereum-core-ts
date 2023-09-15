import {Address, ITxSync} from '@helpers/types'
// @ts-ignore
import {CoinsNetwork} from '@noonewallet/network-js'
import {BaseSyncWithMethods} from '@modules/base-sync'
import {EMPTY_INPUT_MARKER} from '@helpers/config'
import {decodeInputData} from '@helpers/utils'

/**
 * Class EthSync
 * This class allows you to get information about the balance on an ethereum wallet,
 * the list of transactions and optimal gas price
 * @class
 */

export class EthSync extends BaseSyncWithMethods {
  /**
   * Create a EthSync
   * @param {string} address - Ethereum wallet address
   */
  constructor(address: Address) {
    super(address)
    this.setReqHandler(CoinsNetwork.eth)
  }

  async getTransactions(): Promise<ITxSync[]> {
    const res: ITxSync[] = await this.reqHandler.getAllTransactions(
      this.address,
    )

    for (const tx of res) {
      if (tx.input !== EMPTY_INPUT_MARKER) {
        tx.decodedInput = decodeInputData(tx.input)
      }
    }

    this.transactions = res
    return this.transactions
  }

  async getInternalTransactions(): Promise<ITxSync[]> {
    const res: ITxSync[] = await this.reqHandler.getInternalTransactions(
      this.address,
    )
    this.internalTransactions = res
    return this.internalTransactions
  }
}
