const inquirer = require('inquirer');
const connection = require('./dataBase')

const questions = [
    {
        type: "list",
        name: "mainMenu",
        message: "what would you like to do?",
        choices: ["View all departments", 
                "View all roles", 
                "View all employees",
                "Add employee",
                "Add department",
                "Exit"
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
                return promptAddEmployee();
            case 'Add department':
                return promptForDepartmentName();
            case 'Add role':
                return promptForAddRole();
            case 'Exit':
                console.log('Exiting the application.');
                connection.end();
                process.exit();
        }
    });
}
// functions running in prompt functions

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
    connection.query(`INSERT INTO departments (name) VALUES ('${deptName}')`, (err, result) => {
        if (err) throw err;
        console.log(`Department '${deptName}' added successfully.`);
        start();
    })
}

function addEmployee(employeeFirstName, employeeLastName, roleId, manager, employeeDept){
    connection.query(
      `INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)`,
      [employeeFirstName, employeeLastName, roleId, manager],
      (err, results) => {
        if (err) throw err;
        console.log(
          `${employeeFirstName} ${employeeLastName}, ${roleId} with ${manager} as their manager added successfully.`
        );
        start();
      }
    );
}

//  helper functions

function fetchDepartmentNames() {
    return new Promise((resolve, reject) => {
        connection.query('SELECT name FROM departments', (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results.map((result) => result.name));
            }
        });
    });
}

function fetchRoles() {
  return new Promise((resolve, reject) => {
    connection.query("SELECT id, title FROM role", (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
}

function fetchManagers() {
  return new Promise((resolve, reject) => {
    connection.query(
      "SELECT id, last_name FROM employee WHERE manager_id IS NOT NULL",
      (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      }
    );
  });
}

// prompt functions from switch statement

function promptAddEmployee() {
    Promise.all([fetchDepartmentNames(), fetchRoles(), fetchManagers()])
    .then(([departmentNames, roles, managers]) => {

        // maps the managers to their manager ID
        const managerChoices = managers.map(manager=> ({
            name: manager.last_name,
            value: manager.id
        }))

        // maps roles to their titles for the prompt choices
        const roleChoices = roles.map(role=> ({
            name: role.title,
            value: role.id
        }))

        return (
          inquirer
            .prompt([
              {
                type: "input",
                name: "employeeFirstName",
                message: "Add their new employee first name",
              },
              {
                type: "input",
                name: "employeeLastName",
                message: "Add their new employee last name",
              },
              {
                type: "list",
                name: "roleId",
                message: "Please select which role the employee has.",
                choices: roleChoices,
              },
              {
                type: "list",
                name: "employeeDept",
                message: "Please select which department the employee works in",
                choices: departmentNames,
              },
              {
                type: "list",
                name: "manager",
                message: "Please who their manager is",
                choices: managerChoices,
              },
            ])
            // Continues with the logic after getting the answers
            .then((answers) => {
              const employeeDept = answers.employeeDept;
              const employeeFirstName = answers.employeeFirstName;
              const employeeLastName = answers.employeeLastName;
              const roleId = answers.roleId;
              const manager = answers.manager;
              addEmployee(
                employeeFirstName,
                employeeLastName,
                roleId,
                manager,
                employeeDept
              );
            })
            .catch((error) => {
              console.error("Error in promptAddEmployee:", error);
            })
        );
    })
    .catch((error) => {
    console.error("Error fetching department names:", error);
    });
}

function promptForDepartmentName() {
    return inquirer
      .prompt([
        {
          type: "input",
          name: "deptName",
          message: "Enter name of department",
        },
      ])
      .then((answers) => {
        const deptName = answers.deptName;
        addDepartment(deptName);
      })
      .catch((error) => {
        console.error("Error fetching department names:", error);
      });
}

start()