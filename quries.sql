drop table if exists Accounts;
drop table if exists Categories;
drop table if exists SubCategories;
drop table if exists Transactions;

create table Accounts
(
    id int not null IDENTITY(1, 1) primary key,
    name text not null
);
create table Categories
(
    id int not null IDENTITY(1, 1) PRIMARY KEY,
    name text not null,
    monthlyLimit DECIMAL,
    yearlyLimit DECIMAL,
    type text not null
);
create table SubCategories
(
    id int not null IDENTITY(1, 1) PRIMARY KEY,
    name text not null,
    categoryId int not null FOREIGN KEY REFERENCES Categories(id)
);
create table Transactions
(
    id int not null IDENTITY(1, 1) PRIMARY KEY,
    accountId int not null FOREIGN KEY REFERENCES Accounts(id),
    subCategoryId int FOREIGN KEY REFERENCES SubCategories(id),
    transferAccountId int FOREIGN KEY REFERENCES Accounts(id),
    title text not null,
    narration text,
    amount int not null,
    timestamp bigint not null
)