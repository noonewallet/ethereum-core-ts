import {BaseSync} from '@modules/base-sync'
import {toDecimal, toBN} from 'web3-utils'
// @ts-ignore
import {CoinsNetwork} from '@noonewallet/network-js'
import {
  Address,
  Contract,
  ITokenTxSync,
  IRawTokenTxSync,
  RawTokenTxMap,
  AssetId,
} from '@helpers/types'

export class EvmTokenSync extends BaseSync {
  private contract: Contract
  protected assetId: AssetId
  private tokenTransactions: ITokenTxSync[]

  constructor(address: Address, assetId: AssetId, contract: Contract) {
    super(address)
    this.assetId = assetId
    this.tokenTransactions = []
    this.contract = contract
    this.reqHandler = CoinsNetwork.evm
  }

  async Start() {
    await Promise.all([this.getBalance(), this.getTransactions()])
  }

  async getBalance() {
    this.balance = await this.reqHandler.getTokenBalance({
      address: this.address,
      assetId: this.assetId,
      contract: this.contract,
    })

    return this.balance
  }

  //
  // async getTransactions(): Promise<void> {
  //   this.tokenTransactions = []
  //
  //   await Promise.all([this.getInTransactions(), this.getOutTransactions()])
  //   this.tokenTransactions = this.tokenTransactions.filter(
  //     (item: ITokenTxSync, index: number, self: ITokenTxSync[]) => {
  //       return index === self.findIndex((i) => i.hash === item.hash)
  //     },
  //   )
  // }

  async getTransactions(): Promise<void> {
    const res = await this.reqHandler.getTokenTransactions({
      address: this.address,
      assetId: this.assetId,
      contract: this.contract,
    })
    const formatedTxs: ITokenTxSync[] = this.processTransactions(res)
    this.tokenTransactions.push(...formatedTxs)
  }

  processTransactions(txs: IRawTokenTxSync[]): ITokenTxSync[] {
    const txsMap: RawTokenTxMap = {}
    txs.forEach((item) => {
      if (!txsMap[item.transactionHash]) {
        txsMap[item.transactionHash] = []
      }
      txsMap[item.transactionHash].push(item)
    })
    const formattedTxs: ITokenTxSync[] = []
    for (const hash in txsMap) {
      const group = txsMap[hash]
      let amount
      const item: IRawTokenTxSync = group[0]
      if (group.length !== 1) {
        const topics = group.map((item) => item.topics).flat(1)
        const uniqTopics = [...new Set(topics)]
        if (
          uniqTopics.length === item.topics.length &&
          uniqTopics.every((topic, i) => topic === item.topics[i])
        ) {
          amount = group.reduce((accum, curValue) => {
            const value = toBN(curValue.data).toString()
            return accum + +value
          }, 0)
        } else {
          amount = toBN(item.data).toString()
        }
      } else {
        amount = toBN(item.data).toString()
      }
      const fromAddress = item.topics[1].replace(
        '0x000000000000000000000000',
        '0x',
      )
      const toAddress = item.topics[2].replace(
        '0x000000000000000000000000',
        '0x',
      )
      const action = this.address === toAddress ? 'incoming' : 'outcoming'
      const tx = {
        to: action === 'incoming' ? this.address : toAddress,
        from: action === 'incoming' ? fromAddress : this.address,
        hash: item.transactionHash,
        gasPrice: toDecimal(item.gasPrice),
        gasUsed: toDecimal(item.gasUsed),
        timeStamp: toDecimal(item.timeStamp),
        blockNumber: toDecimal(item.blockNumber),
        amount: amount,
        action: action,
      }
      // @ts-ignore
      formattedTxs.push(tx)
    }
    return formattedTxs
  }

  get DATA() {
    return {
      ...super.DATA,
      tokenTransactions: this.tokenTransactions,
    }
  }
}
