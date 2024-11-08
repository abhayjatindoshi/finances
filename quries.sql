drop table if exists accounts;
drop table if exists categories;
drop table if exists sub_categories;
drop table if exists transactions;
drop table if exists deleted_entities;

create table accounts
(
    id VARCHAR(16) not null primary key,
    name text not null,
    initial_balance int not null,
    created_at bigint not null,
    updated_at bigint not null
);
create table categories
(
    id VARCHAR(16) not null primary key,
    name text not null,
    monthly_limit decimal,
    yearly_limit decimal,
    type text not null,
    created_at bigint not null,
    updated_at bigint not null
);
create table sub_categories
(
    id VARCHAR(16) not null primary key,
    name text not null,
    category_id VARCHAR(16) not null FOREIGN KEY REFERENCES categories(id),
    created_at bigint not null,
    updated_at bigint not null
);
create table transactions
(
    id VARCHAR(16) not null primary key,
    account_id VARCHAR(16) not null FOREIGN KEY REFERENCES accounts(id),
    transfer_account_id VARCHAR(16) FOREIGN KEY REFERENCES accounts(id),
    sub_category_id VARCHAR(16) FOREIGN KEY REFERENCES sub_categories(id),
    transaction_at bigint not null,
    title text not null,
    summary text not null,
    amount decimal not null,
    created_at bigint not null,
    updated_at bigint not null
)
create table deleted_entities
(
    entity_type text not null,
    entity_id text not null,
    deleted_at bigint not null
)