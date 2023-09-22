[![License](https://img.shields.io/badge/license-MIT-green.svg?style=flat)](https://github.com/noonewallet/ethereum-core-ts/blob/main/LICENSE)
[![Platform](https://img.shields.io/badge/platform-web-blue.svg?style=flat)]()
![Dynamic JSON Badge](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2Fnoonewallet%2Fethereum-core-ts%2Fmain%2Fpackage.json&query=version&label=version)

![ethereum-core-ts](https://github.com/noonewallet/noone-android-core-crypto/assets/111989613/1f062349-24d4-4824-9c00-b8f2724eca51)

# ethereum-core-ts
The ethereum-core-ts library is an implementation of tools for working with Ethereum and ERC-20 tokens, as well as Ethereum-like coins such as XinFin. It allows generating keys and addresses, as well as signing transactions.

**Note**: Node version >= 16.15.0
## Usage

### Generate keys and a address:
```
import {utils as EthUtils}                from '@noonewallet/ethereum-core-ts'
import {createCoreByMnemonic, hdFromXprv} from '@noonewallet/core-js'

const mnemonic = 'judge same gain ... salad lake cash '
const {xprv} = createCoreByMnemonic(mnemonic)
const node = hdFromXprv(xprv)
const core = EthUtils.getEthCore(node, 'ETH')
console.log(
  core.privateKey,
  core.publicKey,
  core.externalAddress
)
```

### Create a transaction:
```
import {EthTx} from '@noonewallet/ethereum-core-ts'

const txHandler = new EthTx({
  address: '0x39cf65754...26fa8ea684f, // a sender address
  balance: 2000000000000000, // a current sender balance in wei
  gasPrice: 60000000000 // default gas price in wei
})

let tx_params = {
  address: '0x6fd07ed048f98...71b8d31422', // a recipient address
  amount: 0.5, // a sending amount in ETH
  fee: {...}, // a transaction fee (IFeeTx)
  privateKey: '0xf1d1c216dcc4...6dcc42f591b218489', // a sender private key
  nonce: 15
}

const sign_tx = txHandler.make(tx_params)
console.log(
  sign_tx.hash, // => '0x8ba66f048f...8b4d3575f3e688a',
  sign_tx.tx, // => '0x5a638d7862a739764b190f889...65dedb6a07fde33f884bc5c1caa9fe'
)
```

## Created using
* [@noonewallet/crypto-core-ts](https://github.com/noonewallet/crypto-core-ts)
* [@ethereumjs/tx](https://github.com/ethereumjs/ethereumjs-monorepo)
* [ethereumjs-util](https://github.com/ethereumjs/ethereumjs-monorepo)
* [js-big-decimal](https://github.com/royNiladri/js-big-decimal)
* [web3](https://github.com/web3/web3.js)
* [web3-utils](https://github.com/web3/web3.js/tree/1.x/packages/web3-utils)

## License

ethereum-core-ts is available under the MIT license. See the [LICENSE](https://github.com/noonewallet/ethereum-core-ts/blob/main/LICENSE) file for more info.
