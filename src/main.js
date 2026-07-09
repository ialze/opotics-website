import './style.css'

// Initialize Lucide Icons
lucide.createIcons();

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Intersection Observer for fade-in animations
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
};

const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.animate-up, .fade-in').forEach(el => {
    observer.observe(el);
});

// Handle Contact Form Submission to Netlify
const contactForm = document.getElementById('contactForm');
const formStatus = document.getElementById('formStatus');

if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Disable button during submission
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerText;
        submitBtn.innerText = 'Sending...';
        submitBtn.disabled = true;

        const formData = new FormData(contactForm);

        fetch("/", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams(formData).toString(),
        })
        .then(() => {
            contactForm.reset();
            formStatus.innerText = 'Thank you! Your message has been sent successfully.';
            formStatus.classList.add('success');
            formStatus.style.color = '#00ff88';
        })
        .catch((error) => {
            formStatus.innerText = 'Oops! There was a problem submitting your form.';
            formStatus.classList.remove('success');
            formStatus.style.color = '#ff4444';
        })
        .finally(() => {
            submitBtn.innerText = originalText;
            submitBtn.disabled = false;
            
            setTimeout(() => {
                formStatus.innerText = '';
                formStatus.classList.remove('success');
            }, 5000);
        });
    });
}
