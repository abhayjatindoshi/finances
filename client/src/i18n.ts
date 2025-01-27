import i18next from "i18next"
import { initReactI18next } from "react-i18next"

const resources = {
  en: {
    translation: {
      'app.account': 'Account',
      'app.accounts': 'Accounts',
      'app.add': 'Add',
      'app.ago': 'ago',
      'app.all': 'All',
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
      'app.date': 'Date',
      'app.delete': 'Delete',
      'app.deleteConfirmation': 'Are you sure you want to delete selected {{entity}}?',
      'app.deposit': 'Deposit',
      'app.detectedFormat': 'Detected format',
      'app.detectingFormat': 'Detecting type of the file...',
      'app.edit': 'Edit',
      'app.errorPage': 'Ye ErrorPage hai bhai! 😱 Kya kar diya!',
      'app.failedLogin': 'Failed to verify your credentials. Click on the Home button to retry.',
      'app.formatNotDetected': 'Format not detected. Pick one from below.',
      'app.formatNotSupported': 'The selected file format is not supported. Please select a different file.',
      'app.hdfc': 'HDFC Bank',
      'app.home': 'Home',
      'app.id': 'Id',
      'app.import': 'Import',
      'app.income': 'Income',
      'app.initialBalance': 'Initial Balance',
      'app.installApp': 'Install App',
      'app.jupiter': 'Jupiter Bank',
      'app.loadingTenants': 'Loading households...',
      'app.loggingIn': 'Logging you in.',
      'app.loginNotAllowed': 'You are not authorised to access this application. Please contact Abhay Jatin Doshi for further details.',
      'app.logout': 'Logout',
      'app.monthly': 'Monthly',
      'app.myAccount': 'My Account',
      'app.needs': 'Needs',
      'app.new': 'New',
      'app.no': 'No',
      'app.noTenants': 'You don\'t have an account created yet. Please contact Abhay Jatin Doshi to create an account.',
      'app.none': 'None',
      'app.percentage': 'Percentage',
      'app.readingTransactions': 'Reading transactions',
      'app.save': 'Save',
      'app.savings': 'Savings',
      'app.search': 'Search',
      'app.selectFormat': 'Select format',
      'app.settings': 'Settings',
      'app.subCategories': 'Categories',
      'app.subCategory': 'Category',
      'app.switchHousehold': 'Switch Household',
      'app.sync': 'Sync',
      'app.syncing': 'Syncing recent changes from the server.',
      'app.time': 'Time',
      'app.title': 'Title',
      'app.topSpends': 'Top Spends',
      'app.totalSpent': 'Total Spent',
      'app.transactions': 'Transactions',
      'app.transactionsImported': 'transactions imported',
      'app.unknown': '🫤',
      'app.uploadHint': 'Supports upload of single file only',
      'app.uploadText': 'Click or drag file to this area to upload',
      'app.wants': 'Wants',
      'app.withdraw': 'Withdraw',
      'app.yearly': 'Yearly',
      'app.yearlyLimit': 'Yearly Limit',
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