import React, { useState } from "react";

export default function AuthForm({ title, fields, onSubmit, submitLabel = "Submit" }) {
  const [formData, setFormData] = useState(() =>
    fields ? fields.reduce((acc, field) => {
      acc[field.name] = "";
      return acc;
    }, {}) : {}
  );

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  // Nhúng CSS trực tiếp để tránh lỗi import file
  const styles = `
    * {
      box-sizing: border-box;
    }

    .auth-form {
      max-width: 400px;
      width: 100%;
      margin: 2rem auto;
      padding: 2.5rem;
      background: #ffffff;
      border-radius: 12px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 
                  0 2px 4px -1px rgba(0, 0, 0, 0.06);
      border: 1px solid #e5e7eb;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }

    .auth-form h2 {
      margin-bottom: 2rem;
      font-size: 1.75rem;
      font-weight: 700;
      color: #1f2937;
      text-align: center;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-size: 0.875rem;
      font-weight: 600;
      color: #374151;
    }

    .form-group input {
      width: 100%;
      padding: 0.75rem 1rem;
      font-size: 1rem;
      color: #1f2937;
      background-color: #f9fafb;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      transition: all 0.2s ease-in-out;
    }

    .form-group input:focus {
      outline: none;
      background-color: #ffffff;
      border-color: #6366f1;
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
    }

    .submit-btn {
      width: 100%;
      padding: 0.875rem;
      font-size: 1rem;
      font-weight: 600;
      color: white;
      background-color: #4f46e5;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      transition: background-color 0.2s;
      margin-top: 1rem;
    }

    .submit-btn:hover {
      background-color: #4338ca;
    }

    .submit-btn:active {
      transform: translateY(1px);
    }

    @media (max-width: 480px) {
      .auth-form {
        padding: 1.5rem;
        box-shadow: none;
        border: none;
      }
    }
  `;

  return (
    <>
      <style>{styles}</style>
      <form onSubmit={handleSubmit} className="auth-form">
        <h2>{title}</h2>
        
        {fields && fields.map((field) => (
          <div key={field.name} className="form-group">
            <label htmlFor={field.name}>{field.label}</label>
            <input
              id={field.name}
              name={field.name}
              type={field.type || "text"}
              required={field.required}
              placeholder={field.placeholder || ""}
              value={formData[field.name]}
              onChange={handleChange}
            />
          </div>
        ))}

        <button type="submit" className="submit-btn">
          {submitLabel}
        </button>
      </form>
    </>
  );
}