// i18n.js - Internationalization system
(function(){
  const translations = {
    en: {
      // Navigation
      'nav.home': 'Home',
      'nav.categories': 'Categories',
      'nav.videos': 'Videos',
      'nav.pictures': 'Pictures',
      'nav.models': 'Models',
      'nav.producers': 'Producers',
      
      // Sections
      'section.bestViewed': 'Best Viewed Right Now',
      'section.bestWatched': 'Best Watched Right Now',
      'section.newestImages': 'Newest Images',
      'section.newestVideos': 'Newest Videos',
      'section.hotModelPictures': 'Hot Model (Pictures)',
      'section.hotModelVideos': 'Hot Model (Videos)',
      
      // Buttons
      'btn.loadMore': 'Load more',
      'btn.signin': 'Sign In',
      'btn.telegram': 'Telegram',
      'btn.search': 'Search',
      
      // Search
      'search.placeholder': 'Search JAV codes, models, titles...',
      'hero.title': 'Search Adult Video and Pictures',
      'hero.subtitle': '',
      'hero.searchPlaceholder': 'Use "+" to combine multiple...',
      
      // Footer
      'footer.home': 'Home',
      'footer.contact': 'Contact Us',
      'footer.upload': 'Submit Content',
      'footer.dmca': 'DMCA',
      'footer.2257': '2257',
      'footer.terms': 'Terms of Service',
      'footer.tos': 'Terms of Service',
      'footer.privacy': 'Privacy Policy',
      'footer.copyright': '© 2025 xPandorax.com | All Rights Reserved',
      
      // Filters
      'filter.all': 'All',
      'filter.female': 'Female',
      'filter.male': 'Male',
      'filter.global': 'Global',
      'filter.usa': 'USA',
      'filter.eu': 'EU',
      'filter.asia': 'Asia',
      'global': 'Global',
      'all': 'All',
      'female': 'Female',
      'male': 'Male',
      'location': 'Location',
      'gender': 'Gender',
      
      // Sort
      'sort.latest': 'Latest',
      'sort.popular': 'Most Popular',
      'sort.trending': 'Trending',
      'sort.viewed': 'Most Viewed',
      'sort.alphabetical': 'Alphabetical',
      'sort.videos': 'Most Videos',
      'filter.latest': 'Latest',
      'filter.popular': 'Most Popular',
      'filter.trending': 'Trending',
      'filter.viewed': 'Most Viewed',
      'filter.recent': 'Recently Added',
      'filter.alphabetical': 'Alphabetical',
      'filter.most.videos': 'Most Videos',
      
      // Time filters
      'sort.by': 'Sort By:',
      'time.range': 'Time Range:',
      'time.today': 'Today',
      'time.week': 'This Week',
      'time.month': 'This Month',
      'time.year': 'This Year',
      'time.all': 'All Time',
      
      // Common
      'signin': 'Sign In',
      'load.more': 'Load More',
      'search.placeholder': 'Search JAV codes, models, titles...',
      
      // Admin
      'admin.email': 'Email',
      'admin.password': 'Password',
      'admin.login': 'Login',
      'admin.logout': 'Logout',
      'admin.dashboard': 'Dashboard',
      'admin.content': 'Content Management',
      'admin.users': 'User Management',
      'admin.reports': 'Reports',
      'admin.settings': 'Settings'
    },
    
    id: { // Bahasa Indonesia
      'nav.home': 'Beranda',
      'nav.categories': 'Kategori',
      'nav.videos': 'Video',
      'nav.pictures': 'Gambar',
      'nav.models': 'Model',
      'nav.producers': 'Produser',
      'section.bestViewed': 'Paling Banyak Dilihat Sekarang',
      'section.bestWatched': 'Paling Banyak Ditonton Sekarang',
      'section.newestImages': 'Gambar Terbaru',
      'section.newestVideos': 'Video Terbaru',
      'section.hotModelPictures': 'Model Populer (Gambar)',
      'section.hotModelVideos': 'Model Populer (Video)',
      'btn.loadMore': 'Muat lebih banyak',
      'btn.signin': 'Masuk',
      'search.placeholder': 'Cari kode JAV, model, judul...',
      'hero.title': 'Search Adult Video and Pictures',
      'hero.subtitle': '',
      'footer.contact': 'Hubungi Kami',
      'footer.upload': 'Kirim Konten',
      'footer.copyright': '© 2025 xPandorax.com | Semua Hak Dilindungi'
    },
    
    de: { // German
      'nav.home': 'Startseite',
      'nav.categories': 'Kategorien',
      'nav.videos': 'Videos',
      'nav.pictures': 'Bilder',
      'nav.models': 'Modelle',
      'nav.producers': 'Produzenten',
      'section.bestViewed': 'Gerade am meisten angesehen',
      'section.newestImages': 'Neueste Bilder',
      'section.newestVideos': 'Neueste Videos',
      'btn.loadMore': 'Mehr laden',
      'btn.signin': 'Anmelden',
      'search.placeholder': 'JAV-Codes, Modelle, Titel suchen...',
      'footer.contact': 'Kontaktiere uns',
      'footer.copyright': '© 2025 xPandorax.com | Alle Rechte vorbehalten'
    },
    
    fil: { // Filipino
      'nav.home': 'Tahanan',
      'nav.categories': 'Mga Kategorya',
      'nav.videos': 'Mga Video',
      'nav.pictures': 'Mga Larawan',
      'nav.models': 'Mga Modelo',
      'nav.producers': 'Mga Producer',
      'section.bestViewed': 'Pinakanood Ngayon',
      'section.newestImages': 'Pinakabagong Larawan',
      'section.newestVideos': 'Pinakabagong Video',
      'btn.loadMore': 'Magkaroon ng higit pa',
      'btn.signin': 'Mag-sign In',
      'search.placeholder': 'Maghanap ng JAV code, modelo, titulo...',
      'hero.title': 'Maghanap ng anuman',
      'footer.contact': 'Makipag-ugnayan sa Amin',
      'footer.copyright': '© 2025 xPandorax.com | Lahat ng Karapatan ay Nakalaan'
    },
    
    fr: { // French
      'nav.home': 'Accueil',
      'nav.categories': 'Catégories',
      'nav.videos': 'Vidéos',
      'nav.pictures': 'Images',
      'nav.models': 'Modèles',
      'nav.producers': 'Producteurs',
      'section.bestViewed': 'Les plus vues maintenant',
      'section.newestImages': 'Images les plus récentes',
      'section.newestVideos': 'Vidéos les plus récentes',
      'btn.loadMore': 'Charger plus',
      'btn.signin': 'Se connecter',
      'search.placeholder': 'Rechercher codes JAV, modèles, titres...',
      'footer.contact': 'Contactez-nous',
      'footer.copyright': '© 2025 xPandorax.com | Tous droits réservés'
    },
    
    ko: { // Korean
      'nav.home': '홈',
      'nav.categories': '카테고리',
      'nav.videos': '비디오',
      'nav.pictures': '사진',
      'nav.models': '모델',
      'nav.producers': '제작자',
      'section.bestViewed': '지금 가장 많이 본',
      'section.newestImages': '최신 이미지',
      'section.newestVideos': '최신 비디오',
      'btn.loadMore': '더 보기',
      'btn.signin': '로그인',
      'search.placeholder': 'JAV 코드, 모델, 제목 검색...',
      'footer.contact': '문의하기',
      'footer.copyright': '© 2025 xPandorax.com | 모든 권리 보유'
    },
    
    ms: { // Malay
      'nav.home': 'Laman Utama',
      'nav.categories': 'Kategori',
      'nav.videos': 'Video',
      'nav.pictures': 'Gambar',
      'nav.models': 'Model',
      'nav.producers': 'Pengeluar',
      'section.bestViewed': 'Paling Banyak Dilihat Sekarang',
      'section.newestImages': 'Gambar Terkini',
      'section.newestVideos': 'Video Terkini',
      'btn.loadMore': 'Muat lebih banyak',
      'btn.signin': 'Log Masuk',
      'search.placeholder': 'Cari kod JAV, model, tajuk...',
      'footer.contact': 'Hubungi Kami',
      'footer.copyright': '© 2025 xPandorax.com | Hak Cipta Terpelihara'
    },
    
    ja: { // Japanese
      'nav.home': 'ホーム',
      'nav.categories': 'カテゴリー',
      'nav.videos': 'ビデオ',
      'nav.pictures': '写真',
      'nav.models': 'モデル',
      'nav.producers': 'プロデューサー',
      'section.bestViewed': '今最も視聴されている',
      'section.newestImages': '最新の画像',
      'section.newestVideos': '最新のビデオ',
      'btn.loadMore': 'もっと読み込む',
      'btn.signin': 'サインイン',
      'search.placeholder': 'JAVコード、モデル、タイトルを検索...',
      'footer.contact': 'お問い合わせ',
      'footer.copyright': '© 2025 xPandorax.com | 全著作権所有'
    },
    
    pt: { // Portuguese
      'nav.home': 'Início',
      'nav.categories': 'Categorias',
      'nav.videos': 'Vídeos',
      'nav.pictures': 'Imagens',
      'nav.models': 'Modelos',
      'nav.producers': 'Produtores',
      'section.bestViewed': 'Mais vistos agora',
      'section.newestImages': 'Imagens mais recentes',
      'section.newestVideos': 'Vídeos mais recentes',
      'btn.loadMore': 'Carregar mais',
      'btn.signin': 'Entrar',
      'search.placeholder': 'Pesquisar códigos JAV, modelos, títulos...',
      'footer.contact': 'Entre em contato',
      'footer.copyright': '© 2025 xPandorax.com | Todos os direitos reservados'
    },
    
    th: { // Thai
      'nav.home': 'หน้าแรก',
      'nav.categories': 'หมวดหมู่',
      'nav.videos': 'วิดีโอ',
      'nav.pictures': 'รูปภาพ',
      'nav.models': 'นางแบบ',
      'nav.producers': 'ผู้ผลิต',
      'section.bestViewed': 'ดูมากที่สุดตอนนี้',
      'section.newestImages': 'รูปภาพล่าสุด',
      'section.newestVideos': 'วิดีโอล่าสุด',
      'btn.loadMore': 'โหลดเพิ่มเติม',
      'btn.signin': 'เข้าสู่ระบบ',
      'search.placeholder': 'ค้นหารหัส JAV, นางแบบ, ชื่อเรื่อง...',
      'footer.contact': 'ติดต่อเรา',
      'footer.copyright': '© 2025 xPandorax.com | สงวนลิขสิทธิ์'
    },
    
    vi: { // Vietnamese
      'nav.home': 'Trang chủ',
      'nav.categories': 'Danh mục',
      'nav.videos': 'Video',
      'nav.pictures': 'Hình ảnh',
      'nav.models': 'Người mẫu',
      'nav.producers': 'Nhà sản xuất',
      'section.bestViewed': 'Được xem nhiều nhất hiện nay',
      'section.newestImages': 'Hình ảnh mới nhất',
      'section.newestVideos': 'Video mới nhất',
      'btn.loadMore': 'Tải thêm',
      'btn.signin': 'Đăng nhập',
      'search.placeholder': 'Tìm mã JAV, người mẫu, tiêu đề...',
      'footer.contact': 'Liên hệ chúng tôi',
      'footer.copyright': '© 2025 xPandorax.com | Đã đăng ký bản quyền'
    },
    
    'zh-TW': { // Traditional Chinese
      'nav.home': '首頁',
      'nav.categories': '分類',
      'nav.videos': '影片',
      'nav.pictures': '圖片',
      'nav.models': '模特兒',
      'nav.producers': '製作人',
      'section.bestViewed': '現在觀看最多',
      'section.newestImages': '最新圖片',
      'section.newestVideos': '最新影片',
      'btn.loadMore': '載入更多',
      'btn.signin': '登入',
      'search.placeholder': '搜尋 JAV 代碼、模特兒、標題...',
      'footer.contact': '聯絡我們',
      'footer.copyright': '© 2025 xPandorax.com | 版權所有'
    },
    
    'zh-CN': { // Simplified Chinese
      'nav.home': '首页',
      'nav.categories': '分类',
      'nav.videos': '视频',
      'nav.pictures': '图片',
      'nav.models': '模特',
      'nav.producers': '制作人',
      'section.bestViewed': '现在观看最多',
      'section.newestImages': '最新图片',
      'section.newestVideos': '最新视频',
      'btn.loadMore': '加载更多',
      'btn.signin': '登录',
      'search.placeholder': '搜索 JAV 代码、模特、标题...',
      'footer.contact': '联系我们',
      'footer.copyright': '© 2025 xPandorax.com | 版权所有'
    }
  };

  function translate(key, lang) {
    // Support both dot and underscore notation
    const normalizedKey = key.replace(/_/g, '.');
    return translations[lang]?.[normalizedKey] || translations[lang]?.[key] || translations['en'][normalizedKey] || translations['en'][key] || key;
  }

  function applyTranslations(lang) {
    // Handle data-i18n attributes
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const translated = translate(key, lang);
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.placeholder = translated;
      } else {
        el.textContent = translated;
      }
    });
    
    // Handle data-i18n-placeholder attributes
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      el.placeholder = translate(key, lang);
    });
    
    // Handle data-i18n-attr attributes for complex cases
    document.querySelectorAll('[data-i18n-attr]').forEach(el => {
      const attrMap = el.getAttribute('data-i18n-attr');
      // Format: "aria-label:location"
      const pairs = attrMap.split(',');
      pairs.forEach(pair => {
        const [attr, key] = pair.split(':');
        if (attr && key) {
          el.setAttribute(attr.trim(), translate(key.trim(), lang));
        }
      });
    });
    
    // Save language preference
    localStorage.setItem('language', lang);
  }

  function initLanguage() {
    const savedLang = localStorage.getItem('language') || 'en';
    applyTranslations(savedLang);
    
    // Update language selector
    const langSelect = document.getElementById('langSelect');
    if (langSelect) {
      langSelect.value = savedLang;
      langSelect.addEventListener('change', (e) => {
        applyTranslations(e.target.value);
      });
    }
  }

  // Export functions
  window.i18n = {
    translate,
    applyTranslations,
    init: initLanguage
  };

  // Auto-initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLanguage);
  } else {
    initLanguage();
  }
})();