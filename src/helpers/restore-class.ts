import {Address} from '@helpers/types'

const defaultNoRestoredParams = ['headers', 'request']

export interface IRestoreData {
  address: Address
  balance: number
  gasPrice: number
  blockNumber: number
}

export const restoreClass = (
  // eslint-disable-next-line @typescript-eslint/ban-types
  obj: {},
  restoredData: IRestoreData,
  noRestoredParams = [],
) => {
  const params = noRestoredParams.length
    ? noRestoredParams
    : defaultNoRestoredParams

  if (!restoredData || typeof restoredData !== 'object') return
  for (const key in restoredData) {
    if (!params.includes(key) && key in obj) {
      // @ts-ignore
      obj[key as keyof IRestoreData] = restoredData[key as keyof IRestoreData]
    }
  }
}
