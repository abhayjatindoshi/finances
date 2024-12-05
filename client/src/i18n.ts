import i18next from "i18next"
import { initReactI18next } from "react-i18next"

const resources = {
  en: {
    translation: {
      'app.account': 'Account',
      'app.accounts': 'Accounts',
      'app.add': 'Add',
      'app.balance': 'Balance',
      'app.budget': 'Budget',
      'app.budgetLimit': 'Budget Limit',
      'app.cancel': 'Cancel',
      'app.cannotDelete': 'Cannot delete this {{entity}}. Found {{count}} transactions linked to it.',
      'app.categories': 'Pockets',
      'app.category': 'Pocket',
      'app.close': 'Close',
      'app.continue': 'Continue',
      'app.currency': '₹',
      'app.currentBalance': 'Current Balance',
      'app.delete': 'Delete',
      'app.deleteConfirmation': 'Are you sure you want to delete this {{entity}}?',
      'app.deposit': 'Deposit',
      'app.detectedFormat': 'Detected format',
      'app.detectingFormat': 'Detecting type of the file...',
      'app.edit': 'Edit',
      'app.errorPage': 'Error Page Bhai! 😱 Kya kar diya!',
      'app.formatNotDetected': 'Format not detected',
      'app.hdfc': 'HDFC Bank',
      'app.home': 'Home',
      'app.id': 'Id',
      'app.import': 'Import',
      'app.income': 'Income',
      'app.initialBalance': 'Initial Balance',
      'app.jupiter': 'Jupiter Bank',
      'app.monthly': 'Monthly',
      'app.myAccount': 'My Account',
      'app.needs': 'Needs',
      'app.new': 'New',
      'app.no': 'No',
      'app.readingTransactions': 'Reading transactions',
      'app.save': 'Save',
      'app.savings': 'Savings',
      'app.selectFormat': 'Select format',
      'app.settings': 'Settings',
      'app.subCategories': 'Categories',
      'app.subCategory': 'Category',
      'app.time': 'Time',
      'app.title': 'Title',
      'app.transactionsImported': 'transactions imported',
      'app.unknown': '🫤',
      'app.uploadHint': 'Supports upload of single file only',
      'app.uploadText': 'Click or drag file to this area to upload',
      'app.wants': 'Wants',
      'app.withdraw': 'Withdraw',
      'app.yearly': 'Yearly',
      'app.yes': 'Yes',
    }
  }
}

i18next
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    interpolation: {
      escapeValue: false
    }
  })

export default i18next;