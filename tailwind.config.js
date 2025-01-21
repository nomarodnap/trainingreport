/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
    },
  },
  plugins: [],
  theme: {
    extend: {
      colors: {
        navy: '#001f3f', // กำหนดสีกรมท่า
        blue: {
          600: '#1E40AF', // สีน้ำเงินเข้ม
        },
        cyan: {
          400: '#22D3EE', // สีฟ้าสว่าง
        },
      },
    },
  },
};
