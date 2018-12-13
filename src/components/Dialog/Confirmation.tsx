import React from "react"
import Button from "@material-ui/core/Button"
import Dialog from "@material-ui/core/Dialog"
import DialogActions from "@material-ui/core/DialogActions"
import DialogContent from "@material-ui/core/DialogContent"
import DialogContentText from "@material-ui/core/DialogContentText"
import DialogTitle from "@material-ui/core/DialogTitle"
import Slide, { SlideProps } from "@material-ui/core/Slide"
import WarnIcon from "@material-ui/icons/Warning"
import Background from "../Background"
import ButtonIconLabel from "../ButtonIconLabel"

const Transition = (props: SlideProps) => <Slide {...props} direction="up" />

interface Props {
  confirmationLabel?: React.ReactNode
  description: React.ReactNode
  icon?: React.ReactNode
  open: boolean
  title: React.ReactNode
  warning?: boolean
  onCancel: () => void
  onConfirm: () => void
}

const ConfirmationDialog = (props: Props) => {
  const { confirmationLabel = "Confirm" } = props
  return (
    <Dialog open={props.open} onClose={props.onCancel} TransitionComponent={Transition}>
      {props.warning ? (
        <Background opacity={0.08}>
          <WarnIcon style={{ fontSize: 160 }} />
        </Background>
      ) : null}
      <DialogTitle>{props.title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{props.description}</DialogContentText>
        <DialogActions>
          <Button color="primary" onClick={props.onCancel} style={{ marginRight: 16 }}>
            Cancel
          </Button>
          <Button color="primary" onClick={props.onConfirm} variant="contained">
            {props.icon ? <ButtonIconLabel label={confirmationLabel}>{props.icon}</ButtonIconLabel> : confirmationLabel}
          </Button>
        </DialogActions>
      </DialogContent>
    </Dialog>
  )
}

export default ConfirmationDialog
