import {makeRawEthTx} from '@modules/transaction'

const tx1 = {
  to: '0xdac17f958d2ee523a2206206994597c13d831ec7',
  value: '0x0',
  nonce: '0x51',
  from: '0x6ff1a5257bd89277104d15dbfc834f8450ee4cd6',
  data: '0xa9059cbb000000000000000000000000b7c8f77f3a81eddae70431fdfc85d970a7865fcf00000000000000000000000000000000000000000000000000000000001e8480',
  gas: '0xcf14',
  maxPriorityFeePerGas: '0x1dcd6500',
  maxFeePerGas: '0x127427b2ec',
  type: '0x2',
  privateKey:
    '0x912e151136e6dd0620f5e81eb3b4f00d7970aec970e823c98e86ec326bf63155',
}
const tx1Signed = {
  hash: '0x5b09da3992d31cd3e520346984ab8edc0fc84f2dfbcd88099ec2e3642883ddca',
  tx: '0x02f8b00151841dcd650085127427b2ec82cf1494dac17f958d2ee523a2206206994597c13d831ec780b844a9059cbb000000000000000000000000b7c8f77f3a81eddae70431fdfc85d970a7865fcf00000000000000000000000000000000000000000000000000000000001e8480c080a09634df2204a61af7723ebedb9a6e4913c75ee0fc929ae863aedd1f0de4f85352a020b02849bbba00a14ed170fbdf38fae75896e381740888765c16b0b48074cb83',
}

const tx2 = {
  to: '0xca8a66887dfbef870a2d96de536986516a37fa12',
  value: '0x0',
  gasPrice: '0x4cc037c59',
  gas: '0xda59',
  nonce: '0x50',
  data: '0x095ea7b30000000000000000000000001aaad07998466cd3eb8140827dddb37570be1e63ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
  privateKey:
    '0x912e151136e6dd0620f5e81eb3b4f00d7970aec970e823c98e86ec326bf63155',
}

const tx2Signed = {
  hash: '0xc2324dc7d95c11f26543d65c3cc1a530cc9e22562d217b156fa4fb54ac93155d',
  tx: '0xf8a9508504cc037c5982da5994ca8a66887dfbef870a2d96de536986516a37fa1280b844095ea7b30000000000000000000000001aaad07998466cd3eb8140827dddb37570be1e63ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff25a05592fb0877c00e294eee3cd6553a72c4e1d923bf8dbae743feb1c4c9002a4e95a04b2c4f4c8dea5d0bacf28a2123e6fcff91d1bdde7c12641500a123c8a40e5735',
}

describe('Raw Tx Tests', () => {
  test('should sign tx (type 2)', () => {
    const tx = makeRawEthTx(tx1)
    expect(tx).toBeDefined()
    expect(tx.hash).toEqual(tx1Signed.hash)
    expect(tx.tx).toEqual(tx1Signed.tx)
  })

  test('should sign tx (type 0)', () => {
    const tx = makeRawEthTx(tx2)
    expect(tx).toBeDefined()
    expect(tx.hash).toEqual(tx2Signed.hash)
    expect(tx.tx).toEqual(tx2Signed.tx)
  })
})
