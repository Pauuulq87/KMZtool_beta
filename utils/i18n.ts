export type Language = 'en' | 'zh-TW';

export const translations = {
    'en': {
        // Map Controls
        'undo': 'Undo',
        'redo': 'Redo',
        'reset': 'Reset',

        // Sidebar
        'polygon': 'Polygon',
        'rectangle': 'Rectangle',
        'circle': 'Circle',

        // Properties Panel
        'quality_path': 'Quality & Path',
        'overlap_spacing': 'Overlap (Spacing)',
        'fast_low_overlap': 'Fast (Low Overlap)',
        'high_quality': 'High Quality',
        'estimated_time': 'Est. Time',
        'path_spacing': 'Path Spacing',
        'max': 'Max',
        'rotate_path': 'Rotate Path',
        'vertical': 'Vertical (0°)',
        'full_rotation': 'Full Rotation (360°)',
        'overlap_spacing_desc': 'Overlap and spacing are synchronized. Path is recalculated instantly. 0°-360° rotation adjusts scan direction.',

        // Disclaimer / Footer
        'advanced_options_notice': 'For advanced camera and path settings, please adjust manually in the DJI Fly app after importing.',
        'footer_text': '2025–KMZtool beta by Pauuulq87\nNot Affiliated or Endorsed By DJI\nFly With Caution and At Your Own Risk',

        // Download
        'download_save': 'Download',
        'download_kmz': 'Download KMZ',
        'download_desc': 'Download the final DJI .KMZ file',

        // Header
        'brand_name': '.KMZtool',
        'beta': 'beta',
    },
    'zh-TW': {
        // Map Controls
        'undo': '復原',
        'redo': '重做',
        'reset': '重置',

        // Sidebar
        'polygon': '多邊形',
        'rectangle': '矩形',
        'circle': '圓形',

        // Properties Panel
        'quality_path': '品質與路徑',
        'overlap_spacing': '重疊率 (路徑間距)',
        'fast_low_overlap': '快速 (低重疊)',
        'high_quality': '高品質 (高重疊)',
        'estimated_time': '預估時間',
        'path_spacing': '路徑間距',
        'max': '上限',
        'rotate_path': '旋轉路徑',
        'vertical': '直向 (0°)',
        'full_rotation': '完整旋轉 (360°)',
        'overlap_spacing_desc': '重疊率與間距同步變化，並會即時重算路徑；旋轉角度 0°~360° 微調掃描方向。',

        // Disclaimer / Footer
        'advanced_options_notice': '相機以及路徑等詳細進階選項，請在匯入DJI之後使用DJI Fly app進行手動調整',
        'footer_text': '2025–KMZtool beta by Pauuulq87\nNot Affiliated or Endorsed By DJI\nFly With Caution and At Your Own Risk',

        // Download
        'download_save': '下載',
        'download_kmz': '下載 KMZ',
        'download_desc': '下載最終的 DJI .KMZ 檔案',

        // Header
        'brand_name': '.KMZtool',
        'beta': 'beta',
    }
};

export const getBrowserLanguage = (): Language => {
    const lang = navigator.language;
    if (lang.toLowerCase().includes('zh')) {
        return 'zh-TW';
    }
    return 'en';
};
