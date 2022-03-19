import words from './data/words'

export const isValidWord = (word) => {
  if (word.length < 5) return false
  return words[word.toLowerCase()]
}
