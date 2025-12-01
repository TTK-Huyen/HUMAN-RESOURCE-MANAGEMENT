-- Tạo database
CREATE DATABASE IF NOT EXISTS hr_system
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE hr_system;

-- =========================
-- 1. NHÓM HỒ SƠ & TÀI KHOẢN
-- =========================

-- 1.1. Phòng ban
CREATE TABLE departments (
    department_id   INT AUTO_INCREMENT PRIMARY KEY,
    department_code VARCHAR(50) NOT NULL UNIQUE,
    department_name VARCHAR(255) NOT NULL
) ENGINE=InnoDB;

-- 1.2. Chức vụ
CREATE TABLE positions (
    position_id INT AUTO_INCREMENT PRIMARY KEY,
    position_name VARCHAR(255) NOT NULL,
    level VARCHAR(100) NULL
) ENGINE=InnoDB;

-- 1.3. Vai trò (Employee / Manager / HR)
CREATE TABLE roles (
    role_id   INT AUTO_INCREMENT PRIMARY KEY,
    role_code VARCHAR(50) NOT NULL UNIQUE,   -- EMP, MANAGER, HR
    role_name VARCHAR(255) NOT NULL
) ENGINE=InnoDB;

-- 1.4. Nhân viên
CREATE TABLE employees (
    employee_id        INT AUTO_INCREMENT PRIMARY KEY,
    employee_code      VARCHAR(50) NOT NULL UNIQUE,
    full_name          VARCHAR(255) NOT NULL,
    date_of_birth      DATE NULL,
    gender             ENUM('MALE','FEMALE','OTHER') NULL,
    phone_number       VARCHAR(20) NULL,
    personal_email     VARCHAR(255) NULL,
    company_email      VARCHAR(255) NULL,
    current_address    VARCHAR(500) NULL,
    citizen_id         VARCHAR(50) NULL,
    personal_tax_code  VARCHAR(50) NULL,
    social_insurance_no VARCHAR(50) NULL,
    marital_status     ENUM('SINGLE','MARRIED','DIVORCED','WIDOWED') NULL,
    has_children       TINYINT(1) DEFAULT 0,
    department_id      INT NULL,
    position_id        INT NULL,
    employment_type    ENUM('FULLTIME','PARTTIME','INTERN') DEFAULT 'FULLTIME',
    contract_start_date DATE NULL,
    contract_end_date   DATE NULL,
    status             ENUM('ACTIVE','INACTIVE','RESIGNED') DEFAULT 'ACTIVE',
    manager_id         INT NULL,
    
    CONSTRAINT fk_employees_department
        FOREIGN KEY (department_id) REFERENCES departments(department_id),
    CONSTRAINT fk_employees_position
        FOREIGN KEY (position_id) REFERENCES positions(position_id),
    CONSTRAINT fk_employees_manager
        FOREIGN KEY (manager_id) REFERENCES employees(employee_id)
) ENGINE=InnoDB;

-- 1.5. Tài khoản đăng nhập
CREATE TABLE user_accounts (
    user_id      INT AUTO_INCREMENT PRIMARY KEY,
    username     VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    employee_id  INT NOT NULL,
    role_id      INT NOT NULL,
    status       ENUM('ACTIVE','LOCKED') DEFAULT 'ACTIVE',
    last_login_at DATETIME NULL,
    
    CONSTRAINT fk_user_accounts_employee
        FOREIGN KEY (employee_id) REFERENCES employees(employee_id),
    CONSTRAINT fk_user_accounts_role
        FOREIGN KEY (role_id) REFERENCES roles(role_id)
) ENGINE=InnoDB;

-- 1.6. Yêu cầu cập nhật hồ sơ
CREATE TABLE profile_update_requests (
    update_request_id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id   INT NOT NULL,        -- người gửi yêu cầu
    request_date  DATETIME NOT NULL,
    status        ENUM('PENDING','APPROVED','REJECTED') DEFAULT 'PENDING',
    reviewed_by   INT NULL,           -- HR xử lý
    reviewed_at   DATETIME NULL,
    reject_reason VARCHAR(500) NULL,
    comment       VARCHAR(500) NULL,
    
    CONSTRAINT fk_profile_update_employee
        FOREIGN KEY (employee_id) REFERENCES employees(employee_id),
    CONSTRAINT fk_profile_update_reviewer
        FOREIGN KEY (reviewed_by) REFERENCES employees(employee_id)
) ENGINE=InnoDB;

-- Chi tiết từng trường cập nhật
CREATE TABLE profile_update_request_details (
    detail_id          INT AUTO_INCREMENT PRIMARY KEY,
    update_request_id  INT NOT NULL,
    field_name         VARCHAR(100) NOT NULL, -- ADDRESS, BANK_ACCOUNT, PHONE, ...
    old_value          VARCHAR(1000) NULL,
    new_value          VARCHAR(1000) NOT NULL,
    
    CONSTRAINT fk_profile_update_detail_request
        FOREIGN KEY (update_request_id) REFERENCES profile_update_requests(update_request_id)
) ENGINE=InnoDB;

