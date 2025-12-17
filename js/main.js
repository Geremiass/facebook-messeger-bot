/**
 * Clínica Dentária Sorriso de Santiago
 * JavaScript Principal
 */

document.addEventListener('DOMContentLoaded', function() {
    // =====================================================
    // Mobile Navigation Toggle
    // =====================================================
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
        });

        // Close menu when clicking on a link
        const navLinks = navMenu.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
            }
        });
    }

    // =====================================================
    // Header Scroll Effect
    // =====================================================
    const header = document.getElementById('header');

    function handleScroll() {
        if (window.scrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial scroll position

    // =====================================================
    // Smooth Scrolling for Anchor Links
    // =====================================================
    const anchorLinks = document.querySelectorAll('a[href^="#"]');

    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');

            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                e.preventDefault();
                const headerHeight = header.offsetHeight;
                const targetPosition = targetElement.offsetTop - headerHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // =====================================================
    // Back to Top Button
    // =====================================================
    const backToTop = document.getElementById('backToTop');

    if (backToTop) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 500) {
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.remove('visible');
            }
        });

        backToTop.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // =====================================================
    // Contact Form Handling
    // =====================================================
    const contactForm = document.getElementById('formContacto');

    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // Get form values
            const formData = {
                nome: document.getElementById('nome').value,
                email: document.getElementById('email').value,
                telefone: document.getElementById('telefone').value,
                servico: document.getElementById('servico').value,
                mensagem: document.getElementById('mensagem').value
            };

            // Basic validation
            if (!formData.nome || !formData.email || !formData.telefone) {
                showNotification('Por favor, preencha todos os campos obrigatórios.', 'error');
                return;
            }

            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email)) {
                showNotification('Por favor, introduza um email válido.', 'error');
                return;
            }

            // Simulate form submission
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'A enviar...';
            submitBtn.disabled = true;

            // Simulate API call
            setTimeout(function() {
                showNotification('Obrigado! O seu pedido de marcação foi enviado com sucesso. Entraremos em contacto brevemente.', 'success');
                contactForm.reset();
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }, 1500);
        });
    }

    // =====================================================
    // Notification System
    // =====================================================
    function showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}</span>
                <span class="notification-message">${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;

        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            max-width: 400px;
            padding: 20px;
            background-color: ${type === 'success' ? '#00b894' : type === 'error' ? '#e74c3c' : '#0077b6'};
            color: white;
            border-radius: 12px;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;

        // Add animation styles
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from {
                    opacity: 0;
                    transform: translateX(100px);
                }
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }
            @keyframes slideOut {
                from {
                    opacity: 1;
                    transform: translateX(0);
                }
                to {
                    opacity: 0;
                    transform: translateX(100px);
                }
            }
            .notification-content {
                display: flex;
                align-items: center;
                gap: 15px;
            }
            .notification-icon {
                font-size: 1.5rem;
                font-weight: bold;
            }
            .notification-message {
                flex: 1;
                line-height: 1.5;
            }
            .notification-close {
                background: none;
                border: none;
                color: white;
                font-size: 1.5rem;
                cursor: pointer;
                opacity: 0.8;
                transition: opacity 0.3s;
            }
            .notification-close:hover {
                opacity: 1;
            }
        `;
        document.head.appendChild(style);

        // Add to DOM
        document.body.appendChild(notification);

        // Close button functionality
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', function() {
            notification.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(() => notification.remove(), 300);
        });

        // Auto-remove after 5 seconds
        setTimeout(function() {
            if (notification.parentElement) {
                notification.style.animation = 'slideOut 0.3s ease forwards';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
    }

    // =====================================================
    // Intersection Observer for Animations
    // =====================================================
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fade-in-up');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animateElements = document.querySelectorAll(
        '.servico-card, .membro-card, .testemunho-card, .info-item'
    );

    animateElements.forEach(el => {
        el.style.opacity = '0';
        observer.observe(el);
    });

    // =====================================================
    // Phone Number Formatting
    // =====================================================
    const phoneInput = document.getElementById('telefone');

    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');

            // Format for Cape Verde numbers
            if (value.length > 0) {
                if (value.startsWith('238')) {
                    // International format
                    if (value.length > 3) {
                        value = '(+' + value.substring(0, 3) + ') ' + value.substring(3, 6) + ' ' + value.substring(6, 10);
                    }
                } else {
                    // Local format
                    if (value.length > 3) {
                        value = value.substring(0, 3) + ' ' + value.substring(3, 7);
                    }
                }
            }

            e.target.value = value;
        });
    }

    // =====================================================
    // Active Navigation Link Highlighting
    // =====================================================
    const sections = document.querySelectorAll('section[id]');
    const navLinksHighlight = document.querySelectorAll('.nav-link:not(.btn-agendar)');

    function highlightNavLink() {
        const scrollPos = window.scrollY + 200;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                navLinksHighlight.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === '#' + sectionId) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    window.addEventListener('scroll', highlightNavLink);

    // =====================================================
    // Service Cards Hover Effect Enhancement
    // =====================================================
    const serviceCards = document.querySelectorAll('.servico-card');

    serviceCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.borderColor = 'var(--primary-color)';
        });

        card.addEventListener('mouseleave', function() {
            this.style.borderColor = 'transparent';
        });
    });

    // =====================================================
    // Lazy Loading for Images (if any are added)
    // =====================================================
    if ('loading' in HTMLImageElement.prototype) {
        const images = document.querySelectorAll('img[loading="lazy"]');
        images.forEach(img => {
            img.src = img.dataset.src;
        });
    }

    // =====================================================
    // Keyboard Navigation Accessibility
    // =====================================================
    document.addEventListener('keydown', function(e) {
        // Close mobile menu on Escape
        if (e.key === 'Escape' && navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
        }
    });

    // =====================================================
    // Console Welcome Message
    // =====================================================
    console.log('%c🦷 Clínica Dentária Sorriso de Santiago', 'font-size: 20px; font-weight: bold; color: #0077b6;');
    console.log('%cPraia, Santiago - Cabo Verde', 'font-size: 14px; color: #636e72;');
    console.log('%cSite desenvolvido com ❤️', 'font-size: 12px; color: #00b894;');
});
