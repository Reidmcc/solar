import React from "react"
import Typography from "@material-ui/core/Typography"
import { Account } from "../../context/accounts"
import { SettingsContextType } from "../../context/settings"
import AccountBalances from "./AccountBalances"

const DetailContent = (props: { children: React.ReactNode }) => {
  const style: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 8,
    fontSize: "1.2rem"
  }
  return (
    <Typography color="inherit" component="div" variant="body1" style={style}>
      {props.children}
    </Typography>
  )
}

const AccountPublicKey = (props: { publicKey: string }) => {
  const style = {
    display: "inline-block",
    maxWidth: "100%",
    overflow: "hidden",
    fontWeight: 300,
    textOverflow: "ellipsis"
  }
  return <span style={style}>{props.publicKey}</span>
}

const AccountDetails = (props: { account: Account; settings: SettingsContextType }) => {
  const { account } = props
  const isCosignatureKeypair =
    props.settings.multiSignature && account.accountID && account.accountID !== account.publicKey
  return (
    <div>
      <DetailContent>
        <AccountBalances publicKey={account.accountID || account.publicKey} testnet={account.testnet} />
      </DetailContent>
      <DetailContent>
        <AccountPublicKey publicKey={account.accountID || account.publicKey} />
      </DetailContent>
      {isCosignatureKeypair ? (
        <DetailContent>
          <AccountPublicKey publicKey={account.publicKey} />
          &nbsp;(Co-Signature Key)
        </DetailContent>
      ) : null}
    </div>
  )
}

export default AccountDetails
