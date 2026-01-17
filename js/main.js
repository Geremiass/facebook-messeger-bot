/* ============================================
   Prismidia - Main JavaScript
   ============================================ */

// ==================== DOM Elements ====================
const header = document.getElementById('header');
const navMenu = document.getElementById('nav-menu');
const navToggle = document.getElementById('nav-toggle');
const navClose = document.getElementById('nav-close');
const navLinks = document.querySelectorAll('.nav__link');
const contactForm = document.getElementById('contact-form');
const sections = document.querySelectorAll('section[id]');

// ==================== Mobile Navigation ====================
// Show menu
if (navToggle) {
    navToggle.addEventListener('click', () => {
        navMenu.classList.add('show-menu');
    });
}

// Hide menu
if (navClose) {
    navClose.addEventListener('click', () => {
        navMenu.classList.remove('show-menu');
    });
}

// Close menu when clicking on nav links
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('show-menu');
    });
});

// ==================== Header Scroll Effect ====================
function scrollHeader() {
    if (window.scrollY >= 50) {
        header.style.background = 'rgba(15, 15, 35, 0.98)';
        header.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.1)';
    } else {
        header.style.background = 'rgba(15, 15, 35, 0.9)';
        header.style.boxShadow = 'none';
    }
}

window.addEventListener('scroll', scrollHeader);

// ==================== Active Link on Scroll ====================
function scrollActive() {
    const scrollY = window.scrollY;

    sections.forEach(current => {
        const sectionHeight = current.offsetHeight;
        const sectionTop = current.offsetTop - 100;
        const sectionId = current.getAttribute('id');
        const navLink = document.querySelector(`.nav__link[href="#${sectionId}"]`);

        if (navLink) {
            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                navLink.classList.add('active');
            } else {
                navLink.classList.remove('active');
            }
        }
    });
}

window.addEventListener('scroll', scrollActive);

// ==================== Smooth Scroll ====================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();

        const targetId = this.getAttribute('href');
        if (targetId === '#') return;

        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            const headerOffset = 80;
            const elementPosition = targetElement.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.scrollY - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// ==================== Intersection Observer for Animations ====================
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
};

const animateOnScroll = (entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate');
            observer.unobserve(entry.target);
        }
    });
};

const observer = new IntersectionObserver(animateOnScroll, observerOptions);

// Observe elements for animation
document.querySelectorAll('.service__card, .benefit__card, .testimonial__card, .step, .integration__logo, .contact__card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// Add animate class styles
document.head.insertAdjacentHTML('beforeend', `
    <style>
        .animate {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
    </style>
`);

// ==================== Contact Form Handling ====================
if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
        e.preventDefault();

        // Get form data
        const formData = new FormData(this);
        const data = Object.fromEntries(formData);

        // Simple validation
        if (!data.name || !data.email || !data.message) {
            showNotification('Por favor, preencha todos os campos obrigatórios.', 'error');
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            showNotification('Por favor, insira um e-mail válido.', 'error');
            return;
        }

        // Simulate form submission
        const submitBtn = this.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
        submitBtn.disabled = true;

        // Simulate API call
        setTimeout(() => {
            showNotification('Mensagem enviada com sucesso! Entraremos em contato em breve.', 'success');
            this.reset();
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }, 2000);
    });
}

// ==================== Newsletter Form ====================
const newsletterForm = document.querySelector('.newsletter__form');
if (newsletterForm) {
    newsletterForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const emailInput = this.querySelector('.newsletter__input');
        const email = emailInput.value.trim();

        if (!email) {
            showNotification('Por favor, insira seu e-mail.', 'error');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showNotification('Por favor, insira um e-mail válido.', 'error');
            return;
        }

        // Simulate subscription
        showNotification('Inscrição realizada com sucesso! Você receberá nossas novidades.', 'success');
        emailInput.value = '';
    });
}

