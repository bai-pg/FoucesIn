module.exports = {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    // 移动优先的响应式断点配置
    screens: {
      'xs': '480px',   // 超小屏幕（手机竖屏）
      'sm': '640px',   // 小屏幕（手机横屏/小平板）
      'md': '768px',   // 中等屏幕（平板）
      'lg': '1024px',  // 大屏幕（笔记本）
      'xl': '1280px',  // 超大屏幕（桌面）
      '2xl': '1536px', // 特大屏幕（大显示器）
    },
    extend: {
      // 移动端优化的间距和尺寸
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
      // 字体大小响应式配置
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],      // 12px
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],  // 14px
        'base': ['1rem', { lineHeight: '1.5rem' }],     // 16px
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],  // 18px
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],   // 20px
        '2xl': ['1.5rem', { lineHeight: '2rem' }],      // 24px
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],   // 36px
      },
    },
  },
  plugins: [],
};