-- =========================
-- 2. CHẤM CÔNG & CÁC LOẠI REQUEST
-- =========================

-- 2.1. Bảng chấm công
CREATE TABLE timesheets (
    timesheet_id  INT AUTO_INCREMENT PRIMARY KEY,
    employee_id   INT NOT NULL,
    work_date     DATE NOT NULL,
    check_in_time  TIME NULL,
    check_out_time TIME NULL,
    total_hours    DECIMAL(5,2) NULL,
    is_late       TINYINT(1) DEFAULT 0,
    late_minutes  INT NULL,
    
    CONSTRAINT fk_timesheets_employee
        FOREIGN KEY (employee_id) REFERENCES employees(employee_id),
    CONSTRAINT uq_timesheets_employee_date
        UNIQUE (employee_id, work_date)
) ENGINE=InnoDB;

-- 2.x. Bảng cha cho tất cả yêu cầu
CREATE TABLE requests (
    request_id    INT AUTO_INCREMENT PRIMARY KEY,
    employee_id   INT NOT NULL,   -- người tạo request
    request_type  ENUM('LEAVE','TIMESHEET_UPDATE','OT','RESIGNATION') NOT NULL,
    created_at    DATETIME NOT NULL,
    status        ENUM('PENDING','APPROVED','REJECTED','CANCELLED') DEFAULT 'PENDING',
    approver_id   INT NULL,       -- manager hoặc HR
    approved_at   DATETIME NULL,
    reject_reason VARCHAR(500) NULL,
    
    CONSTRAINT fk_requests_employee
        FOREIGN KEY (employee_id) REFERENCES employees(employee_id),
    CONSTRAINT fk_requests_approver
        FOREIGN KEY (approver_id) REFERENCES employees(employee_id)
) ENGINE=InnoDB;

-- 2.3. Yêu cầu nghỉ phép
CREATE TABLE leave_requests (
    request_id   INT PRIMARY KEY,
    leave_type   ENUM('PAID','UNPAID','SICK','OTHER') NOT NULL,
    start_date   DATE NOT NULL,
    end_date     DATE NOT NULL,
    half_day     ENUM('MORNING','AFTERNOON') NULL,
    reason       VARCHAR(500) NULL,
    handover_employee_id INT NULL,
    attachment_path VARCHAR(500) NULL,
    
    CONSTRAINT fk_leave_requests_request
        FOREIGN KEY (request_id) REFERENCES requests(request_id),
    CONSTRAINT fk_leave_requests_handover
        FOREIGN KEY (handover_employee_id) REFERENCES employees(employee_id)
) ENGINE=InnoDB;

-- 2.4. Yêu cầu cập nhật bảng chấm công
CREATE TABLE timesheet_update_requests (
    request_id    INT PRIMARY KEY,
    timesheet_id  INT NOT NULL,
    old_check_in  TIME NULL,
    old_check_out TIME NULL,
    new_check_in  TIME NULL,
    new_check_out TIME NULL,
    reason        VARCHAR(500) NULL,
    
    CONSTRAINT fk_ts_update_request
        FOREIGN KEY (request_id) REFERENCES requests(request_id),
    CONSTRAINT fk_ts_update_timesheet
        FOREIGN KEY (timesheet_id) REFERENCES timesheets(timesheet_id)
) ENGINE=InnoDB;

-- 2.5. Yêu cầu làm thêm giờ
CREATE TABLE overtime_requests (
    request_id   INT PRIMARY KEY,
    ot_date      DATE NOT NULL,
    start_time   TIME NOT NULL,
    end_time     TIME NOT NULL,
    total_hours  DECIMAL(5,2) NOT NULL,
    ot_reason    VARCHAR(500) NULL,
    project_name VARCHAR(255) NULL,
    
    CONSTRAINT fk_ot_requests_request
        FOREIGN KEY (request_id) REFERENCES requests(request_id)
) ENGINE=InnoDB;

-- 2.6. Yêu cầu nghỉ việc
CREATE TABLE resignation_requests (
    request_id                INT PRIMARY KEY,
    proposed_last_working_date DATE NOT NULL,
    resign_reason             VARCHAR(500) NULL,
    has_completed_handover    TINYINT(1) DEFAULT 0,
    hr_note                   VARCHAR(500) NULL,
    
    CONSTRAINT fk_resignation_requests_request
        FOREIGN KEY (request_id) REFERENCES requests(request_id)
) ENGINE=InnoDB;

-- =========================
-- 3. CHIẾN DỊCH
-- =========================

CREATE TABLE campaigns (
    campaign_id      INT AUTO_INCREMENT PRIMARY KEY,
    campaign_code    VARCHAR(50) NOT NULL UNIQUE,
    campaign_name    VARCHAR(255) NOT NULL,
    description      TEXT NULL,
    announcement_date DATE NULL,
    start_date       DATE NOT NULL,
    end_date         DATE NOT NULL,
    registration_rules TEXT NULL,
    rewards_description TEXT NULL,
    status           ENUM('UPCOMING','ONGOING','FINISHED','CANCELLED') DEFAULT 'UPCOMING',
    created_by       INT NOT NULL,
    created_at       DATETIME NOT NULL,
    
    CONSTRAINT fk_campaigns_created_by
        FOREIGN KEY (created_by) REFERENCES employees(employee_id)
) ENGINE=InnoDB;

