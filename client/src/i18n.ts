import i18next from "i18next"
import { initReactI18next } from "react-i18next"

const resources = {
  en: {
    translation: {
      'app.home': 'Home',
      'app.id': 'Id',
      'app.subCategory': 'Category',
      'app.subCategories': 'Categories',
      'app.category': 'Pocket',
      'app.categories': 'Pockets',
      'app.time': 'Time',
      'app.title': 'Title',
      'app.withdraw': 'Withdraw',
      'app.deposit': 'Deposit',
      'app.balance': 'Balance',
      'app.currency': '₹',
      'app.unknown': '🫤',
      'app.currentBalance': 'Current Balance',
      'app.myAccount': 'My Account',
      'app.monthly': 'Monthly',
      'app.yearly': 'Yearly',
      'app.save': 'Save',
      'app.cancel': 'Cancel',
      'app.edit': 'Edit',
      'app.delete': 'Delete',
      'app.yes': 'Yes',
      'app.no': 'No',
      'app.needs': 'Needs',
      'app.wants': 'Wants',
      'app.savings': 'Savings',
      'app.income': 'Income',
      'app.budget': 'Budget',
      'app.budgetLimit': 'Budget Limit',
      'app.settings': 'Settings',
      'app.errorPage': 'Error Page Bhai! 😱 Kya kar diya!',
      'app.deleteConfirmation': 'Are you sure you want to delete this {{entity}}?',
      'app.new': 'New',
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