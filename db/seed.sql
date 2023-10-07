INSERT INTO departments (name)
VALUES 
    ('Accounting'),
    ('Engineering'),
    ('Sales');

INSERT INTO role (title, salary, department_id)
VALUES ('Sales Manager', 125000, 3),
        ('Engineering Manager', 125000, 2),
        ('Account Manager', 125000, 1);

INSERT INTO employee (last_name, first_name, role_id, manager_id)
VALUES ('Greene', 'Chris', 1, NULL),
        ('Smith', 'Sara', 3, 1);