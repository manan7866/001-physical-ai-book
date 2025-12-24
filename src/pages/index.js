import React, { useState, useEffect, useRef } from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';

import styles from './index.module.css';

function EnhancedHero() {
  const {siteConfig} = useDocusaurusContext();
  const [isVisible, setIsVisible] = useState(false);
  const heroRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (heroRef.current) {
      observer.observe(heroRef.current);
    }

    return () => {
      if (heroRef.current) {
        observer.unobserve(heroRef.current);
      }
    };
  }, []);

  return (
    <header ref={heroRef} className={clsx(styles.enhancedHero)}>
      <div className="container">
        <div className={styles.heroContentGrid}>
          <div className={`${styles.heroText} ${isVisible ? styles.fadeInElement : ''}`}>
            <h1 className="hero__title">{siteConfig.title}</h1>
            <p className="hero__subtitle">{siteConfig.tagline}</p>
            <div className={styles.heroButtons}>
              <Link
                className="button button--secondary button--lg"
                to="/docs/introduction">
                Start Learning - 5min ⏱️
              </Link>
              <span className={styles.ss}></span>
              <Link
                className="button button--primary button--lg"
                to="/docs/getting-started">
                Quick Setup
              </Link>
            </div>
          </div>
          <div className={`${styles.heroMedia} ${isVisible ? styles.fadeInElement : ''}`} style={{ animationDelay: '0.2s', marginTop: '30px' }}>
            <div className={styles.bookImageContainer}>
              <img
                src="/img/landingpageImage.png"
                alt="Physical AI & Humanoid Robotics Book Cover"
                style={{
                  width: '90%',
                  height: 'auto',
                  maxHeight: '600px',
                  objectFit: 'cover',
                  borderRadius: '12px',
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)'
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function ModuleCard({ title, description, link, progress, difficulty, duration, delay = 0 }) {
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay * 100);
        }
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, [delay]);

  const getDifficultyClass = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner':
        return styles.difficultyBeginner;
      case 'intermediate':
        return styles.difficultyIntermediate;
      case 'advanced':
      case 'expert':
        return styles.difficultyAdvanced;
      default:
        return styles.difficultyIntermediate;
    }
  };

  return (
    <div ref={cardRef} className={`col col--3 ${styles.moduleBox} ${isVisible ? styles.fadeInElement : ''}`} style={{ animationDelay: `${delay * 0.1}s` }}>
      <div className={`card ${styles.moduleCard} ${styles.cardHoverEffect}`}>
        <div className="card__body">
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #8b5cf6, #c084fc)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            boxShadow: '0 8px 20px rgba(139, 92, 246, 0.3)'
          }}>
            <span style={{ fontSize: '1.5rem', color: 'white' }}>🤖</span>
          </div>
          <h3 style={{ color: '#7e22ce', marginBottom: '1rem' }}>{title}</h3>
          <p style={{ marginBottom: '1.5rem', minHeight: '60px' }}>{description}</p>
          {progress !== undefined && (
            <>
              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <small style={{ display: 'block', marginTop: '0.5rem', color: '#7e22ce' }}>Progress: {progress}%</small>
            </>
          )}
          <div className="margin-top--md">
            <span className={`${styles.difficultyBadge} ${getDifficultyClass(difficulty)}`}>
              {difficulty}
            </span>
            <span className={styles.durationTag}>{duration}</span>
          </div>
          <Link className="button button--secondary button--block margin-top--md" to={link}>
            Explore
          </Link>
        </div>
      </div>
    </div>
  );
}

function StatCard({ value, label, icon, delay = 0 }) {
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay * 100);
        }
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, [delay]);

  return (
    <div ref={cardRef} className={`col col--3 ${styles.statCard} ${isVisible ? styles.fadeInElement : ''}`} style={{ animationDelay: `${delay * 0.1}s` }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{icon}</div>
      <span className={styles.statValue}>{value}</span>
      <span className={styles.statLabel}>{label}</span>
    </div>
  );
}

