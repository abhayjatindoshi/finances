drop table if exists deleted_entities;
drop table if exists transactions;
drop table if exists sub_categories;
drop table if exists categories;
drop table if exists accounts;
drop table if exists tenant_users;
drop table if exists users;
drop table if exists tenants;

create table tenants
(
    id VARCHAR(25) not null primary key,
    name text not null,
    created_at bigint not null,
    updated_at bigint not null
)

create table tenant_users
(
    tenant_id VARCHAR(25) not null FOREIGN KEY REFERENCES tenants(id),
    user_id VARCHAR(25) not null FOREIGN KEY REFERENCES users(id)
)

create table users
(
    id VARCHAR(25) not null primary key,
    user_id VARCHAR(25),
    name text,
    email VARCHAR(512) not null,
    picture text
)

create table accounts
(
    id VARCHAR(16) not null primary key,
    name text not null,
    initial_balance float not null,
    created_at bigint not null,
    updated_at bigint not null
);
create table categories
(
    id VARCHAR(16) not null primary key,
    name text not null,
    monthly_limit float,
    yearly_limit float,
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
    amount float not null,
    created_at bigint not null,
    updated_at bigint not null
)
create table deleted_entities
(
    entity_type text not null,
    entity_id text not null,
    deleted_at bigint not null
)