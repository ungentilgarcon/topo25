import enMessages from '../i18n/en.json'
import frMessages from '../i18n/fr.json'

export const appLocales = [
  'en',
  'fr',
]

export const formatTranslationMessages = (messages) => {
  const formattedMessages = {}
  for (const message of messages) {
    formattedMessages[message.id] = message.message || message.defaultMessage
  }
  return formattedMessages
}

export const messages = {
  'en' : formatTranslationMessages(enMessages),
  'fr' : formatTranslationMessages(frMessages)
}
