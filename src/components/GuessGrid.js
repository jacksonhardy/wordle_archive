import { Grid } from '@linen/ui'
import { Letter } from './Letter'

export const GuessGrid = (props) => {
  const { board, solution, colorblindMode, currentRowInvalid, currentRow } = props
  console.log(solution)

  const getLetterState = (letter, position) => {
    const solutionArray = solution.split('')
    if (solutionArray.includes(letter)) {
      if (solutionArray[position] === letter) {
        return 'correct'
      } else {
        return 'partial'
      }
    } else {
      return 'incorrect'
    }
  }

  return (
    <Grid columns={5} cn={'guess-grid'}>
      {board.map((row, rowIndex) =>
        row.letters.map((letter, colIndex) => (
          <Letter
            key={`${letter}-${rowIndex}-${colIndex}`}
            value={letter}
            state={
              row.submitted
                ? getLetterState(letter, colIndex)
                : currentRowInvalid && currentRow === rowIndex
                ? 'error'
                : 'not-guessed'
            }
            colorblindMode={colorblindMode}
          />
        ))
      )}
    </Grid>
  )
}
