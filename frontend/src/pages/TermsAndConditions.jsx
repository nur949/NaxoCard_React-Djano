export default function TermsAndConditions() {
  return (
    <section className="section py-12">
      <div className="mx-auto max-w-4xl rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)] sm:p-8 lg:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary/70">Legal</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">Terms and Conditions</h1>
        <p className="mt-4 text-base leading-8 text-slate-700">
          By using NaxoCard, you agree to follow the store policies related to product information, ordering, delivery, and
          customer conduct.
        </p>

        <div className="mt-10 space-y-8">
          <article className="border-t border-slate-200 pt-8 first:border-t-0 first:pt-0">
            <h2 className="text-2xl font-black tracking-tight text-slate-900">Product information</h2>
            <p className="mt-4 text-base leading-8 text-slate-700">
              We try to keep product names, descriptions, prices, stock, and images accurate. However, availability and details
              may change without prior notice.
            </p>
          </article>

          <article className="border-t border-slate-200 pt-8">
            <h2 className="text-2xl font-black tracking-tight text-slate-900">Orders</h2>
            <p className="mt-4 text-base leading-8 text-slate-700">
              Orders are confirmed after review and may be cancelled if stock is unavailable, delivery details are incomplete, or
              suspicious activity is detected.
            </p>
          </article>

          <article className="border-t border-slate-200 pt-8">
            <h2 className="text-2xl font-black tracking-tight text-slate-900">Pricing and payment</h2>
            <p className="mt-4 text-base leading-8 text-slate-700">
              Prices displayed on the website are shown in Bangladeshi Taka. Payment options may include cash on delivery and
              other supported payment methods available at checkout.
            </p>
          </article>

          <article className="border-t border-slate-200 pt-8">
            <h2 className="text-2xl font-black tracking-tight text-slate-900">Use of the website</h2>
            <p className="mt-4 text-base leading-8 text-slate-700">
              Users must not misuse the website, interfere with store operations, or submit false order information. NaxoCard may
              restrict access where misuse or abuse is identified.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}
