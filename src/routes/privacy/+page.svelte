<script lang="ts">
  import { goto } from '$app/navigation';
</script>

<svelte:head>
  <title>Privacy Policy – Drawtopia</title>
  <meta name="description" content="Drawtopia Privacy Policy. How we collect, use, and protect your information." />
</svelte:head>

<div class="privacy-page">
  <header class="privacy-header">
    <a href="/" class="back-link">← Back to Drawtopia</a>
  </header>

  <main class="privacy-content">
    <h1>Privacy Policy</h1>
    <p class="updated">Last updated: February 2025</p>

    <section>
      <h2>1. Introduction</h2>
      <p>
        Drawtopia ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy
        explains how we collect, use, disclose, and safeguard your information when you use our
        application at app.drawtopia.ai and related services.
      </p>
    </section>

    <section>
      <h2>2. Information We Collect</h2>
      <p>We may collect information that you provide directly, including:</p>
      <ul>
        <li>Account information (name, email address, profile data)</li>
        <li>Information from third-party sign-in providers (e.g., Google)</li>
        <li>Content you create, such as characters and stories</li>
        <li>Communications and support requests</li>
      </ul>
    </section>

    <section>
      <h2>3. How We Use Your Information</h2>
      <p>We use the information we collect to:</p>
      <ul>
        <li>Provide, maintain, and improve our services</li>
        <li>Authenticate users and manage accounts</li>
        <li>Send transactional and service-related communications</li>
        <li>Comply with legal obligations and protect our rights</li>
      </ul>
    </section>

    <section>
      <h2>4. Children's Privacy</h2>
      <p>
        We are committed to protecting children's privacy online. We follow strict privacy
        guidelines and do not knowingly collect personal information from children under 13 without
        verifiable parental consent. Our services are designed with child safety in mind.
      </p>
    </section>

    <section>
      <h2>5. Data Security</h2>
      <p>
        We implement appropriate technical and organizational measures to protect your personal
        information against unauthorized access, alteration, disclosure, or destruction.
      </p>
    </section>

    <section>
      <h2>6. Third-Party Services</h2>
      <p>
        Our app may use third-party services (such as authentication and hosting). These providers
        have their own privacy policies governing how they use your information.
      </p>
    </section>

    <section>
      <h2>7. Your Rights</h2>
      <p>
        Depending on your location, you may have rights to access, correct, delete, or restrict
        processing of your personal data. Contact us to exercise these rights.
      </p>
    </section>

    <section>
      <h2>8. Contact Us</h2>
      <p>
        If you have questions about this Privacy Policy or our practices, please contact us at
        <a href="mailto:privacy@drawtopia.ai">privacy@drawtopia.ai</a>.
      </p>
    </section>
  </main>

  <footer class="privacy-footer">
    <a href="/">Home</a>
    <a href="/login">Login</a>
  </footer>
</div>

<style>
  .privacy-page {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    max-width: 720px;
    margin: 0 auto;
    padding: 1.5rem;
  }
  .privacy-header {
    margin-bottom: 2rem;
  }
  .back-link {
    color: #555;
    text-decoration: none;
  }
  .back-link:hover {
    text-decoration: underline;
  }
  .privacy-content {
    flex: 1;
  }
  .privacy-content h1 {
    font-size: 1.75rem;
    margin-bottom: 0.25rem;
  }
  .updated {
    color: #666;
    font-size: 0.9rem;
    margin-bottom: 2rem;
  }
  .privacy-content section {
    margin-bottom: 1.5rem;
  }
  .privacy-content h2 {
    font-size: 1.15rem;
    margin-bottom: 0.5rem;
  }
  .privacy-content p,
  .privacy-content ul {
    margin: 0 0 0.75rem 0;
    line-height: 1.6;
    color: #333;
  }
  .privacy-content ul {
    padding-left: 1.5rem;
  }
  .privacy-content a {
    color: #0066cc;
    text-decoration: none;
  }
  .privacy-content a:hover {
    text-decoration: underline;
  }
  .privacy-footer {
    margin-top: 2rem;
    padding-top: 1rem;
    border-top: 1px solid #eee;
    display: flex;
    gap: 1.5rem;
  }
  .privacy-footer a {
    color: #666;
    text-decoration: none;
  }
  .privacy-footer a:hover {
    text-decoration: underline;
  }
</style>
