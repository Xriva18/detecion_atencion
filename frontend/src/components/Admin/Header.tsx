"use client";

interface UserProfile {
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

interface HeaderProps {
  title: string;
  subtitle?: string;
  user?: UserProfile;
  onProfileClick?: () => void;
}

export default function Header({
  title,
  subtitle,
  user,
  onProfileClick,
}: HeaderProps) {
  const displayName = user?.name || "Usuario";
  const displayRole = user?.role || "Usuario";
  const avatarUrl = user?.avatar;

  return (
    <header className="sticky top-0 z-10 w-full bg-white/80 backdrop-blur-md border-b border-[#e5e7eb] px-6 py-3 flex items-center justify-between">
      <div className="flex flex-col">
        <h2 className="text-xl font-bold text-[#111318]">{title}</h2>
        {subtitle && <p className="text-xs text-[#616f89]">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-4">
        {/* Profile */}
        <div
          className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-1.5 rounded-lg transition-colors"
          onClick={onProfileClick}
        >
          {avatarUrl ? (
            <div
              className="size-8 rounded-full bg-cover bg-center border border-gray-200"
              style={{ backgroundImage: `url(${avatarUrl})` }}
            ></div>
          ) : (
            <div className="size-8 rounded-full bg-gray-200 border border-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
              {displayName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2)}
            </div>
          )}
          <div className="hidden lg:flex flex-col">
            <span className="text-xs font-semibold text-[#111318]">
              {displayName}
            </span>
            <span className="text-[10px] text-[#616f89]">{displayRole}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
