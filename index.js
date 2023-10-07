const inquirer = require('inquirer');

const questions = [
    {
        type: "list",
        name: "mainMenu",
        Message: "what would you like to do?",
        choices: ["View all Departments"]
    }
]

function start() {
    return inquirer
    .prompt(questions)
    .then((answer) => {
        switch(answer.mainMenu) {
            case 'View all departments':
                return viewAllDepartments();
        }
    });
}

function viewAllDepartments() {
    connection.query('SELECT * FROM departments', (err, results) => {
        if (err) throw err;
        console.log(results);
        start()
    })

}
start()