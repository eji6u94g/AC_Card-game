const GAME_STATE = {
  FirstCardAwaits: 'FirstCardAwaits',
  SecondCardAwaits: 'SecondCardAwaits',
  CardsMatchFailed: 'CardsMatchFailed',
  CardsMatched: 'CardsMatched',
  GameFinished: 'GameFinished'
}

const Symbols = [
  'https://image.flaticon.com/icons/svg/105/105223.svg', // 黑桃
  'https://image.flaticon.com/icons/svg/105/105220.svg', // 愛心
  'https://image.flaticon.com/icons/svg/105/105212.svg', // 方塊
  'https://image.flaticon.com/icons/svg/105/105219.svg' // 梅花
]

const utility = {
  getRandomNumberArray(count) {
    const number = Array.from(Array(count).keys())
    for (let index = number.length - 1; index > 0; index--) {
      let randomIndex = Math.floor(Math.random() * (index + 1))
        ;[number[index], number[randomIndex]] = [number[randomIndex], number[index]]
    }
    return number
  }
}

const model = {
  revealedCards: [],

  isRevealedCardsMatched() {
    return this.revealedCards[0].dataset.index % 13 === this.revealedCards[1].dataset.index % 13
  },

  score: 0,
  numberOfAttempts: 0
}

const view = {
  transformNumber(number) {
    switch (number) {
      case 1:
        return 'A'
      case 11:
        return 'J'
      case 12:
        return 'Q'
      case 13:
        return 'K'
      default:
        return number
    }
  },

  getCardContent(index) {
    const number = (index % 13) + 1
    const symbol = Symbols[Math.floor(index / 13)]
    return `<p>${this.transformNumber(number)}</p>
      <img src="${symbol}" alt="">
      <p>${this.transformNumber(number)}</p>`
  },

  getCardElement(index) {
    return `<div class="card back" data-index='${index}'></div>`
  },

  generateCards(randomNumnberArray) {
    const rootElement = document.querySelector('#cards')
    rootElement.innerHTML = randomNumnberArray.map(index => this.getCardElement(index)).join("");
  },

  flipCards(...cards) {
    cards.map(card => {
      if (card.classList.contains('back')) {
        card.classList.remove('back')
        card.innerHTML = this.getCardContent(Number(card.dataset.index))
        return
      } else if (!card.classList.contains('back')) {
        card.classList.add('back')
        card.innerHTML = ''
      }
    })
  },

  pairedCards(...cards) {
    cards.map(card => {
      card.classList.add('paired')
    })
  },

  resetCards(revealedCards) {
    view.flipCards(...revealedCards)
    model.revealedCards = []
    controller.currentState = GAME_STATE.FirstCardAwaits
  },

  renderScore(score) {
    document.querySelector('.score').innerText = `Your score: ${score}`
  },

  rednerNumberOfAttempts(times) {
    document.querySelector('.number-of-attempts').innerText = `You've tried ${times} times`
  },

  wrongAnimation(...cards) {
    cards.map(card => {
      card.classList.add('wrong')
      card.addEventListener('animationed', event => {
        card.classList.remove('wrong')
      }, { once: true })
    })
  },

  showFinishMessage() {
    const div = document.createElement('div')
    div.classList.add('completed')
    div.innerHTML = `
      <p>Complete!</p>
      <p>Score: ${model.score}</p>
      <p>You've tried: ${model.numberOfAttempts} times</p>`

    const header = document.querySelector('header')
    header.before(div)
  }
}

const controller = {
  currentState: GAME_STATE.FirstCardAwaits,

  displayCards() {
    view.generateCards(utility.getRandomNumberArray(52))
  },

  dispatchCardAction(card) {
    if (!card.classList.contains('back')) {
      return
    }

    switch (this.currentState) {
      case GAME_STATE.FirstCardAwaits:
        view.flipCards(card)
        model.revealedCards.push(card)
        this.currentState = GAME_STATE.SecondCardAwaits
        break
      case GAME_STATE.SecondCardAwaits:
        view.rednerNumberOfAttempts(++model.numberOfAttempts)
        view.flipCards(card)
        model.revealedCards.push(card)
        if (model.isRevealedCardsMatched()) {
          view.renderScore(model.score += 10)
          this.currentState = GAME_STATE.CardsMatched
          view.pairedCards(...model.revealedCards)
          model.revealedCards = []
          if (model.score === 260) {
            view.showFinishMessage()
            this.currentState = GAME_STATE.GameFinished
          }
          this.currentState = GAME_STATE.FirstCardAwaits
        } else {
          view.wrongAnimation(...model.revealedCards)
          this.currentState = GAME_STATE.CardsMatchFailed
          setTimeout(() => {
            view.resetCards(model.revealedCards)
          }, 1000)
        }
        break
    }
  }
}

controller.displayCards()

document.querySelectorAll('.card').forEach(function (card) {
  card.addEventListener('click', function (event) {
    controller.dispatchCardAction(card)
  })
})