function ResourceCard({ title, description, icon, link, delay = 0 }) {
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay * 100);
        }
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, [delay]);

  return (
    <div ref={cardRef} className={`col col--3 ${styles.moduleBox} ${isVisible ? styles.fadeInElement : ''}`} style={{ animationDelay: `${delay * 0.1}s` }}>
      <div className={`card ${styles.cardHoverEffect}`} style={{
        background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
        boxShadow: '0 10px 30px rgba(139, 92, 246, 0.1)'
      }}>
        <div className="card__body">
          <div style={{
            width: '70px',
            height: '70px',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, #8b5cf6, #c084fc)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            boxShadow: '0 8px 25px rgba(139, 92, 246, 0.3)'
          }}>
            <span style={{ fontSize: '2rem', color: 'white' }}>{icon}</span>
          </div>
          <h3 style={{ color: '#7e22ce', marginBottom: '1rem' }}>{title}</h3>
          <p style={{ marginBottom: '1.5rem', minHeight: '60px' }}>{description}</p>
          <Link className="button button--secondary button--block" to={link}>
            Access
          </Link>
        </div>
      </div>
    </div>
  );
}

function DemoCard({ title, description, demoUrl, thumbnail, delay = 0 }) {
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay * 100);
        }
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, [delay]);

  return (
    <div ref={cardRef} className={`col col--4 ${styles.moduleBox} ${isVisible ? styles.fadeInElement : ''}`} style={{ animationDelay: `${delay * 0.1}s` }}>
      <div className={`card ${styles.demoCard} ${styles.cardHoverEffect}`}>
        <div className="card__image" style={{ position: 'relative' }}>
          <img
            src={thumbnail}
            alt={title}
            style={{
              width: '100%',
              height: '220px',
              objectFit: 'cover',
              borderRadius: '20px 20px 0 0'
            }}
          />
          <div style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'rgba(126, 34, 206, 0.9)',
            color: 'white',
            padding: '0.25rem 0.75rem',
            borderRadius: '15px',
            fontSize: '0.8rem',
            fontWeight: '600'
          }}>
            Demo
          </div>
        </div>
        <div className="card__body">
          <h3 style={{ color: '#7e22ce', marginBottom: '1rem' }}>{title}</h3>
          <p style={{ marginBottom: '1.5rem', minHeight: '60px' }}>{description}</p>
          <Link className="button button--primary button--block" to={demoUrl}>
            Try Demo
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  const [statsVisible, setStatsVisible] = useState({});

  useEffect(() => {
    // Animation for stats counter effect
    const timer = setTimeout(() => {
      setStatsVisible({
        learners: true,
        projects: true,
        satisfaction: true,
        support: true
      });
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Layout
      title={`Physical AI & Humanoid Robotics`}
      description="A Comprehensive Guide to Building Intelligent Humanoid Robots">
      <EnhancedHero />

      <main>
        {/* Featured Modules Section */}
        <section className={styles.featuredModules}>
          <div className="container">
            <div className="text--center margin-bottom--xl">
              <h2>Learning Pathways</h2>
              <p className={styles.sectionDescription}>Choose your journey through the world of humanoid robotics. Our comprehensive modules guide you from fundamentals to advanced concepts.</p>
            </div>
            <div className="row">
              <ModuleCard
                title="ROS 2 Development"
                description="Master the Robot Operating System for advanced robotics applications"
                link="/docs/module1-ros2"
                progress={65}
                difficulty="Intermediate"
                duration="8 weeks"
                delay={1}
              />
              <ModuleCard
                title="Digital Twin & Simulation"
                description="Create realistic simulation environments for robot testing"
                link="/docs/module2-digital-twin"
                progress={40}
                difficulty="Advanced"
                duration="6 weeks"
                delay={2}
              />
              <ModuleCard
                title="Isaac AI Platform"
                description="Leverage NVIDIA's AI tools for robotics development"
                link="/docs/module3-isaac"
                progress={20}
                difficulty="Expert"
                duration="10 weeks"
                delay={3}
              />
              <ModuleCard
                title="Vision-Language-Action"
                description="Integrate perception, cognition, and action systems"
                link="/docs/module4-vla"
                progress={10}
                difficulty="Expert"
                duration="12 weeks"
                delay={4}
              />
            </div>
          </div>
        </section>

        {/* Section Divider */}
        <div className={styles.sectionDivider}></div>

        {/* Community Stats Section */}
        <section className={styles.statsSection}>
          <div className="container">
            <div className="text--center margin-bottom--xl">
              <h2>Community Impact</h2>
              <p className={styles.sectionDescription}>Join thousands of learners on their robotics journey. Our community is growing every day with passionate individuals building the future of robotics.</p>
            </div>
            <div className="row">
              <StatCard
                value={statsVisible.learners ? "5,000+" : "0"}
                label="Active Learners"
                icon="👥"
                delay={1}
              />
              <StatCard
                value={statsVisible.projects ? "150+" : "0"}
                label="Projects Completed"
                icon="🏆"
                delay={2}
              />
              <StatCard
                value={statsVisible.satisfaction ? "98%" : "0%"}
                label="Satisfaction Rate"
                icon="⭐"
                delay={3}
              />
              <StatCard
                value={statsVisible.support ? "24/7" : "0/0"}
                label="Support Available"
                icon="💬"
                delay={4}
              />
            </div>
          </div>
        </section>

        {/* Section Divider */}
        <div className={styles.sectionDivider}></div>

        {/* Resources Section */}
        <section className={styles.resourcesSection}>
          <div className="container">
            <div className="text--center margin-bottom--xl">
              <h2>Essential Resources</h2>
              <p className={styles.sectionDescription}>Everything you need to succeed in humanoid robotics. Access our curated collection of tools, documentation, and learning materials.</p>
            </div>
            <div className="row">
              <ResourceCard
                title="Hardware Specifications"
                description="Complete guide to workstation and robot hardware requirements"
                icon="⚙️"
                link="/docs/hardware"
                delay={1}
              />
              <ResourceCard
                title="Code Examples"
                description="Ready-to-use code snippets and templates"
                icon="💻"
                link="/docs/examples"
                delay={2}
              />
              <ResourceCard
                title="Video Tutorials"
                description="Step-by-step video guides for complex concepts"
                icon="🎥"
                link="/docs/tutorials"
                delay={3}
              />
              <ResourceCard
                title="Community Forum"
                description="Connect with fellow learners and experts"
                icon="💬"
                link="/docs/community"
                delay={4}
              />
            </div>
          </div>
        </section>

        {/* Section Divider */}
        <div className={styles.sectionDivider}></div>

        {/* Demo Showcase Section */}
        <section className={styles.demoShowcase}>
          <div className="container">
            <div className="text--center margin-bottom--xl">
              <h2>Live Demonstrations</h2>
              <p className={styles.sectionDescription}>Experience humanoid robotics in action. Interactive demos and simulations that bring concepts to life and accelerate your learning.</p>
            </div>
            <div className="row">
              <DemoCard
                title="Walking Gait Control"
                description="Real-time simulation of bipedal locomotion algorithms"
                demoUrl="/docs/demos/walking-simulation"
                thumbnail="/img/demo-walking.svg"
                delay={1}
              />
              <DemoCard
                title="Object Manipulation"
                description="Robotic arm control for precision grasping"
                demoUrl="/docs/demos/manipulation"
                thumbnail="/img/demo-manipulation.svg"
                delay={2}
              />
              <DemoCard
                title="Human-Robot Interaction"
                description="Natural language processing for robot commands"
                demoUrl="/docs/demos/hri"
                thumbnail="/img/demo-hri.svg"
                delay={3}
              />
            </div>
          </div>
        </section>

        {/* Section Divider */}
        <div className={styles.sectionDivider}></div>

        {/* Newsletter Section */}
        <section className={styles.newsletter}>
          <div className="container">
            <div className={styles.newsletterContent}>
              <div className={styles.newsletterText}>
                <h3>Stay Updated</h3>
                <p>Get the latest news, updates, and resources delivered to your inbox</p>
              </div>
              <div>
                <form className="margin-top--md">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="form-control"
                    style={{
                      padding: '0.875rem',
                      borderRadius: '12px',
                      border: '2px solid rgba(255,255,255,0.2)',
                      width: '100%',
                      marginBottom: '0.75rem',
                      backgroundColor: 'rgba(255,255,255,0.9)',
                      color: '#4f46e5',
                      fontSize: '1rem'
                    }}
                  />
                  <button
                    type="submit"
                    className="button button--primary button--block"
                    style={{ borderRadius: '12px' }}
                  >
                    Subscribe
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}