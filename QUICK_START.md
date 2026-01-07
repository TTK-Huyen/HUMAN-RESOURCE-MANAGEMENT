# 🚀 Quick Start Guide

## What Was Implemented?

An **enhanced employee registration system** with support for:
- ✅ Multiple phone numbers (up to 2) with descriptions
- ✅ Birth place selection (Province/District)
- ✅ Current address selection (Province/District)
- ✅ Bank account information (Bank name, account number, holder)
- ✅ Excel bulk import/export
- ✅ Complete form validation
- ✅ Database persistence for all new fields

---

## 🔧 Step 1: Apply Database Migration

**First, you MUST apply the database migration before anything else works!**

```powershell
# Navigate to backend
cd src\BE\HRMApi

# Apply migration
dotnet ef database update

# Verify new columns exist
# Check employees table for: birth_place_province, birth_place_district
```

If you need to check migration status:
```powershell
dotnet ef migrations list
```

---

## ▶️ Step 2: Start Backend Server

```powershell
# Still in src\BE\HRMApi
dotnet run --configuration Development
```

Expected output:
```
info: Microsoft.Hosting.Lifetime[14]
      Now listening on: http://localhost:5291
```

---

## ▶️ Step 3: Start Frontend (New Terminal)

```powershell
# Navigate to frontend
cd src\frontend

# Install dependencies (first time only)
npm install

# Start development server
npm start
```

Browser will open automatically to `http://localhost:3000`

---

## 📝 Step 4: Test the Feature

### Using the Form (Manual Entry)
1. Navigate to **HR Management → Add Employee**
2. Fill in all required fields:
   - Basic info (name, DOB, CCCD, etc.)
   - **Phone Number 1** (required) + description
   - **Phone Number 2** (optional) + description
   - **Birth Place** → Select Province → Select District
   - **Current Address** → Select Province → Select District
   - **Bank Account** → Bank Name, Account Number, Account Holder
   - Department, Job Title, Contract info
3. Click **Save**
4. Should see success: `"Thêm nhân viên thành công!"`

### Using Excel Import
1. On **Add Employee** page, click **Download Excel Template**
2. Fill in data (see sample below)
3. Click **Import from Excel**
4. Select file
5. Should see success with import stats

---

## 📊 Sample Excel Data

| Field | Example Value |
|-------|---------------|
| EmployeeCode | NV001 |
| FullName | Nguyễn Văn An |
| Username | nguyenvana |
| Password | Pass@123 |
| DateOfBirth | 1995-03-20 |
| Gender | Nam |
| CitizenIdNumber | 0123456789012 |
| PhoneNumber1 | 0912345678 |
| PhoneNumber1Description | Cá nhân |
| PhoneNumber2 | 0987654321 |
| PhoneNumber2Description | Liên hệ |
| BirthPlaceProvince | Hồ Chí Minh |
| BirthPlaceDistrict | Quận 9 |
| PersonalEmail | nguyenvana@personal.com |
| CompanyEmail | nguyenvana@company.com |
| CurrentAddress | 456 Lê Văn Việt, Q9 |
| BankName | TECHCOMBANK |
| BankAccountNumber | 1234567890123 |
| BankAccountHolderName | Nguyễn Văn An |
| DepartmentCode | IT |
| JobTitleCode | 5 |
| RoleName | Nhân viên |
| EmploymentType | Toàn thời gian |
| ContractType | Vĩnh viễn |
| ContractStartDate | 2023-06-01 |
| Nationality | Việt Nam |

---

## 🆘 Troubleshooting

### Issue: Backend won't start
```
Error: Address already in use
```
**Solution**: Change port in `appsettings.json` or kill process using port 5291

### Issue: Frontend shows API errors
```
404 Not Found errors
```
**Solution**: 
1. Check backend is running on localhost:5291
2. Verify proxy in frontend `package.json`: `"proxy": "http://localhost:5291"`
3. Restart frontend: `npm start`

### Issue: Excel import fails
```
"File Excel không có dữ liệu"
```
**Solution**: 
1. Download fresh template from UI
2. Ensure data starts at Row 2 (Row 1 is header)
3. Don't add extra columns
4. Keep column order same as template

### Issue: Database columns not found
```
Unknown column 'birth_place_province'
```
**Solution**: Run migration first!
```powershell
dotnet ef database update
```

### Issue: Form validation always shows errors
**Solution**: 
- Phone: Add at least 1 phone number
- Address: Select both province AND district
- Bank: Fill all 3 fields (name, account, holder)

---

## 📋 Form Validation Rules

### Phone Numbers
- ✅ Minimum 1 required
- ✅ Maximum 2 allowed
- ✅ Format: numeric only
- ✅ Length: 10-11 digits for Vietnamese

