/**
 * @jest-environment node
 */
import {hdFromSeed, mnemonicToSeed} from '@noonewallet/crypto-core-ts'
import {mnemonic} from '../../mocks/walletMock'
import {currencies} from '@helpers/currencies'
import {
  getEthAddress,
  getEthCore,
  recoverPublicKeyFromRawTx,
  signTypedData,
} from '@helpers/utils'
import {EthTx} from '@coins/ETH/tx'
import * as sigUtil from '@metamask/eth-sig-util'
import {TypedMessage, SignTypedDataVersion} from '@metamask/eth-sig-util'
import * as ethUtil from 'ethereumjs-util'

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
  test('should get signature using signTypedData (V4)', () => {
    const privateKey =
      '0x4c0883a69102937d6231471b5ecb1e1d2be8b03b34aaca8b7fdec1c800b8ab12'

    // EIP-712 typed data
    const typedData = {
      types: {
        EIP712Domain: [
          {name: 'name', type: 'string'},
          {name: 'version', type: 'string'},
          {name: 'chainId', type: 'uint256'},
          {name: 'verifyingContract', type: 'address'},
        ],
        Person: [
          {name: 'name', type: 'string'},
          {name: 'wallet', type: 'address'},
        ],
        Mail: [
          {name: 'from', type: 'Person'},
          {name: 'to', type: 'Person'},
          {name: 'contents', type: 'string'},
        ],
      },
      primaryType: 'Mail',
      domain: {
        name: 'Ether Mail',
        version: '1',
        chainId: 1,
        verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
      },
      message: {
        from: {
          name: 'Alice',
          wallet: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
        },
        to: {
          name: 'Bob',
          wallet: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
        },
        contents: 'Hello, Bob!',
      },
    }

    const signature = signTypedData(privateKey, typedData, 'V4')
    const expectedSignature =
      '0xab56b50dd8b3fd468e86932cc83649f6d83e896dfa3921b12dfa93d964e0d6cc0d4d949a6474fdfcc868178bd2c82f3df06b06b657bfe19428acd91a463a1c131b'
    expect(signature).toEqual(expectedSignature)
  })

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

  test('test recover public key for legacy', () => {
    const rawTx =
      '0xf86b06843b9aca00825208940d6ec8c979f9c410565494d7494efc2a29c5362b87038d7ea4c68000808193a0e595fa3bc82fda7dd349155845d53fd742e7d1988f710ac41b0304352a1290b1a00ed6fc2bb05bfe59d944866b7f83e16cafea444f67069fe41707d2899de82dfc'
    const expectedPubKey =
      '0xe208d1e5bf3694586875370d7bdb49e9cedb2691f6cbef461ac67058977e30052c70f91e62a4ac8669e78eecdbf6588b324466024f39a29b4c2b0a28b3cdfcf8'

    const pubKey = recoverPublicKeyFromRawTx(rawTx)
    expect(expectedPubKey).toEqual(pubKey)
  })
})
