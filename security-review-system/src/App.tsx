import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  FileText,
  LogOut,
  ShieldCheck,
  UserRoundCog,
} from "lucide-react";
import { CHECKLIST } from "./data/checklist";
import { isSupabaseConfigured, requireSupabase, supabase } from "./lib/supabase";
import type {
  AppRole,
  Profile,
  Review,
  ReviewGroup,
  ReviewItem,
  ReviewResult,
  ReviewStatus,
  SecurityRequirement,
  SystemType,
} from "./types";

type SessionUser = {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
  };
};

type DraftReview = {
  system_name: string;
  system_type: SystemType;
  requester_department: string;
  project_owner: string;
  development_type: string;
  service_scope: string;
  launch_date: string;
  summary: string;
  due_date: string;
};

type SideMenu = "dashboard" | "reviewQueue" | "authoring" | "completed" | "history" | "permissions";

const ACTIVE_MENU_STORAGE_KEY = "security-review:active-menu";
const SIDE_MENUS: SideMenu[] = ["dashboard", "reviewQueue", "authoring", "completed", "history", "permissions"];

function isSideMenu(value: string | null): value is SideMenu {
  return Boolean(value && SIDE_MENUS.includes(value as SideMenu));
}

function getInitialSideMenu(): SideMenu {
  if (typeof window === "undefined") return "dashboard";
  const storedMenu = window.localStorage.getItem(ACTIVE_MENU_STORAGE_KEY);
  return isSideMenu(storedMenu) ? storedMenu : "dashboard";
}

const STATUS_LABEL: Record<ReviewStatus, string> = {
  draft: "작성중",
  submitted: "요청됨",
  in_review: "검토중",
  completed: "완료",
  rejected: "반려",
};

const RESULT_LABEL: Record<Exclude<ReviewResult, null>, string> = {
  pass: "양호",
  fail: "미흡",
  na: "해당없음",
};

const ROLE_LABEL: Record<AppRole, string> = {
  viewer: "Viewer",
  requester: "Requester",
  admin: "Admin",
};

const GROUP_QUESTIONS: Record<string, string> = {
  인증: "사용자 로그인, 계정 발급, 비밀번호, 세션 또는 본인 확인 기능이 포함되어 있나요?",
  "로그인 관리": "로그인 실패, 계정 잠금, 접속 세션, 동시 접속 등 로그인 통제 기능이 있나요?",
  "인증 및 접근 권한 통제": "관리자/사용자 권한, 메뉴 접근, 데이터 접근 권한을 구분해야 하나요?",
  개인정보보호: "개인정보, 고유식별정보, 민감정보 또는 개인정보 처리 화면/기능이 포함되어 있나요?",
  "시스템 구성": "서버, DB, 네트워크, 암호키, 방화벽, 개발/운영 환경 구성 변경이 있나요?",
  "개발 시 보안 적용 사항": "신규 개발, 기능 개선, 배포 구조 변경 또는 개발/운영 환경 분리가 필요한 프로젝트인가요?",
  "입출력 관리": "사용자 입력, 파일 업로드/다운로드, 화면/문서 출력, 데이터 마스킹 기능이 있나요?",
  "로그 관리": "개인정보 처리 기록, 관리자 활동, 접근 기록 등 감사 로그를 남겨야 하나요?",
  보안솔루션: "백신, WAF, 접근통제, 취약점 점검 등 보안솔루션 적용 또는 연동 대상인가요?",
};

const GROUP_GUIDES: Record<string, string> = {
  인증: "로그인 화면, 회원/직원 계정, 비밀번호, SSO, 인증번호, 세션 유지 기능이 있으면 해당입니다.",
  "로그인 관리": "로그인 실패 횟수 제한, 자동 로그아웃, 중복 로그인 차단, 장시간 미사용 처리처럼 로그인 후 상태를 관리하면 해당입니다.",
  "인증 및 접근 권한 통제": "사용자별로 볼 수 있는 메뉴나 데이터가 다르거나, 관리자 기능이 따로 있으면 해당입니다.",
  개인정보보호: "이름, 연락처, 이메일, 사번, 주소, 생년월일, 계좌, 식별번호 같은 사람을 알아볼 수 있는 정보를 다루면 해당입니다.",
  "시스템 구성": "서버, 데이터베이스, 방화벽, 네트워크, 클라우드 저장소, 암호화 키처럼 인프라 구성이 새로 생기거나 바뀌면 해당입니다.",
  "개발 시 보안 적용 사항": "운영과 개발 환경을 나누거나, 실제 개인정보를 테스트에 쓰지 않아야 하거나, 배포 전 보안 점검이 필요한 개발이면 해당입니다.",
  "입출력 관리": "사용자가 값을 입력하거나 파일을 올리고 내려받거나, 화면/문서에 개인정보를 표시하는 기능이 있으면 해당입니다.",
  "로그 관리": "누가 언제 어떤 데이터를 조회/수정/삭제했는지 기록해야 하거나, 관리자 작업 내역을 남겨야 하면 해당입니다.",
  보안솔루션: "백신, 웹방화벽, 접근제어, 취약점 점검 도구, 모니터링 솔루션을 적용하거나 연동하면 해당입니다.",
};

function normalizeCategory(category: string) {
  return category.replace(/\s+/g, " ").trim();
}

function getGroupQuestion(category: string) {
  return GROUP_QUESTIONS[normalizeCategory(category)] ?? `${category} 영역의 보안 요건이 이번 프로젝트에 적용되나요?`;
}

function getGroupGuide(category: string) {
  return GROUP_GUIDES[normalizeCategory(category)] ?? "이번 프로젝트의 기능, 데이터, 화면, 인프라 변경과 관련이 있으면 해당으로 선택하세요.";
}

async function sendReviewSubmittedNotification(
  review: Review,
  requester: Profile,
  groups: ReviewGroup[],
  items: ReviewItem[],
) {
  const applicableGroups = groups.filter((group) => group.is_applicable === true);
  const failedItems = items.filter((item) => item.result === "fail");
  const requesterName = requester.full_name || requester.email;
  const text = [
    "🔔 보안성 검토 요청서가 제출되었습니다.",
    `• 프로젝트: ${review.system_name}`,
    `• 요청자: ${requesterName}`,
    `• 요청 부서: ${review.requester_department || "-"}`,
    `• 오픈 예정일: ${formatDate(review.launch_date)}`,
    `• 해당 그룹: ${applicableGroups.length}개`,
    `• 미흡 항목: ${failedItems.length}개`,
  ].join("\n");

  const response = await fetch("/api/google-chat-webhook", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    throw new Error(`Google Chat 알림 전송 실패 (${response.status})`);
  }
}

const emptyDraft: DraftReview = {
  system_name: "",
  system_type: "personal",
  requester_department: "",
  project_owner: "",
  development_type: "new",
  service_scope: "internal",
  launch_date: "",
  summary: "",
  due_date: "",
};

function appliesToSystem(item: SecurityRequirement, systemType: SystemType) {
  if (systemType === "both") return true;
  if (systemType === "personal") return item.applies_personal;
  return item.applies_non_personal;
}

function isProjectInfoComplete(value: DraftReview) {
  return Boolean(
    value.system_name.trim() &&
      value.requester_department.trim() &&
      value.project_owner.trim() &&
      value.development_type.trim() &&
      value.service_scope.trim() &&
      value.launch_date.trim() &&
      value.summary.trim() &&
      value.due_date.trim() &&
      value.system_type,
  );
}

