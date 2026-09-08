import LoginForm from "@/components/admin/LoginForm";

export const metadata = {
  title: "Admin Login | Visit Museums",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-marble-100 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-tuscan-300 bg-marble-50 p-8 shadow-sm sm:p-10">
        <div className="mb-6 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-navy-700">
            Visit Museums
          </p>
          <h1 className="mt-2 font-display text-2xl font-bold text-navy-900">Admin Sign In</h1>
        </div>
        <div className="mt-6">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
