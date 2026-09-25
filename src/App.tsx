import { useEffect, useState, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  Alert,
  Avatar,
  Button,
  Card,
  Col,
  DatePicker,
  Drawer,
  Dropdown,
  Form,
  Input,
  Layout,
  Menu,
  Modal,
  Row,
  Select,
  Space,
  Spin,
  Statistic,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import {
  BarChartOutlined,
  CheckCircleOutlined,
  CreditCardOutlined,
  DeleteOutlined,
  FilterOutlined,
  EditOutlined,
  LockOutlined,
  LogoutOutlined,
  MailOutlined,
  MenuOutlined,
  PlusOutlined,
  SearchOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { api, errorText } from "./api";
import { useAuth } from "./auth";
import { PrivateComponent, PrivateRoutes } from "./components/Access";
import type {
  ApiResponse,
  Report,
  Role,
  Transaction,
  TransactionStatus,
  User,
} from "./types";

const { Header, Sider, Content } = Layout;
const { RangePicker } = DatePicker;
const money = (value: number) =>
  `${new Intl.NumberFormat("uz-UZ", { maximumFractionDigits: 0 }).format(value)} so‘m`;
const statusColor: Record<TransactionStatus, string> = {
  SUCCESS: "green",
  PENDING: "gold",
  FAILED: "red",
  REFUNDED: "blue",
};
const getRole = (role: User["roles"][number]) =>
  typeof role === "string" ? role : "role" in role ? role.role.key : role.key;
const isAdminUser = (user: User) =>
  user.roles.some((role) => getRole(role) === "ADMIN");
const roleTitle = (role: any) =>
  typeof role === "string"
    ? role
    : role.role?.title?.uz || role.title?.uz || role.role?.key || role.key;

function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const setUser = useAuth((state) => state.setUser);
  const clear = useAuth((state) => state.clear);
  useEffect(() => {
    let active = true;
    const refreshProfile = async () => {
      try {
        const response = await api.get<ApiResponse<User>>("/auth/me");
        if (active) setUser(response.data.data);
      } catch (error: any) {
        if (active && error?.response?.status === 401) {
          clear();
          navigate("/login");
        }
      }
    };
    void refreshProfile();
    return () => {
      active = false;
    };
  }, [setUser, clear, navigate]);
  const user = useAuth((state) => state.user);
  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      clear();
      navigate("/login");
    }
  };
  const menu = [
    {
      key: "/users",
      label: "Foydalanuvchilar",
      icon: <TeamOutlined />,
    },
    {
      key: "/payments",
      label: "To‘lovlar",
      icon: <CreditCardOutlined />,
    },
    {
      key: "/reports",
      label: "Hisobotlar",
      icon: <BarChartOutlined />,
    },
  ];
  const goTo = (key: string) => {
    setMobileMenuOpen(false);
    navigate(key);
  };
  return (
    <Layout className="shell">
      <Sider className="desktop-sider" width={220}>
        <div className="brand">
          <b>RB</b>
          <span>
            <strong>RoleBase</strong>
            <small>Boshqaruv markazi</small>
          </span>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menu}
          onClick={({ key }) => goTo(key)}
        />
      </Sider>
      <Layout>
        <Header className="app-header">
          <Button
            className="mobile-menu-trigger"
            type="text"
            aria-label="Menyuni ochish"
            icon={<MenuOutlined />}
            onClick={() => setMobileMenuOpen(true)}
          />
          <span className="welcome-text">
            Xush kelibsiz, {user?.first_name || user?.firstName || "..."}
          </span>
          <Dropdown
            menu={{
              items: [
                {
                  key: "logout",
                  label: "Chiqish",
                  icon: <LogoutOutlined />,
                  onClick: logout,
                },
              ],
            }}
          >
            <Button className="profile-button" type="text">
              <Avatar icon={<UserOutlined />} />
              <span className="profile-email">{user?.email}</span>
            </Button>
          </Dropdown>
        </Header>
        <Content>
          <Outlet />
        </Content>
      </Layout>
      <Drawer
        className="mobile-navigation"
        title={
          <div className="brand mobile-brand">
            <b>RB</b>
            <span>
              <strong>RoleBase</strong>
              <small>Boshqaruv markazi</small>
            </span>
          </div>
        }
        placement="left"
        width={280}
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      >
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menu}
          onClick={({ key }) => goTo(key)}
        />
      </Drawer>
    </Layout>
  );
}