// ==================== Notification System ====================
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification--${type}`;
    notification.innerHTML = `
        <div class="notification__content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        </div>
        <button class="notification__close"><i class="fas fa-times"></i></button>
    `;

    // Add styles
    const styles = `
        <style>
            .notification {
                position: fixed;
                top: 100px;
                right: 20px;
                max-width: 400px;
                padding: 1rem 1.5rem;
                background: #1a1a2e;
                border-radius: 10px;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
                z-index: 9999;
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 1rem;
                animation: slideIn 0.3s ease;
                border-left: 4px solid;
            }
            .notification--success {
                border-color: #14b8a6;
            }
            .notification--error {
                border-color: #ef4444;
            }
            .notification--info {
                border-color: #6366f1;
            }
            .notification__content {
                display: flex;
                align-items: center;
                gap: 0.75rem;
            }
            .notification--success i {
                color: #14b8a6;
            }
            .notification--error i {
                color: #ef4444;
            }
            .notification--info i {
                color: #6366f1;
            }
            .notification__close {
                background: none;
                border: none;
                color: #71717a;
                cursor: pointer;
                padding: 0.25rem;
                transition: color 0.3s;
            }
            .notification__close:hover {
                color: #fff;
            }
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            @keyframes slideOut {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
        </style>
    `;

    // Add styles to head (only once)
    if (!document.querySelector('#notification-styles')) {
        const styleElement = document.createElement('div');
        styleElement.id = 'notification-styles';
        styleElement.innerHTML = styles;
        document.head.appendChild(styleElement);
    }

    // Add to DOM
    document.body.appendChild(notification);

    // Close button functionality
    const closeBtn = notification.querySelector('.notification__close');
    closeBtn.addEventListener('click', () => {
        notification.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => notification.remove(), 300);
    });

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// ==================== Counter Animation ====================
function animateCounter(element, target, duration = 2000) {
    let start = 0;
    const increment = target / (duration / 16);

    function updateCounter() {
        start += increment;
        if (start < target) {
            element.textContent = Math.floor(start).toLocaleString() + (element.dataset.suffix || '');
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = target.toLocaleString() + (element.dataset.suffix || '');
        }
    }

    updateCounter();
}

// Observe stats for counter animation
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const statNumbers = entry.target.querySelectorAll('.hero__stat-number');
            statNumbers.forEach(stat => {
                const text = stat.textContent;
                let target = parseInt(text.replace(/[^0-9]/g, ''));
                let suffix = '';

                if (text.includes('k')) {
                    suffix = 'k+';
                } else if (text.includes('+')) {
                    suffix = '+';
                }

                stat.dataset.suffix = suffix;
                animateCounter(stat, target);
            });
            statsObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

const heroStats = document.querySelector('.hero__stats');
if (heroStats) {
    statsObserver.observe(heroStats);
}

// ==================== Typing Effect for Hero Title ====================
function typeEffect(element, text, speed = 100) {
    let i = 0;
    element.textContent = '';

    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }

    type();
}

// ==================== Parallax Effect for Background Shapes ====================
document.addEventListener('mousemove', (e) => {
    const shapes = document.querySelectorAll('.shape');
    const x = e.clientX / window.innerWidth;
    const y = e.clientY / window.innerHeight;

    shapes.forEach((shape, index) => {
        const speed = (index + 1) * 20;
        const xOffset = (x - 0.5) * speed;
        const yOffset = (y - 0.5) * speed;
        shape.style.transform = `translate(${xOffset}px, ${yOffset}px)`;
    });
});

// ==================== Service Card Hover Effect ====================
const serviceCards = document.querySelectorAll('.service__card');
serviceCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
    });
});

// ==================== Scroll to Top Button ====================
const scrollTopBtn = document.createElement('button');
scrollTopBtn.className = 'scroll-top';
scrollTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
scrollTopBtn.setAttribute('aria-label', 'Scroll to top');
document.body.appendChild(scrollTopBtn);

// Add styles for scroll top button
document.head.insertAdjacentHTML('beforeend', `
    <style>
        .scroll-top {
            position: fixed;
            bottom: 30px;
            right: 30px;
            width: 50px;
            height: 50px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #6366f1 0%, #ec4899 100%);
            border: none;
            border-radius: 50%;
            color: #fff;
            font-size: 1.25rem;
            cursor: pointer;
            opacity: 0;
            visibility: hidden;
            transform: translateY(20px);
            transition: all 0.3s ease;
            z-index: 999;
            box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
        }
        .scroll-top.show {
            opacity: 1;
            visibility: visible;
            transform: translateY(0);
        }
        .scroll-top:hover {
            transform: translateY(-5px);
            box-shadow: 0 6px 25px rgba(99, 102, 241, 0.5);
        }
    </style>
`);

// Show/hide scroll top button
window.addEventListener('scroll', () => {
    if (window.scrollY > 500) {
        scrollTopBtn.classList.add('show');
    } else {
        scrollTopBtn.classList.remove('show');
    }
});

// Scroll to top functionality
scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// ==================== Preloader ====================
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
});

// ==================== Console Easter Egg ====================
console.log(`
%c🚀 Prismidia
%cTransformando negócios através da automação inteligente com n8n

Interessado em trabalhar conosco?
Visite: prismidia.cv/carreiras
`,
'font-size: 24px; font-weight: bold; color: #6366f1;',
'font-size: 14px; color: #a1a1aa;'
);

// ==================== Initialize ====================
document.addEventListener('DOMContentLoaded', () => {
    // Set initial header state
    scrollHeader();

    // Set initial active link
    scrollActive();

    // Add loaded class for animations
    document.body.classList.add('js-loaded');
});