### Birth Place & Current Address
- ✅ Province: Required, must select from dropdown
- ✅ District: Required, must select from dropdown
- ⚠️ Must match PROVINCES data exactly

### Bank Account
- ✅ Bank Name: Required, any text
- ✅ Account Number: Required, numeric (10-20 digits)
- ✅ Account Holder: Required, any text

### Other Required Fields
- ✅ Full Name, DOB, Gender, Nationality
- ✅ CCCD, Department, Job Title, Contract Date

---

## 🔍 Verify Data Was Saved

### Check Database (SQL)
```sql
-- Find newly created employee
SELECT id, employee_code, employee_name, 
       birth_place_province, birth_place_district
FROM employees
WHERE employee_code = 'NV001';

-- Check phone numbers
SELECT * FROM employee_phone_numbers
WHERE employee_id = [the_id_from_above];

-- Check bank account
SELECT * FROM employee_bank_accounts
WHERE employee_id = [the_id_from_above];
```

### Check via API
```bash
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:5291/api/v1/employees/1
```

---

## 📚 Available Provinces/Districts

The frontend form supports these provinces:

1. **Hồ Chí Minh** - Districts: Quận 1, Quận 3, Quận 5, Quận 7, Quận 9, Bình Tân, Bình Thạnh, etc.
2. **Hà Nội** - Districts: Quận 1, Quận Ba Đình, Quận Hoàn Kiếm, Quận Đống Đa, etc.
3. **Đà Nẵng** - Districts: Quận Hải Châu, Quận Thanh Khê, Quận Sơn Trà, etc.
4. **Bình Dương** - Districts: Thủ Dầu Một, Dĩ An, Bến Cát, etc.
5. **Đồng Nai** - Districts: Biên Hòa, Trảng Bom, Định Quán, etc.
6. **Long An** - Districts: Tân An, Cần Đước, Cần Giuộc, etc.
7. **Tiền Giang** - Districts: Mỹ Tho, Gò Công, Cái Bè, etc.

---

## 🔗 API Endpoints

### Main Endpoints
- `POST /api/v1/employees` - Create single employee
- `POST /api/v1/employees/import-excel` - Bulk import from Excel
- `GET /api/v1/employees/excel-template` - Download template
- `POST /api/v1/employees/validate-excel` - Validate file
- `GET /api/v1/employees/{id}` - Get employee details
- `PUT /api/v1/employees/{id}` - Update employee

All endpoints require `Authorization: Bearer {token}` header

---

## 📁 Key Files Modified

### Frontend
- `src/frontend/src/pages/HRPage/HRAddEmployeePage.jsx` - Main form (1030 lines)

### Backend
- `src/BE/HRMApi/Models/Employee.cs` - Added BirthPlace columns
- `src/BE/HRMApi/Services/EmployeeService.cs` - Updated create method
- `src/BE/HRMApi/Services/ExcelImportService.cs` - Updated import logic
- `src/BE/HRMApi/Dtos/Employee/CreateEmployeeDto.cs` - Added nested classes
- `src/BE/HRMApi/Migrations/AddBirthPlaceToEmployee.cs` - Database migration

### Database
- Migration creates 2 new columns on `employees` table

---

## ✅ Verification Checklist

After setup, verify these:

- [ ] Backend started on port 5291
- [ ] Frontend started on port 3000
- [ ] Database migration applied (2 new columns exist)
- [ ] Can navigate to HR → Add Employee page
- [ ] Form shows all new fields (phones, addresses, bank)
- [ ] Can download Excel template
- [ ] Can fill and submit form manually
- [ ] Can view new employee in directory
- [ ] Database has new employee with all related data
- [ ] Can import Excel file successfully

---

## 📞 Common Questions

**Q: Do I need to restart services after migration?**  
A: Yes, restart backend after `dotnet ef database update`

**Q: Can I import Excel before applying migration?**  
A: No! Birth place columns must exist in database first

**Q: What if phone validation fails?**  
A: Enter exactly 10-11 digits for Vietnamese phones

**Q: Can I modify the provinces list?**  
A: Edit `PROVINCES` array in HRAddEmployeePage.jsx (line ~100)

**Q: Do I need both phone numbers?**  
A: No, first phone required but second is optional

**Q: What's the default role for imported employees?**  
A: Role ID 1 (usually "Employee") if not specified

---

## 🎉 You're Done!

The system is ready to use. All features are:
- ✅ Fully implemented
- ✅ Tested for compilation errors
- ✅ Database ready
- ✅ API endpoints configured
- ✅ Frontend form complete

**Next**: Follow "Step 1" above to apply the migration and get started!
