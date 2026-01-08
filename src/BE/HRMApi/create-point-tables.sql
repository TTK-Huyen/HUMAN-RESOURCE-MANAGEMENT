-- Create point system tables
USE HrmDb;

-- Create point_balances table
CREATE TABLE IF NOT EXISTS point_balances (
    employee_id INT PRIMARY KEY,
    current_balance INT NOT NULL DEFAULT 0,
    total_earned INT NOT NULL DEFAULT 0,
    total_spent INT NOT NULL DEFAULT 0,
    last_updated DATETIME NOT NULL,
    FOREIGN KEY (employee_id) REFERENCES employees(employee_id)
);

-- Create point_transactions table
CREATE TABLE IF NOT EXISTS point_transactions (
    transaction_id INT PRIMARY KEY AUTO_INCREMENT,
    employee_id INT NOT NULL,
    transaction_type VARCHAR(50) NOT NULL,
    points INT NOT NULL,
    description VARCHAR(500),
    related_id INT,
    created_at DATETIME NOT NULL,
    created_by INT,
    FOREIGN KEY (employee_id) REFERENCES employees(employee_id),
    FOREIGN KEY (created_by) REFERENCES employees(employee_id)
);

-- Create cash_redemptions table
CREATE TABLE IF NOT EXISTS cash_redemptions (
    redemption_id INT PRIMARY KEY AUTO_INCREMENT,
    employee_id INT NOT NULL,
    points_redeemed INT NOT NULL,
    exchange_rate DECIMAL(10,2) NOT NULL,
    cash_amount DECIMAL(15,2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    requested_at DATETIME NOT NULL,
    approved_at DATETIME,
    approved_by INT,
    notes VARCHAR(500),
    FOREIGN KEY (employee_id) REFERENCES employees(employee_id),
    FOREIGN KEY (approved_by) REFERENCES employees(employee_id)
);

-- Check if tables were created
SHOW TABLES LIKE '%point%';
SHOW TABLES LIKE '%redemption%';