function reviewToDraft(review: Review): DraftReview {
  return {
    system_name: review.system_name,
    system_type: review.system_type,
    requester_department: review.requester_department ?? "",
    project_owner: review.project_owner ?? "",
    development_type: review.development_type ?? "",
    service_scope: review.service_scope ?? "",
    launch_date: review.launch_date ?? "",
    summary: review.summary,
    due_date: review.due_date ?? "",
  };
}

function formatDate(value: string | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("ko-KR", { dateStyle: "medium" }).format(new Date(value));
}

function isReviewer(role: AppRole) {
  return role === "admin";
}

export default function App() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [requirements, setRequirements] = useState<SecurityRequirement[]>(CHECKLIST);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);
  const [reviewItems, setReviewItems] = useState<ReviewItem[]>([]);
  const [reviewGroups, setReviewGroups] = useState<ReviewGroup[]>([]);
  const [draft, setDraft] = useState<DraftReview>(emptyDraft);
  const [activeMenu, setActiveMenu] = useState<SideMenu>(() => getInitialSideMenu());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedReview = useMemo(
    () => reviews.find((review) => review.id === selectedReviewId) ?? null,
    [reviews, selectedReviewId],
  );
  const stats = useMemo(() => {
    const groupMap = new Map(reviewGroups.map((group) => [group.category, group]));
    const applicableItems = reviewItems.filter(
      (item) => groupMap.get(item.security_requirements.category)?.is_applicable === true,
    );
    const skippedGroups = reviewGroups.filter((group) => group.is_applicable === false).length;
    const total = applicableItems.length;
    const requesterDone = applicableItems.filter((item) => item.result).length;
    const requesterFailed = applicableItems.filter((item) => item.result === "fail").length;
    const adminDone = applicableItems.filter((item) => item.reviewer_result).length;
    const adminFailed = applicableItems.filter((item) => item.reviewer_result === "fail").length;
    const undecidedGroups = reviewGroups.filter((group) => group.is_applicable === null).length;
    const missingSkipReasons = reviewGroups.filter(
      (group) => group.is_applicable === false && !group.skip_reason?.trim(),
    ).length;
    return {
      total,
      requesterDone,
      requesterFailed,
      adminDone,
      adminFailed,
      skippedGroups,
      undecidedGroups,
      missingSkipReasons,
    };
  }, [reviewItems, reviewGroups]);
  const canCreateReview = profile?.role === "requester";
  const canAccessReviewQueue = profile ? isReviewer(profile.role) : false;
  const canAccessReviewOutput = profile ? profile.role === "requester" || isReviewer(profile.role) : false;
  const isCurrentProjectInfoComplete = selectedReview
    ? isProjectInfoComplete(reviewToDraft(selectedReview))
    : isProjectInfoComplete(draft);
  const canRequesterEdit = Boolean(
    canCreateReview &&
      selectedReview &&
      selectedReview.requester_id === user?.id &&
      ["draft", "rejected"].includes(selectedReview.status),
  );
  const shouldShowProjectForm = activeMenu === "authoring" && canCreateReview && (!selectedReview || canRequesterEdit);
  const hasStartedReview = Boolean(
    isCurrentProjectInfoComplete &&
    selectedReview &&
      selectedReview.requester_id === user?.id &&
      ["draft", "rejected"].includes(selectedReview.status),
  );
  const hasCompletedGroupDecision =
    hasStartedReview && reviewGroups.length > 0 && stats.undecidedGroups === 0 && stats.missingSkipReasons === 0;
  const menuReviews = useMemo(() => {
    if (activeMenu === "reviewQueue") {
      return reviews.filter((review) => ["submitted", "in_review"].includes(review.status));
    }
    if (activeMenu === "authoring") {
      return reviews.filter((review) => ["draft", "rejected", "submitted", "in_review"].includes(review.status));
    }
    if (activeMenu === "completed") {
      return reviews.filter((review) => review.status === "completed");
    }
    if (activeMenu === "history") {
      return reviews.filter((review) => review.status === "completed");
    }
    return reviews;
  }, [activeMenu, reviews]);

  const dashboardCounts = useMemo(
    () => ({
      draft: reviews.filter((review) => review.status === "draft").length,
      submitted: reviews.filter((review) => review.status === "submitted").length,
      inReview: reviews.filter((review) => review.status === "in_review").length,
      completed: reviews.filter((review) => review.status === "completed").length,
      rejected: reviews.filter((review) => review.status === "rejected").length,
    }),
    [reviews],
  );

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    supabase.auth.getUser().then(({ data }) => setUser(data.user as SessionUser | null));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser((session?.user as SessionUser | undefined) ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setProfiles([]);
      setReviews([]);
      setReviewItems([]);
      setReviewGroups([]);
      setLoading(false);
      return;
    }
    void bootstrap();
  }, [user]);

  useEffect(() => {
    if (selectedReviewId) {
      if (activeMenu === "dashboard" || activeMenu === "completed" || activeMenu === "history" || activeMenu === "permissions") {
        return;
      }
      if (!menuReviews.some((review) => review.id === selectedReviewId)) return;
      void loadReviewItems(selectedReviewId);
    } else {
      setReviewItems([]);
      setReviewGroups([]);
    }
  }, [activeMenu, menuReviews, selectedReviewId]);

  useEffect(() => {
    window.localStorage.setItem(ACTIVE_MENU_STORAGE_KEY, activeMenu);
  }, [activeMenu]);

  useEffect(() => {
    if (activeMenu === "dashboard" || activeMenu === "permissions") return;
    if (activeMenu === "authoring") return;
    if (activeMenu === "completed") return;
    if (activeMenu === "history") return;
    if (selectedReviewId && menuReviews.some((review) => review.id === selectedReviewId)) return;
    setSelectedReviewId(menuReviews[0]?.id ?? null);
  }, [activeMenu, menuReviews, selectedReviewId]);

  useEffect(() => {
    if (activeMenu !== "permissions" || !user) return;
    void refreshProfileForPermissions();
  }, [activeMenu, user]);

  useEffect(() => {
    if (!profile) return;
    const isBlockedRequesterMenu = activeMenu === "authoring" && !canCreateReview;
    const isBlockedReviewerMenu =
      (activeMenu === "reviewQueue" || activeMenu === "permissions") && !canAccessReviewQueue;
    const isBlockedOutputMenu = (activeMenu === "completed" || activeMenu === "history") && !canAccessReviewOutput;
    if (isBlockedRequesterMenu || isBlockedReviewerMenu || isBlockedOutputMenu) {
      setActiveMenu("dashboard");
    }
  }, [activeMenu, canAccessReviewOutput, canAccessReviewQueue, canCreateReview, profile]);

  async function bootstrap() {
    try {
      setLoading(true);
      setError(null);
      const client = requireSupabase();

      const [{ data: existingProfile, error: profileError }, { data: reqData, error: reqError }] =
        await Promise.all([
          client.from("sr_profiles").select("*").eq("id", user!.id).maybeSingle(),
          client.from("sr_security_requirements").select("*").order("sort_order"),
        ]);

      if (profileError) throw profileError;
      if (reqError) throw reqError;

      const profileData = existingProfile ?? (await createMissingProfile());
      setProfile(profileData as Profile);
      if (!(reqData as SecurityRequirement[])?.length) {
        throw new Error("체크리스트 마스터 데이터가 없습니다. Supabase에서 seed_checklist.sql을 실행해 주세요.");
      }
      setRequirements(reqData as SecurityRequirement[]);
      await loadReviews(profileData as Profile);
      await loadProfiles(profileData as Profile);
    } catch (err) {
      setError(toFriendlyError(err, "초기 데이터를 불러오지 못했습니다."));
    } finally {
      setLoading(false);
    }
  }

  async function createMissingProfile() {
    const client = requireSupabase();
    const { data, error: insertError } = await client
      .from("sr_profiles")
      .insert({
        id: user!.id,
        email: user!.email ?? "",
        full_name: user!.user_metadata?.full_name ?? null,
        avatar_url: user!.user_metadata?.avatar_url ?? null,
        role: "requester",
      })
      .select()
      .single();

    if (insertError) {
      if (insertError.code === "23505") {
        const { data: existingProfile, error: selectError } = await client
          .from("sr_profiles")
          .select("*")
          .eq("id", user!.id)
          .single();

        if (!selectError && existingProfile) {
          return existingProfile;
        }
      }

      throw new Error(
        `프로필을 자동 생성하지 못했습니다. Supabase에서 schema.sql을 다시 실행해 RLS 정책을 갱신해 주세요. (${insertError.message})`,
      );
    }
    return data;
  }

  async function loadReviews(activeProfile = profile) {
    const client = requireSupabase();
    let query = client
      .from("sr_reviews")
      .select("*")
      .order("updated_at", { ascending: false });

    if (activeProfile?.role === "viewer") {
      query = query.neq("status", "draft");
    }

    const { data, error: reviewError } = await query;

    if (reviewError) throw reviewError;
    const reviewRows = (data ?? []) as Review[];
    const requesterIds = [...new Set(reviewRows.map((review) => review.requester_id))];
    const { data: profileRows, error: requesterError } = requesterIds.length
      ? await client.from("sr_profiles").select("id, email, full_name").in("id", requesterIds)
      : { data: [], error: null };

    if (requesterError) throw requesterError;
    const profileMap = new Map((profileRows ?? []).map((row) => [row.id, row]));
    const reviewsWithProfiles = reviewRows.map((review) => ({
      ...review,
      profiles: profileMap.get(review.requester_id) ?? null,
    }));

    setReviews(reviewsWithProfiles as Review[]);
  }

  async function loadProfiles(activeProfile = profile) {
    if (activeProfile?.role !== "admin") {
      setProfiles([]);
      return;
    }

    const client = requireSupabase();
    const { data, error: profileError } = await client
      .from("sr_profiles")
      .select("*")
      .order("email", { ascending: true });

    if (profileError) throw profileError;
    setProfiles((data ?? []) as Profile[]);
  }

  async function refreshProfileForPermissions() {
    try {
      setError(null);
      const client = requireSupabase();
      const { data, error: profileError } = await client.from("sr_profiles").select("*").eq("id", user!.id).single();

      if (profileError) throw profileError;
      const freshProfile = data as Profile;
      setProfile(freshProfile);
      await loadProfiles(freshProfile);
    } catch (err) {
      setError(toFriendlyError(err, "권한 정보를 다시 불러오지 못했습니다."));
    }
  }

  async function loadReviewItems(reviewId: string) {
    try {
      setError(null);
      const client = requireSupabase();
      const [{ data, error: itemError }, { data: groupData, error: groupError }] = await Promise.all([
        client
          .from("sr_review_items")
          .select("*, security_requirements:sr_security_requirements(*)")
          .eq("review_id", reviewId),
        client.from("sr_review_groups").select("*").eq("review_id", reviewId).order("category"),
      ]);

      if (itemError) throw itemError;
      if (groupError) throw groupError;
      const sortedItems = ((data ?? []) as ReviewItem[]).sort(
        (a, b) => a.security_requirements.sort_order - b.security_requirements.sort_order,
      );
      setReviewItems(sortedItems);
      setReviewGroups((groupData ?? []) as ReviewGroup[]);
    } catch (err) {
      setError(toFriendlyError(err, "검토 항목을 불러오지 못했습니다."));
    }
  }

  async function toggleCompletedResult(reviewId: string | null) {
    if (!reviewId || selectedReviewId === reviewId) {
      setSelectedReviewId(null);
      setReviewItems([]);
      setReviewGroups([]);
      return;
    }

    await loadReviewItems(reviewId);
    setSelectedReviewId(reviewId);
  }

  async function signInWithGoogle() {
    const client = requireSupabase();
    const { error: authError } = await client.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (authError) setError(authError.message);
  }

  async function signOut() {
    const client = requireSupabase();
    await client.auth.signOut();
  }

  async function createReview() {
    if (!profile || !user) return;

    const applicableRequirements = requirements.filter((item) => appliesToSystem(item, draft.system_type));
    if (!isProjectInfoComplete(draft)) {
      setError("프로젝트 정보를 모두 작성해 주세요.");
      return;
    }

    try {
      setSaving(true);
      setError(null);
      const client = requireSupabase();
      const { data: review, error: reviewError } = await client
        .from("sr_reviews")
        .insert({
          requester_id: user.id,
          system_name: draft.system_name.trim(),
          system_type: draft.system_type,
          requester_department: draft.requester_department.trim() || null,
          project_owner: draft.project_owner.trim() || null,
          development_type: draft.development_type || null,
          service_scope: draft.service_scope || null,
          launch_date: draft.launch_date || null,
          summary: draft.summary.trim(),
          due_date: draft.due_date || null,
          status: "draft",
        })
        .select()
        .single();

      if (reviewError) throw reviewError;

      const reviewItemRows = applicableRequirements.map((requirement) => ({
        review_id: review.id,
        requirement_id: requirement.id,
      }));
      const reviewGroupRows = [...new Set(applicableRequirements.map((requirement) => requirement.category))].map(
        (category) => ({
          review_id: review.id,
          category,
          is_applicable: null,
        }),
      );

      if (reviewItemRows.some((row) => !row.requirement_id)) {
        throw new Error("체크리스트 마스터 데이터가 Supabase에 seed되지 않았습니다.");
      }

      const { error: itemError } = await client.from("sr_review_items").insert(reviewItemRows);
      if (itemError) throw itemError;
      const { error: groupError } = await client.from("sr_review_groups").insert(reviewGroupRows);
      if (groupError) throw groupError;

      setDraft(emptyDraft);
      await loadReviews();
      setReviewGroups(reviewGroupRows as ReviewGroup[]);
      setSelectedReviewId(review.id);
      await loadReviewItems(review.id);
    } catch (err) {
      setError(toFriendlyError(err, "검토 요청을 저장하지 못했습니다."));
    } finally {
      setSaving(false);
    }
  }

  async function updateReviewProjectInfo(review: Review, values: DraftReview) {
    if (!profile || !user) return;

    if (!isProjectInfoComplete(values)) {
      setError("프로젝트 정보를 모두 작성해 주세요.");
      return;
    }

    try {
      setSaving(true);
      setError(null);
      const client = requireSupabase();
      const { error: reviewError } = await client
        .from("sr_reviews")
        .update({
          system_name: values.system_name.trim(),
          system_type: values.system_type,
          requester_department: values.requester_department.trim() || null,
          project_owner: values.project_owner.trim() || null,
          development_type: values.development_type || null,
          service_scope: values.service_scope || null,
          launch_date: values.launch_date || null,
          summary: values.summary.trim(),
          due_date: values.due_date || null,
        })
        .eq("id", review.id)
        .eq("requester_id", user.id);

      if (reviewError) throw reviewError;
      await loadReviews(profile);
      setSelectedReviewId(review.id);
    } catch (err) {
      setError(toFriendlyError(err, "프로젝트 정보를 수정하지 못했습니다."));
    } finally {
      setSaving(false);
    }
  }

  async function updateItem(item: ReviewItem, patch: Partial<ReviewItem>) {
    if (!selectedReview || !profile) return;

    const updated = reviewItems.map((candidate) =>
      candidate.id === item.id ? { ...candidate, ...patch } : candidate,
    );
    setReviewItems(updated);

    const client = requireSupabase();
    const payload: Record<string, ReviewResult | string | null> = {};
    for (const key of [
      "result",
      "non_compliance_reason",
      "action_due_date",
      "reviewer_result",
      "reviewer_comment",
    ] as const) {
      if (Object.prototype.hasOwnProperty.call(patch, key)) {
        payload[key] = patch[key] ?? null;
      }
    }

    const { error: itemError } = await client
      .from("sr_review_items")
      .update(payload)
      .eq("id", item.id);

    if (itemError) {
      setError(itemError.message);
      await loadReviewItems(selectedReview.id);
    }
  }

  async function updateGroup(group: ReviewGroup, patch: Partial<ReviewGroup>) {
    if (!selectedReview || !profile) return;

    setReviewGroups((current) =>
      current.map((candidate) => (candidate.id === group.id ? { ...candidate, ...patch } : candidate)),
    );

    const payload: Partial<ReviewGroup> = {};
    if (Object.prototype.hasOwnProperty.call(patch, "is_applicable")) {
      payload.is_applicable = patch.is_applicable;
    }
    if (Object.prototype.hasOwnProperty.call(patch, "skip_reason")) {
      payload.skip_reason = patch.skip_reason ?? null;
    }

    const client = requireSupabase();
    const { error: groupError } = await client.from("sr_review_groups").update(payload).eq("id", group.id);
    if (groupError) {
      setError(groupError.message);
      await loadReviewItems(selectedReview.id);
      return;
    }

    if (patch.is_applicable === false) {
      const itemIds = reviewItems
        .filter((item) => item.security_requirements.category === group.category)
        .map((item) => item.id);

      if (itemIds.length) {
        setReviewItems((current) =>
          current.map((item) =>
            itemIds.includes(item.id)
              ? { ...item, result: null, non_compliance_reason: null, action_due_date: null }
              : item,
          ),
        );

        const { error: itemError } = await client
          .from("sr_review_items")
          .update({ result: null, non_compliance_reason: null, action_due_date: null })
          .in("id", itemIds);

        if (itemError) {
          setError(itemError.message);
          await loadReviewItems(selectedReview.id);
        }
      }
    }
  }

  async function submitReview() {
    if (!selectedReview || !profile) return;

    const groupMap = new Map(reviewGroups.map((group) => [group.category, group]));
    const undecidedGroups = reviewGroups.filter((group) => group.is_applicable === null);
    const missingSkipReasons = reviewGroups.filter(
      (group) => group.is_applicable === false && !group.skip_reason?.trim(),
    );
    const applicableGroups = reviewGroups.filter((group) => group.is_applicable === true);
    const missingItems = reviewItems.filter((item) => {
      const group = groupMap.get(item.security_requirements.category);
      return group?.is_applicable === true && !item.result;
    });

    if (undecidedGroups.length) {
      setError(`그룹 해당 여부 ${undecidedGroups.length}개가 아직 선택되지 않았습니다.`);
      return;
    }

    if (missingSkipReasons.length) {
      setError(`미해당 그룹 ${missingSkipReasons.length}개의 사유를 입력해 주세요.`);
      return;
    }

    if (!applicableGroups.length) {
      setError("최소 한 개 이상의 체크리스트 그룹을 해당으로 선택해 주세요.");
      return;
    }

    if (missingItems.length) {
      setError(`해당 그룹의 체크리스트 ${missingItems.length}개 항목이 아직 작성되지 않았습니다.`);
      return;
    }

    try {
      setSaving(true);
      setError(null);
      const client = requireSupabase();
      const { error: reviewError } = await client
        .from("sr_reviews")
        .update({ status: "submitted" })
        .eq("id", selectedReview.id);

      if (reviewError) throw reviewError;
      let notificationError: unknown = null;
      try {
        await sendReviewSubmittedNotification(selectedReview, profile, reviewGroups, reviewItems);
      } catch (err) {
        notificationError = err;
      }
      await loadReviews(profile);
      setSelectedReviewId(selectedReview.id);
      if (notificationError) {
        setError(toFriendlyError(notificationError, "검토 요청은 제출됐지만 Google Chat 알림 전송에 실패했습니다."));
      }
    } catch (err) {
      setError(toFriendlyError(err, "검토 요청을 제출하지 못했습니다."));
    } finally {
      setSaving(false);
    }
  }

  async function setReviewStatus(status: ReviewStatus) {
    if (!selectedReview || !profile) return;
    try {
      setSaving(true);
      setError(null);
      const client = requireSupabase();
      const { error: reviewError } = await client
        .from("sr_reviews")
        .update({
          status,
          admin_id: profile.id,
          reviewed_at: status === "completed" || status === "rejected" ? new Date().toISOString() : null,
        })
        .eq("id", selectedReview.id);

      if (reviewError) throw reviewError;
      await loadReviews();
    } catch (err) {
      setError(toFriendlyError(err, "상태를 변경하지 못했습니다."));
    } finally {
      setSaving(false);
    }
  }

  async function updateProfileRole(targetProfile: Profile, role: AppRole) {
    if (profile?.role !== "admin") return;

    try {
      setSaving(true);
      setError(null);
      setProfiles((current) =>
        current.map((candidate) => (candidate.id === targetProfile.id ? { ...candidate, role } : candidate)),
      );

      const client = requireSupabase();
      const { error: profileError } = await client.from("sr_profiles").update({ role }).eq("id", targetProfile.id);
      if (profileError) throw profileError;

      if (targetProfile.id === profile.id) {
        setProfile({ ...profile, role });
      }
      await loadProfiles({ ...profile, role });
    } catch (err) {
      setError(toFriendlyError(err, "권한을 변경하지 못했습니다."));
      await loadProfiles(profile);
    } finally {
      setSaving(false);
    }
  }

  function startNewReview() {
    setDraft(emptyDraft);
    setSelectedReviewId(null);
    setReviewItems([]);
    setReviewGroups([]);
    setActiveMenu("authoring");
    setError(null);
  }

  if (!isSupabaseConfigured) {
    return <SetupScreen />;
  }

  if (!user) {
    return (
      <main className="login-page">
        <section className="login-panel">
          <div className="brand-mark">
            <ShieldCheck size={34} />
          </div>
          <h1>보안성 검토 시스템</h1>
          <p>Google OAuth로 로그인하고 체크리스트 기반 검토 요청과 관리자 검토를 진행합니다.</p>
          {error && <div className="alert">{error}</div>}
          <button className="primary-button wide" onClick={signInWithGoogle}>
            Google 계정으로 로그인
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="app-title">
          <ShieldCheck />
          <div>
            <strong>Security Review</strong>
            <span>Checklist workflow</span>
          </div>
        </div>

        <div className="account-strip">
          <div className="profile-box">
            <div className="avatar">
              {profile?.avatar_url ? <img src={profile.avatar_url} alt="" /> : <UserRoundCog />}
            </div>
            <div>
              <strong>{profile?.full_name || user.user_metadata?.full_name || "사용자"}</strong>
              <span>{profile ? ROLE_LABEL[profile.role] : "Loading"}</span>
            </div>
          </div>

          <button className="ghost-button mobile-logout-button" onClick={signOut} aria-label="로그아웃">
            <LogOut size={18} />
            로그아웃
          </button>
        </div>

        <nav className="side-menu" aria-label="주 메뉴">
          <MenuButton active={activeMenu === "dashboard"} onClick={() => setActiveMenu("dashboard")}>
            대시보드
          </MenuButton>
          <MenuButton active={activeMenu === "authoring"} disabled={!canCreateReview} onClick={startNewReview}>
            검토 요청
          </MenuButton>
          <MenuButton
            active={activeMenu === "reviewQueue"}
            disabled={!canAccessReviewQueue}
            onClick={() => setActiveMenu("reviewQueue")}
          >
            검토 진행
          </MenuButton>
          <MenuButton
            active={activeMenu === "completed"}
            disabled={!canAccessReviewOutput}
            onClick={() => setActiveMenu("completed")}
          >
            검토 결과
          </MenuButton>
          <MenuButton
            active={activeMenu === "history"}
            disabled={!canAccessReviewOutput}
            onClick={() => setActiveMenu("history")}
          >
            검토 이력
          </MenuButton>
          <MenuButton
            active={activeMenu === "permissions"}
            disabled={!canAccessReviewQueue}
            onClick={() => setActiveMenu("permissions")}
          >
            권한 관리
          </MenuButton>
        </nav>

        <button className="ghost-button" onClick={signOut}>
          <LogOut size={18} />
          로그아웃
        </button>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <h1>{menuTitle(activeMenu)}</h1>
          </div>
        </header>

        {error && <div className="alert">{error}</div>}
        {loading ? (
          <div className="loading">데이터를 불러오는 중입니다.</div>
        ) : (
          <>
            {activeMenu === "dashboard" ? (
              <DashboardView reviews={reviews} onOpen={(review) => {
                setActiveMenu(
                  review.status === "completed"
                    ? "completed"
                    : ["submitted", "in_review"].includes(review.status) && canAccessReviewQueue
                      ? "reviewQueue"
                      : "authoring",
                );
                setSelectedReviewId(review.id);
              }} />
            ) : activeMenu === "permissions" ? (
              <PermissionManagement
                profiles={profiles}
                canManage={profile?.role === "admin"}
                saving={saving}
                onRoleChange={updateProfileRole}
              />
            ) : activeMenu === "completed" || activeMenu === "history" ? (
              <CompletedResultList
                title={menuTitle(activeMenu)}
                mode={activeMenu === "history" ? "report" : "checklist"}
                reviews={menuReviews}
                selectedReview={selectedReview}
                selectedReviewId={selectedReviewId}
                items={reviewItems}
                groups={reviewGroups}
                onSelect={toggleCompletedResult}
              />
            ) : (
              <div className={activeMenu === "authoring" ? "content-grid authoring-flow" : "content-grid"}>
                {activeMenu !== "authoring" && (
                  <ReviewPicker
                    title={menuTitle(activeMenu)}
                    reviews={menuReviews}
                    selectedReviewId={selectedReviewId}
                    onSelect={setSelectedReviewId}
                  />
                )}

                <section className="panel review-detail">
                  {activeMenu === "authoring" && canCreateReview && selectedReview && (
                    <div className="authoring-actions">
                      <button className="secondary-button" type="button" onClick={startNewReview}>
                        새 요청서 작성
                      </button>
                    </div>
                  )}

                  {shouldShowProjectForm && (
                    <RequestForm
                      draft={draft}
                      existingReview={canRequesterEdit ? selectedReview : null}
                      setDraft={setDraft}
                      saving={saving}
                      onSave={createReview}
                      onUpdate={updateReviewProjectInfo}
                    />
                  )}

                  {selectedReview && menuReviews.some((review) => review.id === selectedReview.id) ? (
                <>
                  {!canRequesterEdit && (
                    <ProjectInfoSummary review={selectedReview} />
                  )}

                  {activeMenu === "reviewQueue" &&
                    profile &&
                    isReviewer(profile.role) &&
                    ["submitted", "in_review"].includes(selectedReview.status) && (
                    <div className="admin-actions">
                      <button disabled={saving} onClick={() => setReviewStatus("in_review")}>
                        검토 시작
                      </button>
                      <button disabled={saving} onClick={() => setReviewStatus("completed")}>
                        완료 처리
                      </button>
                      <button disabled={saving} onClick={() => setReviewStatus("rejected")}>
                        반려
                      </button>
                    </div>
                  )}

                  {canRequesterEdit ? (
                    <>
                      <StepSection
                        step={2}
                        title="사전 질의"
                        locked={!hasStartedReview}
                        lockedMessage="1번 프로젝트 정보를 먼저 작성하세요."
                      >
                        <GroupQuestionPanel
                          groups={reviewGroups}
                          requesterEditable={canRequesterEdit}
                          onGroupChange={updateGroup}
                        />
                      </StepSection>

                      <StepSection
                        step={3}
                        title="체크리스트 작성"
                        locked={!hasCompletedGroupDecision}
                        lockedMessage="2번 사전 질의를 모두 완료하세요."
                      >
                        <ChecklistTable
                          items={reviewItems}
                          groups={reviewGroups}
                          requesterEditable={canRequesterEdit}
                          onChange={updateItem}
                        />
                      </StepSection>

                      <div className="submit-bar">
                        <button className="primary-button" disabled={saving} onClick={submitReview}>
                          {saving ? "요청 중" : "검토 요청"}
                        </button>
                      </div>
                    </>
                  ) : null}

                  {!canRequesterEdit && (
                    <ChecklistTable
                      items={reviewItems}
                      groups={reviewGroups}
                      requesterEditable={false}
                      reviewerEditable={profile?.role === "admin" && selectedReview.status === "in_review"}
                      onChange={updateItem}
                    />
                  )}
                </>
              ) : activeMenu === "authoring" && canCreateReview ? (
                <>
                  <StepSection
                    step={2}
                    title="사전 질의"
                    locked
                    lockedMessage="1번 프로젝트 정보를 모두 작성하세요."
                  >
                    <GroupQuestionPanel groups={[]} requesterEditable={false} onGroupChange={updateGroup} />
                  </StepSection>

                  <StepSection
                    step={3}
                    title="체크리스트 작성"
                    locked
                    lockedMessage="2번 사전 질의를 모두 완료하세요."
                  >
                    <ChecklistTable items={[]} groups={[]} requesterEditable={false} onChange={updateItem} />
                  </StepSection>
                </>
              ) : (
                <div className="empty-state">
                  <ClipboardCheck size={44} />
                  <h2>{menuTitle(activeMenu)} 항목이 없습니다</h2>
                  <p>선택 가능한 검토가 생기면 이곳에서 상세 내용을 확인합니다.</p>
                </div>
              )}
                </section>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}

function SetupScreen() {
  return (
    <main className="login-page">
      <section className="login-panel setup">
        <ShieldCheck size={42} />
        <h1>Supabase 연결이 필요합니다</h1>
        <p>
          `.env.example`을 `.env.local`로 복사한 뒤 Supabase URL과 anon key를 입력하세요. 스키마는
          `supabase/schema.sql`, 체크리스트 seed는 `supabase/seed_checklist.sql`에 준비되어 있습니다.
        </p>
      </section>
    </main>
  );
}

function MenuButton({
  active,
  disabled = false,
  onClick,
  children,
}: {
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button className={active ? "menu-button active" : "menu-button"} disabled={disabled} onClick={onClick}>
      {children}
    </button>
  );
}

function menuTitle(menu: SideMenu) {
  if (menu === "dashboard") return "대시보드";
  if (menu === "reviewQueue") return "검토 진행";
  if (menu === "authoring") return "검토 요청";
  if (menu === "completed") return "검토 결과";
  if (menu === "history") return "검토 이력";
  if (menu === "permissions") return "권한 관리";
  return "대시보드";
}

function PermissionManagement({
  profiles,
  canManage,
  saving,
  onRoleChange,
}: {
  profiles: Profile[];
  canManage: boolean;
  saving: boolean;
  onRoleChange: (profile: Profile, role: AppRole) => void;
}) {
  return (
    <section className="panel permission-panel">
      <div className="section-title">
        <UserRoundCog size={20} />
        <div>
          <h2>권한 관리</h2>
          <p>계정별 역할을 viewer, requester, admin으로 관리합니다.</p>
        </div>
      </div>

      {!canManage ? (
        <div className="empty-state compact">
          <ShieldCheck size={38} />
          <h2>관리자 권한이 필요합니다</h2>
          <p>권한 변경은 admin 계정만 사용할 수 있습니다.</p>
        </div>
      ) : (
        <div className="permission-list">
          <div className="permission-row permission-head">
            <span>계정</span>
            <span>이름</span>
            <span>권한</span>
          </div>
          {profiles.map((targetProfile) => (
            <div className="permission-row" key={targetProfile.id}>
              <strong>{targetProfile.email}</strong>
              <span>{targetProfile.full_name || "-"}</span>
              <select
                value={targetProfile.role}
                disabled={saving}
                onChange={(event) => onRoleChange(targetProfile, event.target.value as AppRole)}
              >
                <option value="viewer">{ROLE_LABEL.viewer}</option>
                <option value="requester">{ROLE_LABEL.requester}</option>
                <option value="admin">{ROLE_LABEL.admin}</option>
              </select>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function DashboardView({ reviews, onOpen }: { reviews: Review[]; onOpen: (review: Review) => void }) {
  const kanbanColumns = [
    {
      key: "draft",
      title: "작성중",
      items: reviews.filter((review) => review.status === "draft" || review.status === "rejected"),
    },
    {
      key: "reviewing",
      title: "검토중",
      items: reviews.filter((review) => review.status === "submitted" || review.status === "in_review"),
    },
    {
      key: "completed",
      title: "검토완료",
      items: reviews.filter((review) => review.status === "completed"),
    },
  ];

  return (
    <div className="dashboard-view">
      <section className="panel dashboard-panel">
        <div className="section-title compact">
          <ClipboardCheck />
          <div>
            <h2>요청 현황</h2>
            <p>작성중, 검토중, 검토완료 상태를 한눈에 확인합니다.</p>
          </div>
        </div>
        <div className="kanban-board">
          {kanbanColumns.map((column) => (
            <section key={column.key} className={`kanban-column ${column.key}`}>
              <div className="kanban-column-header">
                <h3>{column.title}</h3>
                <span>{column.items.length}</span>
              </div>
              <div className="kanban-card-list">
                {column.items.map((review) => (
                  <button key={review.id} className="kanban-card" onClick={() => onOpen(review)}>
                    <strong>{review.system_name}</strong>
                    <span className={`review-status-box ${review.status}`}>{STATUS_LABEL[review.status]}</span>
                    <small>{formatDate(review.updated_at)}</small>
                  </button>
                ))}
                {!column.items.length && <div className="kanban-empty">항목 없음</div>}
              </div>
            </section>
          ))}
        </div>
      </section>

      <section className="panel dashboard-panel">
        <div className="section-title compact">
          <ClipboardCheck />
          <div>
            <h2>최근 검토 내역</h2>
            <p>최근 업데이트된 검토를 바로 열 수 있습니다.</p>
          </div>
        </div>
        <div className="review-cards">
          {reviews.slice(0, 8).map((review) => (
            <button key={review.id} className="review-card" onClick={() => onOpen(review)}>
              <span className={`review-status-box ${review.status}`}>{STATUS_LABEL[review.status]}</span>
              <strong>{review.system_name}</strong>
              <small>{formatDate(review.updated_at)}</small>
            </button>
          ))}
          {!reviews.length && <div className="empty-inline">아직 검토가 없습니다.</div>}
        </div>
      </section>
    </div>
  );
}

function ReviewPicker({
  title,
  reviews,
  selectedReviewId,
  onSelect,
}: {
  title: string;
  reviews: Review[];
  selectedReviewId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <section className="panel review-picker">
      <h2>{title}</h2>
      <div className="review-picker-list">
        {reviews.map((review) => (
          <button
            key={review.id}
            className={review.id === selectedReviewId ? "review-tab active" : "review-tab"}
            onClick={() => onSelect(review.id)}
          >
            <span>{review.system_name}</span>
            <small>{STATUS_LABEL[review.status]}</small>
          </button>
        ))}
        {!reviews.length && <div className="empty-inline">항목이 없습니다.</div>}
      </div>
    </section>
  );
}

function CompletedResultList({
  title,
  mode,
  reviews,
  selectedReview,
  selectedReviewId,
  items,
  groups,
  onSelect,
}: {
  title: string;
  mode: "checklist" | "report";
  reviews: Review[];
  selectedReview: Review | null;
  selectedReviewId: string | null;
  items: ReviewItem[];
  groups: ReviewGroup[];
  onSelect: (id: string | null) => void | Promise<void>;
}) {
  return (
    <section className="panel completed-results">
      <h2>{title}</h2>
      <div className="completed-result-list">
        {reviews.map((review) => {
          const isOpen = review.id === selectedReviewId && selectedReview?.id === review.id;

          return (
            <article key={review.id} className={isOpen ? "completed-result-item open" : "completed-result-item"}>
              <button className="review-card result-toggle" type="button" onClick={() => onSelect(isOpen ? null : review.id)}>
                <span className={`review-status-box ${review.status}`}>{STATUS_LABEL[review.status]}</span>
                <strong>{review.system_name}</strong>
                <small>{formatDate(review.updated_at)}</small>
              </button>
              {isOpen && (
                <div className="completed-result-detail">
                  {mode === "report" ? (
                    <ReviewReport review={review} items={items} groups={groups} />
                  ) : (
                    <>
                      <ProjectInfoSummary review={review} />
                      <ChecklistTable items={items} groups={groups} requesterEditable={false} onChange={() => undefined} />
                    </>
                  )}
                </div>
              )}
            </article>
          );
        })}
        {!reviews.length && <div className="empty-inline">항목이 없습니다.</div>}
      </div>
    </section>
  );
}

function RequestForm({
  draft,
  existingReview,
  setDraft,
  saving,
  onSave,
  onUpdate,
}: {
  draft: DraftReview;
  existingReview: Review | null;
  setDraft: React.Dispatch<React.SetStateAction<DraftReview>>;
  saving: boolean;
  onSave: () => void;
  onUpdate: (review: Review, values: DraftReview) => void;
}) {
  const [isEditingExisting, setIsEditingExisting] = useState(false);
  const [editDraft, setEditDraft] = useState<DraftReview>(existingReview ? reviewToDraft(existingReview) : emptyDraft);
  const locked = Boolean(existingReview && !isEditingExisting);
  const formValues = existingReview ? editDraft : draft;
  const setFormValues = existingReview ? setEditDraft : setDraft;
  const canSave = !locked && isProjectInfoComplete(formValues);

  useEffect(() => {
    if (!existingReview) {
      setIsEditingExisting(false);
      return;
    }

    setEditDraft(reviewToDraft(existingReview));
    setIsEditingExisting(false);
  }, [existingReview?.id]);

  function handleProjectSave() {
    if (existingReview) {
      onUpdate(existingReview, formValues);
      setIsEditingExisting(false);
      return;
    }

    onSave();
  }

  return (
    <StepSection step={1} title="프로젝트 정보">
      <section className="request-form">
        <form onSubmit={(event) => event.preventDefault()}>
          <label>
            서비스/시스템명
            <input
              value={formValues.system_name}
              disabled={locked}
              onChange={(event) => setFormValues((current) => ({ ...current, system_name: event.target.value }))}
              placeholder="예: 관리자 포털 고도화"
            />
          </label>
          <label className="span-half">
            요청 부서
            <input
              value={formValues.requester_department}
              disabled={locked}
              onChange={(event) =>
                setFormValues((current) => ({ ...current, requester_department: event.target.value }))
              }
              placeholder="예: 플랫폼개발팀"
            />
          </label>
          <label className="span-half">
            프로젝트 담당자
            <input
              value={formValues.project_owner}
              disabled={locked}
              onChange={(event) => setFormValues((current) => ({ ...current, project_owner: event.target.value }))}
              placeholder="예: 홍길동"
            />
          </label>
          <label>
            개발 유형
            <select
              value={formValues.development_type}
              disabled={locked}
              onChange={(event) => setFormValues((current) => ({ ...current, development_type: event.target.value }))}
            >
              <option value="new">신규 개발</option>
              <option value="improvement">기능 개선</option>
              <option value="change">구성 변경</option>
              <option value="integration">외부 연동</option>
            </select>
          </label>
          <label>
            서비스 공개 범위
            <select
              value={formValues.service_scope}
              disabled={locked}
              onChange={(event) => setFormValues((current) => ({ ...current, service_scope: event.target.value }))}
            >
              <option value="internal">내부 서비스</option>
              <option value="external">외부 공개 서비스</option>
              <option value="both">내/외부 공통</option>
            </select>
          </label>
          <label className="third-row">
            오픈 예정일
            <input
              type="date"
              value={formValues.launch_date}
              disabled={locked}
              onChange={(event) => setFormValues((current) => ({ ...current, launch_date: event.target.value }))}
            />
          </label>
          <label className="third-row">
            희망 완료일
            <input
              type="date"
              value={formValues.due_date}
              disabled={locked}
              onChange={(event) => setFormValues((current) => ({ ...current, due_date: event.target.value }))}
            />
          </label>
          <label className="third-row">
            시스템 구분
            <select
              value={formValues.system_type}
              disabled={locked}
              onChange={(event) =>
                setFormValues((current) => ({ ...current, system_type: event.target.value as SystemType }))
              }
            >
              <option value="personal">개인정보 처리시스템</option>
              <option value="non_personal">비 개인정보 처리시스템</option>
            </select>
          </label>
          <label className="full-row summary-field">
            <span className="field-title-row">
              <span>프로젝트 개요</span>
            </span>
            <span className="textarea-action-wrap">
              <textarea
                value={formValues.summary}
                disabled={locked}
                onChange={(event) => setFormValues((current) => ({ ...current, summary: event.target.value }))}
                placeholder="신규 프로젝트의 목적, 주요 기능, 개발 범위를 적어주세요."
                rows={5}
              />
              {locked ? (
                <button
                  className="primary-button save-project-button"
                  type="button"
                  disabled={saving}
                  onClick={() => setIsEditingExisting(true)}
                >
                  수정
                </button>
              ) : (
                <button
                  className="primary-button save-project-button"
                  type="button"
                  disabled={!canSave || saving}
                  onClick={handleProjectSave}
                >
                  {saving ? "저장 중" : "저장"}
                </button>
              )}
            </span>
          </label>
          {!locked && saving && <div className="saving-note">프로젝트 정보를 저장하는 중입니다.</div>}
        </form>
      </section>
    </StepSection>
  );
}

function StepSection({
  step,
  title,
  locked = false,
  lockedMessage,
  children,
}: {
  step: number;
  title: string;
  locked?: boolean;
  lockedMessage?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={locked ? "step-section locked" : "step-section"}>
      <div className="step-heading">
        <span className="step-circle">{step}</span>
        <h2>{title}</h2>
      </div>
      {locked ? <div className="locked-panel">{lockedMessage}</div> : children}
    </section>
  );
}

function GroupQuestionPanel({
  groups,
  requesterEditable,
  onGroupChange,
}: {
  groups: ReviewGroup[];
  requesterEditable: boolean;
  onGroupChange: (group: ReviewGroup, patch: Partial<ReviewGroup>) => void;
}) {
  if (!groups.length) return null;

  return (
    <div className="group-question-panel">
      <div className="group-question-grid">
        {groups.map((group) => (
          <article key={group.id} className="group-question-card">
            <div>
              <strong>{group.category}</strong>
              <p>{getGroupQuestion(group.category)}</p>
              <small>{getGroupGuide(group.category)}</small>
            </div>
            <div className="choice-row">
              <label>
                <input
                  type="radio"
                  name={`group-${group.id}`}
                  checked={group.is_applicable === true}
                  disabled={!requesterEditable}
                  onChange={() => onGroupChange(group, { is_applicable: true, skip_reason: null })}
                />
                해당
              </label>
              <label>
                <input
                  type="radio"
                  name={`group-${group.id}`}
                  checked={group.is_applicable === false}
                  disabled={!requesterEditable}
                  onChange={() => onGroupChange(group, { is_applicable: false })}
                />
                미해당
              </label>
            </div>
            {group.is_applicable === false && (
              <textarea
                className="skip-reason-input"
                disabled={!requesterEditable}
                value={group.skip_reason ?? ""}
                onChange={(event) => onGroupChange(group, { skip_reason: event.target.value })}
                placeholder="미해당 사유"
                rows={2}
              />
            )}
          </article>
        ))}
      </div>
    </div>
  );
}

function ProjectInfoSummary({ review }: { review: Review }) {
  const values = reviewToDraft(review);

  return (
    <StepSection step={1} title="프로젝트 정보">
      <section className="request-form readonly">
        <form onSubmit={(event) => event.preventDefault()}>
          <label>
            서비스/시스템명
            <input value={values.system_name} disabled />
          </label>
          <label className="span-half">
            요청 부서
            <input value={values.requester_department} disabled />
          </label>
          <label className="span-half">
            프로젝트 담당자
            <input value={values.project_owner} disabled />
          </label>
          <label>
            개발 유형
            <select value={values.development_type} disabled>
              <option value="new">신규 개발</option>
              <option value="improvement">기능 개선</option>
              <option value="change">구성 변경</option>
              <option value="integration">외부 연동</option>
            </select>
          </label>
          <label>
            서비스 공개 범위
            <select value={values.service_scope} disabled>
              <option value="internal">내부 서비스</option>
              <option value="external">외부 공개 서비스</option>
              <option value="both">내/외부 공통</option>
            </select>
          </label>
          <label className="third-row">
            오픈 예정일
            <input type="date" value={values.launch_date} disabled />
          </label>
          <label className="third-row">
            희망 완료일
            <input type="date" value={values.due_date} disabled />
          </label>
          <label className="third-row">
            시스템 구분
            <select value={values.system_type} disabled>
              <option value="personal">개인정보 처리시스템</option>
              <option value="non_personal">비 개인정보 처리시스템</option>
            </select>
          </label>
          <label className="full-row summary-field">
            프로젝트 개요
            <textarea value={values.summary} disabled rows={4} />
          </label>
        </form>
      </section>
    </StepSection>
  );
}

function ReviewReport({ review, items, groups }: { review: Review; items: ReviewItem[]; groups: ReviewGroup[] }) {
  const groupMap = useMemo(() => new Map(groups.map((group) => [group.category, group])), [groups]);
  const applicableItems = items.filter(
    (item) => groupMap.get(item.security_requirements.category)?.is_applicable === true,
  );
  const passedItems = applicableItems.filter((item) => item.result === "pass");
  const failedItems = applicableItems.filter((item) => item.result === "fail");
  const notApplicableItems = applicableItems.filter((item) => item.result === "na");
  const unresolvedItems = applicableItems.filter((item) => !item.result);
  const applicableGroups = groups.filter((group) => group.is_applicable === true);
  const skippedGroups = groups.filter((group) => group.is_applicable === false);

  return (
    <div className="report-view">
      <div className="detail-header report-header">
        <div>
          <h2>{review.system_name} 증적 리포트</h2>
          <p>검토 완료 후 출력·보관하는 증적용 결과 리포트입니다.</p>
        </div>
        <div className="report-actions">
          <StatusPill status={review.status} />
          <button className="secondary-button" type="button" onClick={() => window.print()}>
            증적 출력
          </button>
        </div>
      </div>

      <div className="report-summary-grid">
        <Metric label="대상 항목" value={applicableItems.length} />
        <Metric label="양호" value={passedItems.length} />
        <Metric label="미흡" value={failedItems.length} tone={failedItems.length ? "danger" : "default"} />
        <Metric label="해당없음" value={notApplicableItems.length} />
        <Metric label="미검토" value={unresolvedItems.length} tone={unresolvedItems.length ? "danger" : "default"} />
      </div>

      <section className="report-section">
        <h3>프로젝트 정보</h3>
        <div className="meta-grid">
          <Meta label="시스템 구분" value={systemTypeLabel(review.system_type)} />
          <Meta label="요청 부서" value={review.requester_department || "-"} />
          <Meta label="프로젝트 담당자" value={review.project_owner || "-"} />
          <Meta label="오픈 예정일" value={formatDate(review.launch_date)} />
          <Meta label="희망 완료일" value={formatDate(review.due_date)} />
          <Meta label="최종 업데이트" value={formatDate(review.updated_at)} />
        </div>
        <div className="report-note">{review.summary}</div>
      </section>

      <section className="report-section">
        <h3>사전 질의 결과</h3>
        <div className="report-chip-list">
          {applicableGroups.map((group) => (
            <span key={group.id} className="report-chip applied">
              {group.category}
            </span>
          ))}
          {skippedGroups.map((group) => (
            <span key={group.id} className="report-chip skipped">
              {group.category}: {group.skip_reason || "미해당"}
            </span>
          ))}
        </div>
      </section>

      <section className="report-section">
        <h3>미흡 및 조치 필요 항목</h3>
        {failedItems.length ? (
          <div className="report-finding-list">
            {failedItems.map((item) => (
              <article key={item.id} className="report-finding">
                <span className="code">{item.security_requirements.code}</span>
                <div>
                  <strong>{item.security_requirements.title}</strong>
                  <p>{item.non_compliance_reason || "미흡 사유가 작성되지 않았습니다."}</p>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-inline">미흡 항목이 없습니다.</div>
        )}
      </section>
    </div>
  );
}

function ChecklistTable({
  items,
  groups,
  requesterEditable,
  reviewerEditable = false,
  onChange,
}: {
  items: ReviewItem[];
  groups: ReviewGroup[];
  requesterEditable: boolean;
  reviewerEditable?: boolean;
  onChange: (item: ReviewItem, patch: Partial<ReviewItem>) => void;
}) {
  const grouped = useMemo(() => {
    return items.reduce<Record<string, ReviewItem[]>>((acc, item) => {
      const category = item.security_requirements.category;
      acc[category] = acc[category] ?? [];
      acc[category].push(item);
      return acc;
    }, {});
  }, [items]);
  const groupMap = useMemo(() => new Map(groups.map((group) => [group.category, group])), [groups]);
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(() => new Set());

  function toggleCategory(category: string) {
    setCollapsedCategories((current) => {
      const next = new Set(current);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  }

  return (
    <div className="checklist">
      {Object.entries(grouped).map(([category, categoryItems]) => {
        const group = groupMap.get(category);
        const isApplicable = group?.is_applicable === true;

        if (!isApplicable) return null;
        const isCollapsed = collapsedCategories.has(category);

        return (
          <section key={category} className="category-block">
            <button
              className={isCollapsed ? "category-header collapsed" : "category-header"}
              type="button"
              onClick={() => toggleCategory(category)}
              aria-expanded={!isCollapsed}
            >
              <h3>{category}</h3>
              <span className="category-header-meta">
                {group && <span className="group-badge">해당 그룹</span>}
                <ChevronDown size={18} />
              </span>
            </button>
            {!isCollapsed && categoryItems.map((item) => (
            <article key={item.id} className={item.result === "fail" ? "requirement-row result-fail" : "requirement-row"}>
              <div className="requirement-main">
                <span className="code">{item.security_requirements.code}</span>
                <div>
                  <strong>{item.security_requirements.title}</strong>
                  <p>{item.security_requirements.requirement}</p>
                  <details>
                    <summary>상세 요건</summary>
                    <pre>{item.security_requirements.description}</pre>
                  </details>
                </div>
              </div>
              <div className="review-controls">
                <div className="control-group requester-entry">
                  <span className="control-title">요청자 작성</span>
                <select
                  value={item.result ?? ""}
                    disabled={!requesterEditable}
                  onChange={(event) =>
                    onChange(item, { result: (event.target.value || null) as ReviewResult })
                  }
                >
                  <option value="">미검토</option>
                  <option value="pass">{RESULT_LABEL.pass}</option>
                  <option value="fail">{RESULT_LABEL.fail}</option>
                  <option value="na">{RESULT_LABEL.na}</option>
                </select>
                <textarea
                    disabled={!requesterEditable}
                  value={item.non_compliance_reason ?? ""}
                  onChange={(event) => onChange(item, { non_compliance_reason: event.target.value })}
                  placeholder="예: 해당 항목의 베스트 프랙티스와 프로젝트 적용 방안을 작성"
                  rows={2}
                />
                </div>
                <div className="control-group reviewer-entry">
                  <span className="control-title">검토자 의견</span>
                  <select
                    value={item.reviewer_result ?? ""}
                    disabled={!reviewerEditable}
                    onChange={(event) =>
                      onChange(item, { reviewer_result: (event.target.value || null) as ReviewResult })
                    }
                  >
                    <option value="">미검토</option>
                    <option value="pass">{RESULT_LABEL.pass}</option>
                    <option value="fail">{RESULT_LABEL.fail}</option>
                    <option value="na">{RESULT_LABEL.na}</option>
                  </select>
                  <textarea
                    disabled={!reviewerEditable}
                    value={item.reviewer_comment ?? ""}
                    onChange={(event) => onChange(item, { reviewer_comment: event.target.value })}
                    placeholder="검토 의견 또는 보완 요청 사항을 작성"
                    rows={2}
                  />
                </div>
              </div>
            </article>
            ))}
          </section>
        );
      })}
    </div>
  );
}

function Metric({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string | number;
  tone?: "default" | "danger";
}) {
  return (
    <div className={`metric ${tone}`}>
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="meta-item">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function StatusPill({ status }: { status: ReviewStatus }) {
  return (
    <span className={`status-pill ${status}`}>
      <CheckCircle2 size={16} />
      {STATUS_LABEL[status]}
    </span>
  );
}

function systemTypeLabel(systemType: SystemType) {
  if (systemType === "personal") return "개인정보 처리시스템";
  if (systemType === "non_personal") return "비 개인정보 처리시스템";
  return "공통";
}

function toFriendlyError(err: unknown, fallback: string) {
  if (!(err instanceof Error)) return fallback;
  if (err.message.includes("relation") && err.message.includes("does not exist")) {
    return "Supabase 테이블이 아직 없습니다. supabase/schema.sql을 먼저 실행해 주세요.";
  }
  if (err.message.includes("permission denied") || err.message.includes("row-level security")) {
    return "Supabase RLS 정책에서 요청이 차단되었습니다. supabase/schema.sql을 다시 실행해 정책을 갱신해 주세요.";
  }
  return err.message || fallback;
}
