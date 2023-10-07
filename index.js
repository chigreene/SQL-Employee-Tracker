const inquirer = require('inquirer');
const connection = require('./dataBase')
const consoleTable = require('console.table')

const questions = [
    {
        type: "list",
        name: "mainMenu",
        Message: "what would you like to do?",
        choices: ["View all Departments", "place holder choice"]
    }
]

function start() {
    return inquirer
    .prompt(questions)
    .then((answer) => {
        switch(answer.mainMenu) {
            case 'View all Departments':
                return viewAllDepartments();
        }
    });
}

function viewAllDepartments() {
    connection.query('SELECT * FROM departments', (err, results) => {
        if (err) throw err;
        console.table(results);
        start()
    })

}
start()