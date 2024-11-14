import i18next from "i18next"
import { initReactI18next } from "react-i18next"

const resources = {
  en: {
    translation: {
      'app.balance': 'Balance',
      'app.budget': 'Budget',
      'app.budgetLimit': 'Budget Limit',
      'app.cancel': 'Cancel',
      'app.categories': 'Pockets',
      'app.category': 'Pocket',
      'app.currency': '₹',
      'app.currentBalance': 'Current Balance',
      'app.delete': 'Delete',
      'app.deleteConfirmation': 'Are you sure you want to delete this {{entity}}?',
      'app.deposit': 'Deposit',
      'app.edit': 'Edit',
      'app.errorPage': 'Error Page Bhai! 😱 Kya kar diya!',
      'app.home': 'Home',
      'app.id': 'Id',
      'app.income': 'Income',
      'app.monthly': 'Monthly',
      'app.myAccount': 'My Account',
      'app.needs': 'Needs',
      'app.new': 'New',
      'app.no': 'No',
      'app.save': 'Save',
      'app.savings': 'Savings',
      'app.settings': 'Settings',
      'app.subCategories': 'Categories',
      'app.subCategory': 'Category',
      'app.time': 'Time',
      'app.title': 'Title',
      'app.unknown': '🫤',
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