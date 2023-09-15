import {Address, AssetId, ITxSync} from '@helpers/types'
// @ts-ignore
import {CoinsNetwork} from '@noonewallet/network-js'
import {BaseSync} from '@modules/base-sync'
import {decodeInputData} from '@helpers/utils'
import {EMPTY_INPUT_MARKER} from '@helpers/config'

/**
 * Class EthSync
 * This class allows you to get information about the balance on an ethereum wallet,
 * the list of transactions and optimal gas price
 * @class
 */

export class EvmSync extends BaseSync {
  protected assetId: AssetId

  constructor(address: Address, assetId: AssetId) {
    super(address)
    this.assetId = assetId
    this.reqHandler = CoinsNetwork.evm
  }

  async Start(): Promise<void> {
    await Promise.all([
      await this.getBalance(),
      await this.getBlockNumber(),
      // await this.getGasPrice(),
      await this.getTransactions(),
      await this.getInternalTransactions(),
    ])
  }

  async getBalance(): Promise<number> {
    this.balance = await this.reqHandler.getBalance(this.address, this.assetId)
    return this.balance
  }

  async getTransactions(): Promise<any> {
    const res = await this.reqHandler.getTransactions(
      this.address,
      this.assetId,
    )

    for (const tx of res) {
      if (tx.input !== EMPTY_INPUT_MARKER) {
        tx.decodedInput = decodeInputData(tx.input)
      }
    }

    this.transactions = res
    return this.transactions
  }

  async getInternalTransactions(): Promise<any> {
    this.internalTransactions = await this.reqHandler.getInternalTransactions(
      this.address,
      this.assetId,
    )
  }

  // async getGasPrice(): Promise<void> {
  //   this.gasPrice = await this.reqHandler.getGasPrice(this.assetId)
  // }

  async getBlockNumber(): Promise<void> {
    this.blockNumber = await this.reqHandler.getBlockNumber(this.assetId)
  }
}
