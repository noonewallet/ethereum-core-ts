import {makeRawEthTx} from '@modules/transaction'
import {EthTx} from '@coins/ETH/tx'
import converters from '@helpers/converters'
import {ITxClass, IFeeTx, IRawTxData, ITxData} from '@helpers/types'

export const expectedSignedTx = {
  hash: '0x79811f42822f3d6740ed28ba66fd07ed048f98b4d3575f3e688a7fad8ce3a51a',
  tx: '0xf86b288510229a15008252089439cf65754e55c69e5729b4ea57df526fa8ea684f871298ee920178008026a06b07ca11e71b8d31422b0a364b3412bb695cfb245ca03dac012021ba065dedb6a07fde33f884bc5c1caa9fe35a638d7862a739764b190f889bd96345b9faedbed8',
}
const valueInEth = 0.0052347
const value = converters.eth_to_wei(valueInEth)
const fee: IFeeTx = {
  id: 'optimal',
  gasPrice: 69300000000,
  gasLimit: 21000,
}
const txData: ITxData = {
  to: '0x39cf65754e55c69e5729b4ea57df526fa8ea684f',
  privateKey:
    '0x168bc693ec2323ad210c2888ab46b31178dec8d6f1d1c216dcc42f591b218489',
  gasPrice: fee.gasPrice,
  gasLimit: fee.gasLimit,
  nonce: 40,
  value,
}

describe('Eth Tests', () => {
  test('should create tx', () => {
    const tx = makeRawEthTx(txData)
    expect(tx).toMatchObject(expectedSignedTx)
  })

  test('should create tx class', () => {
    const classData: ITxClass = {
      address: '0x1e8d99d2278acc10a9d67d89983e2920df33b485',
      balance: 6690000000000000,
      gasPrice: 55000000233,
    }
    const tx = new EthTx(classData)
    expect(tx).toBeDefined()
  })

  test('should create tx class and sign tx', () => {
    const classData: ITxClass = {
      address: '0x1e8d99d2278acc10a9d67d89983e2920df33b485',
      balance: 100000000000000000,
      gasPrice: 55000000233,
    }
    const tx = new EthTx(classData)
    const rawTxData: IRawTxData = {
      address: txData.to,
      amount: valueInEth,
      nonce: txData.nonce,
      privateKey: txData.privateKey,
      fee: fee,
    }
    const signedTx = tx.make(rawTxData)
    expect(signedTx).toMatchObject(expectedSignedTx)
  })
})
