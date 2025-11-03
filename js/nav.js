// Navigation and Responsive Menu Functionality
class Navigation {
    constructor() {
        this.hamburger = document.getElementById('hamburger');
        this.mobileNav = document.getElementById('mobileNav');
        this.isMenuOpen = false;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.handleResize();
    }

    setupEventListeners() {
        // Hamburger menu click
        if (this.hamburger) {
            this.hamburger.addEventListener('click', () => this.toggleMenu());
        }

        // Close menu when clicking on a link
        const mobileLinks = document.querySelectorAll('.mobile-nav-link');
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => this.closeMenu());
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (this.isMenuOpen && 
                !this.mobileNav.contains(e.target) && 
                !this.hamburger.contains(e.target)) {
                this.closeMenu();
            }
        });

        // Handle window resize
        window.addEventListener('resize', () => this.handleResize());

        // Handle escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isMenuOpen) {
                this.closeMenu();
            }
        });

        // Prevent body scroll when menu is open
        this.preventBodyScroll();
    }

    toggleMenu() {
        if (this.isMenuOpen) {
            this.closeMenu();
        } else {
            this.openMenu();
        }
    }

    openMenu() {
        this.hamburger.classList.add('active');
        this.mobileNav.classList.add('active');
        this.isMenuOpen = true;
        document.body.style.overflow = 'hidden';
    }

    closeMenu() {
        this.hamburger.classList.remove('active');
        this.mobileNav.classList.remove('active');
        this.isMenuOpen = false;
        document.body.style.overflow = '';
    }

    handleResize() {
        // Close menu and reset on larger screens
        if (window.innerWidth > 768 && this.isMenuOpen) {
            this.closeMenu();
        }
    }

    preventBodyScroll() {
        // Additional scroll prevention for mobile
        this.mobileNav.addEventListener('touchmove', (e) => {
            if (this.isMenuOpen) {
                e.preventDefault();
            }
        }, { passive: false });
    }

    // Update active navigation link
    updateActiveLink() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        
        // Update desktop nav
        const desktopLinks = document.querySelectorAll('.nav-link');
        desktopLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === currentPage) {
                link.classList.add('active');
            }
        });

        // Update mobile nav
        const mobileLinks = document.querySelectorAll('.mobile-nav-link');
        mobileLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === currentPage) {
                link.classList.add('active');
            }
        });
    }
}

// Enhanced responsive charts
class ResponsiveCharts {
    constructor() {
        this.charts = [];
        this.init();
    }

    init() {
        this.setupResizeHandler();
    }

    registerChart(chartInstance) {
        this.charts.push(chartInstance);
    }

    setupResizeHandler() {
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.charts.forEach(chart => {
                    if (chart && typeof chart.resize === 'function') {
                        chart.resize();
                    }
                });
            }, 250);
        });
    }
}

// Initialize navigation when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const navigation = new Navigation();
    const responsiveCharts = new ResponsiveCharts();
    
    // Update active links
    navigation.updateActiveLink();

    // Make responsiveCharts available globally for chart registration
    window.responsiveCharts = responsiveCharts;
});

// Touch device detection
const isTouchDevice = () => {
    return ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || 
           (navigator.msMaxTouchPoints > 0);
};

// Add touch device class for CSS targeting
if (isTouchDevice()) {
    document.documentElement.classList.add('touch-device');
} else {
    document.documentElement.classList.add('no-touch-device');
}

// Enhanced modal handling for mobile
const enhanceModalsForMobile = () => {
    const modals = document.querySelectorAll('.modal');
    
    modals.forEach(modal => {
        // Prevent background scroll when modal is open
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'style') {
                    const display = modal.style.display;
                    if (display === 'flex') {
                        document.body.style.overflow = 'hidden';
                    } else {
                        document.body.style.overflow = '';
                    }
                }
            });
        });

        observer.observe(modal, { attributes: true });
        
        // Close modal on background tap for touch devices
        modal.addEventListener('touchstart', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    });
};

// Initialize modal enhancements
document.addEventListener('DOMContentLoaded', enhanceModalsForMobile);