CREATE TABLE campaign_registrations (
    registration_id  INT AUTO_INCREMENT PRIMARY KEY,
    campaign_id      INT NOT NULL,
    employee_id      INT NOT NULL,
    registration_date DATETIME NOT NULL,
    status           ENUM('REGISTERED','CANCELLED') DEFAULT 'REGISTERED',
    cancel_date      DATETIME NULL,
    cancel_reason    VARCHAR(500) NULL,
    
    CONSTRAINT fk_campaign_reg_campaign
        FOREIGN KEY (campaign_id) REFERENCES campaigns(campaign_id),
    CONSTRAINT fk_campaign_reg_employee
        FOREIGN KEY (employee_id) REFERENCES employees(employee_id),
    CONSTRAINT uq_campaign_reg_unique
        UNIQUE (campaign_id, employee_id)
) ENGINE=InnoDB;

CREATE TABLE campaign_results (
    result_id      INT AUTO_INCREMENT PRIMARY KEY,
    campaign_id    INT NOT NULL,
    employee_id    INT NOT NULL,
    result_value   DECIMAL(10,2) NULL,
    result_unit    VARCHAR(50) NULL,
    ranking        INT NULL,
    reward_points  INT DEFAULT 0,
    recorded_at    DATETIME NOT NULL,
    
    CONSTRAINT fk_campaign_results_campaign
        FOREIGN KEY (campaign_id) REFERENCES campaigns(campaign_id),
    CONSTRAINT fk_campaign_results_employee
        FOREIGN KEY (employee_id) REFERENCES employees(employee_id),
    CONSTRAINT uq_campaign_results_unique
        UNIQUE (campaign_id, employee_id)
) ENGINE=InnoDB;

-- =========================
-- 4. POINT & GIAO DỊCH POINT
-- =========================

-- 4.1. Giao dịch point
CREATE TABLE reward_point_transactions (
    transaction_id    INT AUTO_INCREMENT PRIMARY KEY,
    employee_id       INT NOT NULL,
    transaction_date  DATETIME NOT NULL,
    transaction_type  ENUM('EARN_CAMPAIGN','REDEEM_CASH','TRANSFER_OUT','TRANSFER_IN','ADJUSTMENT') NOT NULL,
    points            INT NOT NULL, -- dương: cộng, âm: trừ
    related_campaign_id INT NULL,
    related_employee_id INT NULL,   -- người nhận/gửi khi transfer
    note              VARCHAR(500) NULL,
    
    CONSTRAINT fk_rpt_employee
        FOREIGN KEY (employee_id) REFERENCES employees(employee_id),
    CONSTRAINT fk_rpt_campaign
        FOREIGN KEY (related_campaign_id) REFERENCES campaigns(campaign_id),
    CONSTRAINT fk_rpt_related_employee
        FOREIGN KEY (related_employee_id) REFERENCES employees(employee_id)
) ENGINE=InnoDB;

-- 4.2. Yêu cầu đổi point ra tiền mặt
CREATE TABLE cash_redemption_requests (
    cash_request_id   INT AUTO_INCREMENT PRIMARY KEY,
    employee_id       INT NOT NULL,
    points_to_redeem  INT NOT NULL,
    rate              DECIMAL(10,2) NOT NULL, -- 1 point = rate VND
    estimated_amount  DECIMAL(15,2) NOT NULL,
    created_at        DATETIME NOT NULL,
    status            ENUM('PENDING','APPROVED','REJECTED','PAID') DEFAULT 'PENDING',
    processed_by      INT NULL,
    processed_at      DATETIME NULL,
    reject_reason     VARCHAR(500) NULL,
    
    CONSTRAINT fk_cash_redeem_employee
        FOREIGN KEY (employee_id) REFERENCES employees(employee_id),
    CONSTRAINT fk_cash_redeem_processed_by
        FOREIGN KEY (processed_by) REFERENCES employees(employee_id)
) ENGINE=InnoDB;

-- 4.3. Yêu cầu chuyển point
CREATE TABLE point_transfer_requests (
    transfer_id       INT AUTO_INCREMENT PRIMARY KEY,
    from_employee_id  INT NOT NULL,
    to_employee_id    INT NOT NULL,
    points            INT NOT NULL,
    created_at        DATETIME NOT NULL,
    status            ENUM('PENDING','APPROVED','REJECTED') DEFAULT 'PENDING',
    approved_by       INT NULL,
    approved_at       DATETIME NULL,
    reject_reason     VARCHAR(500) NULL,
    
    CONSTRAINT fk_ptr_from_employee
        FOREIGN KEY (from_employee_id) REFERENCES employees(employee_id),
    CONSTRAINT fk_ptr_to_employee
        FOREIGN KEY (to_employee_id) REFERENCES employees(employee_id),
    CONSTRAINT fk_ptr_approved_by
        FOREIGN KEY (approved_by) REFERENCES employees(employee_id)
) ENGINE=InnoDB;
