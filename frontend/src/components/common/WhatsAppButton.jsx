const phoneNumber = "8801739391331";
const defaultMessage = encodeURIComponent("Hello NaxoCard, I need help with my order.");
const whatsappLink = `https://wa.me/${phoneNumber}?text=${defaultMessage}`;

export default function WhatsAppButton() {
  return (
    <a
      href={whatsappLink}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-5 right-5 z-[72] text-[#1f3f73] drop-shadow-[0_18px_30px_rgba(15,23,42,0.22)] transition hover:translate-y-[-2px] hover:opacity-90 sm:bottom-6 sm:right-6"
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 320" className="h-14 w-14 fill-current sm:h-16 sm:w-16" aria-hidden="true">
          <path d="M160 34c-68.5 0-124 55.5-124 124 0 21.9 5.7 43.3 16.6 62.2L34 286l67.6-17.7c18.6 10.1 39.6 15.4 61 15.4h.1c68.4 0 123.3-55.5 123.3-124S228.5 34 160 34zm0 227.1h-.1c-19 0-37.7-5.1-54-14.8l-3.9-2.3-40.7 10.7 10.9-39.7-2.6-4.1c-11.2-17.7-17.2-38.2-17.2-59.1 0-59.4 48.3-107.7 107.7-107.7 28.8 0 55.8 11.2 76.1 31.6 20.3 20.4 31.4 47.4 31.4 76.2 0 59.4-48.4 107.7-107.6 107.7zm59-80.4c-3.2-1.6-18.8-9.3-21.8-10.3-2.9-1.1-5.1-1.6-7.2 1.6-2.1 3.2-8.3 10.3-10.1 12.4-1.9 2.1-3.7 2.4-6.9.8-18.8-9.4-31.1-16.8-43.5-38-3.3-5.7 3.3-5.3 9.4-17.5 1.1-2.2.5-4.1-.3-5.7-.8-1.6-7.2-17.4-9.8-23.8-2.5-6-5.1-5.2-7-5.3-1.8-.1-3.9-.1-6-.1s-5.6.8-8.6 4.1-11.3 11-11.3 26.8 11.6 31 13.2 33.1c1.6 2.1 22.7 34.7 55 48.7 20.5 8.8 28.4 9.6 38.6 8.1 6.2-.9 19-7.8 21.7-15.6 2.7-7.7 2.7-14.3 1.9-15.7-.8-1.3-2.9-2.1-6.1-3.7z" />
      </svg>
    </a>
  );
}