function defaultRoute(user: User) {
  const roles = user.roles.map(getRole);
  return roles.includes("ADMIN")
    ? "/users"
    : roles.includes("PAYMENT")
      ? "/payments"
      : roles.includes("REPORTS")
        ? "/reports"
        : "/403";
}

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const tokens = useAuth((s) => s.tokens);
  const setUser = useAuth((s) => s.setUser);
  const login = useMutation({
    mutationFn: (body: { login: string; password: string }) =>
      api.post<ApiResponse<{ access_token: string; refresh_token: string }>>(
        "/auth/login",
        body,
      ),
    onSuccess: async (response) => {
      tokens(response.data.data);
      const user = (await api.get<ApiResponse<User>>("/auth/me")).data.data;
      setUser(user);
      navigate((location.state as any)?.from?.pathname || defaultRoute(user), {
        replace: true,
      });
    },
  });
  return (
    <main className="login">
      <section>
        <b>RB</b>
        <h1>Rollar bilan ishlash — sodda va xavfsiz.</h1>
        <p>Foydalanuvchilar va ruxsatlarni bitta qulay markazdan boshqaring.</p>
      </section>
      <Card className="login-card" variant="borderless">
        <label>TIZIMGA KIRISH</label>
        <h2>Xush kelibsiz</h2>
        <p>Davom etish uchun hisobingizga kiring.</p>
        {login.isError && (
          <Alert type="error" message={errorText(login.error)} showIcon />
        )}
        <Form layout="vertical" onFinish={login.mutate} autoComplete="off">
          <Form.Item
            name="login"
            label="Email"
            rules={[{ required: true, message: "Emailni kiriting." }]}
          >
            <Input
              prefix={<MailOutlined />}
              size="large"
              autoComplete="username"
              placeholder="example@gmail.com"
            />
          </Form.Item>
          <Form.Item
            name="password"
            label="Parol"
            rules={[{ required: true, message: "Parolni kiriting." }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              size="large"
              autoComplete="current-password"
              placeholder="Parolni kiriting"
            />
          </Form.Item>
          <Button
            htmlType="submit"
            type="primary"
            size="large"
            block
            loading={login.isPending}
          >
            Kirish
          </Button>
        </Form>
      </Card>
    </main>
  );
}

function Payments() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<TransactionStatus>();
  const [period, setPeriod] = useState<
    [dayjs.Dayjs | null, dayjs.Dayjs | null] | null
  >(null);
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const payments = useQuery({
    queryKey: ["payments", page, search, status, period, minAmount, maxAmount],
    queryFn: () =>
      api
        .get<ApiResponse<Transaction[]>>("/payments", {
          params: {
            page,
            perPage: 10,
            search: search.trim() || undefined,
            status,
            from: period?.[0]?.startOf("day").toISOString(),
            to: period?.[1]?.endOf("day").toISOString(),
            minAmount: minAmount || undefined,
            maxAmount: maxAmount || undefined,
          },
        })
        .then((r) => r.data),
  });
  const resetFilters = () => {
    setSearch("");
    setStatus(undefined);
    setPeriod(null);
    setMinAmount("");
    setMaxAmount("");
    setPage(1);
  };
  return (
    <>
      <PageHeading
        title="To‘lovlar"
        subtitle="Tranzaksiyalarni qidiring va holatiga ko‘ra kuzating."
      />
      {payments.isError ? (
        <Alert
          type="error"
          message={errorText(payments.error)}
          showIcon
          action={
            <Button onClick={() => payments.refetch()}>Qayta urinish</Button>
          }
        />
      ) : (
        <div className="panel">
          <div className="tools">
            <Input
              prefix={<SearchOutlined />}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Kod, email yoki provayder"
              allowClear
            />
            <Select
              allowClear
              value={status}
              onChange={(value) => {
                setStatus(value);
                setPage(1);
              }}
              placeholder="Barcha holatlar"
              options={[
                { value: "SUCCESS", label: "Muvaffaqiyatli" },
                { value: "PENDING", label: "Kutilmoqda" },
                { value: "FAILED", label: "Muvaffaqiyatsiz" },
                { value: "REFUNDED", label: "Qaytarilgan" },
              ]}
            />
            <RangePicker
              value={period}
              onChange={(value) => {
                setPeriod(value);
                setPage(1);
              }}
              format="DD.MM.YYYY"
              placeholder={["Boshlanish sana", "Tugash sana"]}
            />
            <Input
              inputMode="numeric"
              value={minAmount}
              onChange={(event) => {
                setMinAmount(event.target.value.replace(/[^0-9]/g, ""));
                setPage(1);
              }}
              placeholder="Min. summa"
            />
            <Input
              inputMode="numeric"
              value={maxAmount}
              onChange={(event) => {
                setMaxAmount(event.target.value.replace(/[^0-9]/g, ""));
                setPage(1);
              }}
              placeholder="Maks. summa"
            />
            <Button icon={<FilterOutlined />} onClick={resetFilters}>
              Filtrni tozalash
            </Button>
          </div>
          <Table
            scroll={{ x: 800 }}
            loading={payments.isLoading}
            rowKey="id"
            dataSource={payments.data?.data || []}
            columns={[
              { title: "Kod", dataIndex: "reference" },
              { title: "To‘lovchi", dataIndex: "payerEmail" },
              { title: "Summa", dataIndex: "amount", render: money },
              { title: "Provayder", dataIndex: "provider" },
              {
                title: "Holat",
                render: (_, row: Transaction) => (
                  <Tag color={statusColor[row.status]}>{row.statusLabel}</Tag>
                ),
              },
              {
                title: "Sana",
                dataIndex: "createdAt",
                render: (value) => dayjs(value).format("DD.MM.YYYY HH:mm"),
              },
            ]}
            pagination={{
              current: page,
              total: payments.data?.meta?.totalItems,
              pageSize: 10,
              onChange: setPage,
              showSizeChanger: false,
            }}
          />
        </div>
      )}
    </>
  );
}

