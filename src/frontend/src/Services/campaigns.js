import api from "./client";

const MOCK_CAMPAIGNS = [
  {
    id: 1,
    campaignCode: "NYM2026",
    campaignName: "New Year Marathon",
    description: "Run and win exciting rewards!",
    startDate: "2026-01-10",
    endDate: "2026-01-20",
    announcementDate: "2026-01-01",
    registrationRules: "Register before Jan 9, 2026.",
    rewardDescription: "Top 3 runners get cash prizes.",
    guidelines: "Track your runs using the company app.",
    status: "UPCOMING",
    maxParticipants: 100,
    currentParticipants: 12,
    createdAt: "2025-12-01T10:00:00"
  },
  {
    id: 2,
    campaignCode: "SWC2026",
    campaignName: "Spring Wellness Challenge",
    description: "Stay healthy and earn points!",
    startDate: "2026-03-01",
    endDate: "2026-03-31",
    announcementDate: "2026-02-15",
    registrationRules: "Open to all employees.",
    rewardDescription: "Gift cards for top performers.",
    guidelines: "Log your activities daily.",
    status: "UPCOMING",
    maxParticipants: null,
    currentParticipants: 3,
    createdAt: "2026-01-15T09:00:00"
  },
];

const USE_MOCK = false; // set to true to use mock data

function normalizeListItem(item) {
  return {
    campaignCode: item.CampaignCode ?? item.campaignCode ?? item.CampaignCode,
    campaignName: item.CampaignName ?? item.campaignName ?? item.CampaignName,
    description: item.Description ?? item.description ?? item.Description ?? "",
    startDate: item.StartDate ?? item.startDate ?? item.StartDate ?? null,
    endDate: item.EndDate ?? item.endDate ?? item.EndDate ?? null,
    announcementDate: item.AnnouncementDate ?? item.announcementDate ?? item.AnnouncementDate ?? null,
    registrationRules: item.RegistrationRules ?? item.registrationRules ?? item.registrationRules ?? null,
    rewardDescription: item.RewardDescription ?? item.rewards ?? item.rewardDescription ?? null,
    status: item.Status ?? item.status ?? item.Status ?? "UPCOMING",
    maxParticipants: item.MaxParticipants ?? item.maxParticipants ?? null,
    currentParticipants: item.CurrentParticipants ?? item.currentParticipants ?? 0,
    createdAt: item.CreatedAt ?? item.createdAt ?? null,
    // Flag indicating whether current employee already registered (support various backend naming)
    isRegistered: item.IsRegistered ?? item.isRegistered ?? item.IsRegisteredByCurrentEmployee ?? item.registered ?? false,
  };
}

function normalizeDetail(item) {
  // many fields similar to list item
  return normalizeListItem(item);
}

export async function fetchCampaigns(filters = {}) {
  if (USE_MOCK) {
    return new Promise((resolve) => setTimeout(() => resolve(MOCK_CAMPAIGNS), 300));
  }

  const params = {};
  if (filters.name) params.Name = filters.name;
  if (filters.status) params.Status = filters.status;
  if (filters.startDate) params.StartDate = filters.startDate; // expect YYYY-MM-DD or ISO
  if (filters.endDate) params.EndDate = filters.endDate;

  const res = await api.get("/employee/view-campaigns", { params });
  const arr = res.data?.campaigns ?? res.data?.Campaigns ?? [];
  return (arr || []).map(normalizeListItem);
}

export async function fetchCampaignDetail(campaignCode) {
  if (USE_MOCK) {
    return new Promise((resolve) => setTimeout(() => resolve(MOCK_CAMPAIGNS.find((c) => c.campaignCode === campaignCode)), 300));
  }

  const res = await api.get(`/employee/view-campaigns-details`, { params: { campaign_code: campaignCode } });
  const data = res.data?.campaign ?? res.data ?? null;
  if (!data) return null;
  return normalizeDetail(data);
}

// --- NEW: Register for a campaign as employee ---
export async function registerCampaign(campaignCode, employeeCode) {
  // payload per backend: { employeeCode }
  const payload = { EmployeeCode: employeeCode || localStorage.getItem('employeeCode') || '' };
  const res = await api.post(`/employee/campaigns/${campaignCode}/register`, payload);
  return res.data; // CampaignRegisterResponseDto
}

// --- NEW: Check registration status for a campaign by employee code ---
export async function getRegistrationStatus(campaignCode, employeeCode) {
  if (USE_MOCK) {
    // Mock: none registered
    return { status: 'NOT_REGISTERED', registered: false };
  }

  const res = await api.get(`/employee/campaigns/${campaignCode}/status`, { params: { employee_code: employeeCode } });
  // res.data example: { campaignCode, employeeCode, status, registrationDate, ... }
  const dto = res.data;
  return { status: dto?.status ?? null, registered: (dto?.status ?? '').toUpperCase() === 'REGISTERED' };
}

export async function createCampaign(campaignData) {
  // 1. Lấy User ID (giả sử lưu trong localStorage)
  const storedId = localStorage.getItem("employeeId");
  const createdBy = storedId ? parseInt(storedId) : 1;

  // 2. Chuẩn bị Payload khớp 100% với Swagger (image_679deb.png)
  const payload = {
    campaignName: campaignData.campaignName,
    description: campaignData.description,
    startDate: campaignData.startDate,     // Định dạng YYYY-MM-DD từ input date là OK
    endDate: campaignData.endDate,
    announcementDate: campaignData.announcementDate,
    
    // MAPPING QUAN TRỌNG: Form gọi là 'rule' -> API gọi là 'registrationRules'
    registrationRules: campaignData.rule, 
    
    rewardDescription: campaignData.rewardDescription,
    maxParticipants: campaignData.maxParticipants ? parseInt(campaignData.maxParticipants) : 0,
    createdBy: parseInt(createdBy) // Backend cần số nguyên
  };

  // 3. Gọi API (Dựa trên Swagger: POST /api/v1/hr/add-campaigns)
  // Lưu ý: Nếu axios client của bạn đã set base URL là /api/v1 rồi thì chỉ cần /hr/add-campaigns
  const res = await api.post("/hr/add-campaigns", payload);
  return res.data;
}

export async function deleteCampaign(campaignCode) {
  // Dựa trên hình Swagger: PATCH /api/v1/campaigns/{campaign_code}/delete
  // Lưu ý: api.patch không phải api.delete
  const res = await api.patch(`/campaigns/${campaignCode}/delete`);
  return res.data;
}