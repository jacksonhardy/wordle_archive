import { Menu } from '@headlessui/react'
import { autoBlackWhite, Block, Button, Column, Container, Grid, Text } from '@linen/ui'
import { useEffect, useMemo, useRef, useState } from 'react'
import { EndGameModal } from './components/EndGameModal'
import { GuessGrid } from './components/GuessGrid'
import { InfoModal } from './components/InfoModal'
import { Keyboard } from './components/Keyboard'
import { SettingsModal } from './components/SettingsModal'
import { letters, status } from './constants'
import answers from './data/answers'
import { ReactComponent as Share } from './data/Share.svg'
import { isValidWord } from './helpers'
import { useLocalStorage } from './hooks/useLocalStorage'

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

const state = {
  playing: 'playing',
  won: 'won',
  lost: 'lost',
}

const getDayAnswer = (day_) => {
  return answers[day_ - 1].toUpperCase()
}

// Set the day number of the puzzle to display and show it as the address bar query string

const setDay = (newDay) => {
  if (newDay < 1 || newDay > og_day) return
  day = newDay
  window.history.pushState({}, '', '?' + day)
}

const getDay = (og_day) => {
  const { search } = document.location
  var url_day = og_day
  if (search) {
    if (isNaN(search.slice(1))) {
      url_day = og_day
    } else {
      url_day = parseInt(search.slice(1), 10)
    }
    if (url_day > og_day || url_day < 1) {
      url_day = og_day
    }
    return url_day
  } else {
    return og_day
  }
}

