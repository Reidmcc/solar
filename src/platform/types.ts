export interface PublicKeyData {
  accountID?: string
  name: string
  password: boolean
  publicKey: string
  testnet: boolean
}

export interface PrivateKeyData {
  privateKey: string
}

export interface SettingsData {
  multisignature: boolean
  testnet: boolean
}
