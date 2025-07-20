import React, { useEffect } from 'react';

const HeroBanner = () => (
    <section className="hero-banner">
        <img src="https://www.pngall.com/wp-content/uploads/17/Mysterious-Night-Tree-Surrounded-By-Mist-PNG.png" className="tree-bg tree-bg-left" alt="left tree" />
        <img src="https://static.vecteezy.com/system/resources/thumbnails/047/592/171/small_2x/realistic-tree-silhouette-isolated-on-transparent-background-with-clipping-path-and-alpha-channel-png.png" className="tree-bg tree-bg-right" alt="right tree" />
        <img src="https://www.pngall.com/wp-content/uploads/17/Mysterious-Night-Tree-Surrounded-By-Mist-PNG.png" className="tree-bg tree-bg-middle" alt="middle tree" />
        <img src="https://static.vecteezy.com/system/resources/thumbnails/047/592/171/small_2x/realistic-tree-silhouette-isolated-on-transparent-background-with-clipping-path-and-alpha-channel-png.png" className="tree-bg tree-bg-far-left" alt="far left tree" />
        <img src="https://www.pngall.com/wp-content/uploads/17/Mysterious-Night-Tree-Surrounded-By-Mist-PNG.png" className="tree-bg tree-bg-far-right" alt="far right tree" />
        <img src="https://gallery.yopriceville.com/var/resizes/Free-Clipart-Pictures/Sun-and-Moon-PNG/Moon_Transparent_PNG_Clip_Art-639687983.png?m=1629833467" className="crescent-moon" alt="crescent moon" />
        <div className="auth-buttons">
            <a href="/login" className="auth-button">Login</a>
            <a href="/register" className="auth-button">Create Account</a>
        </div>
        <div className="hero-content">
            <h1 className="hero-heading">FOCUS</h1>
            <a href="#services" className="hero-button">SEE MORE</a>
        </div>
    </section>
);

const ServicesSection = () => (
    <section className="services-section">
        <div className="services-container">
            <div className="services-header">
                <h2 className="services-title">Master Your Studies</h2>
                <p className="services-description">
                    Elevate your learning with our powerful study tools. Dive into a vast question bank, sharpen your skills with mock and practice exams, or push your limits with our fast-paced Blitz Exam—all enhanced by our curated collection of calming, brain-boosting music to supercharge your productivity.
                </p>
                <a href="#products" className="services-learn-btn">LEARN MORE</a>
            </div>
            <div className="services-swiper">
                <div className="services-grid" id="servicesGrid">
                    <div className="service-pod">
                        <div className="service-image">
                            <span>📚</span>
                        </div>
                        <div className="service-content">
                            <h3 className="service-title">Question Bank</h3>
                            <p>Explore thousands of questions to build your knowledge</p>
                        </div>
                    </div>
                    <div className="service-pod">
                        <div className="service-image">
                            <span>📝</span>
                        </div>
                        <div className="service-content">
                            <h3 className="service-title">Mock Exam</h3>
                            <p>Simulate real exam conditions to prepare effectively</p>
                        </div>
                    </div>
                    <div className="service-pod">
                        <div className="service-image">
                            <span>✍️</span>
                        </div>
                        <div className="service-content">
                            <h3 className="service-title">Practice Exam</h3>
                            <p>Hone your skills with targeted practice sessions</p>
                        </div>
                    </div>
                    <div className="service-pod">
                        <div className="service-image">
                            <span>⚡</span>
                        </div>
                        <div className="service-content">
                            <h3 className="service-title">Blitz Exam</h3>
                            <p>Test your speed and accuracy under pressure</p>
                        </div>
                    </div>
                    <div className="service-pod">
                        <div className="service-image">
                            <span>🎵</span>
                        </div>
                        <div className="service-content">
                            <h3 className="service-title">Music Collection</h3>
                            <p>Curated tracks to boost focus and productivity</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
);

const ProductCollection = () => (
    <section className="collection-section" id="products">
        <div className="collection-container">
            <h2 className="collection-title">The Premium Collection</h2>
            <div className="swiper-container">
                <div className="product-grid" id="productGrid"></div>
            </div>
        </div>
    </section>
);

const HeroSlideSection = () => (
    <section className="hero-slide-section">
        <div className="hero-slide-content">
            <h2 className="hero-slide-title">Boost Your Exam Success!</h2>
            <p className="hero-slide-subtitle">Access our powerful study tools to ace your exams with confidence.</p>
            <a href="#" className="hero-slide-btn">Learn More</a>
        </div>
    </section>
);

const Home = () => {
    useEffect(() => {
        // Function to generate product card HTML with emoji
        function createProductCard(songName, emoji) {
            return `
                <div class="product-card">
                    <div class="product-image">
                        <span><span class="emoji">${emoji}</span>${songName}</span>
                    </div>
                </div>
            `;
        }

        // Default song names with corresponding emojis for fallback
        const defaultSongs = [
            { name: "Moonlight Sonata", emoji: "🌿" },
            { name: "Starry Night Serenade", emoji: "🌸" },
            { name: "Twilight Melody", emoji: "🌱" },
            { name: "Lunar Rhapsody", emoji: "🍃" },
            { name: "Midnight Harmony", emoji: "🌺" }
        ];

        // Function to populate product grid
        async function populateProductGrid() {
            const productGrid = document.getElementById('productGrid');
            
            try {
                const response = await fetch('/api/songs');
                if (!response.ok) throw new Error('Failed to fetch songs');
                const songs = await response.json();
                productGrid.innerHTML = songs.map(song => createProductCard(song.name, song.emoji || "🌿")).join('');
            } catch (error) {
                console.error('Error fetching songs:', error);
                productGrid.innerHTML = defaultSongs.map(song => createProductCard(song.name, song.emoji)).join('');
            }

            const cards = document.querySelectorAll('.product-card');
            let currentIndex = 0;
            const totalCards = cards.length;

            function slideProducts() {
                if (totalCards > 2) {
                    currentIndex = (currentIndex + 1) % (totalCards - 2);
                    const translateX = currentIndex * -33.333;
                    productGrid.style.transform = `translateX(${translateX}%)`;
                }
            }

            setInterval(slideProducts, 3000);
            cards.forEach(card => observer.observe(card));
        }

        // Auto-scroll for services grid
        const servicesGrid = document.getElementById('servicesGrid');
        const servicePods = document.querySelectorAll('.service-pod');
        const totalPods = servicePods.length;
        let currentIndex = 0;

        function slideServices() {
            if (totalPods > 2) {
                currentIndex = (currentIndex + 1) % (totalPods - 2);
                const translateX = currentIndex * -33.333;
                servicesGrid.style.transform = `translateX(${translateX}%)`;
            }
        }

        setInterval(slideServices, 3000);

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

        // Intersection Observer for animations
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animation = 'fadeInUp 0.8s ease-out forwards';
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        document.querySelectorAll('.service-pod, .hero-slide-content').forEach(el => observer.observe(el));
        populateProductGrid();
    }, []);

    return (
        <>
            <HeroBanner />
            <ServicesSection />
            <ProductCollection />
            <HeroSlideSection />
        </>
    );
};

export default Home;