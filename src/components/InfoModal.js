import {
  Anchor,
  autoBlackWhite,
  Button,
  Column,
  Container,
  Divider,
  Heading,
  List,
  Modal,
  Paragraph,
  Row,
  Text,
} from '@linen/ui'
import { ReactComponent as Github } from '../data/Github.svg'

export const InfoModal = ({ isOpen, handleClose, darkMode, colorBlindMode, styles }) => (
  <Modal
    TriggerComponent={<Button icon="info" />}
    size="auto"
    transition={'grow'}
    showCloseButton={false}
    title="What is this?"
    headerClasses="text-align-center js ac"
  >
    <Container wide gap={16} align="center" className="tac">
      <Column wide gap={8} align="center">
        <Row gap={0} justify="center">
          <Paragraph textAlign="center">This is an archive of </Paragraph>
          <Anchor href="https://www.powerlanguage.co.uk/wordle/">Wordle</Anchor>
          <Paragraph textAlign="center"> by </Paragraph>
          <Anchor href="https://twitter.com/powerlanguish">Josh Wardle</Anchor>
          <Paragraph textAlign="center"> built on </Paragraph>
          <Anchor href="https://twitter.com/katherinecodes">Katherine Peterson</Anchor>
          <Paragraph textAlign="center">'s </Paragraph>
          <Anchor href="https://octokatherine.github.io/word-master">WordMaster</Anchor>
        </Row>
        <Divider dotted />
      </Column>
      <Column wide gap={8} align="center">
        <Heading textAlign="center" level={2}>
          How to play?
        </Heading>
        <List
          items={[
            'You have 6 guesses to guess the correct word.',
            'You can guess any valid 5-letter word.',
            `After each guess, each letter will turn ${
              colorBlindMode ? '#ffa621, blue or gray.' : 'green, yellow, or gray.'
            }`,
          ]}
          textAlign="center"
        />
        <Column gap={24} style={{ width: 'auto' }} padding={24} align="center">
          <Row gap={8}>
            <Column
              justify="center"
              align="center"
              boxSize={48}
              style={{ borderRadius: '100%' }}
              background={`${colorBlindMode ? '#ffa621' : '#4A895C'}`}
            >
              <Text
                color={autoBlackWhite(`${colorBlindMode ? '#ffa621' : '#4A895C'}`)}
                textAlign="center"
                large
                bold
              >
                W
              </Text>
            </Column>
            <Text>Correct letter, correct position.</Text>
          </Row>
          <Row gap={8}>
            <Column
              justify="center"
              align="center"
              boxSize={48}
              style={{ borderRadius: '100%' }}
              background={`${colorBlindMode ? '#358fff' : '#FAD749'}`}
            >
              <Text
                color={autoBlackWhite(`${colorBlindMode ? '#358fff' : '#FAD749'}`)}
                textAlign="center"
                large
                bold
              >
                W
              </Text>
            </Column>
            <Text>Correct letter, wrong position.</Text>
          </Row>
          <Row gap={8}>
            <Column
              justify="center"
              align="center"
              boxSize={48}
              style={{ borderRadius: '100%' }}
              background="#DCDCDC"
            >
              <Text color={autoBlackWhite('#DCDCDC')} textAlign="center" large bold>
                W
              </Text>
            </Column>
            <Text>Wrong letter.</Text>
          </Row>
        </Column>
        <Divider dotted />
        <Column align="center">
          <Row gap={0} justify="center">
            <Paragraph small italic textAlign="center">
              Original archive made by{' '}
            </Paragraph>
            <Anchor className="paragraph --em" href="https://www.twitter.com/devangvang">
              Devang Thakkar
            </Anchor>
            .
          </Row>
          <Row gap={0} justify="center">
            <Paragraph small italic textAlign="center">
              Redesigned and refactored frontend by{' '}
            </Paragraph>
            <Anchor className="paragraph --em" href="https://www.github.com/jacksonhardy">
              Jackson Hardy
            </Anchor>
            .
          </Row>
          <Row gap={4} justify="center">
            <Paragraph small italic textAlign="center">
              This project is open source on{' '}
            </Paragraph>
            <Anchor
              isExternal
              className="paragraph --em"
              href="https://www.github.com/jacksonhardy"
            >
              {' '}
              <Github style={{ height: 16 }} /> Github
            </Anchor>
            .
          </Row>
        </Column>
      </Column>
    </Container>
  </Modal>
)
