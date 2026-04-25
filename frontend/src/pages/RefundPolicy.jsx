export default function RefundPolicy() {
  return (
    <section className="section py-12">
      <div className="mx-auto max-w-4xl rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)] sm:p-8 lg:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary/70">Legal</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">Refund Policy</h1>
        <p className="mt-4 text-base leading-8 text-slate-700">
          NaxoCard aims to resolve delivery and product issues fairly. Refund or exchange requests are reviewed based on order
          condition, product status, and the reason for the request.
        </p>

        <div className="mt-10 space-y-8">
          <article className="border-t border-slate-200 pt-8 first:border-t-0 first:pt-0">
            <h2 className="text-2xl font-black tracking-tight text-slate-900">Eligible cases</h2>
            <p className="mt-4 text-base leading-8 text-slate-700">
              Refunds or exchanges may be considered for damaged items, incorrect products, or verified delivery issues reported
              within the stated support period.
            </p>
          </article>

          <article className="border-t border-slate-200 pt-8">
            <h2 className="text-2xl font-black tracking-tight text-slate-900">Non-refundable cases</h2>
            <p className="mt-4 text-base leading-8 text-slate-700">
              Used products, items damaged after delivery, and requests made outside the allowed review period may not qualify for
              refund or exchange.
            </p>
          </article>

          <article className="border-t border-slate-200 pt-8">
            <h2 className="text-2xl font-black tracking-tight text-slate-900">How to request support</h2>
            <p className="mt-4 text-base leading-8 text-slate-700">
              Contact support with your order details, phone number, and issue summary. If needed, customers may be asked to share
              photos or delivery proof for faster review.
            </p>
          </article>

          <article className="border-t border-slate-200 pt-8">
            <h2 className="text-2xl font-black tracking-tight text-slate-900">Processing time</h2>
            <p className="mt-4 text-base leading-8 text-slate-700">
              Approved refund or exchange requests are processed within a reasonable timeframe after verification. Timing may vary
              depending on payment method, courier status, and product return condition.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}