function Reports() {
  const report = useQuery({
    queryKey: ["reports"],
    queryFn: () =>
      api
        .get<ApiResponse<Report>>("/payments/reports")
        .then((r) => r.data.data),
  });
  const summary = report.data?.summary;
  return (
    <>
      <PageHeading
        title="Hisobotlar"
        subtitle="Backenddagi tranzaksiyalar yakuni."
      />
      {report.isError ? (
        <Alert type="error" message={errorText(report.error)} showIcon />
      ) : (
        <>
          <Row gutter={[20, 20]}>
            <Col xs={24} sm={12} xl={8}>
              <Card loading={report.isLoading}>
                <Statistic
                  title="Jami tranzaksiyalar"
                  value={summary?.totalTransactions || 0}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} xl={8}>
              <Card loading={report.isLoading}>
                <Statistic
                  title="Muvaffaqiyatli summa"
                  value={summary?.successfulAmount || 0}
                  formatter={(value) => money(Number(value))}
                  prefix={<CheckCircleOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} xl={8}>
              <Card loading={report.isLoading}>
                <Statistic
                  title="Jami summa"
                  value={summary?.totalAmount || 0}
                  formatter={(value) => money(Number(value))}
                />
              </Card>
            </Col>
          </Row>
          <Row className="report-row" gutter={[20, 20]}>
            <Col xs={12} sm={6}>
              <Card size="small" loading={report.isLoading}>
                <Statistic
                  title="Muvaffaqiyatli"
                  value={summary?.successCount || 0}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card size="small" loading={report.isLoading}>
                <Statistic
                  title="Kutilmoqda"
                  value={summary?.pendingCount || 0}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card size="small" loading={report.isLoading}>
                <Statistic
                  title="Muvaffaqiyatsiz"
                  value={summary?.failedCount || 0}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card size="small" loading={report.isLoading}>
                <Statistic
                  title="Qaytarilgan"
                  value={summary?.refundedCount || 0}
                />
              </Card>
            </Col>
          </Row>
          <Card className="data-card" title="Kunlik tranzaksiyalar">
            <Table
              loading={report.isLoading}
              rowKey="date"
              dataSource={report.data?.daily || []}
              columns={[
                {
                  title: "Sana",
                  dataIndex: "date",
                  render: (value) => dayjs(value).format("DD.MM.YYYY"),
                },
                { title: "Tranzaksiyalar", dataIndex: "count" },
                { title: "Jami summa", dataIndex: "amount", render: money },
              ]}
              scroll={{ x: 650 }}
              pagination={false}
            />
          </Card>
        </>
      )}
    </>
  );
}

