import React, { useState, useEffect } from "react";
import StatsGrid from "../../../components/common/StatsGrid";
import Table from "../../../components/common/Table";
import Button from "../../../components/common/Button";
import { FormRow } from "../../../components/common/FormRow";
import StatusBadge from "../../../components/common/StatusBadge";
import Toast from "../../../components/common/Toast";
import {
  getMyWallet,
  redeemPoints,
  getMyRedemptions,
} from "../../../Services/rewardService";
import { HRService } from "../../../Services/employees";
import { DollarSign, Gift, Activity, Eye, EyeOff } from "lucide-react"; // Dùng lucide-react
import ConfirmDialog from "../../../components/common/ConfirmDialog";

const MyRewardPage = () => {
  const [wallet, setWallet] = useState({ balance: 0, transactions: [] });
  const [redeemAmount, setRedeemAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [showPoints, setShowPoints] = useState(false); // start hidden
  const [lastUpdated, setLastUpdated] = useState(null);
  const [employeeStatus, setEmployeeStatus] = useState(null);
  const [showRedeemConfirm, setShowRedeemConfirm] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  // Format to DD/MM/YYYY HH:MM
  const formatDateTime = (value) => {
    if (!value) return "";
    const d = new Date(value);
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    const HH = String(d.getHours()).padStart(2, "0");
    const MM = String(d.getMinutes()).padStart(2, "0");
    return `${dd}/${mm}/${yyyy} ${HH}:${MM}`;
  };

  const fetchData = async () => {
    try {
      // quick auth presence check
      const token = localStorage.getItem("token");
      if (!token) {
        setToast({ type: "warning", message: "Please log in again" });
        return;
      }

      const res = await getMyWallet();

      // Backend may return different shapes depending on server code / casing.
      // Normalize possible shapes to a single `walletData` object.
      const raw = res?.data ?? res;
      const payload = raw?.data ?? raw?.Data ?? raw;
      const walletData = payload || {};
      const balance =
        walletData.balance ??
        walletData.Balance ??
        walletData.currentBalance ??
        walletData.CurrentBalance ??
        0;
      const totalEarned = walletData.totalEarned ?? walletData.TotalEarned ?? 0;
      const totalSpent = walletData.totalSpent ?? walletData.TotalSpent ?? 0;
      let transactions =
        walletData.transactions ?? walletData.Transactions ?? [];
      const last = walletData.lastUpdated ?? walletData.LastUpdated ?? null;
      const empStatus =
        walletData.employeeStatus ?? walletData.EmployeeStatus ?? null;
      const empName =
        walletData.employeeName ??
        walletData.EmployeeName ??
        walletData.employeeCode ??
        walletData.EmployeeCode ??
        null;

      // Also fetch redemption requests to show status and metadata for redeem transactions
      try {
        const redRes = await getMyRedemptions();
        const rawR = redRes?.data ?? redRes;
        const redList = rawR?.data ?? rawR ?? [];

        // Build lookups: by redemptionId, by points+minute, and latest by points
        const redemptionById = {};
        const byKey = {};
        const byPointsLatest = {};

        (redList || []).forEach((r) => {
          const id = r.redemptionId ?? r.RedemptionId ?? r.redemption_id;
          if (id) redemptionById[id] = r;

          const pts =
            r.pointsRedeemed ?? r.PointsRedeemed ?? r.points ?? r.Points;
          const at = r.requestedAt ?? r.RequestedAt ?? r.requested_at;
          if (!pts) return;
          const key = `${pts}|${
            at ? new Date(at).toISOString().slice(0, 16) : "nok"
          }`;
          byKey[key] = r;
          if (!byPointsLatest[pts]) byPointsLatest[pts] = r;
        });

        // If there are processedBy ids without a processor name, we'll try to resolve names
        const processedIds = new Set();
        (redList || []).forEach((r) => {
          const pb = r.processedBy ?? r.ProcessedBy ?? r.processed_by;
          const proc = r.processor ?? r.Processor;
          if (pb && !proc) processedIds.add(pb);
        });

        let employeesById = {};
        if (processedIds.size > 0) {
          try {
            // Fetch employees (use large page size to include all; acceptable for small deployments)
            const empRes = await HRService.fetchAllEmployees({
              Page: 1,
              PageSize: 1000,
            });
            const empData =
              empRes?.data ?? empRes ?? empRes?.employees ?? empRes?.items;
            const list = Array.isArray(empData)
              ? empData
              : empRes?.employees ?? empRes?.data ?? [];
            (list || []).forEach((e) => {
              employeesById[e.id ?? e.employeeId ?? e.EmployeeId] = e;
            });
          } catch (e) {
            console.warn(
              "Could not fetch employees to resolve processor names",
              e
            );
          }
        }

        transactions = (transactions || []).map((tx) => {
          // 1. Chuẩn hóa Type
          const normalizedType =
            tx.type ||
            tx.Type ||
            tx.transactionType ||
            tx.TransactionType ||
            "UNKNOWN";

          const txPoints = tx.amount ?? tx.Amount ?? tx.Points ?? tx.points;
          const txAt =
            tx.createdAt ?? tx.CreatedAt ?? tx.requestedAt ?? tx.RequestedAt;
          const txRelated =
            tx.relatedId ?? tx.RelatedId ?? tx.related_id ?? tx.related;
          const key = `${Math.abs(txPoints) || txPoints}|${
            txAt ? new Date(txAt).toISOString().slice(0, 16) : "nok"
          }`;

          // match by related id -> by key -> by latest points
          let matched = null;
          if (txRelated && redemptionById[txRelated])
            matched = redemptionById[txRelated];
          if (!matched)
            matched = byKey[key] || byPointsLatest[Math.abs(txPoints)];

          const status = matched
            ? matched.status ?? matched.Status
            : tx.status || tx.Status;

          const requestedAt = matched
            ? matched.requestedAt ?? matched.RequestedAt ?? matched.requested_at
            : undefined;
          const processedAt = matched
            ? matched.processedAt ?? matched.ProcessedAt ?? matched.processed_at
            : undefined;
          let processorName = matched
            ? matched.processor?.fullName ||
              matched.Processor?.fullName ||
              matched.processorName ||
              matched.processedByName ||
              matched.processedByFullName ||
              undefined
            : tx.ProcessedBy || tx.processedBy || tx.processBy;

          // If still missing processorName, try lookup from employees fetch
          if (!processorName && matched) {
            const pb =
              matched.processedBy ??
              matched.ProcessedBy ??
              matched.processed_by;
            const emp = employeesById[pb];
            if (emp)
              processorName =
                emp.fullName ??
                emp.full_name ??
                emp.employeeName ??
                emp.employeeName;
          }

          return {
            ...tx,
            type: normalizedType,
            status,
            requestedAt,
            processedAt,
            processorName,
          };
        });
      } catch (e) {
        console.warn("Could not load redemptions to merge statuses", e);
      }

      setWallet({
        balance,
        totalEarned,
        totalSpent,
        transactions,
      });
      setLastUpdated(last);
      setEmployeeStatus(empStatus);
      if (empName) {
        // optionally expose employee name/code in UI or logs
      }
    } catch (error) {
      console.error("Wallet load error:", error);
      // More detailed error logging
      if (error.response?.status === 401) {
        console.error("❌ 401 Unauthorized - Token invalid or expired");
      }
      setToast({ type: "error", message: "Unable to load wallet data" });
    }
  };

  // Initiate redeem: validate and show confirm dialog
  const handleRedeem = () => {
    if (!redeemAmount || parseInt(redeemAmount) < 100) {
      setToast({ type: "warning", message: "Minimum redeem is 100 points" });
      return;
    }
    if (parseInt(redeemAmount) > wallet.balance) {
      setToast({ type: "error", message: "Insufficient points" });
      return;
    }
    setShowRedeemConfirm(true);
  };

  // Execute redeem after user confirms
  const executeRedeem = async () => {
    setShowRedeemConfirm(false);
    setLoading(true);
    try {
      const points = parseInt(redeemAmount);
      const res = await redeemPoints({ points, method: "CASH" });

      const pendingTransaction = {
        id: res?.data?.id || `local-${Date.now()}`,
        createdAt: new Date().toISOString(),
        type: "REDEEM",
        description: "Request cash redemption",
        amount: -points,
        status: "PENDING",
      };

      setWallet((prev) => ({
        ...prev,
        balance: (Number(prev.balance) || 0) - points,
        transactions: [pendingTransaction, ...(prev.transactions || [])],
      }));

      setToast({
        type: "success",
        message: "Redemption request submitted, pending approval",
      });
      setRedeemAmount("");
      await fetchData();
    } catch (error) {
      console.error("Redeem request failed", error);
      setToast({ type: "error", message: "Redemption failed" });
    } finally {
      setLoading(false);
    }
  };

  // Props input cho Component StatsGrid
  const stats = [
    {
      title: "Available points",
      value: showPoints ? Number(wallet.balance).toLocaleString() : "•••••",
      icon: <Gift size={24} />,
      color: "blue",
    },
    {
      title: "Estimated VND conversion",
      value: showPoints
        ? `${(Number(wallet.balance) * 1000)?.toLocaleString()} VND`
        : "•••••",
      icon: <DollarSign size={24} />,
      color: "green",
    },
  ];

  const columns = [
    {
      title: "Transaction Date",
      dataIndex: "createdAt",
      width: 150,
      render: (row) =>
        row.createdAt ? new Date(row.createdAt).toLocaleString("en-GB") : "-",
    },
    {
      title: "Type",
      dataIndex: "type",
      width: 120,
      // SỬA LỖI 1: Đổi tham số thành (row) và dùng row.type để kiểm tra
      render: (row) => {
        // Lấy type từ row, fallback về các trường khác nếu cần
        const typeValue =
          row.type ||
          row.Type ||
          row.transactionType ||
          row.TransactionType ||
          "UNKNOWN";

        let color = "default";
        // Logic chọn màu
        if (typeValue === "EARN" || typeValue === "BONUS") color = "success";
        if (typeValue === "REDEEM") color = "warning";
        if (typeValue === "MONTHLY") color = "processing";

        return (
          <StatusBadge status={typeValue} type={color} label={typeValue} />
        );
      },
    },
    {
      title: "Description",
      dataIndex: "description",
      // SỬA LỖI 2: Hiển thị đúng mô tả thay vì hiển thị số tiền
      render: (row) => (
        <span className="text-gray-700">
          {row.description || row.Description || "-"}
        </span>
      ),
    },
    {
      title: "Amount",
      dataIndex: "points",
      align: "right",
      // SỬA LỖI 3: Tham số là (row), truy cập row.points
      render: (row) => {
        // Lấy giá trị points, đảm bảo là số
        const val = row.points ?? row.Points ?? row.amount ?? 0;
        return (
          <span
            className={`font-bold ${
              val > 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {val > 0 ? "+" : ""}
            {Number(val).toLocaleString()}
          </span>
        );
      },
    },
    {
      title: "Processed By",
      dataIndex: "processBy",
      // Sửa tham số thành row cho đồng nhất (dù row.processBy có thể undefined)
      render: (row) => {
        const name = row.processBy || row.processorName;
        return name ? (
          <span className="font-medium text-gray-600">{name}</span>
        ) : (
          "System"
        );
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      align: "center",
      render: (row) => {
        // Lấy status từ row
        const status = row.status || "COMPLETED";
        return <StatusBadge status="APPROVED" type="success" label={status} />;
      },
    },
  ];

  return (
    <div className="p-6 fade-in-up">
      <h1 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
        <Gift className="text-blue-600" /> My Rewards Wallet
      </h1>
      <div className="flex items-center gap-3 mb-4">
        <Button variant="secondary" onClick={() => fetchData()}>
          Refresh
        </Button>
        <Button
          variant="ghost"
          onClick={() => setShowPoints((s) => !s)}
          icon={showPoints ? Eye : EyeOff}
        >
          <span className="hidden sm:inline">
            {showPoints ? "Hide points" : "Show points"}
          </span>
        </Button>
        {lastUpdated && (
          <div className="text-sm text-gray-500">
            Last updated: {formatDateTime(lastUpdated)}
          </div>
        )}
      </div>

      <div className="mb-8">
        {/* Simple stats display for wallet (balance + conversion) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500">Available Points</div>
              <div className="text-2xl font-bold text-gray-800">
                {employeeStatus === "LOCKED"
                  ? "Account is locked"
                  : showPoints
                  ? Number(wallet.balance).toLocaleString()
                  : "•••••"}
              </div>
            </div>
            <div className="text-blue-500">
              <Gift size={28} />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500">
                Exchange VNĐ (Estimated)
              </div>
              <div className="text-2xl font-bold text-gray-800">
                {employeeStatus === "LOCKED"
                  ? "-"
                  : showPoints
                  ? (Number(wallet.balance) * 1000).toLocaleString() + " VND"
                  : "•••••"}
              </div>
            </div>
            <div className="text-green-500">
              <DollarSign size={28} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Feature: Form đổi điểm */}
        <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-sm border border-gray-100 h-fit">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Activity className="text-orange-500" size={20} /> Cash Redemption
          </h3>
          <div className="space-y-4">
            <FormRow label="Enter points to redeem (Rate 1:1000)">
              <input
                type="number"
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                value={redeemAmount}
                onChange={(e) => setRedeemAmount(e.target.value)}
                placeholder="e.g. 500"
                min="100"
              />
            </FormRow>
            <Button
              variant="primary"
              onClick={handleRedeem}
              disabled={loading}
              className="w-full justify-center"
            >
              {loading ? "Processing..." : "Confirm Redeem"}
            </Button>
          </div>
        </div>

        {/* Feature: Lịch sử */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-4">Transaction History</h3>
          <Table columns={columns} data={wallet.transactions || []} />
        </div>
      </div>
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
      <ConfirmDialog
        isOpen={showRedeemConfirm}
        title="Confirm Redeem"
        message={`Confirm redeem ${redeemAmount} points?`}
        type="info"
        onConfirm={executeRedeem}
        onCancel={() => setShowRedeemConfirm(false)}
        confirmLabel="Confirm"
        cancelLabel="Cancel"
      />
    </div>
  );
};

export default MyRewardPage;
