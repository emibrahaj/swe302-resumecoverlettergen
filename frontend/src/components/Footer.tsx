export default function Footer() {
  return (
    <footer className="bg-[#101827] px-8 py-16 text-slate-300 md:px-[103px]">
      <div className="grid gap-12 md:grid-cols-5">
        <div className="md:col-span-2">
          <p className="max-w-sm text-sm leading-7">
            Transform your career with AI-powered CV builder. Create
            professional, job-ready CVs in minutes.
          </p>

          <div className="mt-8 flex gap-4">
            {["𝕏", "in", "GH", "✉"].map((icon) => (
              <div
                key={icon}
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-800 text-sm"
              >
                {icon}
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-bold text-white">Product</h4>
          <p className="mt-5 text-sm">CV Templates</p>
          <p className="mt-4 text-sm">Improve CV</p>
          <p className="mt-4 text-sm">Job Suggestions</p>
          <p className="mt-4 text-sm">Pricing</p>
        </div>

        <div>
          <h4 className="font-bold text-white">Company</h4>
          <p className="mt-5 text-sm">About Us</p>
          <p className="mt-4 text-sm">Careers</p>
          <p className="mt-4 text-sm">Blog</p>
          <p className="mt-4 text-sm">Contact</p>
        </div>

        <div>
          <h4 className="font-bold text-white">Legal</h4>
          <p className="mt-5 text-sm">Privacy Policy</p>
          <p className="mt-4 text-sm">Terms of Service</p>
          <p className="mt-4 text-sm">Cookie Policy</p>
        </div>
      </div>

      <div className="mt-16 border-t border-slate-800 pt-10 text-center">
        <h4 className="font-bold text-white">Stay updated</h4>

        <p className="mt-3 text-sm">
          Get the latest CV tips and job opportunities delivered to your inbox.
        </p>

        <div className="mx-auto mt-5 flex max-w-lg overflow-hidden rounded-xl border border-slate-700 bg-slate-900">
          <input
            placeholder="Enter your email"
            className="flex-1 bg-transparent px-5 py-3 text-sm outline-none"
          />

          <button className="bg-pink-600 px-7 text-sm font-bold text-white">
            Subscribe
          </button>
        </div>
      </div>
    </footer>
  );
}