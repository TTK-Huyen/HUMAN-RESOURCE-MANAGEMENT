-- Script để thêm điểm thưởng cho tất cả nhân viên hiện có
-- Chạy script này nếu database đã có nhân viên nhưng chưa có điểm

USE HrmDb;

-- Xóa dữ liệu điểm cũ (nếu có)
DELETE FROM point_transactions;
DELETE FROM point_balances;

-- Thêm điểm cho tất cả nhân viên
INSERT INTO point_balances (employee_id, current_balance, total_earned, total_spent, last_updated)
SELECT 
    employee_id,
    5000 AS current_balance,
    5000 AS total_earned,
    0 AS total_spent,
    NOW() AS last_updated
FROM employees;

-- Thêm transaction khởi tạo cho tất cả nhân viên
INSERT INTO point_transactions (employee_id, transaction_type, points, description, created_at)
SELECT 
    employee_id,
    'INITIAL' AS transaction_type,
    5000 AS points,
    'Điểm thưởng khởi tạo hệ thống' AS description,
    NOW() AS created_at
FROM employees;

-- Kiểm tra kết quả
SELECT 
    e.employee_code,
    e.full_name,
    pb.current_balance,
    pb.total_earned,
    COUNT(pt.transaction_id) AS transaction_count
FROM employees e
LEFT JOIN point_balances pb ON e.employee_id = pb.employee_id
LEFT JOIN point_transactions pt ON e.employee_id = pt.employee_id
GROUP BY e.employee_id, e.employee_code, e.full_name, pb.current_balance, pb.total_earned
ORDER BY e.employee_code;
