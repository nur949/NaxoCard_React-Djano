export default function PrivacyPolicy() {
  return (
    <section className="section py-12">
      <div className="mx-auto max-w-4xl rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)] sm:p-8 lg:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary/70">Legal</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">Privacy Policy</h1>
        <p className="mt-4 text-base leading-8 text-slate-700">
          NaxoCard respects your privacy and only collects the information needed to process orders, improve the shopping
          experience, and provide customer support.
        </p>

        <div className="mt-10 space-y-8">
          <article className="border-t border-slate-200 pt-8 first:border-t-0 first:pt-0">
            <h2 className="text-2xl font-black tracking-tight text-slate-900">Information we collect</h2>
            <p className="mt-4 text-base leading-8 text-slate-700">
              We may collect your name, phone number, email address, delivery address, and order details when you place an
              order, contact support, or subscribe to updates.
            </p>
          </article>

          <article className="border-t border-slate-200 pt-8">
            <h2 className="text-2xl font-black tracking-tight text-slate-900">How we use your information</h2>
            <p className="mt-4 text-base leading-8 text-slate-700">
              Your information is used to confirm orders, arrange delivery, communicate order updates, resolve support issues,
              and improve store performance. We do not sell personal customer information to third parties.
            </p>
          </article>

          <article className="border-t border-slate-200 pt-8">
            <h2 className="text-2xl font-black tracking-tight text-slate-900">Payment and security</h2>
            <p className="mt-4 text-base leading-8 text-slate-700">
              We take reasonable measures to protect customer data. Payment-related processing may involve trusted third-party
              services depending on the checkout method used.
            </p>
          </article>

          <article className="border-t border-slate-200 pt-8">
            <h2 className="text-2xl font-black tracking-tight text-slate-900">Contact</h2>
            <p className="mt-4 text-base leading-8 text-slate-700">
              For questions about privacy or your stored information, contact NaxoCard support at <strong>admin@gmail.com</strong>.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}
