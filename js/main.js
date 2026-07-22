// Theme Toggle
function toggleTheme() {
    const body = document.body;
    const icon = document.getElementById('theme-icon');
    const current = body.getAttribute('data-theme');
    
    if (current === 'light') {
        body.removeAttribute('data-theme');
        icon.className = 'fas fa-moon';
        localStorage.setItem('theme', 'dark');
    } else {
        body.setAttribute('data-theme', 'light');
        icon.className = 'fas fa-sun';
        localStorage.setItem('theme', 'light');
    }
}

// Load saved theme
window.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.body.setAttribute('data-theme', 'light');
        document.getElementById('theme-icon').className = 'fas fa-sun';
    }
});

// Smooth Scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Fade In Animation
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

// Counter Animation
const speed = 200;

const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const counter = entry.target;
            const target = +counter.getAttribute('data-target');
            const increment = target / speed;
            
            let current = 0;
            const updateCounter = () => {
                current += increment;
                if (current < target) {
                    counter.innerText = Math.ceil(current);
                    requestAnimationFrame(updateCounter);
                } else {
                    counter.innerText = target;
                }
            };
            updateCounter();
            counterObserver.unobserve(counter);
        }
    });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-number').forEach(counter => counterObserver.observe(counter));

// Form Handler
function handleSubmit(e) {
    e.preventDefault();
    alert('پیام شما دریافت شد! به زودی با شما تماس می‌گیریم.');
    e.target.reset();
}

// Load content from JSON
async function loadContent() {
    try {
        const response = await fetch('data/content.json');
        const data = await response.json();
        
        // Update contact info
        document.querySelectorAll('.contact-item').forEach((item, index) => {
            if (data.contact[index]) {
                item.querySelector('h4').textContent = data.contact[index].title;
                item.querySelector('p').textContent = data.contact[index].value;
            }
        });
        
        // Update testimonials
        const testimonialCards = document.querySelectorAll('.testimonial-card');
        data.testimonials.forEach((t, index) => {
            if (testimonialCards[index]) {
                testimonialCards[index].querySelector('.testimonial-text').textContent = t.text;
                testimonialCards[index].querySelector('.testimonial-name').textContent = t.name;
                testimonialCards[index].querySelector('.testimonial-role').textContent = t.role;
            }
        });
        
        // Update working hours
        const hoursItems = document.querySelectorAll('.hours-item');
        data.workingHours.forEach((h, index) => {
            if (hoursItems[index]) {
                hoursItems[index].querySelector('.day').textContent = h.day;
                hoursItems[index].querySelector('.time').textContent = h.time;
            }
        });
        
    } catch (error) {
        console.log('Using default content');
    }
}

// Load content when page loads
window.addEventListener('DOMContentLoaded', loadContent);