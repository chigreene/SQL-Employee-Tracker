// setting a variable equal to inquirer then setting another variable equal to the path to database.js
const inquirer = require('inquirer');
const connection = require('./dataBase')
// require('console.table');


// list of the questions for inquirer to ask
const questions = [
    {
        type: "list",
        name: "mainMenu",
        message: "what would you like to do?",
        choices: ["View all departments", 
                "View all roles", 
                "View all employees",
                "View employees by department",
                "View employees by manager",
                "View salaries for all employees",
                "View salary for a specific employee",
                "View the budgets of the department",
                "Add employee",
                "Add department",
                "Add role",
                "Update Manager",
                "Update Role",
                "Delete",
                "Exit"
            ]
    }
]
// function that runs inquirer and handles user selections with a switch statement, give the user the ability to exit the app
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
            case 'View employees by department':
                return promptViewDept();
            case 'View employees by manager':
                return promptManagerEmployees();
            case 'View salaries for all employees':
                return viewAllEmployeeSalary();
            case 'View salary for a specific employee':
                return promptForEmployeeSalary();
            case 'View the budgets of the department':
                return viewDeptBudget();
            case 'Add employee':
                return promptAddEmployee();
            case 'Add department':
                return promptForDepartmentName();
            case 'Update Manager':
                return promptUpdateManager();
            case 'Add role':
                return promptAddRole();
            case 'Update Role':
                return promptUpdateRole();
            case 'Delete':
                return promptDelete();
            case 'Exit':
                console.log('Exiting the application.');
                connection.end();
                process.exit();
        }
    });
}
// functions running in prompt functions. these functions query the database and save the results of the query as result

function viewAllDepartments() {
    connection.query('SELECT * FROM departments', (err, results) => {
        if (err) throw err;
        console.table(results);
        start();
    })
}

function viewAllRoles() {
  const query = `
      SELECT
        role.title,
        role.salary,
        departments.name AS department_id
      FROM role
      INNER JOIN departments ON role.department_id = departments.id;
  `  
  
  connection.query(query, (err, results) => {
        if (err) throw err;
        console.table(results);
        start();
    })
}

function viewAllEmployees() {
      const query = `
        SELECT 
            employee.id,
            employee.first_name,
            employee.last_name,
            role.title AS role_title,
            departments.name AS department_name,
            role.salary,
            CONCAT(manager.first_name, ' ', manager.last_name) AS manager_name
        FROM employee
        LEFT JOIN role ON employee.role_id = role.id
        LEFT JOIN departments ON role.department_id = departments.id
        LEFT JOIN employee AS manager ON employee.manager_id = manager.id;
    `;
    connection.query(query, (err, results) => {
        if (err) throw err;
        console.table(results);
        start();
    })
}

function viewByDept(department) {
  const query = `
    SELECT 
      departments.name AS department_name, 
      CONCAT(employee.first_name, ' ', employee.last_name) AS employee_name,
      role.title,
      role.salary 
    FROM employee 
    JOIN role ON employee.role_id = role.id
    JOIN departments ON role.department_id = departments.id
    WHERE departments.name = ?
    ORDER BY departments.name, employee.last_name, employee.first_name;
  `;

  connection.query(query, [department], (err, results) => {
    if (err) throw err;
    console.table(results);
    start();
  });
}

function viewByManager(managerId) {
  const query = `
    SELECT CONCAT(first_name, ' ', last_name) AS employee_name 
    FROM employee
    WHERE manager_id = ?
  `

  connection.query(query, [managerId], (err, results) => {
    if (err) throw err;
    console.table(results);
    start();
  })
}

function viewAllEmployeeSalary() {
  const query = `
    SELECT employee.last_name, employee.first_name, role.salary
    FROM employee
    INNER JOIN role 
    ON employee.role_id = role.id;
  `
  connection.query(query, (err, results) => {
    if (err) throw err;
    console.table(results);
    start();
  })
}

function viewEmployeeSalary(employeeId) {
  const query = `
    SELECT employee.last_name, employee.first_name, role.salary
    FROM employee
    INNER JOIN role 
    ON employee.role_id = role.id
    WHERE employee.id = ?;
  `;
  connection.query(query, [employeeId], (err, results) => {
    if (err) throw err;
    console.table(results);
    start();
  });
}

