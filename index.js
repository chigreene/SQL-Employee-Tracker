const inquirer = require('inquirer');
const connection = require('./dataBase')

const questions = [
    {
        type: "list",
        name: "mainMenu",
        Message: "what would you like to do?",
        choices: ["View all departments", 
                "View all roles", 
                "View all employees",
                "Add employee"
            ]
    }
]

function start() {
    return inquirer
    .prompt(questions)
    .then((answer) => {
        switch(answer.mainMenu) {
            case 'View all departments':
                return viewAllDepartments();
            case 'View all roles':
                return viewAllRoles();
            case 'View all employees':
                return viewAllEmployees();
            case 'Add employee':
                return addEmployee();
            case 'Add department':
                return addDepartment();
        }
    });
}

function viewAllDepartments() {
    connection.query('SELECT * FROM departments', (err, results) => {
        if (err) throw err;
        console.table(results);
        start();
    })
}

function viewAllRoles() {
    connection.query('SELECT * FROM role', (err, results) => {
        if (err) throw err;
        console.table(results);
        start();
    })
}

function viewAllEmployees() {
    connection.query('SELECT * FROM employee', (err, results) => {
        if (err) throw err;
        console.table(results);
        start();
    })
}

function addDepartment(deptName) {
    connection.query(`INSERT INTO departments (name) VALUES ('${deptName}')`)
}

function addEmployee(){
    
}

start()