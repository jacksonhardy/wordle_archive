import { autoBlackWhite, Column, Text, Block } from '@linen/ui'
import { useMemo } from 'react'
import { COLORS } from '../data/colors'

export const Letter = (props) => {
  const { value, state, colorblindMode } = props

  const background = useMemo(() => {
    const cb = colorblindMode
    switch (state) {
      case 'correct':
        return cb ? COLORS.ORANGE : COLORS.GREEN
      case 'partial':
        return cb ? COLORS.BLUE : COLORS.YELLOW
      case 'incorrect':
        return COLORS.GRAY
      case 'error':
        return COLORS.RED
      case 'not-guessed':
        return COLORS.GRAY
      default:
        return COLORS.BLACK
    }
  }, [colorblindMode, state])

  return (
    <Block cn={'letter'} background={background} color={autoBlackWhite(background)}>
      <Text xl black>
        {value}
      </Text>
    </Block>
  )
}
