export const typography = {
  fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
  headings: {
    h1: "text-4xl sm:text-6xl font-black leading-tight",
    h2: "text-3xl font-extrabold leading-tight",
    h3: "text-2xl font-bold leading-snug",
    h4: "text-xl font-bold leading-snug",
    h5: "text-lg font-semibold leading-snug",
    h6: "text-base font-semibold leading-snug",
  },
  body: {
    default: "text-base leading-7",
    small: "text-sm leading-6",
    muted: "text-sm leading-6 text-muted-foreground",
  },
} as const;
