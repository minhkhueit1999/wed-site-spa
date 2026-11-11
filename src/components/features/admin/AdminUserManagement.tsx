'use client';

import * as React from 'react';
import { Card, CardTitle, Button, Input, Badge } from '@/components/ui';
import {
  getAllUsersAction,
  createUserAccountAction,
  updateUserAccountAction,
  deleteUserAccountAction,
  resetStaffPasswordAction,
  type UserAccountItem,
} from '@/application/admin/actions';

export function AdminUserManagement() {
  const [users, setUsers] = React.useState<UserAccountItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [roleFilter, setRoleFilter] = React.useState<'ALL' | 'CUSTOMER' | 'THERAPIST' | 'ADMIN'>(
    'ALL',
  );

  const [feedback, setFeedback] = React.useState<{ type: 'success' | 'error'; msg: string } | null>(
    null,
  );

  // Modal Thêm Tài Khoản
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [createName, setCreateName] = React.useState('');
  const [createEmail, setCreateEmail] = React.useState('');
  const [createPhone, setCreatePhone] = React.useState('');
  const [createPassword, setCreatePassword] = React.useState('SpaDemo2026!');
  const [createRole, setCreateRole] = React.useState<'CUSTOMER' | 'THERAPIST' | 'ADMIN'>(
    'CUSTOMER',
  );
  const [isSubmittingCreate, setIsSubmittingCreate] = React.useState(false);

  // Modal Sửa Tài Khoản
  const [editingUser, setEditingUser] = React.useState<UserAccountItem | null>(null);
  const [editName, setEditName] = React.useState('');
  const [editEmail, setEditEmail] = React.useState('');
  const [editPhone, setEditPhone] = React.useState('');
  const [editPassword, setEditPassword] = React.useState('');
  const [editRole, setEditRole] = React.useState<'CUSTOMER' | 'THERAPIST' | 'ADMIN'>('CUSTOMER');
  const [isSubmittingEdit, setIsSubmittingEdit] = React.useState(false);

  // Modal Reset Password
  const [resetModalData, setResetModalData] = React.useState<{
    name: string;
    tempPass: string;
  } | null>(null);

  // Modal Xác nhận xóa
  const [deletingUser, setDeletingUser] = React.useState<UserAccountItem | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const loadUsers = React.useCallback(async () => {
    setIsLoading(true);
    const res = await getAllUsersAction();
    if (res.ok) {
      setUsers(res.value);
    } else {
      setFeedback({ type: 'error', msg: res.error });
    }
    setIsLoading(false);
  }, []);

  React.useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Handler Tạo tài khoản
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingCreate(true);
    setFeedback(null);

    const res = await createUserAccountAction({
      name: createName.trim(),
      email: createEmail.trim(),
      phone: createPhone.trim() || undefined,
      password: createPassword.trim() || undefined,
      role: createRole,
    });

    setIsSubmittingCreate(false);
    if (res.ok) {
      setFeedback({
        type: 'success',
        msg: `✅ Đã tạo tài khoản "${res.value.name}" (${createRole}) thành công!`,
      });
      setIsCreateOpen(false);
      setCreateName('');
      setCreateEmail('');
      setCreatePhone('');
      setCreatePassword('SpaDemo2026!');
      await loadUsers();
    } else {
      setFeedback({ type: 'error', msg: res.error });
    }
  };

  // Mở modal sửa
  const openEditModal = (user: UserAccountItem) => {
    setEditingUser(user);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditPhone(user.phone || '');
    setEditPassword('');
    setEditRole(user.role);
  };

  // Handler Sửa tài khoản
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setIsSubmittingEdit(true);
    setFeedback(null);

    const res = await updateUserAccountAction({
      id: editingUser.id,
      name: editName.trim(),
      email: editEmail.trim(),
      phone: editPhone.trim() || undefined,
      password: editPassword.trim() || undefined,
      role: editRole,
    });

    setIsSubmittingEdit(false);
    if (res.ok) {
      setFeedback({
        type: 'success',
        msg: `✅ Đã cập nhật tài khoản "${res.value.name}" thành công!`,
      });
      setEditingUser(null);
      await loadUsers();
    } else {
      setFeedback({ type: 'error', msg: res.error });
    }
  };

  // Handler Xóa tài khoản
  const handleDeleteConfirm = async () => {
    if (!deletingUser) return;
    setIsDeleting(true);
    setFeedback(null);

    const res = await deleteUserAccountAction(deletingUser.id);
    setIsDeleting(false);

    if (res.ok) {
      setFeedback({ type: 'success', msg: `🗑️ ${res.value.message}` });
      setDeletingUser(null);
      await loadUsers();
    } else {
      setFeedback({ type: 'error', msg: res.error });
    }
  };

  // Handler Reset Mật Khẩu
  const handleResetPassword = async (user: UserAccountItem) => {
    const res = await resetStaffPasswordAction(user.id);
    if (res.ok) {
      setResetModalData({
        name: res.value.staffName,
        tempPass: res.value.tempPassword,
      });
    } else {
      setFeedback({ type: 'error', msg: res.error });
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.phone && u.phone.includes(searchTerm));
    return matchRole && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header & Thống kê nhanh */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-serif text-2xl font-bold text-[#2B2622]">
            Quản Lý Toàn Bộ Tài Khoản Hệ Thống
          </h2>
          <p className="text-xs text-[#635B54]">
            Thêm mới, chỉnh sửa thông tin, phân quyền vai trò (Khách hàng, KTV, Quản trị viên) và
            xóa tài khoản.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-2 self-start shadow-md sm:self-auto"
        >
          <span>➕</span>
          <span>Thêm Tài Khoản Mới</span>
        </Button>
      </div>

      {/* Thông báo phản hồi */}
      {feedback && (
        <div
          className={`flex items-center justify-between rounded-xl p-3 text-xs font-medium ${
            feedback.type === 'success'
              ? 'border border-[#405C4E]/30 bg-[#E5EDE8] text-[#2D4137]'
              : 'border border-[#9E3838]/30 bg-[#FBEBEB] text-[#832B2B]'
          }`}
        >
          <span>{feedback.msg}</span>
          <button
            onClick={() => setFeedback(null)}
            className="text-sm font-bold opacity-60 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      )}

      {/* Bộ lọc & Tìm kiếm */}
      <Card className="border-[#E2D9CC] bg-white p-4 shadow-xs">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-md flex-1">
            <input
              type="text"
              placeholder="🔍 Tìm theo họ tên, email hoặc số điện thoại..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-[#D4C8B8] bg-[#FAF7F2] px-3 py-2 text-xs text-[#2B2622] placeholder-[#8C827A] focus:ring-1 focus:ring-[#405C4E] focus:outline-none"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute top-2.5 right-3 text-xs text-[#8C827A] hover:text-[#2B2622]"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {(['ALL', 'CUSTOMER', 'THERAPIST', 'ADMIN'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRoleFilter(r)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                  roleFilter === r
                    ? 'bg-[#405C4E] text-white shadow-xs'
                    : 'bg-[#FAF7F2] text-[#635B54] hover:bg-[#EAE1D3]'
                }`}
              >
                {r === 'ALL'
                  ? `Tất cả (${users.length})`
                  : r === 'CUSTOMER'
                    ? `Khách hàng (${users.filter((u) => u.role === 'CUSTOMER').length})`
                    : r === 'THERAPIST'
                      ? `KTV (${users.filter((u) => u.role === 'THERAPIST').length})`
                      : `Admin (${users.filter((u) => u.role === 'ADMIN').length})`}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Bảng danh sách tài khoản */}
      <Card className="overflow-hidden border-[#E2D9CC] bg-white p-0 shadow-sm">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-[#635B54]">
            <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-[#405C4E] border-t-transparent" />
            Đang nạp danh sách tài khoản...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#635B54]">
            Không tìm thấy tài khoản nào phù hợp với điều kiện tìm kiếm.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#E2D9CC] bg-[#F4EFEA] font-serif font-bold text-[#2B2622]">
                <tr>
                  <th className="px-4 py-3.5">Họ Tên & Email</th>
                  <th className="px-4 py-3.5">Vai Trò</th>
                  <th className="px-4 py-3.5">Số Điện Thoại</th>
                  <th className="px-4 py-3.5">Thông Tin Thêm</th>
                  <th className="px-4 py-3.5 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2D9CC]/60">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="transition-colors hover:bg-[#FAF7F2]">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#E5EDE8] font-bold text-[#405C4E]">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-[#2B2622]">{u.name}</div>
                          <div className="font-mono text-[11px] text-[#8C827A]">{u.email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      {u.role === 'ADMIN' ? (
                        <Badge variant="terracotta">🛡️ Quản trị viên</Badge>
                      ) : u.role === 'THERAPIST' ? (
                        <Badge variant="primary">💆 Kỹ thuật viên</Badge>
                      ) : (
                        <Badge variant="secondary">👤 Khách hàng</Badge>
                      )}
                    </td>

                    <td className="px-4 py-3 font-mono text-[#405C4E]">
                      {u.phone || <span className="text-[#8C827A] italic">Chưa cập nhật</span>}
                    </td>

                    <td className="px-4 py-3 text-[11px] text-[#635B54]">
                      {u.role === 'CUSTOMER' ? (
                        <span>
                          Hạng:{' '}
                          <strong className="text-[#D4AF37]">{u.loyaltyTier || 'STANDARD'}</strong>{' '}
                          {u.prepaidSessions ? `• Gói: ${u.prepaidSessions} buổi` : ''}
                        </span>
                      ) : (
                        <span>Ngày tạo: {new Date(u.createdAt).toLocaleDateString('vi-VN')}</span>
                      )}
                    </td>

                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditModal(u)}
                          className="rounded-lg border border-[#D4C8B8] bg-white px-2.5 py-1 text-[11px] font-medium text-[#2B2622] hover:bg-[#FAF7F2]"
                          title="Sửa thông tin tài khoản"
                        >
                          ✏️ Sửa
                        </button>

                        <button
                          type="button"
                          onClick={() => handleResetPassword(u)}
                          className="rounded-lg border border-[#D4AF37]/50 bg-[#FDF8EE] px-2.5 py-1 text-[11px] font-medium text-[#8C5E3C] hover:bg-[#F9EED4]"
                          title="Đặt lại mật khẩu tạm ngẫu nhiên"
                        >
                          🔑 Reset
                        </button>

                        <button
                          type="button"
                          onClick={() => setDeletingUser(u)}
                          className="rounded-lg border border-[#9E3838]/30 bg-white px-2.5 py-1 text-[11px] font-medium text-[#9E3838] hover:bg-[#FBEBEB]"
                          title="Xóa tài khoản"
                        >
                          🗑️ Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* ================= MODAL THÊM TÀI KHOẢN MỚI ================= */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-[#E2D9CC] bg-[#FAF7F2] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E2D9CC] pb-3">
              <CardTitle className="font-serif text-lg text-[#2B2622]">
                ➕ Thêm Tài Khoản Mới
              </CardTitle>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="text-base text-[#8C827A] hover:text-[#2B2622]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="mt-4 space-y-3.5 text-xs">
              <Input
                label="Họ và tên"
                placeholder="Nguyễn Văn A"
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                required
              />

              <Input
                label="Địa chỉ Email"
                type="email"
                placeholder="nguyenvana@gmail.com"
                value={createEmail}
                onChange={(e) => setCreateEmail(e.target.value)}
                required
              />

              <Input
                label="Số điện thoại"
                placeholder="0912345678"
                value={createPhone}
                onChange={(e) => setCreatePhone(e.target.value)}
              />

              <div>
                <label className="mb-1 block font-medium text-[#2B2622]">Vai trò tài khoản</label>
                <select
                  value={createRole}
                  onChange={(e) =>
                    setCreateRole(e.target.value as 'CUSTOMER' | 'THERAPIST' | 'ADMIN')
                  }
                  className="w-full rounded-xl border border-[#D4C8B8] bg-white px-3 py-2 text-xs text-[#2B2622] focus:ring-1 focus:ring-[#405C4E] focus:outline-none"
                >
                  <option value="CUSTOMER">👤 Khách hàng (CUSTOMER)</option>
                  <option value="THERAPIST">💆 Kỹ thuật viên (THERAPIST)</option>
                  <option value="ADMIN">🛡️ Quản trị viên (ADMIN)</option>
                </select>
              </div>

              <Input
                label="Mật khẩu khởi tạo"
                type="text"
                placeholder="Mặc định: SpaDemo2026!"
                value={createPassword}
                onChange={(e) => setCreatePassword(e.target.value)}
              />

              <div className="flex items-center justify-end gap-2 pt-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsCreateOpen(false)}
                  disabled={isSubmittingCreate}
                >
                  Hủy
                </Button>
                <Button type="submit" variant="primary" disabled={isSubmittingCreate}>
                  {isSubmittingCreate ? 'Đang tạo...' : 'Xác Nhận Tạo'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL SỬA TÀI KHOẢN ================= */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-[#E2D9CC] bg-[#FAF7F2] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E2D9CC] pb-3">
              <CardTitle className="font-serif text-lg text-[#2B2622]">
                ✏️ Chỉnh Sửa Tài Khoản
              </CardTitle>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="text-base text-[#8C827A] hover:text-[#2B2622]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="mt-4 space-y-3.5 text-xs">
              <Input
                label="Họ và tên"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
              />

              <Input
                label="Địa chỉ Email"
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                required
              />

              <Input
                label="Số điện thoại"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
              />

              <div>
                <label className="mb-1 block font-medium text-[#2B2622]">Vai trò tài khoản</label>
                <select
                  value={editRole}
                  onChange={(e) =>
                    setEditRole(e.target.value as 'CUSTOMER' | 'THERAPIST' | 'ADMIN')
                  }
                  className="w-full rounded-xl border border-[#D4C8B8] bg-white px-3 py-2 text-xs text-[#2B2622] focus:ring-1 focus:ring-[#405C4E] focus:outline-none"
                >
                  <option value="CUSTOMER">👤 Khách hàng (CUSTOMER)</option>
                  <option value="THERAPIST">💆 Kỹ thuật viên (THERAPIST)</option>
                  <option value="ADMIN">🛡️ Quản trị viên (ADMIN)</option>
                </select>
              </div>

              <Input
                label="Mật khẩu mới (Để trống nếu giữ nguyên)"
                type="password"
                placeholder="Nhập nếu muốn đổi mật khẩu"
                value={editPassword}
                onChange={(e) => setEditPassword(e.target.value)}
              />

              <div className="flex items-center justify-end gap-2 pt-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setEditingUser(null)}
                  disabled={isSubmittingEdit}
                >
                  Hủy
                </Button>
                <Button type="submit" variant="primary" disabled={isSubmittingEdit}>
                  {isSubmittingEdit ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL HIỂN THỊ MẬT KHẨU RESET ================= */}
      {resetModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl border border-[#D4AF37] bg-white p-6 text-center shadow-2xl">
            <span className="text-3xl">🔑</span>
            <h3 className="mt-2 font-serif text-lg font-bold text-[#2B2622]">
              Đặt Lại Mật Khẩu Thành Công
            </h3>
            <p className="mt-1 text-xs text-[#635B54]">
              Mật khẩu tạm ngẫu nhiên cho <strong>{resetModalData.name}</strong>:
            </p>
            <div className="my-4 rounded-xl border border-[#D4AF37]/40 bg-[#FDF8EE] p-3 font-mono text-base font-bold text-[#8C5E3C] select-all">
              {resetModalData.tempPass}
            </div>
            <div className="flex justify-center gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(resetModalData.tempPass);
                  alert('Đã sao chép mật khẩu tạm thời vào Clipboard!');
                }}
              >
                📋 Sao Chép
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setResetModalData(null)}>
                Đóng
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL XÁC NHẬN XÓA ================= */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl border border-[#9E3838]/40 bg-white p-6 text-center shadow-2xl">
            <span className="text-4xl">⚠️</span>
            <h3 className="mt-3 font-serif text-lg font-bold text-[#2B2622]">
              Xác Nhận Xóa Tài Khoản?
            </h3>
            <p className="mt-2 text-xs text-[#635B54]">
              Bạn có chắc chắn muốn xóa tài khoản <strong>{deletingUser.name}</strong> (
              <span className="font-mono text-[#9E3838]">{deletingUser.email}</span>)? Hành động này
              sẽ xóa dữ liệu liên kết và không thể hoàn tác.
            </p>
            <div className="mt-5 flex items-center justify-center gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setDeletingUser(null)}
                disabled={isDeleting}
              >
                Hủy Bỏ
              </Button>
              <Button
                type="button"
                variant="danger"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
              >
                {isDeleting ? 'Đang xóa...' : 'Xác Nhận Xóa'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
