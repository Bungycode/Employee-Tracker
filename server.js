// import mysql2 module
const mysql = require('mysql2');
// import inquirer module
const inquirer = require('inquirer');
const { isNumberObject } = require('util/types');

// import console.table module
require('console.table');

// import dotenv module
// require('dotenv').config();

// connection to the database
// all the values that aren't integers(maybe not booleans either but havent tested) have to be in quotes even if its a variable.
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'employees_db',
});

connection.connect(err => {
  if (err) throw err;
  console.log('Connected as id ' + connection.threadId);
  connectionSuccess();
})

// This function will run after the connection is successful.

connectionSuccess = () => {
  promptChoices();
}

// view all departments, view all roles, view all employees, add a department, add a role, add an employee, and update an employee role

// inquirer prompt for select category

const promptChoices = () => {
  inquirer.prompt([
    {
      type: 'list',
      name: 'selection',
      message: 'Select a category.',
      choices: ['View All Departments',
                'View All Roles',
                'View All Employees',
                'Add a Department',
                'Add a Role',
                'Add an Employee',
                'Update an Employee Role',
                'End']
    }
  ])
  .then(function ( { selection } ) {
    switch (selection) {
      case 'View All Departments': 
        viewDepartments();
        break;
      
      case 'View All Roles': 
        viewRoles();
        break;
      
      case 'View All Employees':
        viewEmployees();
        break;

      case 'Add a Department':
        addDepartment();
        break;

      case 'Add a Role':
        addRole();
        break;

      case 'Add an Employee':
        addEmployee();
        break;

      case 'Update an Employee Role':
        updateEmployeeRole();
        break;

      default:
        connection.end();
        break;
    } 
  });

}

// Declare a function that lets the user view all of the departments.

viewDepartments = () => {
  console.log("View All Departments\n");
  const sql = `SELECT department.id AS id, department.name AS department
                FROM department`;
  
  connection.query(sql, (err, rows) => {
    if (err) throw err;
    console.table(rows);
    promptChoices();
  });
};

// Declare a function that lets the user view all of the roles.

viewRoles = () => {
  console.log('View All Roles\n');

  const sql = `Select role.id, role.title, department.name AS department
              From role
              INNER JOIN department ON role.department_id = department.id`;

  connection.query(sql, (err, rows) => {
    if (err) throw err;
    console.table(rows);
    promptChoices();
  });
};

// Declare a function that lets the user view all of the employees.

viewEmployees = () => {
  console.log('View All Employees\n');
  const sql = `SELECT employee.id,
              employee.first_name,
              employee.last_name,
              role.title,
              department.name AS department,
              role.salary,
              CONCAT (manager.first_name, " ", manager.last_name) AS manager
        FROM employee
              LEFT JOIN role ON employee.role_id = role.id
              LEFT JOIN department ON role.department_id = department.id
              LEFT JOIN employee manager ON employee.manager_id = manager.id`;

  connection.query(sql, (err, rows) => {
    if (err) throw err;
    console.table(rows);
    promptChoices();
  });
};

// Declare a function that lets the user add a department.

addDepartment = () => {
  inquirer.prompt([
    {
      type: 'input',
      name: 'addDept',
      message: 'What department are you adding?',
      validate: addDept => {
        if (addDept) {
          return true;
        } else {
          console.log('Please enter in a department');
          return false;
        }
      }
    }
  ])
  .then(answer => {
    const sql = `INSERT INTO department (name)
                VALUES (?)`;
    connection.query(sql, answer.addDept, (err, result) => {
      if (err) throw err;
      console.log(answer.addDept + ' was added to departments');

      viewDepartments();
    });
  });
};

// Declare a function that lets the user add a role.

