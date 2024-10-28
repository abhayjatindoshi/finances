## Account
- name

## Category
- name
- monthlyLimit
- yearlyLimit
- type - wants, needs, savings, income
> // if limit is -ve it's expense <br/>
> // if limit is +ve it's income <br/>

## SubCategory
- name
- categoryId

## Transaction
- accountId
- subCategoryId
- transferAccountId
- timestamp
- title
- narration - original statement during import
- amount
