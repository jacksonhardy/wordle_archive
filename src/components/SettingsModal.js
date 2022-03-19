import { Button, Column, Form, Icon, Label, Modal, Row, Toggle } from '@linen/ui'

export const SettingsModal = ({
  isOpen,
  handleClose,
  darkMode,
  toggleDarkMode,
  colorBlindMode,
  toggleColorBlindMode,
}) => {
  return (
    <Modal TriggerComponent={<Button icon="cog" />} title="Settings" transition="grow">
      <Column gap={16}>
        <Form>
          <Column gap={16}>
            <Row gap={8} style={{ cursor: 'pointer' }}>
              <Toggle onChange={toggleDarkMode} on={darkMode} name="darkmode" />
              <Label htmlFor="darkmode">Dark Mode</Label>
            </Row>
            <Row gap={8} style={{ cursor: 'pointer' }}>
              <Toggle onChange={toggleColorBlindMode} on={colorBlindMode} name="colorBlindMode" />
              <Label htmlFor="colorBlindMode">Colorblind Mode</Label>
            </Row>
          </Column>
        </Form>
      </Column>
    </Modal>
  )
}
