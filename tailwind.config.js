// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}", // Quan trọng: quét toàn bộ src
    ],
    theme: {
      extend: {
        // Thêm cấu hình màu sắc hoặc font nếu cần
      },
    },
    plugins: [],
  }