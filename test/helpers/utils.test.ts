import {hdFromSeed, mnemonicToSeed} from '@noonewallet/crypto-core-ts'
import {mnemonic} from '../../mocks/walletMock'
import {currencies} from '@helpers/currencies'
import {getEthCore, getEthAddress} from '@helpers/utils'
import {EthTx} from '@coins/ETH/tx'
import {recoverPublicKeyFromRawTx} from '@helpers/utils'

const getNode = () => {
  const seed = mnemonicToSeed(mnemonic)
  return hdFromSeed(seed)
}

const unit = 'GWEI'

const ethCoreTest = {
  externalAddress: '0xb2a63645ffbeeed9530261e1569e4d6a9a279b63',
  publicKey:
    '0xc49843c4b5b927dc61d42aba0dc4246e9035ea4055d8e12c2e8f52e59d0f1a9ed8d75db25dfd02b22eea93ac44af2904a3a823f3c6d22e84a9f184ec0c92b556',
  privateKey:
    '0xd3b4ceb73ab99c790c33d6f18a5b4da1398a58bcc0c2db7cbc52b1bbadf233d2',
}

const testTx = {
  addressTo: '0x39cf65754e55c69e5729b4ea57df526fa8ea684f',
  addressFrom: '0x1e8d99d2278acc10a9d67d89983e2920df33b485',
  privateKey:
    '0x168bc693ec2323ad210c2888ab46b31178dec8d6f1d1c216dcc42f591b218489',
  balance: 6690000000000000,
  gasPrice: 69300000000,
  // gasPrice: 55000000233,
  amount: 0.0052347,
  hash: '0x79811f42822f3d6740ed28ba66fd07ed048f98b4d3575f3e688a7fad8ce3a51a',
  tx: '0xf86b288510229a15008252089439cf65754e55c69e5729b4ea57df526fa8ea684f871298ee920178008026a06b07ca11e71b8d31422b0a364b3412bb695cfb245ca03dac012021ba065dedb6a07fde33f884bc5c1caa9fe35a638d7862a739764b190f889bd96345b9faedbed8',
}

describe('Utils Tests', () => {
  test('should create eth core', () => {
    const node = getNode()
    const ethCore = getEthCore(node, currencies.ETH.shortName)
    expect(ethCore).toBeDefined()
    expect(ethCore).toMatchObject(ethCoreTest)
  })

  test('should create address by public key', () => {
    const bufferFromAddress = Buffer.from(
      ethCoreTest.publicKey.replace('0x', ''),
      'hex',
    )
    const address = getEthAddress(
      bufferFromAddress,
      currencies.ETH.checksumAddress,
    )
    expect(address).toEqual(ethCoreTest.externalAddress)
  })

  test('tx test', () => {
    const txHandler = new EthTx({
      address: testTx.addressFrom,
      balance: testTx.balance,
      gasPrice: testTx.gasPrice,
      unit,
    })
    const feeList = txHandler.calcFee()

    // @ts-ignore
    const fee = feeList[0]
    const signTx = txHandler.make({
      fee,
      address: testTx.addressTo,
      amount: testTx.amount,
      privateKey: testTx.privateKey,
      nonce: 40,
    })
    expect(signTx.hash).toEqual(testTx.hash)
    expect(signTx.tx).toEqual(testTx.tx)
  })

  test('test recover public key for EIP1559', () => {
    const rawTx =
      '0x02f87301820114839896808502540be400825208946ff1a5257bd89277104d15dbfc834f8450ee4cd687038d7ea4c6800080c080a004b4cf2bdaa54553a6fbde9a8acb00f690d317c4ad0ebb0e3308af3214ce9d12a01f042cc5f92165e4077b959196c4b37943fced5cb47e79e6a25b48ec51c8aadf'
    const expectedPubKey =
      '0x6341703da2b14c65cbfdff76f77657e84e6cafbfbbe08a129546a375df41e934cf0a0aa639a2d38518037efb06a4e21089f9217b98f88a2992d5e6ef62a25d51'

    const pubKey = recoverPublicKeyFromRawTx(rawTx)
    expect(expectedPubKey).toEqual(pubKey)
  })
})
