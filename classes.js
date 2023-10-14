class Database {

    constructor(connection) {
        this.connection = connection;
    }

    query(sql, args) {
        return new Promise ((resolve, reject) => {
            this.connection.query(sql, args, (err, rows) => {
                if (err) return reject (err);
                resolve(rows)
            })
        })
    }

    close() {
        return new Promise((resolve, reject) => {
            this.connection.end(err => {
                if (err) return reject(err);
                resolve();
            })
        })
    }

    queryTable(sql, args){
        return new Promise ((resolve, reject) => {
            this.connection.query(sql, args, (err, rows) => {
                if (err) return reject (err);
                resolve(rows.map((row) => row.Tables_in_mycompany_db));
            })
        })
    }
}

class Table {
    constructor(database){
        this.db = database;
    }

    fetchTables() {
        return this.db.queryTable('SHOW TABLES');
    }
}

class Department {
    constructor(database){
        this.db=database;
    }

    viewByDept() {
        const query = `
            SELECT 
            departments.name AS department_name, 
            employee.first_name, 
            employee.last_name 
            FROM employee 
            JOIN role ON employee.role_id = role.id
            JOIN departments ON role.department_id = departments.id
            ORDER BY departments.name, employee.last_name, employee.first_name;
        `;

        return this.db.query(query);
    }

    delete(deptName) {
        return this.db.query('DELETE FROM departments WHERE name = ?', [deptName]);
    }

    fetchNames() {
        return this.db.query('SELECT name FROM departments')
    }
}

class Role {
  constructor(database) {
    this.db = database;
  }

  fetchAllRoles() {
    const query = `
      SELECT
        role.title,
        role.salary,
        departments.name AS department_id
      FROM role
      INNER JOIN departments ON role.department_id = departments.id;
  `;  

    return this.db.query(query)
  }

  delete(roleName) {
    const query = `
        DELETE FROM role
        WHERE name = ?
    `;  
    
    return this.db.query(query, [roleName])
  }
  
}

class Employee {
  constructor(database) {
    this.db = database;
  }

  fetchAllEmployees() {
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

    return this.db.query(query);
  }

  viewAllEmployeeSalary() {
    const query = `
        SELECT employee.last_name, employee.first_name, role.salary
        FROM employee
        INNER JOIN role 
        ON employee.role_id = role.id;
    `;

    return this.db.query(query);
  }
}

module.exports = {
    Database,
    Table,
    Department,
    Role,
    Employee
}