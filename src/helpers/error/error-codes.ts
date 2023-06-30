interface ErrorCodes {
  [key: string]: string
}

const ErrorCodes: ErrorCodes = {
  err_core_eth_node: 'Error generating ETH private key. Check ETH node',
  err_core_eth_private_key:
    'Error generating ETH public key. Check ETH private key',
  err_core_eth_public_key: 'Error generating ETH address. Check ETH public key',
  err_tx_eth_balance: 'Insufficient balance',
  err_tx_eth_address: 'Invalid ethereum address',
  err_tx_eth_contract: 'Invalid contract address',
  err_tx_eth_build: 'ETH transaction failed. Check all parameters',
  err_tx_eth_invalid_params:
    'Invalid params. Nonce, value, gas price and gas limit have to be a number',
  err_tx_eth_invalid_params_string:
    'Invalid params. Parameters "to" must be string based',
}

export default ErrorCodes
