-- Check Point System Status
-- Run this in MySQL to diagnose point system issues

-- 1. Check if PointBalances table has data
SELECT 'PointBalances Count' as Check_Name, COUNT(*) as Total
FROM PointBalances;

-- 2. Check current balance for all employees
SELECT 
    e.Id,
    e.EmployeeCode,
    e.FullName,
    COALESCE(pb.CurrentBalance, 0) as CurrentBalance,
    COALESCE(pb.TotalEarned, 0) as TotalEarned,
    COALESCE(pb.TotalSpent, 0) as TotalSpent
FROM Employees e
LEFT JOIN PointBalances pb ON e.Id = pb.EmployeeId
ORDER BY e.EmployeeCode;

-- 3. Check transactions
SELECT 
    pt.TransactionId,
    e.EmployeeCode,
    e.FullName,
    pt.TransactionType,
    pt.Points,
    pt.Description,
    pt.CreatedAt
FROM PointTransactions pt
JOIN Employees e ON pt.EmployeeId = e.Id
ORDER BY pt.CreatedAt DESC
LIMIT 50;

-- 4. Check if there are duplicate PointBalance entries
SELECT 
    EmployeeId, 
    COUNT(*) as Count,
    GROUP_CONCAT(CurrentBalance) as Balances
FROM PointBalances
GROUP BY EmployeeId
HAVING COUNT(*) > 1;

-- 5. Check if employee has any points (for troubleshooting specific employee)
SELECT 
    e.EmployeeCode,
    e.FullName,
    e.Id as EmployeeId,
    COALESCE(pb.CurrentBalance, 0) as Balance
FROM Employees e
LEFT JOIN PointBalances pb ON e.Id = pb.EmployeeId
WHERE e.EmployeeCode IN ('EMP001', 'EMP002', 'EMP003')
ORDER BY e.EmployeeCode;
