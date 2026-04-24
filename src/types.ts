export type AppRole = "viewer" | "requester" | "admin";
export type ReviewStatus = "draft" | "submitted" | "in_review" | "completed" | "rejected";
export type SystemType = "personal" | "non_personal" | "both";
export type ReviewResult = "pass" | "fail" | "na" | null;

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: AppRole;
};

export type SecurityRequirement = {
  id?: string;
  code: string;
  category: string;
  title: string;
  requirement: string;
  description: string;
  applies_personal: boolean;
  applies_non_personal: boolean;
  sort_order: number;
};

export type Review = {
  id: string;
  requester_id: string;
  admin_id: string | null;
  system_name: string;
  system_type: SystemType;
  requester_department: string | null;
  project_owner: string | null;
  development_type: string | null;
  service_scope: string | null;
  launch_date: string | null;
  summary: string;
  status: ReviewStatus;
  due_date: string | null;
  created_at: string;
  updated_at: string;
  profiles?: Pick<Profile, "email" | "full_name"> | null;
};

export type ReviewItem = {
  id: string;
  review_id: string;
  requirement_id: string;
  result: ReviewResult;
  non_compliance_reason: string | null;
  action_due_date: string | null;
  reviewer_result: ReviewResult;
  reviewer_comment: string | null;
  security_requirements: SecurityRequirement;
};

export type ReviewGroup = {
  id: string;
  review_id: string;
  category: string;
  is_applicable: boolean | null;
  skip_reason: string | null;
};
