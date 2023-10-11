class mySqlQuery {
    constructor(connection) {
        this.connection = connection;
    }
    // gets roles form roles table
    fetchTables() {
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

    fetchDepartmentNames() {
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

    fetchRoles() {
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

    fetchManagers() {
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

    fetchEmployees() {
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
    
}

module.exports = mySqlQuery