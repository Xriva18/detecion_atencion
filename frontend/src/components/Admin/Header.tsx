"use client";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 w-full bg-white/80 backdrop-blur-md border-b border-[#e5e7eb] px-6 py-3 flex items-center justify-between">
      <div className="flex flex-col">
        <h2 className="text-xl font-bold text-[#111318]">
          {title}
        </h2>
        {subtitle && (
          <p className="text-xs text-[#616f89]">
            {subtitle}
          </p>
        )}
      </div>
      <div className="flex items-center gap-4">
        {/* Profile */}
        <div className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-1.5 rounded-lg transition-colors">
          <div className="size-8 rounded-full bg-cover bg-center border border-gray-200 bg-gray-200"></div>
          <div className="hidden lg:flex flex-col">
            <span className="text-xs font-semibold text-[#111318]">
              Usuario Admin
            </span>
            <span className="text-[10px] text-[#616f89]">
              Super Administrador
            </span>
          </div>
          <span className="material-symbols-outlined text-[#616f89] text-[18px]">
            expand_more
          </span>
        </div>
      </div>
    </header>
  );
}
