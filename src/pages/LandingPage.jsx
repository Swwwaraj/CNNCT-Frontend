import { Link } from "react-router-dom"
import Logo from "../components/Logo"
import "./LandingPage.css"


const LandingPage = () => {
  return (
    <div className="landing-page">
      <header className="landing-header">
        <div className="header-content">
          <Logo />
          <div>
            <Link to="/signup" className="signup-btn">Sign up free</Link>
          </div>
        </div>
      </header>

      <main>
        <section className="hero-section">
          <h1 className="hero-title">
            CNNCT – Easy<br />
            Scheduling Ahead
          </h1>
          <Link to="/signup" className="signup-btn">Sign up free</Link>
        </section>

        <section className="app-preview">
          <div className="preview-image">
            <img src="https://i.postimg.cc/MGXYSRgY/dashboard.png" alt="CNNCT Dashboard Preview" />
          </div>
          <h2 className="preview-title">Simplified scheduling for you and your team</h2>
          <p className="preview-description">
            CNNCT eliminates the back-and-forth of scheduling meetings so you can focus on what matters. Set your availability, share your link, and let others book time with you instantly.
          </p>
        </section>

        <section className="features-section">
          <div className="feature-content">
            <h2 className="feature-title">
              Stay Organized with Your<br />
              Calendar & Meetings
            </h2>
            <h3>Seamless Event Scheduling</h3>
            <ul className="feature-list">
              <li>View all your upcoming meetings and appointments in one place.</li>
              <li>Syncs with Google Calendar, Outlook, and iCloud to avoid conflicts</li>
              <li>Customize event types: one-on-ones, team meetings, group sessions, and webinars.</li>
            </ul>
          </div>
          <div className="feature-image">
            <img src="https://i.postimg.cc/L5LSvYs2/Screenshot-2025-03-26-235759-removebg-preview.png" alt="Calendar Features" />
          </div>
        </section>

        <section className="testimonials-section">
          <h2 className="testimonials-title">
            Here's what our <span className="highlight">customer</span><br />
            has to says
          </h2>
          <div className="testimonials-grid">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="testimonial-card">
                <h3 className="testimonial-text">Amazing tool! Saved me months</h3>
                <p className="testimonial-description">
                  This is a placeholder for your testimonials and what your client has to say, put them here and make sure its 100% true and meaningful.
                </p>
                <div className="testimonial-author">
                  <div className="author-avatar"
                   />
                  <div>
                    <p className="author-name">John Mastor</p>
                    <p className="author-position">Director, Spark.com</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="integrations-section">
          <h2 className="integrations-title">All Link Apps and Integrations</h2>
          <div className="integrations-grid">
            {[
                {
                  "name": "Audiomack",
                  "description": "Add an Audiomack player to your Linktree",
                  icon: "/images/1.png"
                },
                {
                  "name": "Bandsintown",
                  "description": "Drive ticket sales by listing your events",
                  icon: "/images/2.png"
                },
                {
                  "name": "Bonfire",
                  "description": "Display and sell your custom merch",
                  icon: "/images/3.png"
                },
                {
                  "name": "Books",
                  "description": "Promote books on your Linktree",
                  icon: "/images/4.png"
                },
                {
                  "name": "Buy Me A Gift",
                  "description": "Let visitors support you with a small gift",
                  icon: "/images/5.png"
                },
                {
                  "name": "Cameo",
                  "description": "Make impossible fan connections possible",
                  icon: "/images/6.png"
                },
                {
                  "name": "Clubhouse",
                  "description": "Let your community in on the conversation",
                  icon: "/images/7.png"
                },
                {
                  "name": "Community",
                  "description": "Build an SMS subscriber list",
                  icon: "/images/8.png"
                },
                {
                  "name": "Contact Details",
                  "description": "Easily share downloadable contact details",
                  icon: "/images/9.png"
                }
                
].map((integration, i) => (
              <div key={i} className="integration-card">
                <div className="integration-icon" />
                <div className="integration-content">
                  <h3 className="integration-name">{integration.name}</h3>
                  <p className="integration-description">{integration.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-top">
            <Logo />
            <div>
              <Link to="/signin" className="sign-in-btn">Log in</Link>
              <Link to="/signup" className="signup-btn">Sign up free</Link>
            </div>
          </div>
          
          <div className="footer-links">
            <Link to="/about">About CNNCT</Link>
            <Link to="/careers">Careers</Link>
            <Link to="/terms">Terms and Conditions</Link>
            <Link to="/blog">Blog</Link>
            <Link to="/getting-started">Getting Started</Link>
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/press">Press</Link>
            <Link to="/features">Features and How-Tos</Link>
            <Link to="/cookie">Cookie Notice</Link>
            <Link to="/social">Social Good</Link>
            <Link to="/faqs">FAQs</Link>
            <Link to="/trust">Trust Center</Link>
            <Link to="/contact">Contact</Link>
            <Link to="/report">Report a Violation</Link>
          </div>

          <div className="footer-social">
            <a href="#" className="social-icon">Twitter</a>
            <a href="#" className="social-icon">Instagram</a>
            <a href="#" className="social-icon">YouTube</a>
            <a href="#" className="social-icon">TikTok</a>
            <a href="#" className="social-icon">Discord</a>
          </div>

          <p className="footer-bottom">
            We acknowledge the Traditional Custodians of the land on which our office stands, The Wurundjeri people of the Kulin Nation, and pay our respects to Elders past, present and emerging.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage