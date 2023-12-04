import { observer } from "mobx-react-lite"
import { FC, useCallback, useEffect, useState } from "react"
import { Alert } from "../../../components/Alert"
import { Button, PrimaryButton } from "../../../components/Button"
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "../../../components/Dialog"
import { Localized } from "../../../components/Localized"
import { canExport, exportSongAsJson, exportSongAsWav } from "../../actions"
import { useStores } from "../../hooks/useStores"

export const ExportDialog: FC = observer(() => {
  const rootStore = useStores()
  const { exportStore, song } = rootStore
  const { openExportDialog: open } = exportStore
  const onClose = useCallback(
    () => (exportStore.openExportDialog = false),
    [exportStore],
  )

  const onClickExport = useCallback(() => {
    exportStore.openExportDialog = false
    exportSongAsWav(rootStore)()
  }, [rootStore, exportStore])

  const onClickExportAsJson = useCallback(() => {
    exportStore.openExportDialog = false
    exportSongAsJson(rootStore)()
  }, [rootStore, exportStore])

  const [exportEnabled, setExportEnabled] = useState(false)
  useEffect(() => {
    if (open) {
      setExportEnabled(canExport(song))
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onClose} style={{ minWidth: "20rem" }}>
      <DialogTitle>
        <Localized default="Export Audio">export-audio</Localized>
      </DialogTitle>
      <DialogContent>
        <p>
          <Localized default="File Type">file-type</Localized>: WAV
        </p>
        {!exportEnabled && (
          <Alert severity="warning">
            <Localized default="Songs are too short">
              export-error-too-short
            </Localized>
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>
          <Localized default="Close">close</Localized>
        </Button>
        {exportEnabled && (
          <div>
          <PrimaryButton onClick={onClickExport}>
            <Localized default="Export">export</Localized>
          </PrimaryButton>
            <PrimaryButton onClick={onClickExportAsJson}>
              <Localized default="Export as json">export</Localized>
            </PrimaryButton>
          </div>
        )}
      </DialogActions>
    </Dialog>
  )
})
