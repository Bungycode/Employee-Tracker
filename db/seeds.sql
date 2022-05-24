INSERT INTO department (name)
VALUES
('Accounting'),
('IT'),
('Operations'),
('Sales');

INSERT INTO role (title, salary, department_id)
VALUES
('Accountant', 75000, 1),
('Senior Accountant', 90000, 1),
('Full Stack Developer', 90000, 2),
('Software Engineer', 130000, 2),
('Operations Manager', 95000, 3),
('Project Manager', 105000, 3),
('Sales Coordinator', 85000, 4),
('Sales Manager', 95000, 4);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES
('Nathan', 'Rollins', 8, null),
('Ashley', 'Parks', 7, 1),
('Jessica', 'Bunny', 2, null),
('Joshua', 'Gibbins', 1, 2),
('Manny', 'Richardson', 5, 1),
('Serena', 'Tucker', 3, 2),
('Andrew', 'Maxwell', 4, null),
('Sandra', 'Hollins', 6, null);