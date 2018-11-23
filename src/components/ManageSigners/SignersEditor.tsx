import React from "react"
import { AccountRecord } from "stellar-sdk"
import IconButton from "@material-ui/core/IconButton"
import ListItem from "@material-ui/core/ListItem"
import ListItemIcon from "@material-ui/core/ListItemIcon"
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction"
import ListItemText from "@material-ui/core/ListItemText"
import EditIcon from "@material-ui/icons/Edit"
import PersonIcon from "@material-ui/icons/Person"
import RemoveIcon from "@material-ui/icons/Close"
import SpaciousList from "../List/SpaciousList"
import PublicKey from "../PublicKey"
import NewSignerForm from "./NewSignerForm"

type Signer = AccountRecord["signers"][0]

interface SignersEditorProps {
  signers: Signer[]
  addSigner: (signer: Signer) => void
  editSigner: (signer: Signer) => void
  removeSigner: (signer: Signer) => void
}

interface SignersEditorState {
  editingSigner: "new" | "existing" | false
  signerEditErrors: {
    publicKey?: Error
    weight?: Error
  }
  signerEditValues: {
    publicKey: string
    weight: string
  }
}

class SignersEditor extends React.Component<SignersEditorProps, SignersEditorState> {
  state: SignersEditorState = {
    editingSigner: false,
    signerEditErrors: {},
    signerEditValues: {
      publicKey: "",
      weight: "1"
    }
  }

  addAdditionalCosigner = () => {
    this.setState({ editingSigner: "new" })
  }

  cancelEditingCosigner = () => {
    this.setState({ editingSigner: false })
  }

  createCosigner = () => {
    const { signerEditValues } = this.state
    const errors: Partial<SignersEditorState["signerEditErrors"]> = {}

    if (!signerEditValues.publicKey.match(/^G[A-Z0-9]{55}$/)) {
      errors.publicKey = new Error("Not a valid public key.")
    }
    if (!signerEditValues.weight.match(/^[0-9]+$/)) {
      errors.weight = new Error("Must be an integer.")
    }

    if (Object.keys(errors).length > 0) {
      return this.setState({ signerEditErrors: errors })
    }

    this.props.addSigner({
      public_key: signerEditValues.publicKey,
      weight: parseInt(signerEditValues.weight, 10)
    })

    this.setState({
      editingSigner: false,
      signerEditErrors: {},
      signerEditValues: {
        publicKey: "",
        weight: "1"
      }
    })
  }

  editSigner = (signer: Signer) => {
    this.setState({
      editingSigner: "existing",
      signerEditErrors: {},
      signerEditValues: {
        publicKey: signer.public_key,
        weight: String(signer.weight)
      }
    })
  }

  updateNewSignerValues = (values: Partial<SignersEditorState["signerEditValues"]>) => {
    this.setState(state => ({
      signerEditValues: {
        ...state.signerEditValues,
        ...values
      }
    }))
  }

  render() {
    const { editingSigner, signerEditErrors, signerEditValues } = this.state
    return (
      <SpaciousList fitHorizontal>
        {this.props.signers.map(signer => (
          <ListItem>
            <ListItemIcon>
              <PersonIcon style={{ fontSize: "2rem" }} />
            </ListItemIcon>
            <ListItemText
              primary={<PublicKey publicKey={signer.public_key} variant="full" />}
              secondary={`Weight: ${signer.weight}`}
            />
            <ListItemSecondaryAction>
              <IconButton aria-label="Edit" disabled={editingSigner !== false} onClick={() => this.editSigner(signer)}>
                <EditIcon />
              </IconButton>
              <IconButton aria-label="Remove" onClick={() => this.props.removeSigner(signer)}>
                <RemoveIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
        {editingSigner === "new" ? (
          <NewSignerForm
            errors={signerEditErrors}
            onCancel={this.cancelEditingCosigner}
            onSubmit={this.createCosigner}
            onUpdate={this.updateNewSignerValues}
            values={signerEditValues}
          />
        ) : null}
      </SpaciousList>
    )
  }
}

export default SignersEditor