addRole = () => {
  inquirer.prompt([
    {
      type: 'input',
      name: 'role',
      message: 'What role are you adding?',
      validate: addRole => {
        if (addRole) {
          return true;
        } else {
          console.log('Please enter in a role');
          return false;
        }
      }
    },
    {
      type: 'input',
      name: 'salary',
      message: 'What is the salary for this role?',
      validate: addSalary => {
        if (!isNaN(addSalary)) {
          return true;
        } else {
          console.log('\n' + addSalary + ' is not a salary, please enter in a salary.');
          return false;
        }
      }
    }
  ])
  .then(answer => {
    const params = [answer.role, answer.salary];

    // Grab the dept from the department table.
    const roleSql = `SELECT name, id
                    FROM department`;
    
    connection.query(roleSql, (err, data) => {
      if (err) throw err;

      const dept = data.map(( { name, id } ) => ( { name, value: id } ));

      inquirer.prompt([
        {
          type: 'list',
          name: 'dept',
          message: 'What department is this role for?',
          choices: dept
        }
      ])
      .then(deptChoice => {
        const dept = deptChoice.dept;
        params.push(dept);

        const sql = `INSERT INTO role (title, salary, department_id)
                    VALUES
                    (?, ?, ?)`;
        
        connection.query(sql, params, (err, result) => {
          if (err) throw err;
          console.log(answer.role + ' was added to roles!');

          viewRoles();
        });
      });
    });
  });
};

// Declare a function that lets the user add an employee.

addEmployee = () => {
  inquirer.prompt([
    {
      type: 'input',
      name: 'firstName',
      message: "What is the employee's first name?",
      validate: addFirst => {
        if (addFirst) { 
            return true;
        } else {
            console.log('Please enter a first name');
            return false;
        }
      }
    },
    {
      type: 'input',
      name: 'lastName',
      message: "What is the employee's last name?",
      validate: addLast => {
        if (addLast) {
          return true;
        } else {
            console.log('Please enter a first name');
            return false;
        }
      }
      }
  ])
  .then(answer => {
    const params = [answer.firstName, answer.lastName]

    // Grab the roles from the roles table.
    const roleSql = `SELECT role.id, role.title
                    FROM role`;

    connection.query(roleSql, (err, data) => {
      if (err) throw err;

      const roles = data.map(( { id, title } ) => ( { name: title, value: id } ));

      inquirer.prompt([
        {
          type: 'list',
          name: 'role',
          message: "What is the employee's role?",
          choices: roles
        }
      ])
      .then(roleChoice => {
        //console.log(role);
        const role = roleChoice.role;
        console.log(role);
        params.push(role);

        const managerSql = `SELECT * 
                            FROM employee`;

        connection.query(managerSql, (err, data) => {
          if (err) throw err;

          const managers = data.map(( { id, first_name, last_name } ) => ( { name: first_name + " " + last_name, value: id } ));

          console.log(managers);

          inquirer.prompt([
            {
              type: 'list',
              name: 'manager',
              message: "Who is the employee's manager?",
              choices: managers
            }
          ])
          .then(managerChoice => {
            const manager = managerChoice.manager;
            params.push(manager);
            const sql = `INSERT INTO employee (first_name, last_name, role_id, manager_id)
                        VALUES
                        (?, ?, ?, ?)`;

            connection.query(sql, params, (err, result) => {
              if (err) throw err;
              console.log("The employee has been added!")

              viewEmployees();
            });
          });
        });
      });
    });
  });
};

// Declare a function that lets the user update an employee's role.

updateEmployeeRole = () => {
  // Get employees columns from the employee table.
  const employeeSql = `SELECT *
                      FROM employee`;

  connection.query(employeeSql, (err, data) => {
    if (err) throw err;

    const employees = data.map(( { id, first_name, last_name } ) => ( { name: first_name + " " + last_name, value: id } ));

    inquirer.prompt([
      {
        type: 'list',
        name: 'name',
        message: "Which employee's role would you like to update?",
        choices: employees
      }
    ])
    .then(employeeChoice => {
      const employee = employeeChoice.name;
      const params = [];
      params.push(employee);

      const roleSql = `SELECT *
                      FROM role`;

      connection.query(roleSql, (err, data) => {
        if (err) throw err;

        const roles = data.map(( { id, title } ) => ( { name: title, value: id } ));

        inquirer.prompt([
          {
            type: 'list',
            name: 'role',
            message: "What is the employee's new role?",
            choices: roles
          }
        ])
        .then(roleChoice => {
          const role = roleChoice.role;
          params.push(role);

          let employee = params[0];
          params[0] = role;
          params[1] = employee;

          console.log(params);
          console.log(employee);

          const sql = `UPDATE employee
                      SET role_id = ?
                      WHERE id = ?`;

          connection.query(sql, params, (err, result) => {
            if (err) throw err;
            console.log("The employee's role has been updated!");

            viewEmployees();
          });
        });
      });
    });
  });
};