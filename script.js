// Skylar Solutions - Main JavaScript

// Check WebP support
function checkWebpSupport() {
  const canvas = typeof document === 'object' ? document.createElement('canvas') : {};
  canvas.width = canvas.height = 1;
  return canvas.toDataURL && canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
}

// Set WebP support CSS class on the HTML element
document.documentElement.className += checkWebpSupport() ? ' webp' : ' no-webp';

// Helper function to replace images with WebP versions where available
function replaceWithWebpImage() {
  if(!checkWebpSupport()) return; // Skip if WebP is not supported
  
  const images = document.querySelectorAll('img[data-src-webp]');
  images.forEach(img => {
    const webpSrc = img.getAttribute('data-src-webp');
    if (webpSrc) {
      img.src = webpSrc;
      
      // If there's a srcset attribute, update that too if there's a webp version
      const webpSrcset = img.getAttribute('data-srcset-webp');
      if (webpSrcset) {
        img.srcset = webpSrcset;
      }
    }
  });
}

document.addEventListener('DOMContentLoaded', function() {
  // Replace images with WebP versions if supported
  replaceWithWebpImage();
  // Language switcher
  const languageSwitcher = document.querySelector('.language-switcher');
  const langToggleBtn = document.getElementById('lang-toggle');
  
  if (languageSwitcher) {
    const currentLanguage = localStorage.getItem('language') || 'en';
    document.documentElement.setAttribute('lang', currentLanguage);
    
    // Set the initial active language
    document.querySelectorAll('.language-switcher a').forEach(link => {
      if (link.getAttribute('data-lang') === currentLanguage) {
        link.classList.add('active');
      }
    });
    
    // Show content for current language
    toggleLanguageContent(currentLanguage);
    
    // Add event listeners to language switcher links
    document.querySelectorAll('.language-switcher a').forEach(link => {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        const lang = this.getAttribute('data-lang');
        localStorage.setItem('language', lang);
        document.documentElement.setAttribute('lang', lang);
        
        // Update active class on language links
        document.querySelectorAll('.language-switcher a').forEach(l => {
          l.classList.remove('active');
        });
        this.classList.add('active');
        
        // Toggle content
        toggleLanguageContent(lang);
      });
    });
  }
  
  // Language toggle button (alternative implementation)
  if (langToggleBtn) {
    const currentLanguage = localStorage.getItem('language') || 'en';
    document.documentElement.setAttribute('lang', currentLanguage);
    
    // Set the initial button text based on current language
    langToggleBtn.textContent = currentLanguage === 'en' ? 'FR' : 'EN';
    langToggleBtn.setAttribute('data-lang', currentLanguage);
    
    // Show content for current language
    toggleLanguageContent(currentLanguage);
    
    langToggleBtn.addEventListener('click', function() {
      const currentLang = this.getAttribute('data-lang');
      const newLang = currentLang === 'en' ? 'fr' : 'en';
      
      // Update button text and data attribute
      this.textContent = newLang === 'en' ? 'FR' : 'EN';
      this.setAttribute('data-lang', newLang);
      
      // Update html lang attribute and localStorage
      document.documentElement.setAttribute('lang', newLang);
      localStorage.setItem('language', newLang);
      
      // Toggle content
      toggleLanguageContent(newLang);
      
      // Force re-render of language-specific elements
      document.body.style.display = 'none';
      document.body.offsetHeight; // Force reflow
      document.body.style.display = '';
    });
  }
  
  // Function to show/hide content based on language
  function toggleLanguageContent(lang) {
    // Update html lang attribute
    document.documentElement.setAttribute('lang', lang);
    
    // Force re-render to ensure proper display
    document.body.style.display = 'none';
    document.body.offsetHeight; // Force reflow
    document.body.style.display = '';
    
    // Update language toggle button text if it exists
    const langToggleBtn = document.getElementById('lang-toggle');
    if (langToggleBtn) {
        langToggleBtn.textContent = lang === 'en' ? 'FR' : 'EN';
        langToggleBtn.setAttribute('data-lang', lang);
    }
    
    // Save language preference
    localStorage.setItem('language', lang);
  }
  
  // Initialize language on page load
  const savedLanguage = localStorage.getItem('language') || 'en';
  toggleLanguageContent(savedLanguage);
  
  // Mobile Navigation Toggle
  const navbarToggle = document.querySelector('.navbar-toggle');
  const navbar = document.querySelector('.navbar');

  if (navbarToggle) {
    navbarToggle.addEventListener('click', function() {
      navbar.classList.toggle('active');
      navbarToggle.classList.toggle('active');
    });
  }
  
  // Dropdown menu toggle for mobile
  const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
  
  dropdownToggles.forEach(toggle => {
    toggle.addEventListener('click', function(e) {
      if (window.innerWidth <= 1024) {
        e.preventDefault();
        const parent = this.parentElement;
        parent.classList.toggle('active');
      }
    });
  });

  // Enhanced Smooth scrolling for anchor links with easing
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        // Enhanced smooth scroll with custom easing
        const startPosition = window.pageYOffset;
        const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - 80;
        const distance = targetPosition - startPosition;
        const duration = 1000; // ms
        let start = null;
        
        // Add a subtle scroll animation
        function step(timestamp) {
          if (!start) start = timestamp;
          const progress = timestamp - start;
          const easeInOutQuad = t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; // Smoother easing function
          
          // Calculate current position
          const percentage = Math.min(progress / duration, 1);
          const easing = easeInOutQuad(percentage);
          const position = startPosition + distance * easing;
          
          window.scrollTo(0, position);
          
          // Continue animation if not done
          if (progress < duration) {
            window.requestAnimationFrame(step);
          }
        }
        
        window.requestAnimationFrame(step);
        
        // Close mobile menu if open
        navbar.classList.remove('active');
      }
    });
  });

  // Add active class to navigation based on current page
  const currentPage = window.location.pathname.split('/').pop();
  const navLinks = document.querySelectorAll('.navbar a');
  
  navLinks.forEach(link => {
    const linkHref = link.getAttribute('href');
    if (linkHref === currentPage || 
        (currentPage === '' && linkHref === 'index.html') || 
        (currentPage === 'index.html' && linkHref === 'index.html')) {
      link.classList.add('active');
    }
  });

  // Contact form validation
  const contactForm = document.querySelector('.contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Simple validation
      let isValid = true;
      const requiredFields = contactForm.querySelectorAll('[required]');
      
      requiredFields.forEach(field => {
        if (!field.value.trim()) {
          isValid = false;
          field.classList.add('error');
        } else {
          field.classList.remove('error');
        }
      });
      
      // Email validation
      const emailField = contactForm.querySelector('input[type="email"]');
      if (emailField && emailField.value) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(emailField.value)) {
          isValid = false;
          emailField.classList.add('error');
        }
      }
      
      if (isValid) {
        // In a real implementation, you would send the form data to a server
        alert('Thank you for your message. We will get back to you soon!');
        contactForm.reset();
      } else {
        alert('Please fill in all required fields correctly.');
      }
    });
  }

  // Animation on scroll with improved performance
  const animateElements = document.querySelectorAll('.animate');
  
  function checkIfInView() {
    const windowHeight = window.innerHeight;
    
    animateElements.forEach(element => {
      const elementPosition = element.getBoundingClientRect().top;
      
      if (elementPosition < windowHeight - 100) {
        element.classList.add('animate-visible');
      }
    });
  }
  
  // Check elements on load
  checkIfInView();
  
  // Debounced scroll event listener for better performance
  let scrollTimeout;
  window.addEventListener('scroll', function() {
    if (scrollTimeout) {
      window.cancelAnimationFrame(scrollTimeout);
    }
    
    scrollTimeout = window.requestAnimationFrame(function() {
      checkIfInView();
    });
  });
  
  // Add parallax effect to hero section
  const heroSection = document.querySelector('.home-hero');
  const heroImage = document.querySelector('.hero-image img');
  
  if (heroSection && heroImage) {
    window.addEventListener('scroll', function() {
      const scrollPosition = window.pageYOffset;
      const scrollSpeed = 0.5; // Adjust for desired parallax intensity
      
      // Only apply parallax if section is in view
      if (scrollPosition < heroSection.offsetHeight) {
        // Move the hero image slightly when scrolling
        heroImage.style.transform = `translateY(${scrollPosition * scrollSpeed}px)`;
        
        // Add a subtle opacity fade effect
        const opacity = 1 - (scrollPosition / heroSection.offsetHeight) * 0.5;
        heroImage.style.opacity = Math.max(opacity, 0.5);
      }
    });
  }
  
  // Add smooth hover effects for interactive elements
  const interactiveElements = document.querySelectorAll('.btn, .service-card, .blog-card, .testimonial-card');
  
  interactiveElements.forEach(element => {
    element.addEventListener('mouseenter', function() {
      element.style.transition = 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    });
    
    element.addEventListener('mouseleave', function() {
      element.style.transition = 'all 0.3s ease';
    });
  });
  
  // Enhanced header scroll effect with blur
  const header = document.querySelector('.header');
  let lastScrollTop = 0;
  
  window.addEventListener('scroll', function() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    if (scrollTop > 50) {
      header.classList.add('scrolled');
      
      // Add blur effect based on scroll amount
      const blurAmount = Math.min(scrollTop / 200, 10); // Max 10px blur
      header.style.backdropFilter = `blur(${blurAmount}px)`;
      header.style.webkitBackdropFilter = `blur(${blurAmount}px)`;
      
      // Slightly adjust background opacity based on scroll
      const bgOpacity = Math.min(0.9, 0.7 + (scrollTop / 1000));
      header.style.backgroundColor = `rgba(255, 255, 255, ${bgOpacity})`;
    } else {
      header.classList.remove('scrolled');
      header.style.backdropFilter = 'blur(0px)';
      header.style.webkitBackdropFilter = 'blur(0px)';
      header.style.backgroundColor = 'rgba(255, 255, 255, 1)';
    }
    
    // Add subtle shadow based on scroll
    const shadowOpacity = Math.min(0.15, scrollTop / 500);
    header.style.boxShadow = `0 4px 20px rgba(0, 0, 0, ${shadowOpacity})`;
    
    lastScrollTop = scrollTop;
  });
  
  // Back to top button
  const backToTopButton = document.querySelector('.back-to-top');
  
  if (backToTopButton) {
    window.addEventListener('scroll', function() {
      if (window.pageYOffset > 300) {
        backToTopButton.classList.add('visible');
      } else {
        backToTopButton.classList.remove('visible');
      }
    });
    
    backToTopButton.addEventListener('click', function(e) {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
  
  // Testimonial slider logic
  const testimonialSlider = document.querySelector('.testimonial-slider');
  if (testimonialSlider) {
    const testimonials = testimonialSlider.querySelectorAll('.testimonial');
    const prevBtn = testimonialSlider.querySelector('.slider-prev');
    const nextBtn = testimonialSlider.querySelector('.slider-next');
    let currentIndex = 0;
    
    // Function to show specific testimonial
    function showTestimonial(index) {
      testimonials.forEach((testimonial, i) => {
        if (i === index) {
          testimonial.classList.add('active');
        } else {
          testimonial.classList.remove('active');
        }
      });
    }
    
    // Initialize: show first testimonial
    showTestimonial(currentIndex);
    
    // Event listeners for slider buttons
    if (nextBtn) {
      nextBtn.addEventListener('click', function() {
        currentIndex = (currentIndex + 1) % testimonials.length;
        showTestimonial(currentIndex);
      });
    }
    
    if (prevBtn) {
      prevBtn.addEventListener('click', function() {
        currentIndex = (currentIndex - 1 + testimonials.length) % testimonials.length;
        showTestimonial(currentIndex);
      });
    }
    
    // Auto slide every 5 seconds
    setInterval(function() {
      currentIndex = (currentIndex + 1) % testimonials.length;
      showTestimonial(currentIndex);
    }, 5000);
  }
  
  // FAQ toggle logic
  const faqItems = document.querySelectorAll('.faq-item');
  if (faqItems.length > 0) {
    faqItems.forEach(item => {
      const question = item.querySelector('.faq-question');
      const answer = item.querySelector('.faq-answer');
      
      question.addEventListener('click', function() {
        // Toggle the current item
        const isActive = item.classList.contains('active');
        
        // Optional: close other open FAQ items
        faqItems.forEach(otherItem => {
          if (otherItem !== item && otherItem.classList.contains('active')) {
            otherItem.classList.remove('active');
            otherItem.querySelector('.faq-answer').style.maxHeight = '0';
          }
        });
        
        // Toggle the current item
        if (isActive) {
          item.classList.remove('active');
          answer.style.maxHeight = '0';
        } else {
          item.classList.add('active');
          answer.style.maxHeight = answer.scrollHeight + 'px';
        }
      });
    });
  }
});