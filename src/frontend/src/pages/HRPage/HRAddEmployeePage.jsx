import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Save, X, User, Briefcase, FileText, ShieldAlert, Settings } from "lucide-react";

// --- Services ---
import { HRService } from "../../Services/employees";

// --- Components ---
import { FormRow } from "../../components/common/FormRow";
import Button from "../../components/common/Button";
import ViolationBanner from "../../components/common/ViolationBanner";
import Loading from "../../components/common/Loading";
import ConfirmDialog from "../../components/common/ConfirmDialog";

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

  // --- Nationalities ---
  const NATIONALITIES = [
    "Vietnam",
    "United States",
    "United Kingdom",
    "France",
    "Germany",
    "Japan",
    "South Korea",
    "China",
    "Singapore",
    "Thailand",
    "Australia",
    "Canada",
    "Netherlands",
    "Italy",
    "Spain",
    "Sweden",
    "Norway",
    "Denmark",
    "Finland",
    "Other",
  ];

  // ===== Vietnam Provinces/Districts Data =====
  const PROVINCES = [
    { id: "HN", name: "Hanoi", districts: ["Ba Dinh", "Hoan Kiem", "Hai Ba Trung", "Dong Da", "Tay Ho", "Cau Giay", "Thanh Xuan", "Hoang Mai"] },
    { id: "HCM", name: "Ho Chi Minh City", districts: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "Binh Thanh", "Binh Tan", "Go Vap", "Phu Nhuan", "Tan Binh", "Tan Phu"] },
    { id: "HP", name: "Hai Phong", districts: ["Hong Bang", "Ngo Quyen", "Le Chan", "Kien An", "Do Luong", "An Lao", "Van Don"] },
    { id: "DN", name: "Da Nang", districts: ["Hai Chau", "Thanh Khe", "Son Tra", "Ngu Hanh Son", "Lien Chieu", "Cam Le"] },
    { id: "HUE", name: "Thua Thien Hue", districts: ["Hue City", "A Luoi", "Phu Loc", "Phu Vang", "Quang Dien"] },
    { id: "QN", name: "Quang Ninh", districts: ["Ha Long", "Mong Cai", "Cam Pha", "Uong Bi", "Dong Trieu", "Tien Yen"] },
    { id: "CT", name: "Can Tho", districts: ["Ninh Kieu", "Binh Thuy", "Cai Rang", "O Mon", "Thot Not", "Phong Dien"] },
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
  const [successDialog, setSuccessDialog] = useState(null); // { code, password }


  // ===== Form state =====
  const [form, setForm] = useState({
    // 1. Personal Info
    employeeName: "",
    dateOfBirth: "",
    gender: "Male",
    nationality: "Vietnam",
    maritalStatus: "Single",
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
    contractType: "Permanent",
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
        setMasterError("Failed to load dropdown lists. Please reload the page.");
      } finally {
        if (mounted) setMasterLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  // ===== Regex =====
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^[0-9]{10,11}$/; // 10-11 digits
  const citizenIdRegex = /^[0-9]{12}$/; // exactly 13 digits
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
    if (name === "employeeName" && !value) message = "Full name is required";
    if (name === "dateOfBirth" && !value) message = "Date of birth is required";
    if (name === "citizenIdNumber" && !value) message = "Citizen ID is required";
    if (name === "companyEmail" && !value) message = "Company email is required";
    if (name === "departmentId" && !value) message = "Select a department";
    if (name === "jobTitleId" && !value) message = "Select a job title";
    if (name === "contractStartDate" && !value) message = "Start date is required";
    if (name === "roleId" && !value) message = "Select a role";
    if (name === "birthPlace" && (!value?.province || !value?.district)) message = "Birth place is required";
    if (name === "currentAddress" && (!value?.province || !value?.district)) message = "Current address is required";

    // Check at least 1 phone number
    if (name === "phoneNumbers" && Array.isArray(value)) {
      const hasPhone = value.some(p => p.phoneNumber?.trim());
      if (!hasPhone) message = "At least 1 phone number is required";
    }

    // Bank account validation - only bankName and accountNumber are required
    if (name === "bankAccount" && value) {
      if (!value.bankName) message = "Bank name is required";
      else if (!value.accountNumber) message = "Account number is required";
    }

    // format
    if (!message && name === "citizenIdNumber" && value && !citizenIdRegex.test(value)) {
      message = "Citizen ID must be exactly 12 digits";
    }

    if (!message && name === "personalTaxCode" && value && !taxCodeRegex.test(value)) {
      message = "Tax code must be exactly 10 digits";
    }

    if (!message && name === "socialInsuranceNumber" && value && !socialInsuranceRegex.test(value)) {
      message = "Social insurance number must be exactly 10 digits";
    }

    if (!message && (name === "companyEmail" || name === "personalEmail") && value && !emailRegex.test(value)) {
      message = "Invalid email format";
    }

    if (!message && name === "phoneNumber" && value && !phoneRegex.test(value)) {
      message = "Phone must be 10-11 digits";
    }

    // date logic
    if (!message && name === "dateOfBirth" && value) {
      if (!isValidDate(value)) message = "Invalid date of birth";
      else if (new Date(value) > new Date()) message = "Date of birth cannot be in the future";
    }

    if (!message && name === "contractStartDate" && value) {
      if (!isValidDate(value)) message = "Invalid start date";
    }

    if (!message && name === "contractEndDate" && value) {
      if (!isValidDate(value)) message = "Invalid end date";
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
        message = "End date must be equal to or after start date";
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

    // Handle contract type changes for End Date
    if (name === "contractType") {
      if (value === "Indefinite") {
        // Permanent: disable and clear End Date
        nextForm.contractEndDate = "";
        setErrors((prev) => ({ ...prev, contractEndDate: null }));
      }
      // Fixed-term and Probation: just enable (keep existing end date if any)
    }

    // if changing start/end date, re-check end date
    if (name === "contractStartDate" || name === "contractEndDate") {
      // If end date not filled yet → NO ERROR
      if (!nextForm.contractEndDate) {
        setErrors((prev) => ({ ...prev, contractEndDate: null }));
      } else if (
        nextForm.contractStartDate &&
        new Date(nextForm.contractEndDate) < new Date(nextForm.contractStartDate)
      ) {
        setErrors((prev) => ({
          ...prev,
          contractEndDate: "End date must be after start date",
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

  // Helper function to calculate end date based on months
  const calculateEndDate = (startDate, months) => {
    if (!startDate) return "";
    const start = new Date(startDate);
    const end = new Date(start.getFullYear(), start.getMonth() + months, start.getDate());
    // Subtract 1 day to get the day before
    end.setDate(end.getDate() - 1);
    return end.toISOString().split("T")[0];
  };

  // Handle quick duration button clicks
  const handleQuickDuration = (months) => {
    const endDate = calculateEndDate(form.contractStartDate, months);
    if (endDate) {
      setForm({ ...form, contractEndDate: endDate });
      setErrors((prev) => ({ ...prev, contractEndDate: null }));
    }
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
          ? "End date must be after start date"
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
      setGeneralError("Please check your input information.");
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
      const initialPassword = response?.initialPassword || "EMP + last 4 digits of ID";

      setSuccessDialog({ code: newCode, password: initialPassword });
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
        setGeneralError("Please check the fields with errors.");
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
          <h1 className="text-2xl font-bold text-slate-900">Add New Employee</h1>
          <p className="text-slate-500 text-sm">
            Fill in profile information. <b>Employee Code / Username</b> will be generated automatically, default password is{" "}
            <b>EMP + last 4 digits of ID</b>.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => navigate(-1)} icon={X}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} isLoading={loading} icon={Save}>
            Save Profile
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

      {masterLoading && <Loading fullScreen text="Loading form data..." />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* === LEFT (2/3) === */}
        <div className="lg:col-span-2 space-y-6">
          {/* 1. Personal */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <SectionTitle icon={User} title="Personal Information" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
              <FormRow label="Full Name" required error={touched.employeeName ? errors.employeeName : null}>
                <input
                  name="employeeName"
                  value={form.employeeName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={inputClass("employeeName")}
                  placeholder="e.g. John Doe"
                />
              </FormRow>

              <FormRow label="Date of Birth" required error={touched.dateOfBirth ? errors.dateOfBirth : null}>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={form.dateOfBirth}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={inputClass("dateOfBirth")}
                />
              </FormRow>

              <FormRow label="Gender" required>
                <select
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={inputClass("gender")}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </FormRow>

              <FormRow label="Nationality" required>
                <select
                  name="nationality"
                  value={form.nationality}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={inputClass("nationality")}
                >
                  <option value="">-- Select Nationality --</option>
                  {NATIONALITIES.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </FormRow>


              <FormRow label="Marital Status">
                <select
                  name="maritalStatus"
                  value={form.maritalStatus}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={inputClass("maritalStatus")}
                >
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Divorced">Divorced</option>
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
                  Employee has children
                </label>
              </div>
            </div>
          </div>

          {/* 2. Legal */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <SectionTitle icon={ShieldAlert} title="Legal Information" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
              <FormRow
                label="Citizen ID"
                required
                error={touched.citizenIdNumber ? errors.citizenIdNumber : null}
                helpText="Exactly 12 digits"
              >
                <input
                  name="citizenIdNumber"
                  value={form.citizenIdNumber}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={inputClass("citizenIdNumber")}
                  maxLength={12}
                  placeholder="00109xxxxxxxx"
                  inputMode="numeric"
                  pattern="[0-9]{12}"
                />
              </FormRow>

              <FormRow label="Tax Code" error={touched.personalTaxCode ? errors.personalTaxCode : null} helpText="10 digits">
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

              <FormRow label="Social Insurance Number" error={touched.socialInsuranceNumber ? errors.socialInsuranceNumber : null} helpText="10 digits">
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
            <SectionTitle icon={FileText} title="Contact Information" />
            <div className="space-y-4">
              <FormRow label="Personal Email" error={touched.personalEmail ? errors.personalEmail : null}>
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
                  Phone Numbers <span className="text-red-500">*</span> (Max 2, at least 1 required)
                </label>
                {touched.phoneNumbers && errors.phoneNumbers && (
                  <p className="text-xs text-red-500 mb-2">{errors.phoneNumbers}</p>
                )}
                {form.phoneNumbers.map((phone, idx) => (
                  <div key={idx} className="mb-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="e.g. 0912345678"
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
                        <option value="Personal">Personal</option>
                        <option value="Emergency">Emergency</option>
                        <option value="Work">Work</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>

              {/* Birth Place */}
              <div className="border-t border-slate-100 pt-4">
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Birth Place <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <select
                    value={form.birthPlace.province}
                    onChange={(e) => handleAddressChange("birthPlace", "province", e.target.value)}
                    className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border-slate-300 bg-white"
                  >
                    <option value="">-- Select Province --</option>
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
                    <option value="">-- Select District --</option>
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
                  Current Address <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <select
                    value={form.currentAddress.province}
                    onChange={(e) => handleAddressChange("currentAddress", "province", e.target.value)}
                    className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border-slate-300 bg-white"
                  >
                    <option value="">-- Select Province --</option>
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
                    <option value="">-- Select District --</option>
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
            <SectionTitle icon={Briefcase} title="Bank Account" />
            <div className="space-y-4">
              <FormRow label="Bank Name" required>
                <input
                  value={form.bankAccount.bankName}
                  onChange={(e) => handleBankChange("bankName", e.target.value)}
                  className={inputClass("bankName")}
                  placeholder="e.g. Vietcombank, Techcombank..."
                />
              </FormRow>

              <FormRow label="Account Number" required>
                <input
                  value={form.bankAccount.accountNumber}
                  onChange={(e) => handleBankChange("accountNumber", e.target.value)}
                  className={inputClass("accountNumber")}
                  placeholder="e.g. 123456789"
                />
              </FormRow>

            </div>
          </div>

          {/* 5. Job/Contract */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <SectionTitle icon={Briefcase} title="Position & Contract" />
            <div className="space-y-4">
              <FormRow label="Department" required error={touched.departmentId ? errors.departmentId : null}>
                <select
                  name="departmentId"
                  value={form.departmentId}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={inputClass("departmentId")}
                  disabled={masterLoading}
                >
                  <option value="">{masterLoading ? "Loading..." : "-- Select Department --"}</option>
                  {master.departments.map((d) => (
                    <option key={d.id} value={String(d.id)}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </FormRow>

              <FormRow label="Job Title" required error={touched.jobTitleId ? errors.jobTitleId : null}>
                <select
                  name="jobTitleId"
                  value={form.jobTitleId}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={inputClass("jobTitleId")}
                  disabled={masterLoading}
                >
                  <option value="">{masterLoading ? "Loading..." : "-- Select Job Title --"}</option>
                  {master.jobTitles.map((j) => (
                    <option key={j.id} value={String(j.id)}>
                      {j.name}
                    </option>
                  ))}
                </select>
              </FormRow>

              <FormRow label="Direct Manager">
                <select
                  name="directManagerId"
                  value={form.directManagerId}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={inputClass("directManagerId")}
                  disabled={masterLoading}
                >
                  <option value="">{masterLoading ? "Loading..." : "-- (Optional) --"}</option>
                  {master.managers.map((m) => (
                    <option key={m.id} value={String(m.id)}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </FormRow>

              <FormRow label="Employment Type" required>
                <select
                  name="employmentType"
                  value={form.employmentType}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={inputClass("employmentType")}
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Remote">Remote</option>
                  <option value="Internship">Internship</option>
                </select>
              </FormRow>

              <div className="border-t border-slate-100" />

              <FormRow label="Contract Type">
                <select
                  name="contractType"
                  value={form.contractType}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={inputClass("contractType")}
                >
                  <option value="Indefinite">Permanent</option>
                  <option value="Fixed-term">Fixed-term</option>
                  <option value="Probation">Probation</option>
                </select>
              </FormRow>

              <FormRow label="Start Date" required error={touched.contractStartDate ? errors.contractStartDate : null}>
                <input
                  type="date"
                  name="contractStartDate"
                  value={form.contractStartDate}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={inputClass("contractStartDate")}
                />
              </FormRow>

              {/* End Date - Conditional rendering based on Contract Type */}
              {form.contractType === "Indefinite" ? (
                // Case A: Permanent - Disabled End Date
                <FormRow label="End Date">
                  <input
                    type="date"
                    name="contractEndDate"
                    value=""
                    disabled
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-100 text-slate-500 cursor-not-allowed"
                    placeholder="Not applicable"
                  />
                  <p className="text-xs text-slate-500 mt-1 italic">No applied (Permanent contract)</p>
                </FormRow>
              ) : form.contractType === "Fixed-term" ? (
                // Case B: Fixed-term - Enabled End Date with multiple duration buttons
                <div>
                  <FormRow label="End Date" error={touched.contractEndDate ? errors.contractEndDate : null}>
                    <input
                      type="date"
                      name="contractEndDate"
                      value={form.contractEndDate}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={inputClass("contractEndDate")}
                    />
                  </FormRow>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <p className="text-xs font-medium text-slate-600 w-full mb-1">Quick duration:</p>
                    <Button
                      onClick={() => handleQuickDuration(12)}
                      disabled={!form.contractStartDate}
                      variant="secondary"
                    >
                      12 months
                    </Button>
                    <Button
                      onClick={() => handleQuickDuration(24)}
                      disabled={!form.contractStartDate}
                      variant="secondary"
                    >
                      24 months
                    </Button>
                    <Button
                      onClick={() => handleQuickDuration(36)}
                      disabled={!form.contractStartDate}
                      variant="secondary"
                    >
                      36 months
                    </Button>
                  </div>
                </div>
              ) : (
                // Case C: Probation - Enabled End Date with 2 months button
                <div>
                  <FormRow label="End Date" error={touched.contractEndDate ? errors.contractEndDate : null}>
                    <input
                      type="date"
                      name="contractEndDate"
                      value={form.contractEndDate}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={inputClass("contractEndDate")}
                    />
                  </FormRow>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <p className="text-xs font-medium text-slate-600 w-full mb-1">Quick duration:</p>
                    <Button
                      onClick={() => handleQuickDuration(2)}
                      disabled={!form.contractStartDate}
                      variant="secondary"
                    >
                      2 months
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 6. System settings */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <SectionTitle icon={Settings} title="System Configuration" />
            <div className="space-y-4">
              <FormRow
                label="Company Email"
                required
                error={touched.companyEmail ? errors.companyEmail : null}
                helpText="System auto-generates, if duplicate will add number"
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
                  <Button
                    onClick={() => setEmailLocked((v) => !v)}
                    variant="secondary"
                    title={emailLocked ? "Enable manual edit" : "Lock and auto-generate"}
                  >
                    {emailLocked ? "Edit" : "Auto"}
                  </Button>
                </div>
              </FormRow>


              <FormRow label="Role (Permission)" required error={touched.roleId ? errors.roleId : null}>
                <select
                  name="roleId"
                  value={form.roleId}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={inputClass("roleId")}
                  disabled={masterLoading}
                >
                  <option value="">{masterLoading ? "Loading..." : "-- Select Role --"}</option>
                  {master.roles.map((r) => (
                    <option key={r.id} value={String(r.id)}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </FormRow>

              <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded border border-slate-100">
                * System will auto-generate <b>Username = Employee Code</b> and <b>Password = EMP + last 4 digits of ID</b>.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Dialog */}
      <ConfirmDialog
        isOpen={!!successDialog}
        title="Employee Added Successfully!"
        message={
          successDialog
            ? `Employee Code / Username: ${successDialog.code}
Initial Password: ${successDialog.password}`
            : ""
        }
        type="info"
        confirmLabel="Go to Directory"
        cancelLabel="Add Another"
        onConfirm={() => {
          setSuccessDialog(null);
          navigate("/hr/directory");
        }}
        onCancel={() => {
          setSuccessDialog(null);
          // Reset form for adding another employee
          window.location.reload();
        }}
      />
    </div>
  );
}
