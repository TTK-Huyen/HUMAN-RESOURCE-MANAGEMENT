-- Quick Fix: Update Employee 39 DirectManagerId
-- Run this SQL on MySQL database 'hrm'

USE hrm;

-- Update employee 39 to have manager
UPDATE Employees 
SET DirectManagerId = 1 
WHERE Id = 39;

-- Verify the change
SELECT Id, EmployeeCode, FullName, DirectManagerId, DepartmentId
FROM Employees 
WHERE Id IN (1, 39);

-- Expected result:
-- Id=1  (Manager) DirectManagerId=NULL
-- Id=39 (Employee) DirectManagerId=1 ✅
