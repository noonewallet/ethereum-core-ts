import {BaseTx} from '@modules/base-tx'
import {ITxClass} from '@helpers/types'
import {currencies} from '@helpers/currencies'
import {DEFAULT_FEE_UNIT} from '@helpers/config'

export class XdcTx extends BaseTx {
  constructor(data: ITxClass) {
    super(data)
    super.setCurrency(currencies.XDC)
    super.setFeeList(['optimal'])
    this.unit = DEFAULT_FEE_UNIT
  }
}