const getOGDay = () => {
  const today = new Date()
  const date1 = new Date('6/21/21')
  const diffTime = Math.abs(today - date1)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

const getIsSavedSolution = () => {
  const gameStateList = JSON.parse(localStorage.getItem('gameStateList'))

  if (gameStateList) {
    const dayState = gameStateList[day - 1]
    return dayState && dayState.state === state.won && dayState.board !== null
  }

  return false
}

const getIsClearedSolution = (day_) => {
  const gameStateList = JSON.parse(localStorage.getItem('gameStateList'))

  if (gameStateList) {
    const dayState = gameStateList[day_ - 1]
    return dayState?.state === state.won && dayState?.board === null
  }

  return false
}

const calculateScore = (day_) => {
  const gameStateList = JSON.parse(localStorage.getItem('gameStateList'))

  if (gameStateList) {
    const dayState = gameStateList[day_ - 1]
    const board = dayState?.board

    // puzzle was solved before we tracked board state in
    // local storage. we'll still show the solved puzzle
    // (on first row) but don't show score since its unknown
    if (dayState?.scoreUnknown) {
      return ''
    }

    const numGuesses = board
      ? board.flatMap((row) => (row.join('') ? 1 : 0)).reduce((acc, curr) => acc + curr, 0)
      : null

    return numGuesses ? `${numGuesses}/6` : ''
  }

  return ''
}

// check if gameStateList is old gameStateList shape (array of strings) and
// update to new shape (array of objects w/ state and board). if a user has
// solved a puzzle before this feature was implemented we will show the answer
// on the first row since we don't know how many guesses they took to win
const oneTimeGameStateListUpdate = (stringGameStateList) => {
  const objectGameStateList = stringGameStateList.map((gameState, idx) => {
    if (gameState === state.won) {
      return {
        state: state.won,
        scoreUnknown: true,
        board: new Array(6)
          .fill(answers[idx].toUpperCase().split(''), 0, 1)
          .fill(new Array(5).fill(''), 1),
      }
    }

    return {
      state: gameState,
      board: null,
    }
  })

  localStorage.setItem('gameStateList', JSON.stringify(objectGameStateList))
}

const EMPTY_GAME_BOARD = new Array(5).fill('').map((_, i) => ({
  letters: ['', '', '', '', ''],
  submitted: false,
  active: i === 0 ? true : false,
}))

var day
const og_day = getOGDay()
setDay(getDay(og_day))
var items_list = []
for (var i = 1; i <= og_day; i++) {
  items_list.push(i)
}

function App() {
  const reloadCount = Number(sessionStorage.getItem('reloadCount')) || 0

  const initialStates = {
    gameState: state.playing,
    currentRow: 0,
    currentCol: 0,
    letterStatuses: () => {
      const letterStatuses = {}
      letters.forEach((letter) => {
        letterStatuses[letter] = status.unguessed
      })
      return letterStatuses
    },
  }

  const answer = useMemo(() => getDayAnswer(day), [])
  const [gameState, setGameState] = useState(initialStates.gameState)
  const [board, setBoard] = useState(EMPTY_GAME_BOARD)
  const [cellStatuses, setCellStatuses] = useState(initialStates.cellStatuses)
  const [currentRow, setCurrentRow] = useState(0)
  const [currentCol, setCurrentCol] = useState(0)
  const [letterStatuses, setLetterStatuses] = useState(initialStates.letterStatuses)
  const [submittedInvalidWord, setSubmittedInvalidWord] = useState(false)
  const [currentStreak, setCurrentStreak] = useLocalStorage('current-streak', 0)
  const [longestStreak, setLongestStreak] = useLocalStorage('longest-streak', 0)
  const streakUpdated = useRef(false)
  const [modalIsOpen, setIsOpen] = useState(false)
  const [firstTime, setFirstTime] = useLocalStorage('first-time', true)

  const [isSavedSolution, setIsSavedSolution] = useState(getIsSavedSolution())

  const [gameStateList, setGameStateList] = useLocalStorage(
    'gameStateList',
    Array(500).fill({ state: initialStates.gameState, board: null })
  )

  const openModal = () => setIsOpen(true)
  const closeModal = () => setIsOpen(false)

  const [darkMode, setDarkMode] = useLocalStorage('dark-mode', false)
  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev)
  }

  const [colorblindMode, setColorblindMode] = useLocalStorage('colorblind-mode', false)
  const toggleColorBlindMode = () => {
    setColorblindMode((prev) => !prev)
  }

  useEffect(() => {
    if (gameState !== state.playing && !isSavedSolution) {
      setTimeout(() => {
        openModal()
      }, 500)
    }
  }, [gameState, isSavedSolution])

  useEffect(() => {
    if (!streakUpdated.current) {
      if (gameState === state.won) {
        if (currentStreak >= longestStreak) {
          setLongestStreak((prev) => prev + 1)
        }
        setCurrentStreak((prev) => prev + 1)
        streakUpdated.current = true
      } else if (gameState === state.lost) {
        setCurrentStreak(0)
        streakUpdated.current = true
      }
    }
  }, [gameState, currentStreak, longestStreak, setLongestStreak, setCurrentStreak])

  useEffect(() => {
    const jsonGameStateList = localStorage.getItem('gameStateList')
    if (jsonGameStateList === null) {
      setGameStateList(gameStateList)
    } else {
      const gameStateList = JSON.parse(jsonGameStateList)

      // address regression impact of gameStateList change
      // see oneTimeGameStateListUpdate for more info on this
      if (typeof gameStateList[0] === 'string') {
        oneTimeGameStateListUpdate(gameStateList)
      }
    }

    // set to a blank board or the board from a past win
    setInitialGameState()
  }, [])

  useEffect(() => {
    if (reloadCount < 1) {
      window.location.reload(true)
      sessionStorage.setItem('reloadCount', String(reloadCount + 1))
    } else {
      sessionStorage.removeItem('reloadCount')
    }
  }, [og_day])

  // update letter and cell statuses each time we move onto a
  // new row and when we switch to a puzzle with a saved solution
  useEffect(() => {
    const isGameOver = currentRow === 6
    const isEnterPressOrSavedGame =
      currentRow !== 6 &&
      currentCol === 0 &&
      (board[currentRow][currentCol] === '' || isSavedSolution)

    if (isGameOver || isEnterPressOrSavedGame) {
      board.forEach((row, idx) => {
        const word = row.letters.join('')

        if (word) {
          updateLetterStatuses(word)
          updateCellStatuses(word, idx)
        }
      })
    }
  }, [currentCol, currentRow, board])

  const setInitialGameState = () => {
    const gameStateList = JSON.parse(localStorage.getItem('gameStateList'))

    // setAnswer(initialStates.answer)
    setCurrentRow(initialStates.currentRow)
    setCurrentCol(initialStates.currentCol)
    setCellStatuses(initialStates.cellStatuses)
    setLetterStatuses(initialStates.letterStatuses)

    if (gameStateList && getIsSavedSolution()) {
      setIsSavedSolution(true)
      setGameState(state.won)
      // setBoard(gameStateList[day - 1].board)
    } else {
      setIsSavedSolution(false)
      setBoard(EMPTY_GAME_BOARD)
      setGameState(initialStates.gameState)
    }
  }

  const clearSolution = () => {
    const newGameStateList = JSON.parse(localStorage.getItem('gameStateList'))
    newGameStateList[day - 1].board = null
    localStorage.setItem('gameStateList', JSON.stringify(newGameStateList))
    setInitialGameState()
  }

  const addLetter = (letter) => {
    document.activeElement.blur()
    setSubmittedInvalidWord(false)
    setBoard((prev) => {
      if (currentCol > 4) {
        return prev
      }
      const newBoard = [...prev]
      newBoard[currentRow].letters[currentCol] = letter
      return newBoard
    })
    if (currentCol < 5) {
      setCurrentCol((prev) => prev + 1)
    }
  }

  const onEnterPress = () => {
    const word = board[currentRow].letters.join('')
    if (!isValidWord(word)) {
      setSubmittedInvalidWord(true)
      return
    }

    const activeRow = currentRow
    const nextRow = currentRow + 1
    setBoard((b) =>
      b.map((r, i) => {
        if (i === activeRow) {
          return { ...r, submitted: true }
        } else {
          return r
        }
      })
    )

    if (nextRow === board.length) {
      return
    }
    setCurrentRow(nextRow)
    setCurrentCol(0)
  }

  const onDeletePress = () => {
    setSubmittedInvalidWord(false)
    if (currentCol === 0) return

    setBoard((prev) => {
      const newBoard = [...prev]
      newBoard[currentRow].letters[currentCol - 1] = ''
      return newBoard
    })

    setCurrentCol((prev) => prev - 1)
  }

  const updateLetterStatuses = (word) => {
    setLetterStatuses((prev) => {
      const newLetterStatuses = { ...prev }
      const wordLength = word.length
      for (let i = 0; i < wordLength; i++) {
        if (newLetterStatuses[word[i]] === status.green) continue

        if (word[i] === answer[i]) {
          newLetterStatuses[word[i]] = status.green
        } else if (answer.includes(word[i])) {
          newLetterStatuses[word[i]] = status.yellow
        } else {
          newLetterStatuses[word[i]] = status.gray
        }
      }
      return newLetterStatuses
    })
  }

  const playFirst = () => playDay(1)
  const playPrevious = () => playDay(day - 1)
  const playRandom = () => playDay(Math.floor(Math.random() * (og_day - 1)) + 1)
  const playNext = () => playDay(day + 1)
  const playLast = () => playDay(og_day)

  const playDay = (i) => {
    setDay(i)
    setInitialGameState()
  }

  var tempGameStateList = JSON.parse(localStorage.getItem('gameStateList'))
  if (tempGameStateList === null) {
    setGameStateList(gameStateList)
    tempGameStateList = gameStateList
  }
  for (var i = 4; i <= og_day + 3; i++) {
    var textNumber = document.getElementById('headlessui-menu-item-' + i)
    if (textNumber != null) {
      if (tempGameStateList[i - 1].state === state.won) {
        textNumber.classList.add('green-text')
      }
      if (tempGameStateList[i - 1].state === state.lost) {
        textNumber.classList.add('red-text')
      }
    }
  }

  var header_symbol =
    tempGameStateList[day - 1].state === 'won'
      ? '✔'
      : tempGameStateList[day - 1].state === 'lost'
      ? '✘'
      : ''

  var elements = items_list.map((i) => {
    return (
      <Menu.Item key={i}>
        {({ active }) => (
          <button
            onClick={() => playDay(i)}
            className={classNames(
              tempGameStateList[i - 1].state,
              getIsClearedSolution(i) ? 'cleared' : '',
              active ? 'font-bold text-gray-900' : 'text-gray-700',
              'flex justify-between block px-4 py-2 text-sm w-full'
            )}
          >
            <span>
              {i +
                (tempGameStateList[i - 1].state === state.won
                  ? ' ✔'
                  : tempGameStateList[i - 1].state === state.lost
                  ? ' ✘'
                  : '')}
            </span>
            <span>{calculateScore(i)}</span>
          </button>
        )}
      </Menu.Item>
    )
  })

  const settingsModal = (
    <SettingsModal
      darkMode={darkMode}
      toggleDarkMode={toggleDarkMode}
      colorBlindMode={colorblindMode}
      toggleColorBlindMode={toggleColorBlindMode}
    />
  )

  const infoModal = <InfoModal darkMode={darkMode} colorBlindMode={colorblindMode} />

  if (darkMode === true) {
    var html = document.getElementsByTagName('html')[0] // '0' to assign the first (and only `HTML` tag)
    html.setAttribute('class', 'dark-bg')
  } else {
    var html = document.getElementsByTagName('html')[0] // '0' to assign the first (and only `HTML` tag)
    html.setAttribute('class', 'bg')
  }

  if (window.innerWidth < 600) {
    return (
      <div className={darkMode ? 'dark h-fill' : 'h-fill'}>
        <div
          className={`flex flex-col justify-between h-fill bg-background dark:bg-background-dark`}
        >
          <header className="flex items-center py-2 px-3 text-primary dark:text-primary-dark">
            {settingsModal}

            <h1
              className={
                'flex-1 text-center text-l xxs:text-lg sm:text-3xl tracking-wide font-bold font-og'
              }
            >
              WORDLE ARCHIVE {day} {header_symbol}
            </h1>
            <button className="mr-2" type="button" onClick={() => setIsOpen(true)}>
              <Share />
            </button>
            {infoModal}
          </header>
          <div className="flex flex-force-center items-center py-3">
            <div className="flex items-center px-2">
              <Button onClick={playPrevious}>Previous</Button>
            </div>
            <div className="flex items-center px-2">
              <button
                type="button"
                className="rounded px-2 py-2 mt-2 w-24 text-sm nm-flat-background dark:nm-flat-background-dark hover:nm-inset-background dark:hover:nm-inset-background-dark text-primary dark:text-primary-dark"
                onClick={playRandom}
              >
                Random
              </button>
            </div>
            <div className="flex items-center px-2">
              <button
                type="button"
                className="rounded px-2 py-2 mt-2 w-24 text-sm nm-flat-background dark:nm-flat-background-dark hover:nm-inset-background dark:hover:nm-inset-background-dark text-primary dark:text-primary-dark"
                onClick={playNext}
              >
                Next
              </button>
            </div>
          </div>
          <div className="flex flex-force-center items-center py-3">
            <div className="flex items-center px-2">
              <button
                type="button"
                className="rounded px-2 py-2 w-24 text-sm nm-flat-background dark:nm-flat-background-dark hover:nm-inset-background dark:hover:nm-inset-background-dark text-primary dark:text-primary-dark"
                onClick={playFirst}
              >
                First
              </button>
            </div>
            <div className="flex items-center px-2">
              <Menu as="div" className="relative inline-block text-left">
                <div>
                  <Menu.Button className="blurthis rounded px-2 py-2 w-24 text-sm nm-flat-background dark:nm-flat-background-dark hover:nm-inset-background dark:hover:nm-inset-background-dark text-primary dark:text-primary-dark">
                    Choose
                  </Menu.Button>
                </div>
                <Menu.Items className="origin-top-right absolute right-0 mt-2 w-42 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none overflow-y-scroll h-56">
                  <div className="py-1">{elements}</div>
                </Menu.Items>
              </Menu>
            </div>
            <div className="flex items-center px-2">
              <button
                type="button"
                className="rounded px-2 py-2 w-24 text-sm nm-flat-background dark:nm-flat-background-dark hover:nm-inset-background dark:hover:nm-inset-background-dark text-primary dark:text-primary-dark"
                onClick={playLast}
              >
                Last
              </button>
            </div>
          </div>
          <Container justify="start" align="center">
            <GuessGrid
              board={board}
              solution={answer}
              colorblindMode={colorblindMode}
              currentRowInvalid={submittedInvalidWord}
              currentRow={currentRow}
            />
          </Container>

          <EndGameModal
            isOpen={modalIsOpen}
            handleClose={closeModal}
            darkMode={darkMode}
            gameState={gameState}
            state={state}
            currentStreak={currentStreak}
            longestStreak={longestStreak}
            answer={answer}
            playAgain={() => {
              closeModal()
              streakUpdated.current = false
            }}
            day={day}
            currentRow={currentRow}
            cellStatuses={cellStatuses}
          />
          <Keyboard
            isSolved={gameState === state.won}
            onClear={clearSolution}
            letterStatuses={letterStatuses}
            addLetter={addLetter}
            onEnterPress={onEnterPress}
            onDeletePress={onDeletePress}
            gameDisabled={gameState !== state.playing}
            colorBlindMode={colorblindMode}
          />
        </div>
      </div>
    )
  } else {
    return (
      <div className={darkMode ? 'dark h-fill' : 'h-fill'}>
        <div
          className={`flex flex-col justify-between h-fill bg-background dark:bg-background-dark`}
        >
          <header className="flex items-center py-2 px-3 text-primary dark:text-primary-dark">
            {settingsModal}
            <h1
              className={
                'flex-1 text-center text-xl xxs:text-2xl -mr-6 sm:text-4xl tracking-wide font-bold font-og'
              }
            >
              WORDLE ARCHIVE {day} {header_symbol}
            </h1>
            <button className="mr-6" type="button" onClick={() => setIsOpen(true)}>
              <Share />
            </button>
            {infoModal}
          </header>
          <div className="flex flex-force-center items-center py-3">
            <div className="flex items-center px-3">
              <Button onClick={playFirst}>First</Button>
            </div>
            <div className="flex items-center px-3">
              <Button onClick={playPrevious}>Previous</Button>
            </div>
            <div className="flex items-center px-3">
              <Menu as="div" className="relative inline-block text-left">
                <div>
                  <Menu.Button className="blurthis rounded px-3 py-2 mt-4 w-32 text-lg nm-flat-background dark:nm-flat-background-dark hover:nm-inset-background dark:hover:nm-inset-background-dark text-primary dark:text-primary-dark">
                    Choose
                  </Menu.Button>
                </div>
                <Menu.Items className="origin-top-right absolute right-0 mt-2 w-32 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none overflow-y-scroll h-56">
                  <div className="py-1">
                    <Menu.Item key={i}>
                      {({ active }) => (
                        <button
                          onClick={() => playRandom()}
                          className={classNames(
                            active ? 'font-bold text-gray-900' : 'text-gray-700',
                            'block px-4 py-2 text-sm w-full text-left'
                          )}
                        >
                          Random
                        </button>
                      )}
                    </Menu.Item>
                    {elements}
                  </div>
                </Menu.Items>
              </Menu>
            </div>
            <div className="flex items-center px-3">
              <Button onClick={playNext}>Next</Button>
            </div>
            <div className="flex items-center px-3">
              <Button onClick={playLast}>Last</Button>
            </div>
          </div>
          <Container justify="start" align="center">
            <GuessGrid
              board={board}
              solution={answer}
              colorblindMode={colorblindMode}
              currentRowInvalid={submittedInvalidWord}
              currentRow={currentRow}
            />
          </Container>

          <EndGameModal
            isOpen={modalIsOpen}
            handleClose={closeModal}
            darkMode={darkMode}
            gameState={gameState}
            state={state}
            currentStreak={currentStreak}
            longestStreak={longestStreak}
            answer={answer}
            playAgain={() => {
              closeModal()
              streakUpdated.current = false
            }}
            day={day}
            currentRow={currentRow}
            cellStatuses={cellStatuses}
          />

          <Keyboard
            isSolved={gameState === state.won}
            onClear={clearSolution}
            letterStatuses={letterStatuses}
            addLetter={addLetter}
            onEnterPress={onEnterPress}
            onDeletePress={onDeletePress}
            gameDisabled={gameState !== state.playing}
            colorBlindMode={colorblindMode}
          />
        </div>
      </div>
    )
  }
}

export default App
