'use client';

import React, { useState, useSyncExternalStore } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { signIn } from 'next-auth/react';
import { useCartStore, FavoriteScent } from '@/infrastructure/store/useCartStore';
import { loginAction, registerAction } from '@/application/auth/actions';

interface AuthPortalGateProps {
  isAuthenticated: boolean;
  userEmail?: string | null;
  userName?: string | null;
  children: React.ReactNode;
}

export function AuthPortalGate({ isAuthenticated, children }: AuthPortalGateProps) {
  const pathname = usePathname();
  // Trạng thái cục bộ nếu vừa đăng nhập xong để chạy hiệu ứng Grand Portal Reveal
  const [hasUnlocked, setHasUnlocked] = useState(false);
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [isRevealing, setIsRevealing] = useState(false);

  // Form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [selectedScent, setSelectedScent] = useState<FavoriteScent>('sa-chanh');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [shakeError, setShakeError] = useState(false);

  const setFavoriteScentStore = useCartStore((state) => state.setFavoriteScent);

  // Kiểm tra trạng thái đã mở khóa từ cookie hoặc localStorage qua External Store
  const isStorageUnlocked = useSyncExternalStore(
    (onStoreChange) => {
      if (typeof window === 'undefined') return () => {};
      window.addEventListener('storage', onStoreChange);
      return () => window.removeEventListener('storage', onStoreChange);
    },
    () => {
      if (typeof window === 'undefined') return false;
      try {
        const local =
          typeof window.localStorage !== 'undefined' && window.localStorage !== null
            ? window.localStorage.getItem('sa_spa_unlocked') === 'true'
            : false;
        const cookie =
          typeof document !== 'undefined'
            ? document.cookie.includes('sa_spa_unlocked=true')
            : false;
        return local || cookie;
      } catch {
        return false;
      }
    },
    () => false,
  );

  // Kích hoạt hiệu ứng "Grand Portal Reveal" (mở rèm lá, zoom vào spa)
  const triggerGrandReveal = () => {
    setIsRevealing(true);
    if (typeof window !== 'undefined') {
      try {
        if (typeof window.localStorage !== 'undefined' && window.localStorage !== null) {
          window.localStorage.setItem('sa_spa_unlocked', 'true');
        }
        if (typeof document !== 'undefined') {
          document.cookie = 'sa_spa_unlocked=true; path=/; max-age=2592000; SameSite=Lax';
        }
      } catch {
        // Safe fallback
      }
    }
    setTimeout(() => {
      setHasUnlocked(true);
      setIsRevealing(false);
    }, 1200);
  };

  // Đăng nhập 1 chạm Khách VIP Demo
  const handleVipDemoLogin = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await signIn('credentials', {
        email: 'khachhang@spawellness.vn',
        password: 'SpaDemo2026!',
        redirect: false,
      });

      if (res?.ok) {
        setFavoriteScentStore('sa-chanh');
        triggerGrandReveal();
      } else {
        setErrorMsg('Không thể đăng nhập tài khoản VIP demo. Vui lòng thử lại.');
      }
    } catch {
      setErrorMsg('Đã có lỗi xảy ra khi xác thực.');
    } finally {
      setIsLoading(false);
    }
  };

  // Xử lý gửi Form Đăng nhập
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    const formData = new FormData();
    formData.append('email', loginEmail);
    formData.append('password', loginPassword);

    const res = await loginAction({ success: false }, formData);
    if (!res.success) {
      setErrorMsg(res.message || 'Email hoặc mật khẩu không chính xác.');
      setShakeError(true);
      setTimeout(() => setShakeError(false), 600);
      setIsLoading(false);
      return;
    }

    // Đăng nhập thành công
    await signIn('credentials', {
      email: loginEmail,
      password: loginPassword,
      redirect: false,
    });

    triggerGrandReveal();
    setIsLoading(false);
  };

  // Xử lý gửi Form Đăng ký
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    const formData = new FormData();
    formData.append('name', registerName);
    formData.append('email', registerEmail);
    formData.append('password', registerPassword);
    formData.append('consent', 'on');

    const res = await registerAction({ success: false }, formData);
    if (!res.success) {
      setErrorMsg(res.message || 'Không thể tạo tài khoản. Vui lòng kiểm tra lại thông tin.');
      setShakeError(true);
      setTimeout(() => setShakeError(false), 600);
      setIsLoading(false);
      return;
    }

    // Lưu nốt hương yêu thích đã chọn
    setFavoriteScentStore(selectedScent);

    // Đăng nhập tự động sau khi đăng ký
    await signIn('credentials', {
      email: registerEmail,
      password: registerPassword,
      redirect: false,
    });

    triggerGrandReveal();
    setIsLoading(false);
  };

  // Nếu người dùng đã xác thực, hoặc đã mở cổng, hoặc đang ở trang đăng nhập/đăng ký chuyên biệt
  const isDedicatedAuthPage = pathname === '/dang-nhap' || pathname === '/dang-ky';
  if (isAuthenticated || hasUnlocked || isStorageUnlocked || isDedicatedAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#141C17] px-4 py-8 text-[#FAF7F2]">
      {/* 1. Lối vào tĩnh tại Sả Spa: Nền rừng nhiệt đới & bóng lá đung đưa */}
      <div
        className="pointer-events-none absolute inset-0 z-0 bg-cover bg-center opacity-40 mix-blend-screen"
        style={{
          background: `
            radial-gradient(circle at 50% 30%, rgba(212, 175, 55, 0.15) 0%, transparent 60%),
            radial-gradient(circle at 15% 85%, rgba(78, 107, 86, 0.25) 0%, transparent 50%),
            radial-gradient(circle at 85% 85%, rgba(184, 93, 56, 0.2) 0%, transparent 50%),
            linear-gradient(to bottom, #141C17 0%, #1F2B24 100%)
          `,
        }}
      />

      {/* Làn sương thảo mộc bay là là */}
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-20"
        style={{
          background:
            'radial-gradient(ellipse at 50% 80%, rgba(250, 247, 242, 0.35) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />

      {/* 2. Hiệu ứng Grand Portal Reveal (2 tán lá mở rộng + Camera zoom) */}
      <AnimatePresence>
        {isRevealing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-[#1F2B24]"
          >
            {/* Cánh rèm lá bên trái tách sang trái */}
            <motion.div
              initial={{ x: 0 }}
              animate={{ x: '-100%' }}
              transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
              className="absolute top-0 bottom-0 left-0 w-1/2 border-r border-[#D4AF37]/30 bg-[#141C17] shadow-2xl"
              style={{
                backgroundImage:
                  'radial-gradient(circle at right, rgba(212, 175, 55, 0.15), transparent)',
              }}
            />
            {/* Cánh rèm lá bên phải tách sang phải */}
            <motion.div
              initial={{ x: 0 }}
              animate={{ x: '100%' }}
              transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
              className="absolute top-0 right-0 bottom-0 w-1/2 border-l border-[#D4AF37]/30 bg-[#141C17] shadow-2xl"
              style={{
                backgroundImage:
                  'radial-gradient(circle at left, rgba(212, 175, 55, 0.15), transparent)',
              }}
            />

            {/* Thông điệp chào mừng giữa cổng */}
            <motion.div
              initial={{ scale: 0.9, opacity: 1 }}
              animate={{ scale: 1.15, opacity: 0 }}
              transition={{ duration: 1.0, delay: 0.2 }}
              className="relative z-10 text-center"
            >
              <span className="text-xs tracking-[0.4em] text-[#D4AF37] uppercase">
                Chào mừng bạn đến với
              </span>
              <h2 className="mt-2 font-serif text-3xl font-light text-[#FAF7F2] md:text-5xl">
                Sả Spa Botanical Sanctuary
              </h2>
              <p className="mt-2 text-sm text-[#FAF7F2]/80 italic">
                Làn hương thảo mộc đang mở ra...
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. Thẻ Form Glassmorphism Đông Dương */}
      <motion.div
        initial={{ opacity: 0, y: 25, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className={`relative z-10 w-full max-w-md rounded-3xl border border-[#D4AF37]/30 bg-[#1F2B24]/85 p-6 shadow-2xl backdrop-blur-2xl transition-transform md:p-8 ${
          shakeError ? 'animate-[shake_0.5s_ease-in-out]' : ''
        }`}
      >
        {/* Họa tiết vòm cong Indochine trang trí */}
        <div className="pointer-events-none absolute -top-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-[#D4AF37]/40 bg-[#141C17] px-4 py-1 text-[10px] tracking-widest text-[#D4AF37] uppercase">
          <span>🌿</span> Cổng Vào Sả Spa <span>🌿</span>
        </div>

        {/* Tiêu đề & Lời dẫn nhập */}
        <div className="mt-2 text-center">
          <h1 className="font-serif text-2xl font-light tracking-wide text-[#FAF7F2] md:text-3xl">
            Sả Spa Botanical
          </h1>
          <p className="mt-1.5 text-xs tracking-wider text-[#FAF7F2]/75">
            Không gian hương thảo mộc & Sản phẩm trị liệu Đông Dương cao cấp
          </p>
          <div className="mx-auto mt-3 h-px w-24 bg-gradient-to-r from-transparent via-[#D4AF37]/60 to-transparent" />
        </div>

        {/* Tabs chuyển đổi Đăng nhập / Đăng ký */}
        <div className="mt-6 flex rounded-xl border border-[#D4AF37]/20 bg-[#141C17]/60 p-1">
          <button
            type="button"
            onClick={() => {
              setActiveTab('login');
              setErrorMsg(null);
            }}
            className={`relative flex-1 rounded-lg py-2 text-xs font-medium tracking-wide transition-colors ${
              activeTab === 'login' ? 'text-[#141C17]' : 'text-[#FAF7F2]/70 hover:text-[#FAF7F2]'
            }`}
          >
            {activeTab === 'login' && (
              <motion.div
                layoutId="active-auth-tab"
                className="absolute inset-0 rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#C68B59]"
                transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              />
            )}
            <span className="relative z-10">Đăng Nhập</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('register');
              setErrorMsg(null);
            }}
            className={`relative flex-1 rounded-lg py-2 text-xs font-medium tracking-wide transition-colors ${
              activeTab === 'register' ? 'text-[#141C17]' : 'text-[#FAF7F2]/70 hover:text-[#FAF7F2]'
            }`}
          >
            {activeTab === 'register' && (
              <motion.div
                layoutId="active-auth-tab"
                className="absolute inset-0 rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#C68B59]"
                transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              />
            )}
            <span className="relative z-10">Đăng Ký Thành Viên</span>
          </button>
        </div>

        {/* Thông báo lỗi nếu có */}
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 rounded-xl border border-[#B85D38]/40 bg-[#B85D38]/15 p-2.5 text-center text-xs text-[#E59B3C]"
          >
            {errorMsg}
          </motion.div>
        )}

        {/* Form Container với AnimatePresence */}
        <div className="mt-5">
          <AnimatePresence mode="wait">
            {activeTab === 'login' ? (
              <motion.form
                key="login-form"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleLoginSubmit}
                className="space-y-4"
              >
                <div>
                  <label
                    htmlFor="gate-email"
                    className="block text-xs font-medium text-[#FAF7F2]/80"
                  >
                    Địa chỉ Email
                  </label>
                  <input
                    id="gate-email"
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="tenban@vidu.vn"
                    className="mt-1.5 w-full rounded-xl border border-[#D4AF37]/30 bg-[#141C17]/80 px-3.5 py-2.5 text-xs text-[#FAF7F2] placeholder-[#FAF7F2]/40 transition-colors focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] focus:outline-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="gate-password"
                    className="block text-xs font-medium text-[#FAF7F2]/80"
                  >
                    Mật khẩu
                  </label>
                  <input
                    id="gate-password"
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="mt-1.5 w-full rounded-xl border border-[#D4AF37]/30 bg-[#141C17]/80 px-3.5 py-2.5 text-xs text-[#FAF7F2] placeholder-[#FAF7F2]/40 transition-colors focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#C68B59] py-3 text-xs font-medium text-[#141C17] shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                >
                  {isLoading ? 'Đang mở cổng spa...' : 'Bước Vào Trải Nghiệm Sả Spa →'}
                </button>
              </motion.form>
            ) : (
              <motion.form
                key="register-form"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleRegisterSubmit}
                className="space-y-3.5"
              >
                <div>
                  <label htmlFor="reg-name" className="block text-xs font-medium text-[#FAF7F2]/80">
                    Họ và tên
                  </label>
                  <input
                    id="reg-name"
                    type="text"
                    required
                    value={registerName}
                    onChange={(e) => setRegisterName(e.target.value)}
                    placeholder="Nguyễn Thị Minh An"
                    className="mt-1 w-full rounded-xl border border-[#D4AF37]/30 bg-[#141C17]/80 px-3 py-2 text-xs text-[#FAF7F2] placeholder-[#FAF7F2]/40 transition-colors focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] focus:outline-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="reg-email"
                    className="block text-xs font-medium text-[#FAF7F2]/80"
                  >
                    Email / Số điện thoại
                  </label>
                  <input
                    id="reg-email"
                    type="email"
                    required
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    placeholder="minhan@vidu.vn"
                    className="mt-1 w-full rounded-xl border border-[#D4AF37]/30 bg-[#141C17]/80 px-3 py-2 text-xs text-[#FAF7F2] placeholder-[#FAF7F2]/40 transition-colors focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] focus:outline-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="reg-password"
                    className="block text-xs font-medium text-[#FAF7F2]/80"
                  >
                    Mật khẩu (từ 6 ký tự)
                  </label>
                  <input
                    id="reg-password"
                    type="password"
                    required
                    minLength={6}
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    placeholder="••••••••"
                    className="mt-1 w-full rounded-xl border border-[#D4AF37]/30 bg-[#141C17]/80 px-3 py-2 text-xs text-[#FAF7F2] placeholder-[#FAF7F2]/40 transition-colors focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] focus:outline-none"
                  />
                </div>

                {/* Chọn hương thảo mộc yêu thích để cá nhân hóa */}
                <div>
                  <label className="block text-xs font-medium text-[#D4AF37]">
                    🌿 Chọn nốt hương bạn yêu thích nhất:
                  </label>
                  <div className="mt-1.5 grid grid-cols-2 gap-1.5">
                    {[
                      { id: 'sa-chanh', label: 'Sả Chanh Thanh Lọc', icon: '🍋' },
                      { id: 'hoa-nhai', label: 'Hoa Nhài Ngủ Sâu', icon: '🌸' },
                      { id: 'go-tram', label: 'Gỗ Trầm Tĩnh Tâm', icon: '🪵' },
                      { id: 'bac-ha', label: 'Bạc Hà Phục Hồi', icon: '🍃' },
                    ].map((scent) => (
                      <button
                        key={scent.id}
                        type="button"
                        onClick={() => setSelectedScent(scent.id as FavoriteScent)}
                        className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-left text-[11px] transition-all ${
                          selectedScent === scent.id
                            ? 'border-[#D4AF37] bg-[#D4AF37]/20 font-medium text-[#FAF7F2]'
                            : 'border-[#D4AF37]/20 bg-[#141C17]/40 text-[#FAF7F2]/70 hover:border-[#D4AF37]/40'
                        }`}
                      >
                        <span>{scent.icon}</span>
                        <span className="truncate">{scent.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="mt-2 w-full rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#C68B59] py-3 text-xs font-medium text-[#141C17] shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                >
                  {isLoading ? 'Đang tạo thành viên...' : 'Hoàn Tất Đăng Ký & Bước Vào Spa →'}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        {/* Nút Trải nghiệm nhanh (Khách VIP Demo) */}
        <div className="mt-5 border-t border-[#D4AF37]/20 pt-4 text-center">
          <p className="text-[11px] text-[#FAF7F2]/60">
            Dành cho giảng viên / khách kiểm thử nhanh:
          </p>
          <button
            type="button"
            onClick={handleVipDemoLogin}
            disabled={isLoading}
            className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-[#D4AF37]/40 bg-[#141C17] px-4 py-2 text-xs font-medium text-[#D4AF37] transition-all hover:border-[#D4AF37] hover:bg-[#D4AF37]/10"
          >
            <span>👑</span>
            <span>Vào Nhanh (Khách VIP Demo)</span>
          </button>
        </div>
      </motion.div>

      <style jsx global>{`
        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          20%,
          60% {
            transform: translateX(-8px);
          }
          40%,
          80% {
            transform: translateX(8px);
          }
        }
      `}</style>
    </div>
  );
}
