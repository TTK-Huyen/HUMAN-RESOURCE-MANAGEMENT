import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchEmployeeProfile, sendProfileUpdateRequest } from "../../Services/requests";
import { FormRow } from "../../components/common/FormRow";
import ViolationBanner from "../../components/common/ViolationBanner";

export default function ProfileUpdateRequestPage() {
  const navigate = useNavigate();
  const currentEmployeeCode = localStorage.getItem("employeeCode");

  // State for Address (Split for better UX)
  const [addressParts, setAddressParts] = useState({
    street: "", ward: "", district: "", city: ""
  });

  // Main Form State
  const [form, setForm] = useState({
    personalEmail: "",
    phoneNumber: "",
    maritalStatus: "Single",
    hasChildren: false,
    nationality: "Vietnam",
    citizenIdNumber: "",
    personalTaxCode: "",
    socialInsuranceNumber: "",
    dateOfBirth: "",
    gender: "Male",
  });

  const [original, setOriginal] = useState({});
  const [reason, setReason] = useState("");
  const [errs, setErrs] = useState([]);

  // Helper: Convert dd/MM/yyyy to yyyy-MM-dd
  const convertDateToISO = (dateStr) => {
    if (!dateStr) return "";
    if (dateStr.includes("/")) {
        const [day, month, year] = dateStr.split("/");
        return `${year}-${month}-${day}`;
    }
    return dateStr.substring(0, 10);
  };

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchEmployeeProfile(currentEmployeeCode);
        
        // 1. Process existing address
        const addrStr = data.currentAddress || "";
        const parts = addrStr.split(",").map(s => s.trim());
        setAddressParts({
            street: parts[0] || "",
            ward: parts[1] || "",
            district: parts[2] || "",
            city: parts[3] || ""
        });

        // 2. Map data to Form
        const mappedData = {
          personalEmail: data.personalEmail || "",
          phoneNumber: (Array.isArray(data.phoneNumbers) && data.phoneNumbers[0]?.phoneNumber) || data.phone_number || "",
          
          maritalStatus: data.maritalStatus || "Single",
          hasChildren: data.hasChildren || false,
          nationality: data.nationality || "Vietnam",
          
          citizenIdNumber: data.citizenIdNumber || data.citizen_id || "",
          personalTaxCode: data.personalTaxCode || data.personal_tax_code || "",
          socialInsuranceNumber: data.socialInsuranceNumber || data.social_insurance_no || "",
          
          dateOfBirth: convertDateToISO(data.dateOfBirth),
          gender: data.gender || "Male",
        };

        setForm(mappedData);
        setOriginal({ ...mappedData, currentAddress: addrStr });

      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, [currentEmployeeCode]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrs([]);

    if (!reason.trim()) {
      setErrs(["Please enter the reason for change."]);
      return;
    }

    const details = [];
    const fieldMap = {
      personalEmail: "PersonalEmail",
      phoneNumber: "PhoneNumber",
      maritalStatus: "MaritalStatus",
      hasChildren: "HasChildren",
      nationality: "Nationality",
      citizenIdNumber: "CitizenIdNumber",
      personalTaxCode: "PersonalTaxCode",
      socialInsuranceNumber: "SocialInsuranceNumber",
      dateOfBirth: "DateOfBirth",
      gender: "Gender"
    };

    // Compare fields
    Object.keys(fieldMap).forEach(key => {
      const newValStr = String(form[key]);
      const oldValStr = String(original[key] || (key === 'hasChildren' ? "false" : "")); 
      
      if (newValStr !== oldValStr) {
        details.push({
          fieldName: fieldMap[key],
          newValue: newValStr 
        });
      }
    });

    // Handle Address Combine
    const newAddress = [addressParts.street, addressParts.ward, addressParts.district, addressParts.city]
        .filter(Boolean).join(", "); 
    
    if (newAddress !== original.currentAddress) {
        details.push({ fieldName: "CurrentAddress", newValue: newAddress });
    }

    if (details.length === 0) {
      setErrs(["You haven't changed any information."]);
      return;
    }

    try {
      await sendProfileUpdateRequest(currentEmployeeCode, { reason: reason.trim(), details });
      alert("Profile update request submitted successfully!");
      navigate("/employee/profile");
    } catch (error) {
      setErrs([error.message || "Submission failed."]);
    }
  };

  return (
    <div className="card form-card p-6 bg-white shadow rounded max-w-5xl mx-auto my-6">
      <h3 className="text-2xl font-bold mb-6 text-center text-blue-700">Profile Update Request</h3>
      <ViolationBanner messages={errs} />

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* LEFT COLUMN: PERSONAL & CONTACT */}
        <div className="space-y-5">
            <h4 className="text-lg font-semibold text-gray-700 border-b pb-2 flex items-center">
               📝 Personal & Contact Information
            </h4>
            
            <FormRow label="Personal Email">
                <input className="input border p-2 w-full rounded focus:ring-2 ring-blue-200 outline-none" 
                       name="personalEmail" value={form.personalEmail} onChange={handleChange} />
            </FormRow>
            
            <FormRow label="Phone Number">
                <input className="input border p-2 w-full rounded focus:ring-2 ring-blue-200 outline-none" 
                       name="phoneNumber" value={form.phoneNumber} onChange={handleChange} />
            </FormRow>

            <div className="grid grid-cols-2 gap-4">
                <FormRow label="Marital Status">
                    <select className="input border p-2 w-full rounded" name="maritalStatus" value={form.maritalStatus} onChange={handleChange}>
                        <option value="Single">Single</option>
                        <option value="Married">Married</option>
                        <option value="Divorced">Divorced</option>
                        <option value="Widowed">Widowed</option>
                    </select>
                </FormRow>
                <FormRow label="Nationality">
                    <input className="input border p-2 w-full rounded" name="nationality" value={form.nationality} onChange={handleChange} />
                </FormRow>
            </div>

            <div className="bg-blue-50 p-3 rounded-md border border-blue-100">
                <label className="flex items-center cursor-pointer">
                    <input type="checkbox" name="hasChildren" checked={form.hasChildren} onChange={handleChange} className="w-5 h-5 text-blue-600 rounded" />
                    <span className="ml-3 text-gray-700 font-medium">Has Children (For family deduction)</span>
                </label>
            </div>
        </div>

        {/* RIGHT COLUMN: LEGAL INFO */}
        <div className="space-y-5">
            <h4 className="text-lg font-semibold text-gray-700 border-b pb-2 flex items-center">
               ⚖️ Legal Information Correction
            </h4>
            
            <div className="grid grid-cols-2 gap-4">
                <FormRow label="Date of Birth">
                    <input type="date" className="input border p-2 w-full rounded" name="dateOfBirth" value={form.dateOfBirth} onChange={handleChange} />
                </FormRow>
                <FormRow label="Gender">
                     <select className="input border p-2 w-full rounded" name="gender" value={form.gender} onChange={handleChange}>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                    </select>
                </FormRow>
            </div>

            <FormRow label="Citizen ID / Passport No">
                <input className="input border p-2 w-full rounded" name="citizenIdNumber" value={form.citizenIdNumber} onChange={handleChange} />
            </FormRow>

            <FormRow label="Personal Tax Code">
                <input className="input border p-2 w-full rounded" name="personalTaxCode" value={form.personalTaxCode} onChange={handleChange} />
            </FormRow>

            <FormRow label="Social Insurance Number">
                <input className="input border p-2 w-full rounded" name="socialInsuranceNumber" value={form.socialInsuranceNumber} onChange={handleChange} />
            </FormRow>
        </div>

        {/* FULL WIDTH: ADDRESS */}
        <div className="lg:col-span-2 space-y-4 pt-2">
            <h4 className="text-lg font-semibold text-gray-700 border-b pb-2">🏠 Current Address (Split for accuracy)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-600">Province / City</label>
                    <input className="input border p-2 w-full rounded" 
                           value={addressParts.city} onChange={e => setAddressParts({...addressParts, city: e.target.value})} 
                           placeholder="e.g., Ho Chi Minh City" />
                </div>
                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-600">District</label>
                    <input className="input border p-2 w-full rounded" 
                           value={addressParts.district} onChange={e => setAddressParts({...addressParts, district: e.target.value})} 
                           placeholder="e.g., District 1" />
                </div>
                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-600">Ward / Commune</label>
                    <input className="input border p-2 w-full rounded" 
                           value={addressParts.ward} onChange={e => setAddressParts({...addressParts, ward: e.target.value})} 
                           placeholder="e.g., Ben Nghe Ward" />
                </div>
                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-600">Street Name / House No</label>
                    <input className="input border p-2 w-full rounded" 
                           value={addressParts.street} onChange={e => setAddressParts({...addressParts, street: e.target.value})} 
                           placeholder="e.g., 123 Le Duan" />
                </div>
            </div>
        </div>

        {/* REASON & BUTTONS */}
        <div className="lg:col-span-2 mt-4 border-t pt-6">
            <FormRow label="Reason for Change (*)" full>
                <textarea className="textarea border p-2 w-full rounded bg-gray-50 focus:bg-white transition-colors" 
                          rows={3} value={reason} onChange={(e) => setReason(e.target.value)} 
                          required placeholder="e.g., Moved to new address, updated ID card..." />
            </FormRow>
            
            <div className="flex justify-end gap-4 mt-6">
                <button type="button" onClick={() => navigate("/employee/profile")} 
                        className="btn bg-gray-200 text-gray-700 px-6 py-2.5 rounded hover:bg-gray-300 transition">
                    Cancel
                </button>
                <button type="submit" 
                        className="btn bg-blue-600 text-white px-8 py-2.5 rounded font-medium hover:bg-blue-700 transition shadow-lg shadow-blue-200">
                    Submit Request
                </button>
            </div>
        </div>

      </form>
    </div>
  );
}