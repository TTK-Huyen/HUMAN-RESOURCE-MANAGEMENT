import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Save, X, User, Briefcase, FileText, ShieldAlert, Settings } from "lucide-react";

// --- Services ---
import { HRService } from "../../Services/employees";

// --- Components ---
import { FormRow } from "../../components/common/FormRow";
import Button from "../../components/common/Button";
import ViolationBanner from "../../components/common/ViolationBanner";

export default function HRAddEmployeePage() {
  const navigate = useNavigate();

  const COMPANY_EMAIL_DOMAIN = "hrm.com";

  const removeVietnameseAccents = (str = "") =>
    str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D");

  const slugifyName = (fullName = "") => {
    const s = removeVietnameseAccents(fullName)
      .toLowerCase()
      .replace(/[^a-z\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    return s;
  };

  const generateCompanyEmailLocalPart = (fullName = "") => {
    const parts = slugifyName(fullName).split(" ").filter(Boolean);
    if (parts.length === 0) return "";
    const firstName = parts[parts.length - 1];
    const lastName = parts[0];
    return `${firstName}.${lastName}`; // default: firstname.lastname
  };

  // --- Nationalities (VN - hardcode) ---
  const NATIONALITIES = [
    "Việt Nam",
    "Hoa Kỳ",
    "Anh",
    "Pháp",
    "Đức",
    "Nhật Bản",
    "Hàn Quốc",
    "Trung Quốc",
    "Singapore",
    "Thái Lan",
    "Úc",
    "Canada",
    "Hà Lan",
    "Ý",
    "Tây Ban Nha",
    "Thụy Điển",
    "Na Uy",
    "Đan Mạch",
    "Phần Lan",
    "Khác",
  ];

  // ===== Vietnamese Provinces/Districts Data =====
  const PROVINCES = [
    { id: "HN", name: "Hà Nội", districts: ["Ba Đình", "Hoàn Kiếm", "Hai Bà Trưng", "Đống Đa", "Tây Hồ", "Cầu Giấy", "Thanh Xuân", "Hoàng Mai"] },
    { id: "HCM", name: "TP Hồ Chí Minh", districts: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "Bình Thạnh", "Bình Tân", "Gò Vấp", "Phú Nhuận", "Tân Bình", "Tân Phú"] },
    { id: "HP", name: "Hải Phòng", districts: ["Hồng Bàng", "Ngô Quyền", "Lê Chân", "Kiến An", "Đô Lương", "An Lão", "Vân Đồn"] },
    { id: "DN", name: "Đà Nẵng", districts: ["Hải Châu", "Thanh Khê", "Sơn Trà", "Ngũ Hành Sơn", "Liên Chiểu", "Cẩm Lệ"] },
    { id: "HUE", name: "Thừa Thiên Huế", districts: ["Thành phố Huế", "A Lưới", "Phú Lộc", "Phú Vang", "Quảng Điền"] },
    { id: "QN", name: "Quảng Ninh", districts: ["Hạ Long", "Móng Cái", "Cẩm Phả", "Uông Bí", "Đông Triều", "Tiên Yên"] },
    { id: "CT", name: "Cần Thơ", districts: ["Ninh Kiều", "Bình Thủy", "Cái Răng", "Ô Môn", "Thốt Nốt", "Phong Điền"] },
  ];

  // ===== Master data (from DB) =====
  const [master, setMaster] = useState({
    departments: [],
    jobTitles: [],
    roles: [],
    managers: [],
  });
  const [masterLoading, setMasterLoading] = useState(true);
  const [masterError, setMasterError] = useState("");

  // ===== UI state =====
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [generalError, setGeneralError] = useState("");
  const [emailLocked, setEmailLocked] = useState(true); // true = auto


  // ===== Form state =====
  const [form, setForm] = useState({
    // 1. Personal Info
    employeeName: "",
    dateOfBirth: "",
    gender: "Nam",
    nationality: "Việt Nam",
    maritalStatus: "Độc thân",
    hasChildren: false,

    // 2. Legal Info
    citizenIdNumber: "",
    personalTaxCode: "",
    socialInsuranceNumber: "",

    // 3. Contact Info
    companyEmail: "",
    personalEmail: "",
    // Phone numbers (2 fields, but only 1 required)
    phoneNumbers: [
      { phoneNumber: "", description: "Personal" },
      { phoneNumber: "", description: "Emergency" },
    ],
    
    // Address Info
    birthPlace: { province: "", district: "" },
    currentAddress: { province: "", district: "" },

    // Bank Account Info
    bankAccount: {
      bankName: "",
      accountNumber: "",
    },

    // 4. Employment
    departmentId: "",
    jobTitleId: "",
    directManagerId: "",
    employmentType: "Full-time",
    contractType: "Indefinite",
    contractStartDate: "",
    contractEndDate: "",

    // 5. System role
    roleId: "",
  });

  // ===== Fetch master data once =====
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setMasterLoading(true);
        setMasterError("");

        const data = await HRService.getEmployeeFormMasterData();

        if (!mounted) return;

        const departments = data?.departments ?? [];
        const jobTitles = data?.jobTitles ?? [];
        const roles = data?.roles ?? [];
        const managers = data?.managers ?? [];

        setMaster({ departments, jobTitles, roles, managers });

        // default roleId if empty
        if (!form.roleId && roles.length > 0) {
          setForm((prev) => ({ ...prev, roleId: String(roles[0].id) }));
        }
      } catch (e) {
        if (!mounted) return;
        setMasterError("Không tải được danh sách dropdown. Vui lòng reload trang.");
      } finally {
        if (mounted) setMasterLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ===== Regex =====
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^[0-9]{10,11}$/; // 10-11 digits
  const citizenIdRegex = /^[0-9]{13}$/; // exactly 13 digits
  const taxCodeRegex = /^[0-9]{10}$/; // exactly 10 digits
  const socialInsuranceRegex = /^[0-9]{10}$/; // exactly 10 digits

  const isValidDate = (v) => {
    if (!v) return false;
    const d = new Date(v);
    return !Number.isNaN(d.getTime());
  };

  // ===== Validate a single field =====
  const validateField = (name, value, nextForm = form) => {
    let message = null;

    // required
    if (name === "employeeName" && !value) message = "Họ tên là bắt buộc";
    if (name === "dateOfBirth" && !value) message = "Ngày sinh là bắt buộc";
    if (name === "citizenIdNumber" && !value) message = "Số CCCD là bắt buộc";
    if (name === "companyEmail" && !value) message = "Email công ty là bắt buộc";
    if (name === "departmentId" && !value) message = "Chọn phòng ban";
    if (name === "jobTitleId" && !value) message = "Chọn chức danh";
    if (name === "contractStartDate" && !value) message = "Ngày bắt đầu là bắt buộc";
    if (name === "roleId" && !value) message = "Chọn phân quyền";
    if (name === "birthPlace" && (!value?.province || !value?.district)) message = "Nơi sinh là bắt buộc";
    if (name === "currentAddress" && (!value?.province || !value?.district)) message = "Địa chỉ hiện tại là bắt buộc";

    // Check at least 1 phone number
    if (name === "phoneNumbers" && Array.isArray(value)) {
      const hasPhone = value.some(p => p.phoneNumber?.trim());
      if (!hasPhone) message = "Phải nhập ít nhất 1 số điện thoại";
    }

    // Bank account validation - only bankName and accountNumber are required
    if (name === "bankAccount" && value) {
      if (!value.bankName) message = "Tên ngân hàng là bắt buộc";
      else if (!value.accountNumber) message = "Số tài khoản là bắt buộc";
    }

    // format
    if (!message && name === "citizenIdNumber" && value && !citizenIdRegex.test(value)) {
      message = "CCCD phải đúng 13 chữ số";
    }

    if (!message && name === "personalTaxCode" && value && !taxCodeRegex.test(value)) {
      message = "Mã số thuế phải đúng 10 chữ số";
    }

    if (!message && name === "socialInsuranceNumber" && value && !socialInsuranceRegex.test(value)) {
      message = "Số sổ BHXH phải đúng 10 chữ số";
    }

    if (!message && (name === "companyEmail" || name === "personalEmail") && value && !emailRegex.test(value)) {
      message = "Email không hợp lệ";
    }

    if (!message && name === "phoneNumber" && value && !phoneRegex.test(value)) {
      message = "SĐT phải từ 10-11 chữ số";
    }

    // date logic
    if (!message && name === "dateOfBirth" && value) {
      if (!isValidDate(value)) message = "Ngày sinh không hợp lệ";
      else if (new Date(value) > new Date()) message = "Ngày sinh không được ở tương lai";
    }

    if (!message && name === "contractStartDate" && value) {
      if (!isValidDate(value)) message = "Ngày bắt đầu không hợp lệ";
    }

    if (!message && name === "contractEndDate" && value) {
      if (!isValidDate(value)) message = "Ngày kết thúc không hợp lệ";
    }

    // cross-field: contract dates (only when end date is provided)
    if (
      !message &&
      nextForm.contractStartDate &&
      nextForm.contractEndDate &&
      isValidDate(nextForm.contractStartDate) &&
      isValidDate(nextForm.contractEndDate) &&
      new Date(nextForm.contractEndDate) < new Date(nextForm.contractStartDate)
    ) {
      // show error on end date field
      if (name === "contractEndDate" || name === "contractStartDate") {
        message = "Ngày kết thúc phải sau hoặc bằng ngày bắt đầu";
      }
    }

    return message;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const nextForm = { ...form, [name]: type === "checkbox" ? checked : value };
    setForm(nextForm);

    // live validate only after touched
    if (touched[name]) {
      const msg = validateField(name, nextForm[name], nextForm);
      setErrors((prev) => ({ ...prev, [name]: msg }));
    }
    if (name === "employeeName" && emailLocked) {
      const local = generateCompanyEmailLocalPart(value);
      nextForm.companyEmail = local
        ? `${local}@${COMPANY_EMAIL_DOMAIN}`
        : "";
    }

    // if changing start/end date, re-check end date
    if (name === "contractStartDate" || name === "contractEndDate") {
      // Nếu chưa nhập end date → KHÔNG LỖI
      if (!nextForm.contractEndDate) {
        setErrors((prev) => ({ ...prev, contractEndDate: null }));
      } else if (
        nextForm.contractStartDate &&
        new Date(nextForm.contractEndDate) < new Date(nextForm.contractStartDate)
      ) {
        setErrors((prev) => ({
          ...prev,
          contractEndDate: "Ngày kết thúc phải sau ngày bắt đầu",
        }));
      } else {
        setErrors((prev) => ({ ...prev, contractEndDate: null }));
      }
    }
  };

  // Phone number handlers
  const handlePhoneChange = (index, field, value) => {
    const newPhones = [...form.phoneNumbers];
    newPhones[index][field] = value;
    setForm({ ...form, phoneNumbers: newPhones });
  };

  // Address handlers
  const handleAddressChange = (addressType, field, value) => {
    setForm({
      ...form,
      [addressType]: { ...form[addressType], [field]: value },
    });
  };

  // Bank account handlers
  const handleBankChange = (field, value) => {
    setForm({
      ...form,
      bankAccount: { ...form.bankAccount, [field]: value },
    });
  };



  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));

    const msg = validateField(name, form[name], form);
    setErrors((prev) => ({ ...prev, [name]: msg }));

    if (name === "contractStartDate" || name === "contractEndDate") {
      const endMsg =
        form.contractStartDate &&
        form.contractEndDate &&
        new Date(form.contractEndDate) < new Date(form.contractStartDate)
          ? "Ngày kết thúc phải sau ngày bắt đầu"
          : null;
      setErrors((prev) => ({ ...prev, contractEndDate: endMsg }));
      setTouched((prev) => ({ ...prev, contractEndDate: true }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(form).forEach((key) => {
      const msg = validateField(key, form[key], form);
      if (msg) newErrors[key] = msg;
    });

    setErrors(newErrors);
    setTouched(Object.keys(form).reduce((acc, k) => ({ ...acc, [k]: true }), {}));
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    setGeneralError("");

    if (!validateForm()) {
      setGeneralError("Vui lòng kiểm tra lại thông tin nhập liệu.");
      return;
    }

    setLoading(true);
    try {
      // Filter out empty phone numbers and build payload
      const phoneNumbers = form.phoneNumbers.filter(p => p.phoneNumber?.trim());
      
      const payload = {
        // Personal Info
        employeeName: form.employeeName,
        dateOfBirth: form.dateOfBirth || null,
        gender: form.gender,
        nationality: form.nationality,
        maritalStatus: form.maritalStatus,
        hasChildren: form.hasChildren,
        
        // Legal Info
        citizenIdNumber: form.citizenIdNumber,
        personalTaxCode: form.personalTaxCode || null,
        socialInsuranceNumber: form.socialInsuranceNumber || null,
        
        // Contact Info
        companyEmail: form.companyEmail,
        personalEmail: form.personalEmail || null,
        phoneNumbers: phoneNumbers,
        
        // Address Info
        birthPlace: form.birthPlace,
        currentAddress: form.currentAddress,
        
        // Bank Account
        bankAccount: form.bankAccount,
        
        // Employment
        departmentId: form.departmentId ? Number(form.departmentId) : null,
        jobTitleId: form.jobTitleId ? Number(form.jobTitleId) : null,
        directManagerId: form.directManagerId ? Number(form.directManagerId) : null,
        employmentType: form.employmentType,
        contractType: form.contractType,
        contractStartDate: form.contractStartDate || null,
        contractEndDate: form.contractEndDate || null,
        
        // System
        roleId: form.roleId ? Number(form.roleId) : null,
      };

      const response = await HRService.addNewEmployee(payload);

      const newCode = response?.employeeCode || "(generated)";
      const initialPassword = response?.initialPassword || "EMP + 4 số cuối CCCD";

      alert(
        `Thêm nhân viên thành công!\n` +
          `Mã nhân viên / Username: ${newCode}\n` +
          `Mật khẩu khởi tạo: ${initialPassword}`
      );

      navigate("/hr/directory");
    } catch (error) {
      const data = error.response?.data;

      // ASP.NET ModelState errors
      if (data?.errors) {
        const mapped = {};
        for (const [k, v] of Object.entries(data.errors)) {
          const uiKey = k.charAt(0).toLowerCase() + k.slice(1);
          mapped[uiKey] = Array.isArray(v) ? v[0] : String(v);
        }
        setErrors((prev) => ({ ...prev, ...mapped }));
        setGeneralError("Vui lòng kiểm tra lại các trường bị lỗi.");
        return;
      }

      setGeneralError(data?.message || "Failed to add employee.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (name) =>
    `w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
      errors[name] && touched[name] ? "border-red-500 bg-red-50" : "border-slate-300 bg-white"
    }`;

  const SectionTitle = ({ icon: Icon, title }) => (
    <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100 mt-1">
      <Icon size={18} className="text-blue-600" />
      <h3 className="text-lg font-bold text-slate-800">{title}</h3>
    </div>
  );

  const fieldErrorList = Object.entries(errors)
    .filter(([, v]) => Boolean(v))
    .map(([, v]) => v);

  return (
    <div className="max-w-6xl mx-auto p-6 fade-in-up">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Thêm nhân viên mới</h1>
          <p className="text-slate-500 text-sm">
            Điền thông tin hồ sơ. <b>Mã nhân viên / Username</b> sẽ được tạo tự động, mật khẩu mặc định là{" "}
            <b>EMP + 4 số cuối CCCD</b>.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => navigate(-1)} icon={X}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleSubmit} isLoading={loading} icon={Save}>
            Lưu hồ sơ
          </Button>
        </div>
      </div>

      {masterError && (
        <div className="mb-6">
          <ViolationBanner messages={[masterError]} />
        </div>
      )}

      {generalError && (
        <div className="mb-6">
          <ViolationBanner messages={[generalError]} />
          {fieldErrorList.length > 0 && (
            <ul className="mt-2 text-sm text-red-600 list-disc pl-5">
              {fieldErrorList.map((m, idx) => (
                <li key={idx}>{m}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* === LEFT (2/3) === */}
        <div className="lg:col-span-2 space-y-6">
          {/* 1. Personal */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <SectionTitle icon={User} title="Thông tin cá nhân" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
              <FormRow label="Họ và tên" required error={touched.employeeName ? errors.employeeName : null}>
                <input
                  name="employeeName"
                  value={form.employeeName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={inputClass("employeeName")}
                  placeholder="VD: Nguyễn Văn A"
                />
              </FormRow>

              <FormRow label="Ngày sinh" required error={touched.dateOfBirth ? errors.dateOfBirth : null}>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={form.dateOfBirth}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={inputClass("dateOfBirth")}
                />
              </FormRow>

              <FormRow label="Giới tính" required>
                <select
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={inputClass("gender")}
                >
                  <option value="Male">Nam</option>
                  <option value="Female">Nữ</option>
                  <option value="Other">Khác</option>
                </select>
              </FormRow>

              <FormRow label="Quốc tịch" required>
                <select
                  name="nationality"
                  value={form.nationality}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={inputClass("nationality")}
                >
                  <option value="">-- Chọn quốc tịch --</option>
                  {NATIONALITIES.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </FormRow>


              <FormRow label="Tình trạng hôn nhân">
                <select
                  name="maritalStatus"
                  value={form.maritalStatus}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={inputClass("maritalStatus")}
                >
                  <option value="Single">Độc thân</option>
                  <option value="Married">Đã kết hôn</option>
                  <option value="Divorced">Đã ly hôn</option>
                </select>
              </FormRow>

              <div className="md:col-span-2 mt-2 flex items-center gap-3">
                <input
                  type="checkbox"
                  name="hasChildren"
                  id="hasChildren"
                  checked={form.hasChildren}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="w-4 h-4 text-blue-600"
                />
                <label htmlFor="hasChildren" className="text-sm font-medium text-slate-700 cursor-pointer">
                  Nhân viên đã có con
                </label>
              </div>
            </div>
          </div>

          {/* 2. Legal */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <SectionTitle icon={ShieldAlert} title="Thông tin pháp lý" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
              <FormRow
                label="Số CCCD/CMND"
                required
                error={touched.citizenIdNumber ? errors.citizenIdNumber : null}
                helpText="Đúng 13 chữ số"
              >
                <input
                  name="citizenIdNumber"
                  value={form.citizenIdNumber}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={inputClass("citizenIdNumber")}
                  maxLength={13}
                  placeholder="00109xxxxxxxxx"
                  inputMode="numeric"
                  pattern="[0-9]{13}"
                />
              </FormRow>

              <FormRow label="Mã số thuế cá nhân" error={touched.personalTaxCode ? errors.personalTaxCode : null} helpText="10 chữ số">
                <input
                  name="personalTaxCode"
                  value={form.personalTaxCode}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={inputClass("personalTaxCode")}
                  maxLength={10}
                  placeholder="0123456789"
                  inputMode="numeric"
                  pattern="[0-9]{10}"
                />
              </FormRow>

              <FormRow label="Số sổ BHXH" error={touched.socialInsuranceNumber ? errors.socialInsuranceNumber : null} helpText="10 chữ số">
                <input
                  name="socialInsuranceNumber"
                  value={form.socialInsuranceNumber}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={inputClass("socialInsuranceNumber")}
                  maxLength={10}
                  placeholder="0123456789"
                  inputMode="numeric"
                  pattern="[0-9]{10}"
                />
              </FormRow>
            </div>
          </div>

          {/* 3. Contact */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <SectionTitle icon={FileText} title="Thông tin liên hệ" />
            <div className="space-y-4">
              <FormRow label="Email cá nhân" error={touched.personalEmail ? errors.personalEmail : null}>
                <input
                  name="personalEmail"
                  value={form.personalEmail}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={inputClass("personalEmail")}
                  placeholder="example@gmail.com"
                />
              </FormRow>

              {/* Phone Numbers - 2 fields, at least 1 required */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Số điện thoại <span className="text-red-500">*</span> (Tối đa 2 số, ít nhất 1 bắt buộc)
                </label>
                {touched.phoneNumbers && errors.phoneNumbers && (
                  <p className="text-xs text-red-500 mb-2">{errors.phoneNumbers}</p>
                )}
                {form.phoneNumbers.map((phone, idx) => (
                  <div key={idx} className="mb-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="VD: 0912345678"
                        maxLength="10"
                        value={phone.phoneNumber}
                        onChange={(e) => handlePhoneChange(idx, "phoneNumber", e.target.value)}
                        className={inputClass(`phone-${idx}`)}
                        inputMode="numeric"
                        pattern="[0-9]{10}"
                      />
                      <select
                        value={phone.description}
                        onChange={(e) => handlePhoneChange(idx, "description", e.target.value)}
                        className={inputClass(`phone-desc-${idx}`)}
                      >
                        <option value="Personal">Cá nhân</option>
                        <option value="Emergency">Khẩn cấp</option>
                        <option value="Work">Công việc</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>

              {/* Birth Place */}
              <div className="border-t border-slate-100 pt-4">
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Nơi sinh <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <select
                    value={form.birthPlace.province}
                    onChange={(e) => handleAddressChange("birthPlace", "province", e.target.value)}
                    className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border-slate-300 bg-white"
                  >
                    <option value="">-- Chọn tỉnh/thành phố --</option>
                    {PROVINCES.map((p) => (
                      <option key={p.id} value={p.name}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  <select
                    value={form.birthPlace.district}
                    onChange={(e) => handleAddressChange("birthPlace", "district", e.target.value)}
                    className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border-slate-300 bg-white"
                  >
                    <option value="">-- Chọn phường/huyện --</option>
                    {PROVINCES.find((p) => p.name === form.birthPlace.province)?.districts.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Current Address */}
              <div className="border-t border-slate-100 pt-4">
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Địa chỉ hiện tại <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <select
                    value={form.currentAddress.province}
                    onChange={(e) => handleAddressChange("currentAddress", "province", e.target.value)}
                    className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border-slate-300 bg-white"
                  >
                    <option value="">-- Chọn tỉnh/thành phố --</option>
                    {PROVINCES.map((p) => (
                      <option key={p.id} value={p.name}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  <select
                    value={form.currentAddress.district}
                    onChange={(e) => handleAddressChange("currentAddress", "district", e.target.value)}
                    className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border-slate-300 bg-white"
                  >
                    <option value="">-- Chọn phường/huyện --</option>
                    {PROVINCES.find((p) => p.name === form.currentAddress.province)?.districts.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* === RIGHT (1/3) === */}
        <div className="lg:col-span-1 space-y-6">
          {/* 4. Bank Account */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <SectionTitle icon={Briefcase} title="Tài khoản Ngân Hàng" />
            <div className="space-y-4">
              <FormRow label="Tên ngân hàng" required>
                <input
                  value={form.bankAccount.bankName}
                  onChange={(e) => handleBankChange("bankName", e.target.value)}
                  className={inputClass("bankName")}
                  placeholder="VD: Vietcombank, Techcombank..."
                />
              </FormRow>

              <FormRow label="Số tài khoản" required>
                <input
                  value={form.bankAccount.accountNumber}
                  onChange={(e) => handleBankChange("accountNumber", e.target.value)}
                  className={inputClass("accountNumber")}
                  placeholder="VD: 123456789"
                />
              </FormRow>

            </div>
          </div>

          {/* 5. Job/Contract */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <SectionTitle icon={Briefcase} title="Vị trí & Hợp đồng" />
            <div className="space-y-4">
              <FormRow label="Phòng ban" required error={touched.departmentId ? errors.departmentId : null}>
                <select
                  name="departmentId"
                  value={form.departmentId}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={inputClass("departmentId")}
                  disabled={masterLoading}
                >
                  <option value="">{masterLoading ? "Loading..." : "-- Chọn phòng ban --"}</option>
                  {master.departments.map((d) => (
                    <option key={d.id} value={String(d.id)}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </FormRow>

              <FormRow label="Chức danh" required error={touched.jobTitleId ? errors.jobTitleId : null}>
                <select
                  name="jobTitleId"
                  value={form.jobTitleId}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={inputClass("jobTitleId")}
                  disabled={masterLoading}
                >
                  <option value="">{masterLoading ? "Loading..." : "-- Chọn chức danh --"}</option>
                  {master.jobTitles.map((j) => (
                    <option key={j.id} value={String(j.id)}>
                      {j.name}
                    </option>
                  ))}
                </select>
              </FormRow>

              <FormRow label="Quản lý trực tiếp">
                <select
                  name="directManagerId"
                  value={form.directManagerId}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={inputClass("directManagerId")}
                  disabled={masterLoading}
                >
                  <option value="">{masterLoading ? "Loading..." : "-- (Tuỳ chọn) --"}</option>
                  {master.managers.map((m) => (
                    <option key={m.id} value={String(m.id)}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </FormRow>

              <FormRow label="Hình thức làm việc" required>
                <select
                  name="employmentType"
                  value={form.employmentType}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={inputClass("employmentType")}
                >
                  <option value="Full-time">Toàn thời gian</option>
                  <option value="Part-time">Bán thời gian</option>
                  <option value="Remote">Làm việc từ xa</option>
                  <option value="Internship">Thực tập sinh</option>
                </select>
              </FormRow>

              <div className="border-t border-slate-100" />

              <FormRow label="Loại hợp đồng">
                <select
                  name="contractType"
                  value={form.contractType}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={inputClass("contractType")}
                >
                  <option value="Indefinite">Vô thời hạn</option>
                  <option value="Fixed-term">Xác định thời hạn</option>
                  <option value="Probation">Thử việc</option>
                </select>
              </FormRow>

              <FormRow label="Ngày bắt đầu" required error={touched.contractStartDate ? errors.contractStartDate : null}>
                <input
                  type="date"
                  name="contractStartDate"
                  value={form.contractStartDate}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={inputClass("contractStartDate")}
                />
              </FormRow>

              <FormRow label="Ngày kết thúc" error={touched.contractEndDate ? errors.contractEndDate : null}>
                <input
                  type="date"
                  name="contractEndDate"
                  value={form.contractEndDate}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={inputClass("contractEndDate")}
                />
              </FormRow>
            </div>
          </div>

          {/* 5. System settings */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <SectionTitle icon={Settings} title="Cấu hình hệ thống" />
            <div className="space-y-4">
              <FormRow
                label="Email công ty"
                required
                error={touched.companyEmail ? errors.companyEmail : null}
                helpText="Hệ thống tự tạo, nếu trùng sẽ thêm số"
              >
                <div className="flex gap-2">
                  <input
                    name="companyEmail"
                    value={form.companyEmail}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={inputClass("companyEmail")}
                    placeholder="auto-generated"
                    readOnly={emailLocked}
                  />
                  <button
                    type="button"
                    className="px-3 py-2 text-sm border rounded-lg bg-white"
                    onClick={() => setEmailLocked((v) => !v)}
                    title={emailLocked ? "Cho phép sửa tay" : "Khóa và tự tạo"}
                  >
                    {emailLocked ? "Edit" : "Auto"}
                  </button>
                </div>
              </FormRow>


              <FormRow label="Phân quyền (Role)" required error={touched.roleId ? errors.roleId : null}>
                <select
                  name="roleId"
                  value={form.roleId}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={inputClass("roleId")}
                  disabled={masterLoading}
                >
                  <option value="">{masterLoading ? "Loading..." : "-- Chọn phân quyền --"}</option>
                  {master.roles.map((r) => (
                    <option key={r.id} value={String(r.id)}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </FormRow>

              <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded border border-slate-100">
                * Hệ thống sẽ tự tạo <b>Username = Mã nhân viên</b> và <b>Mật khẩu = EMP + 4 số cuối CCCD</b>.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
