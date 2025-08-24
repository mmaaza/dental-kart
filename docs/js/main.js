// Main JavaScript for DK Nepal API Documentation

document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const mobileMenuToggle = document.createElement('button');
    mobileMenuToggle.className = 'mobile-menu-toggle';
    mobileMenuToggle.innerHTML = '<i class="fas fa-bars"></i>';
    document.body.appendChild(mobileMenuToggle);

    const sidebar = document.querySelector('.sidebar');
    
    mobileMenuToggle.addEventListener('click', function() {
        sidebar.classList.toggle('open');
    });

    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', function(e) {
        if (window.innerWidth <= 1024) {
            if (!sidebar.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
                sidebar.classList.remove('open');
            }
        }
    });

    // Smooth scrolling for anchor links
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

    // Add copy button to code blocks
    document.querySelectorAll('pre code').forEach(block => {
        const pre = block.parentElement;
        
        // Create a container wrapper if it doesn't exist
        if (!pre.parentElement.classList.contains('code-container')) {
            const container = document.createElement('div');
            container.className = 'code-container';
            pre.parentElement.insertBefore(container, pre);
            container.appendChild(pre);
        }
        
        const container = pre.parentElement;
        
        // Check if copy button already exists
        if (!container.querySelector('.copy-button')) {
            const copyButton = document.createElement('button');
            copyButton.className = 'copy-button';
            copyButton.innerHTML = '<i class="fas fa-copy"></i>';
            copyButton.title = 'Copy code';
            
            copyButton.addEventListener('click', async () => {
                try {
                    await navigator.clipboard.writeText(block.textContent);
                    copyButton.innerHTML = '<i class="fas fa-check"></i>';
                    copyButton.classList.add('copied');
                    
                    setTimeout(() => {
                        copyButton.innerHTML = '<i class="fas fa-copy"></i>';
                        copyButton.classList.remove('copied');
                    }, 2000);
                } catch (err) {
                    console.error('Failed to copy: ', err);
                }
            });
            
            container.appendChild(copyButton);
        }
    });

    // Syntax highlighting for code blocks
    if (typeof Prism !== 'undefined') {
        Prism.highlightAll();
    }

    // Add method badges to endpoint cards
    document.querySelectorAll('.endpoint-header .method').forEach(method => {
        const text = method.textContent.toLowerCase();
        method.className = `method ${text}`;
    });

    // Add protection level badges
    document.querySelectorAll('.endpoint-header span:last-child').forEach(badge => {
        if (badge.classList.contains('public')) {
            badge.style.backgroundColor = '#10b981';
        } else if (badge.classList.contains('protected')) {
            badge.style.backgroundColor = '#f59e0b';
        } else if (badge.classList.contains('admin')) {
            badge.style.backgroundColor = '#ef4444';
        }
    });

    // Interactive flow diagram
    const flowSteps = document.querySelectorAll('.flow-step');
    flowSteps.forEach((step, index) => {
        step.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.05)';
        });
        
        step.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
    });

    // Add search functionality to sidebar
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Search documentation...';
    searchInput.className = 'sidebar-search';
    
    const sidebarContent = document.querySelector('.sidebar-content');
    sidebarContent.insertBefore(searchInput, sidebarContent.firstChild);
    
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const navItems = document.querySelectorAll('.nav-section li a');
        
        navItems.forEach(item => {
            const text = item.textContent.toLowerCase();
            const parent = item.parentElement;
            const section = parent.closest('.nav-section');
            
            if (text.includes(searchTerm)) {
                parent.style.display = 'block';
                section.style.display = 'block';
            } else {
                parent.style.display = 'none';
            }
        });
        
        // Show/hide section headers based on visible items
        document.querySelectorAll('.nav-section').forEach(section => {
            const visibleItems = section.querySelectorAll('li[style="display: block"]');
            if (visibleItems.length === 0) {
                section.style.display = 'none';
            } else {
                section.style.display = 'block';
            }
        });
    });

    // Add table of contents for long pages
    const headings = document.querySelectorAll('h2, h3');
    if (headings.length > 3) {
        const toc = document.createElement('div');
        toc.className = 'table-of-contents';
        toc.innerHTML = '<h3>Table of Contents</h3><ul></ul>';
        
        const tocList = toc.querySelector('ul');
        headings.forEach((heading, index) => {
            const id = `heading-${index}`;
            heading.id = id;
            
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = `#${id}`;
            a.textContent = heading.textContent;
            a.style.paddingLeft = `${(heading.tagName === 'H3' ? 20 : 0)}px`;
            
            li.appendChild(a);
            tocList.appendChild(li);
        });
        
        const firstSection = document.querySelector('.content-body > section:first-child');
        if (firstSection) {
            firstSection.parentNode.insertBefore(toc, firstSection);
        }
    }

    // Add loading states to buttons
    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('click', function() {
            if (this.classList.contains('btn-primary')) {
                this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
                this.disabled = true;
                
                setTimeout(() => {
                    this.innerHTML = this.getAttribute('data-original-text') || this.innerHTML;
                    this.disabled = false;
                }, 2000);
            }
        });
    });

    // Store original button text
    document.querySelectorAll('.btn').forEach(btn => {
        btn.setAttribute('data-original-text', btn.innerHTML);
    });

    // Add keyboard navigation
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + K to focus search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            searchInput.focus();
        }
        
        // Escape to close mobile menu
        if (e.key === 'Escape' && window.innerWidth <= 1024) {
            sidebar.classList.remove('open');
        }
    });

    // Add scroll to top button
    const scrollToTopBtn = document.createElement('button');
    scrollToTopBtn.className = 'scroll-to-top';
    scrollToTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
    document.body.appendChild(scrollToTopBtn);
    
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            scrollToTopBtn.style.display = 'block';
        } else {
            scrollToTopBtn.style.display = 'none';
        }
    });
    
    scrollToTopBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // Add dark mode toggle (if user prefers dark mode)
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        const darkModeToggle = document.createElement('button');
        darkModeToggle.className = 'dark-mode-toggle';
        darkModeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        darkModeToggle.title = 'Toggle dark mode';
        
        const sidebarHeader = document.querySelector('.sidebar-header');
        sidebarHeader.appendChild(darkModeToggle);
        
        darkModeToggle.addEventListener('click', function() {
            document.body.classList.toggle('dark-mode');
            const icon = this.querySelector('i');
            if (document.body.classList.contains('dark-mode')) {
                icon.className = 'fas fa-sun';
            } else {
                icon.className = 'fas fa-moon';
            }
        });
    }

    // Add progress bar for page reading
    const progressBar = document.createElement('div');
    progressBar.className = 'reading-progress';
    document.body.appendChild(progressBar);
    
    window.addEventListener('scroll', function() {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        progressBar.style.width = scrolled + '%';
    });

    // Initialize tooltips for endpoint cards
    document.querySelectorAll('.endpoint-card').forEach(card => {
        const method = card.querySelector('.method').textContent;
        const endpoint = card.querySelector('code').textContent;
        
        card.setAttribute('title', `${method} ${endpoint}`);
    });

    // Add collapsible sections for long content
    document.querySelectorAll('section').forEach(section => {
        if (section.children.length > 5) {
            const toggleBtn = document.createElement('button');
            toggleBtn.className = 'section-toggle';
            toggleBtn.innerHTML = '<i class="fas fa-chevron-down"></i> Collapse Section';
            
            const sectionHeader = section.querySelector('h2, h3');
            if (sectionHeader) {
                sectionHeader.appendChild(toggleBtn);
                
                toggleBtn.addEventListener('click', function() {
                    const content = section.querySelectorAll('h2, h3, h4, p, pre, table, div').filter(el => 
                        el !== sectionHeader && el !== toggleBtn
                    );
                    
                    content.forEach(el => {
                        el.style.display = el.style.display === 'none' ? 'block' : 'none';
                    });
                    
                    const icon = this.querySelector('i');
                    if (content[0].style.display === 'none') {
                        icon.className = 'fas fa-chevron-right';
                        this.innerHTML = '<i class="fas fa-chevron-right"></i> Expand Section';
                    } else {
                        icon.className = 'fas fa-chevron-down';
                        this.innerHTML = '<i class="fas fa-chevron-down"></i> Collapse Section';
                    }
                });
            }
        }
    });
});

// Utility functions
window.MBNepalAPI = {
    // Format API endpoint for display
    formatEndpoint: function(method, path) {
        return `<span class="method ${method.toLowerCase()}">${method}</span><code>${path}</code>`;
    },
    
    // Generate sample data
    generateSampleData: function(type) {
        const samples = {
            product: {
                name: "Sample Product",
                description: "This is a sample product description",
                regularPrice: 1000,
                specialOfferPrice: 800,
                categories: ["category_id"],
                brand: "brand_id",
                stock: 50
            },
            user: {
                name: "John Doe",
                email: "john@example.com",
                phone: "+977-9841234567"
            },
            order: {
                items: [
                    {
                        productId: "product_id",
                        quantity: 2,
                        attributes: {
                            size: "M",
                            color: "Red"
                        }
                    }
                ],
                shippingAddress: {
                    street: "123 Main St",
                    city: "Kathmandu",
                    state: "Bagmati",
                    zipCode: "44600",
                    country: "Nepal"
                }
            }
        };
        
        return samples[type] || samples.product;
    },
    
    // Validate API response
    validateResponse: function(response) {
        if (!response.success) {
            throw new Error(response.error || 'API request failed');
        }
        return response.data;
    }
};
