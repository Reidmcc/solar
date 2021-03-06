import React from "react"
import { useContext } from "react"
import Button from "@material-ui/core/Button"
import CircularProgress from "@material-ui/core/CircularProgress"
import Typography from "@material-ui/core/Typography"
import DoneAllIcon from "@material-ui/icons/DoneAll"
import SendIcon from "@material-ui/icons/Send"
import UpdateIcon from "@material-ui/icons/Update"
import ButtonIconLabel from "../components/ButtonIconLabel"
import AccountBalances from "../components/Account/AccountBalances"
import AccountHeaderCard from "../components/Account/AccountHeaderCard"
import FriendbotButton from "../components/Account/FriendbotButton"
import { InteractiveSignatureRequestList } from "../components/Account/SignatureRequestList"
import TransactionList from "../components/Account/TransactionList"
import CreatePaymentDialog from "../components/Dialog/CreatePayment"
import ManageAssetsDialog from "../components/Dialog/ManageAssets"
import ManageSignersDialog from "../components/Dialog/ManageSigners"
import ReceivePaymentDialog from "../components/Dialog/ReceivePayment"
import { MinimumAccountBalance } from "../components/Fetchers"
import QRCodeIcon from "../components/Icon/QRCode"
import { HorizontalLayout } from "../components/Layout/Box"
import { HorizontalMargin, VerticalMargin } from "../components/Layout/Spacing"
import { Section } from "../components/Layout/Page"
import { Account, AccountsContext } from "../context/accounts"
import { SettingsContext } from "../context/settings"
import { SignatureDelegationContext } from "../context/signatureDelegation"
import { useAccountData, useHorizon, useRecentTransactions, useRouter } from "../hooks"
import { hasSigned } from "../lib/transaction"
import * as routes from "../routes"

function DetailContent(props: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <Typography color="inherit" component="div" variant="body1" style={{ fontSize: "1.2rem", ...props.style }}>
      {props.children}
    </Typography>
  )
}

interface AccountActionsProps {
  account: Account
  onCreatePayment: () => void
  onReceivePayment: () => void
}

function AccountActions(props: AccountActionsProps) {
  const accountData = useAccountData(props.account.publicKey, props.account.testnet)
  return (
    <HorizontalLayout>
      <Button
        variant="contained"
        onClick={props.onReceivePayment}
        style={{
          border: "none",
          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.4)",
          fontSize: "1rem",
          flexGrow: 1,
          padding: "20px"
        }}
      >
        <ButtonIconLabel label="Receive">
          <QRCodeIcon style={{ fontSize: "110%" }} />
        </ButtonIconLabel>
      </Button>
      <HorizontalMargin size={40} />
      <Button
        color="primary"
        variant="contained"
        disabled={!accountData.activated}
        onClick={props.onCreatePayment}
        style={{
          border: "none",
          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.4)",
          fontSize: "1rem",
          flexGrow: 1,
          paddingLeft: 20,
          paddingRight: 20
        }}
      >
        <ButtonIconLabel label="Send">
          <SendIcon style={{ fontSize: "110%" }} />
        </ButtonIconLabel>
      </Button>
    </HorizontalLayout>
  )
}

function PendingMultisigTransactions(props: { account: Account }) {
  const { pendingSignatureRequests } = useContext(SignatureDelegationContext)
  return (
    <>
      <InteractiveSignatureRequestList
        account={props.account}
        icon={<DoneAllIcon />}
        signatureRequests={pendingSignatureRequests.filter(
          request =>
            request._embedded.signers.some(signer => signer.account_id === props.account.publicKey) &&
            !hasSigned(request.meta.transaction, props.account.publicKey)
        )}
        title="Transactions to co-sign"
      />
      <InteractiveSignatureRequestList
        account={props.account}
        icon={<UpdateIcon style={{ opacity: 0.5 }} />}
        signatureRequests={pendingSignatureRequests.filter(
          request =>
            request._embedded.signers.some(signer => signer.account_id === props.account.publicKey) &&
            hasSigned(request.meta.transaction, props.account.publicKey)
        )}
        title="Awaiting additional signatures"
      />
    </>
  )
}

function Transactions(props: { account: Account }) {
  const { account } = props
  const horizon = useHorizon(account.testnet)
  const recentTxs = useRecentTransactions(account.publicKey, account.testnet)
  const settings = useContext(SettingsContext)

  return (
    <>
      {recentTxs.loading ? (
        <div style={{ padding: "16px", textAlign: "center" }}>
          <CircularProgress />
        </div>
      ) : recentTxs.activated ? (
        <>
          {settings.multiSignature ? <PendingMultisigTransactions account={account} /> : null}
          <TransactionList
            accountPublicKey={account.publicKey}
            background="transparent"
            title="Recent transactions"
            testnet={account.testnet}
            transactions={recentTxs.transactions}
          />
        </>
      ) : (
        <>
          <Typography align="center" color="textSecondary" style={{ margin: "30px auto" }}>
            Account does not yet exist on the network. Send at least <MinimumAccountBalance testnet={account.testnet} />
            &nbsp;XLM to activate the account.
          </Typography>
          {account.testnet ? (
            <Typography align="center" style={{ paddingBottom: 30 }}>
              <FriendbotButton horizon={horizon} publicKey={account.publicKey} />
            </Typography>
          ) : null}
        </>
      )}
    </>
  )
}

interface Props {
  accountID: string
  showAssetManagement: boolean
  showCreatePayment: boolean
  showReceivePayment: boolean
  showSignersManagement: boolean
}

function AccountPage(props: Props) {
  const { accounts, renameAccount } = useContext(AccountsContext)
  const router = useRouter()

  const onCloseDialog = () => router.history.push(routes.account(props.accountID))

  const account = accounts.find(someAccount => someAccount.id === props.accountID)
  if (!account) {
    throw new Error(`Wallet account not found. ID: ${props.accountID}`)
  }

  return (
    <>
      <Section top brandColored grow={0}>
        <AccountHeaderCard
          account={account}
          onManageAssets={() => router.history.push(routes.manageAccountAssets(props.accountID))}
          onManageSigners={() => router.history.push(routes.manageAccountSigners(props.accountID))}
          onRenameAccount={renameAccount}
        >
          <DetailContent style={{ marginTop: 12, marginLeft: 48 }}>
            <AccountBalances publicKey={account.publicKey} testnet={account.testnet} />
          </DetailContent>
          <VerticalMargin size={40} />
          <AccountActions
            account={account}
            onCreatePayment={() => router.history.push(routes.createPayment(props.accountID))}
            onReceivePayment={() => router.history.push(routes.receivePayment(props.accountID))}
          />
        </AccountHeaderCard>
      </Section>
      <Section backgroundColor="#f6f6f6">
        <Transactions account={account} />
      </Section>
      <CreatePaymentDialog account={account} open={props.showCreatePayment} onClose={onCloseDialog} />
      <ManageAssetsDialog account={account} open={props.showAssetManagement} onClose={onCloseDialog} />
      <ManageSignersDialog account={account} open={props.showSignersManagement} onClose={onCloseDialog} />
      <ReceivePaymentDialog account={account} open={props.showReceivePayment} onClose={onCloseDialog} />
    </>
  )
}

export default AccountPage
