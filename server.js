// import mysql2 module
const mysql = require('mysql2');
// import inquirer module
const inquirer = require('inquirer');
// import dotenv module
require('dotenv').config();

// connection to the database
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: employees_db,
});


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
  .then(function ({ selection }) {
    switch (selection) {
      case 'View All Departments': 
        viewEmployee();
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
  
  connection.promise().query(sql, (err, rows) => {
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

  connection.promise().query(sql, (err, rows) => {
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

  connection.promise().query(sql, (err, rows) => {
    if (err) throw err;
    console.table(rows);
    promptChoices();
  });
};

// Declare a function that lets the user add a department.

addDepartment() = () => {
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
        if (isNaN(addSalary)) {
          return true;
        } else {
          console.log('Please enter in a salary.');
          return false;
        }
      }
    }
  ])
  .then(answer => {
    const params = [answer.role, answer.salary];

    // grab the dept from the department table
    const roleSql = `SELECT name, id
                    FROM department`;
    
    connection.promise().query(roleSql, (err, data) => {
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
  
}