function PageHeading({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children?: ReactNode;
}) {
  return (
    <div className="heading">
      <div>
        <span className="eyebrow">BOSHQARUV MARKAZI</span>
        <Typography.Title level={2}>{title}</Typography.Title>
        <p>{subtitle}</p>
      </div>
      {children}
    </div>
  );
}

type StaffForm = {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  roleIds: number[];
};
function Users() {
  const client = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [opened, setOpened] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [lockedRoleIds, setLockedRoleIds] = useState<number[]>([]);
  const [form] = Form.useForm<StaffForm>();
  const users = useQuery({
    queryKey: ["users", page, search],
    queryFn: () =>
      api
        .get<
          ApiResponse<User[]>
        >("/staff", { params: { page, perPage: 10, search: search || undefined } })
        .then((r) => r.data),
  });
  const roles = useQuery({
    queryKey: ["roles"],
    queryFn: () =>
      api
        .get<
          ApiResponse<Role[]>
        >("/role", { params: { page: 1, perPage: 100 } })
        .then((r) => r.data.data),
  });
  const save = useMutation({
    mutationFn: (values: StaffForm) => {
      const data = {
        ...values,
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        email: values.email.trim().toLowerCase(),
        roleIds: Array.from(
          new Set([...lockedRoleIds, ...values.roleIds.map(Number)]),
        ),
      };
      if (editing && !data.password) {
        const { password: _password, ...updateData } = data;
        return api.patch(`/staff/${editing.id}`, updateData);
      }
      return editing
        ? api.patch(`/staff/${editing.id}`, data)
        : api.post("/staff", data);
    },
    onSuccess: () => {
      message.success(
        editing ? "Foydalanuvchi yangilandi." : "Foydalanuvchi yaratildi.",
      );
      client.invalidateQueries({ queryKey: ["users"] });
      setOpened(false);
    },
    onError: (error) => message.error(errorText(error)),
  });
  const remove = useMutation({
    mutationFn: (id: number) => api.delete(`/staff/${id}`),
    onSuccess: () => {
      message.success("Foydalanuvchi o‘chirildi.");
      client.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error) => message.error(errorText(error)),
  });
  const open = async (user?: User) => {
    form.resetFields();
    setEditing(user || null);
    setLockedRoleIds([]);
    if (user) {
      try {
        const data = (await api.get<ApiResponse<any>>(`/staff/${user.id}`)).data
          .data;
        const assignedRoles = data.roles.map((role: any) => role.role || role);
        setLockedRoleIds(
          assignedRoles
            .filter((role: any) => role.key === "ADMIN")
            .map((role: any) => role.id),
        );
        form.setFieldsValue({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          roleIds: assignedRoles.map((role: any) => role.id),
        });
      } catch (error) {
        message.error(errorText(error));
        return;
      }
    }
    setOpened(true);
  };
  return (
    <>
      <PageHeading
        title="Foydalanuvchilar"
        subtitle="Hisoblar, rollar va ruxsatlarni boshqaring."
      >
        <PrivateComponent roles={["ADMIN"]}>
          <Button
            type="primary"
            size="large"
            icon={<PlusOutlined />}
            onClick={() => open()}
          >
            Foydalanuvchi qo‘shish
          </Button>
        </PrivateComponent>
      </PageHeading>
      {users.isError ? (
        <Alert type="error" message={errorText(users.error)} showIcon />
      ) : (
        <div className="panel">
          <div className="tools">
            <Input
              prefix={<SearchOutlined />}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Ism yoki familiya orqali qidiring"
              allowClear
            />
          </div>
          <Table
            loading={users.isLoading}
            rowKey="id"
            dataSource={users.data?.data || []}
            scroll={{ x: 760 }}
            columns={[
              {
                title: "Foydalanuvchi",
                render: (_, user: User) => (
                  <div className="person">
                    <Avatar>{(user.firstName || "?")[0]}</Avatar>
                    <span>
                      <b>
                        {user.firstName} {user.lastName}
                      </b>
                      <small>#{user.id}</small>
                    </span>
                  </div>
                ),
              },
              { title: "Email", dataIndex: "email" },
              {
                title: "Rollar",
                render: (_, user: User) => (
                  <Space wrap>
                    {user.roles.map((role, index) => (
                      <Tag
                        color={
                          getRole(role) === "ADMIN"
                            ? "purple"
                            : getRole(role) === "PAYMENT"
                              ? "cyan"
                              : "gold"
                        }
                        key={`${getRole(role)}-${index}`}
                      >
                        {roleTitle(role)}
                      </Tag>
                    ))}
                  </Space>
                ),
              },
              {
                title: "Amallar",
                width: 116,
                render: (_, user: User) => (
                  <PrivateComponent roles={["ADMIN"]}>
                    <Space>
                      <Button
                        aria-label="Tahrirlash"
                        icon={<EditOutlined />}
                        onClick={() => open(user)}
                      />
                      {!isAdminUser(user) && (
                        <Button
                          aria-label="O‘chirish"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() =>
                            Modal.confirm({
                              title: "Foydalanuvchini o‘chirasizmi?",
                              content: `${user.firstName} ${user.lastName} hisobini o‘chirishni tasdiqlang.`,
                              okText: "O‘chirish",
                              cancelText: "Bekor qilish",
                              okButtonProps: { danger: true },
                              onOk: () => remove.mutateAsync(user.id),
                            })
                          }
                        />
                      )}
                    </Space>
                  </PrivateComponent>
                ),
              },
            ]}
            pagination={{
              current: page,
              pageSize: 10,
              total: users.data?.meta?.totalItems,
              onChange: setPage,
              showSizeChanger: false,
            }}
          />
        </div>
      )}
      <Drawer
        title={editing ? "Foydalanuvchini tahrirlash" : "Yangi foydalanuvchi"}
        open={opened}
        onClose={() => setOpened(false)}
        width="min(480px, 100vw)"
        destroyOnHidden
      >
        <p className="drawer-note">
          {editing && lockedRoleIds.length > 0
            ? "ADMIN roli himoyalangan: uni olib tashlab bo‘lmaydi."
            : "ADMIN roli yangi foydalanuvchiga biriktirilmaydi."}
        </p>
        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
          onFinish={save.mutate}
          onFinishFailed={() =>
            message.error("Belgilangan maydonlarni to‘g‘ri to‘ldiring.")
          }
          autoComplete="off"
        >
          <Row gutter={12}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="firstName"
                label="Ismi"
                rules={[
                  { required: true, message: "Ismni kiriting." },
                  { min: 2, max: 50, message: "2–50 belgidan foydalaning." },
                  {
                    pattern: /^[A-Za-zÀ-ÖØ-öø-ÿʻ’'-]+$/,
                    message: "Ism faqat harflardan iborat bo‘lishi kerak.",
                  },
                ]}
              >
                <Input size="large" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="lastName"
                label="Familiyasi"
                rules={[
                  { required: true, message: "Familiyani kiriting." },
                  { min: 2, max: 50, message: "2–50 belgidan foydalaning." },
                  {
                    pattern: /^[A-Za-zÀ-ÖØ-öø-ÿʻ’'-]+$/,
                    message: "Familiya faqat harflardan iborat bo‘lishi kerak.",
                  },
                ]}
              >
                <Input size="large" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Emailni kiriting." },
              { type: "email", message: "Email formatini tekshiring." },
            ]}
          >
            <Input
              size="large"
              autoComplete="off"
              placeholder="example@gmail.com"
            />
          </Form.Item>
          <Form.Item
            name="password"
            label={editing ? "Yangi parol (ixtiyoriy)" : "Parol"}
            rules={
              editing
                ? [
                    {
                      pattern:
                        /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,30}$/,
                      message:
                        "Parol 8–30 belgi, katta harf va maxsus belgi bilan bo‘lishi kerak.",
                    },
                  ]
                : [
                    { required: true, message: "Parolni kiriting." },
                    {
                      pattern:
                        /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,30}$/,
                      message:
                        "Parol 8–30 belgi, katta harf va maxsus belgi bilan bo‘lishi kerak.",
                    },
                  ]
            }
            extra="Masalan: Password!1"
          >
            <Input.Password
              size="large"
              autoComplete="new-password"
              placeholder="Masalan: Password!1"
            />
          </Form.Item>
          <Form.Item
            name="roleIds"
            label="Rollar"
            rules={[{ required: true, message: "Kamida bitta rol tanlang." }]}
          >
            <Select
              mode="multiple"
              size="large"
              placeholder="Rollarni tanlang"
              loading={roles.isLoading}
              options={(roles.data || [])
                .filter(
                  (role) =>
                    role.key !== "ADMIN" || lockedRoleIds.includes(role.id),
                )
                .map((role) => ({
                  value: role.id,
                  label:
                    role.key === "ADMIN"
                      ? `${role.title?.uz || role.key} (himoyalangan)`
                      : role.title?.uz || role.key,
                  disabled: role.key === "ADMIN",
                }))}
            />
          </Form.Item>
          <Button
            type="primary"
            size="large"
            htmlType="submit"
            block
            loading={save.isPending}
          >
            {editing ? "O‘zgarishlarni saqlash" : "Foydalanuvchi yaratish"}
          </Button>
        </Form>
      </Drawer>
    </>
  );
}

function Forbidden() {
  return (
    <main className="center">
      <Alert
        type="error"
        showIcon
        message="Kirish taqiqlangan"
        description="Bu sahifa uchun ruxsatingiz yo‘q."
      />
    </main>
  );
}

function HomeRedirect() {
  const access = useAuth((state) => state.access);
  const user = useAuth((state) => state.user);
  if (!access) return <Navigate to="/login" replace />;
  if (!user) {
    return (
      <main className="center" aria-label="Yuklanmoqda">
        <Spin size="large" />
      </main>
    );
  }
  return <Navigate to={defaultRoute(user)} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<PrivateRoutes />}>
        <Route element={<AppLayout />}>
          <Route index element={<HomeRedirect />} />
          <Route element={<PrivateRoutes roles={["ADMIN"]} />}>
            <Route path="/users" element={<Users />} />
          </Route>
          <Route element={<PrivateRoutes roles={["ADMIN", "PAYMENT"]} />}>
            <Route path="/payments" element={<Payments />} />
          </Route>
          <Route element={<PrivateRoutes roles={["ADMIN", "REPORTS"]} />}>
            <Route path="/reports" element={<Reports />} />
          </Route>
          <Route path="/403" element={<Forbidden />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
