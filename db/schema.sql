DROP DATABASE IF EXISTS myCompany_db;
CREATE DATABASE myCompany_db;

use myCompany_db;

create table departments (
    id INT AUTO_INCREMENT NOT NULL,
    name VARCHAR(30) NOT NULL,
    PRIMARY KEY(id)
);