function viewDeptBudget() {
  const query = `
    SELECT SUM(role.salary) AS department_budget, departments.name
    FROM role
    JOIN departments 
    ON role.department_id = departments.id
    JOIN employee ON role.id = employee.role_id
    GROUP BY departments.name;
  `
  connection.query(query, (err, results) => {
    if (err) throw err;
    console.table(results)
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

function addRole(roleName, roleSalary, roleDept) {
  const query = `
    INSERT INTO role (title, salary, department_id)
    VALUES (?, ?, ?);
  `
  connection.query(query, [roleName, roleSalary, roleDept], (err, results) => {
    if (err) throw err;
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

function updateManager(employeeId, managerId) {
  connection.query(
    'UPDATE employee SET manager_id = ? WHERE id = ?', [managerId, employeeId], (err, result) => {
      if (err) {
        console.error('error updating manager:', err);
      } else {
        console.log(`Manager for ${employeeId} updated to ${managerId}`)
      }
      start();
    }
  );
}

function updateRole(employeeId, newRole) {
  const query = `
    UPDATE employee 
    SET role_id = ? 
    WHERE id = ?
  `
  connection.query(query, [newRole, employeeId], (err, results) => {
    if (err) throw err;
    console.table(results);
    start();
  })
}

function deleteFunction (tableName, deptName) {
  const query = `
      DELETE FROM ${tableName}
      WHERE name = ?
  `
  connection.query(query, [deptName], (err, result) => {
    if (err) {
      console.error('error deleting row:', err);
    } else {
      console.log(`Row delete from ${deptName}`)
    }
    start()
  })
}

function roleDeleteFunction(roleName) {
  const query = `
    DELETE FROM role
    WHERE id = ?
  `
  connection.query(query, [roleName], (err, result) => {
    if(err) {
      console.error(`Error deleting ${roleName} from role table`);
    } else {
      console.log(`${roleName} deleted from role table`)
    }
    start();
  })
}

function employeeDeleteFunction(employeeName) {
  const query = `
    DELETE FROM employee
    WHERE id = ?
  `
  connection.query(query, [employeeName], (err, result) => {
    if(err) {
      console.error(`Error deleting ${employeeName} from employees table`);
    } else {
      console.log(`${employeeName} deleted from the employee table`)
    }
    start();
  })
}

//  helper functions that fetch data from the database to use when updating or adding to the database. The function wraps the connection.query in a promise so that it can be incorporated into the chain of asynchronous actions

function fetchTables() {
  return new Promise((resolve, reject) => {
    connection.query('SHOW TABLES', (err, results) => {
      if(err) {
        reject(err)
      } else {
        resolve(results.map((result) => result.Tables_in_mycompany_db)
        );
      }
    })
  })
}

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

function fetchDepartments() {
    return new Promise((resolve, reject) => {
      connection.query("SELECT * FROM departments", (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
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
      "SELECT id, first_name, last_name FROM employee",
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

function fetchEmployees() {
  return new Promise((resolve, reject) => {
    connection.query(
      "SELECT id, first_name, last_name FROM employee",
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

function promptViewDept() {
  fetchDepartmentNames().then((departments) => {
    const deptChoices = departments;

    return inquirer.prompt([
      {
        type: "list",
        name: "dept",
        message:
          "Please select which department's employees you would like to view",
        choices: deptChoices,
      },
    ])
    .then(answers => {
      const department = answers.dept;
      viewByDept(department);
    })
  });

}

function promptAddEmployee() {
    Promise.all([fetchDepartmentNames(), fetchRoles(), fetchManagers()])
    .then(([departmentNames, roles, managers]) => {

        // maps the managers to their manager ID, by design inquirer will display the name but store use the value 
        const managerChoices = managers.map(manager=> ({
            name: `${manager.first_name} ${manager.last_name}`,
            value: manager.id
        }))

        // maps roles to their titles for the prompt choices
        const roleChoices = roles.map(role=> ({
            name: role.title,
            value: role.id
        }))

        return inquirer
            .prompt([
              {
                type: "input",
                name: "employeeFirstName",
                message: "Add the new employee's first name",
              },
              {
                type: "input",
                name: "employeeLastName",
                message: "Add the new employee's last name",
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
        
    })
    .catch((error) => {
    console.error("Error fetching department names:", error);
    });
}

function promptAddRole() {
  fetchDepartments()
  .then((departments) =>{

    const departmentChoices = departments.map((department) => ({
      name: `${department.name}`,
      value: department.id,
    }));

    return inquirer
      .prompt([
        {
          type: "input",
          name: "roleName",
          message: "Add the new role in the company.",
        },
        {
          type: "input",
          name: "roleSalary",
          message: "Add the salary of this role.",
        },
        {
          type: "list",
          name: "roleDept",
          message: "Select which department this role is in.",
          choices: departmentChoices,
        },
      ])
      .then((answers) => {
        const roleName = answers.roleName;
        const roleSalary = answers.roleSalary;
        const roleDept = answers.roleDept;
        addRole(roleName, roleSalary, roleDept);
      })
      .catch((error) => {
        console.error("Error in promptAddRole:", error);
      });
    
  })
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

function promptManagerEmployees() {
  return fetchManagers().then((managers) => {
    const managerChoices = managers.map((manager) => ({
      name: `${manager.first_name} ${manager.last_name}`,
      value: manager.id,
    }));

    return inquirer
      .prompt([
        {
          type: "list",
          name: "manager",
          message: "Please select which manager whose employees you would like to view",
          choices: managerChoices,
        },
      ])
      .then((answers) => {
        const managerId = answers.manager;
        viewByManager(managerId);
      });
  });
}

function promptForEmployeeSalary() {
  return fetchEmployees()
    .then (employees => {
      const employeeChoices = employees.map((employee) => ({
        name: `${employee.first_name} ${employee.last_name}`,
        value: employee.id,
      }));

      return inquirer.prompt([
        {
          type: "list",
          name: "employee",
          message: "Please select who you would like to view the salary for",
          choices: employeeChoices,
        },
      ])
      .then(answers =>{
        const employeeId = answers.employee;
        viewEmployeeSalary(employeeId);
      })
    })
}
// function to fetch managers from the data base then display them to the user to choose from when they want to update the manager for an employee. it require the update manager function

function promptUpdateManager() {
    return Promise.all([fetchManagers(), fetchEmployees()])
        .then(([employees, managers]) => {

            const employeeChoices = employees.map(employee => ({
              name: `${employee.first_name} ${employee.last_name}`,
              value: employee.id,
            }));

            // maps the managers to their manager ID
            const managerChoices = managers.map(manager=> ({
              name: `${manager.first_name} ${manager.last_name}`,
              value: manager.id
            }))

        // because any employee can be a manager when the fetch managers function is run it gathers all employees so it is used as the choice for both the select employ question and the select new manager choice. 

        // runs inquirer

            return inquirer
            .prompt([
                {
                    type: 'list',
                    name: 'employee',
                    message: 'Please select who you would like to update the manager for',
                    choices: employeeChoices
                },
                {
                    type: 'list',
                    name: 'manager',
                    message: 'Please select a new manager for the employee',
                    choices: managerChoices
                }
            ])
            .then((answers) =>{
                const employeeId = answers.employee;
                const managerId = answers.manager;
                updateManager(employeeId, managerId)
            })
            .catch((error) => {
              console.log('error in promptUpdateManager:', error)
            })
        })
}

function promptUpdateRole() {
  return Promise.all([fetchEmployees(), fetchRoles()])
  .then(([employees, roles]) => {
    
    const employeeChoices = employees.map((employee) => ({
      name: `${employee.first_name} ${employee.last_name}`,
      value: employee.id,
    }));
    
    const roleChoices = roles.map((role) => ({
      name: `${role.title}`,
      value: role.id,
    }));

    return inquirer
      .prompt([
        {
          type: "list",
          name: "employee",
          message: "Select an employee to update the role for",
          choices: [...employeeChoices, "Return to Start"],
        },
      ])
      .then((answers) => {
        if (answers.employee === "Return to Start") {
          console.log("user want to go to begining");
          start();
          return;
        }
        const employeeId = answers.employee
        console.log(answers.employee);

        return inquirer
          .prompt([
            {
              type: "list",
              name: "roleChoice",
              message: "Select a new role to assign to the employee",
              choices: [...roleChoices, "Return to Start"],
            },
          ])
          .then((answers) => {
            if (answers.roleChoice === "Return to Start") {
              start();
              return;
            }
            const newRole = answers.roleChoice
            console.log(newRole);
            updateRole(employeeId, newRole);
          });
      });
  })
}

function promptDelete() {
    return Promise.all([fetchTables(), fetchDepartmentNames(), fetchEmployees(),  fetchRoles()])
    .then(([tables, departments, employees, roles]) => {

        const tableChoices = tables

      return inquirer
      .prompt([
        {
          type: "list",
          name: "deleteSelection",
          message: "Please select table you would like to delete from.",
          choices: [...tableChoices, 'Return to Start']
        },
      ])
      .then(answers => {
        switch (answers.deleteSelection) {
          case "departments":
            return fetchDepartmentNames().then((departments) => {
              return inquirer
                .prompt([
                  {
                    type: "list",
                    name: "departmentToDelete",
                    message: "Select a department to delete:",
                    choices: departments,
                  },
                ])
                .then((answer) => {
                  const deptName = answer.departmentToDelete;
                  const tableName = answers.deleteSelection;
                  deleteFunction(tableName, deptName);
                  console.log(`Delete department: ${deptName}`);
                });
            });
          case "role":
            return fetchRoles().then((roles) => {
              const roleChoices = roles.map((role) => ({
                name: `${role.title}`,
                value: role.id,
              }));

              return inquirer
                .prompt([
                  {
                    type: "list",
                    name: "roleToDelete",
                    message: "Select a role to delete:",
                    choices: roleChoices,
                  },
                ])
                .then((answers) => {
                  const roleName = answers.roleToDelete;
                  roleDeleteFunction(roleName);
                });
            });
          case "employee":
            return fetchEmployees().then((employees) => {
              const employeeChoices = employees.map((employee) => ({
                name: `${employee.first_name} ${employee.last_name}`,
                value: employee.id,
              }));

              return inquirer
                .prompt([
                  {
                    type: "list",
                    name: "employeeToDelete",
                    message: "Select a employee to delete:",
                    choices: employeeChoices,
                  },
                ])
                .then((answers) => {
                  const employeeName = answers.employeeToDelete;
                  employeeDeleteFunction(employeeName);
                });
            });
          case "Return to Start":
            start();
        }
      })
    })
  
}

start()