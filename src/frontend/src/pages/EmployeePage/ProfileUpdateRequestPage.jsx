// src/pages/employee/ProfileUpdateRequestPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchEmployeeProfile,
  sendProfileUpdateRequest,
} from "../../Services/requests";
import { FormRow } from "../../components/common/FormRow";
import ViolationBanner from "../../components/common/ViolationBanner";

export default function ProfileUpdateRequestPage() {
  const navigate = useNavigate();
  const currentEmployeeCode = "EMP001"; // đổi lại theo DB

  const [form, setForm] = useState({
    personalEmail: "",
    phoneNumber: "",
    currentAddress: "",
    bankAccount: "",
  });

  const [original, setOriginal] = useState({});
  const [reason, setReason] = useState("");
  const [errs, setErrs] = useState([]);

  // Load dữ liệu gốc từ DB
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await fetchEmployeeProfile(currentEmployeeCode);
        if (cancelled) return;

        // Map DTO -> shape mà form/original đều dùng
        const mappedOriginal = {
          personalEmail: data.personalEmail || "",
          // phoneNumbers / bankAccounts là array → lấy phần tử đầu tiên (nếu có)
          phoneNumber:
            (Array.isArray(data.phoneNumbers) && data.phoneNumbers[0]) || "",
          currentAddress: data.currentAddress || "",
          bankAccount:
            (Array.isArray(data.bankAccounts) && data.bankAccounts[0]) || "",
        };

        setOriginal(mappedOriginal);
        setForm(mappedOriginal);
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setErrs(["Lỗi: Không tải được thông tin hồ sơ."]);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [currentEmployeeCode]);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrs([]);

    if (!reason.trim()) {
      setErrs(["Vui lòng nhập lý do thay đổi."]);
      return;
    }

    // Chỉ gửi những field thực sự thay đổi (so với DB)
    const details = [];
    const fieldMap = {
      personalEmail: "PersonalEmail",   // fieldName gửi lên BE
      phoneNumber: "PhoneNumber",
      currentAddress: "CurrentAddress",
      bankAccount: "BankAccount",
    };

    Object.keys(form).forEach((key) => {
      const newVal = form[key] ?? "";
      const oldVal = original[key] ?? "";
      if (newVal !== oldVal) {
        details.push({
          fieldName: fieldMap[key],
          newValue: newVal,
        });
      }
    });

    if (details.length === 0) {
      setErrs(["Bạn chưa thay đổi thông tin nào."]);
      return;
    }

    try {
      const payload = {
        reason: reason.trim(),
        details, // 👈 đúng format Swagger
      };

      console.log("[ProfileUpdateRequest] payload:", payload);

      await sendProfileUpdateRequest(currentEmployeeCode, payload);

      alert("Gửi yêu cầu cập nhật thành công!");
      navigate("/employee/profile");
    } catch (error) {
      console.error("Lỗi submit:", error);
      setErrs([
        error?.message ||
          "Gửi yêu cầu thất bại. Vui lòng thử lại sau.",
      ]);
    }
  };

  return (
    <div className="card form-card p-6 bg-white shadow rounded max-w-2xl mx-auto my-6">
      <h3 className="text-xl font-bold mb-4">Gửi yêu cầu cập nhật hồ sơ</h3>
      <ViolationBanner messages={errs} />

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="profile-section-title font-semibold text-blue-600 border-b pb-2 mb-4">
          Thông tin liên hệ
        </div>

        <FormRow label="Email cá nhân">
          <input
            className="input border p-2 w-full rounded"
            name="personalEmail"
            value={form.personalEmail}
            onChange={handleChange}
          />
        </FormRow>

        <FormRow label="Số điện thoại">
          <input
            className="input border p-2 w-full rounded"
            name="phoneNumber"
            value={form.phoneNumber}
            onChange={handleChange}
          />
        </FormRow>

        <FormRow label="Địa chỉ hiện tại" full>
          <input
            className="input border p-2 w-full rounded"
            name="currentAddress"
            value={form.currentAddress}
            onChange={handleChange}
          />
        </FormRow>

        <div className="profile-section-title font-semibold text-blue-600 border-b pb-2 mb-4 mt-6">
          Thông tin ngân hàng
        </div>

        <FormRow label="Tài khoản ngân hàng" full>
          <input
            className="input border p-2 w-full rounded"
            name="bankAccount"
            value={form.bankAccount}
            onChange={handleChange}
          />
        </FormRow>

        <div className="mt-6">
          <FormRow label="Lý do thay đổi (*)" full>
            <textarea
              className="textarea border p-2 w-full rounded"
              rows={3}
              name="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Nhập lý do chi tiết."
              required
            />
          </FormRow>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
          <button
            type="button"
            className="btn bg-gray-300 text-gray-700 px-4 py-2 rounded"
            onClick={() => navigate("/employee/profile")}
          >
            Hủy
          </button>
          <button
            type="submit"
            className="btn bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Gửi yêu cầu
          </button>
        </div>
      </form>
    </div>
  );
}
