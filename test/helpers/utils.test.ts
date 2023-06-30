import {hdFromSeed, mnemonicToSeed} from '@noonewallet/core-js'
import {mnemonic} from '../../mocks/walletMock'
import {currencies} from '@helpers/currencies'
import {getEthCore, getEthAddress} from '@helpers/utils'

const getNode = () => {
  const seed = mnemonicToSeed(mnemonic)
  return hdFromSeed(seed)
}

const ethCoreTest = {
  externalAddress: '0xb2A63645fFBeEEd9530261e1569E4d6a9a279B63',
  publicKey:
    '0xc49843c4b5b927dc61d42aba0dc4246e9035ea4055d8e12c2e8f52e59d0f1a9ed8d75db25dfd02b22eea93ac44af2904a3a823f3c6d22e84a9f184ec0c92b556',
  privateKey:
    '0xd3b4ceb73ab99c790c33d6f18a5b4da1398a58bcc0c2db7cbc52b1bbadf233d2',
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
})
