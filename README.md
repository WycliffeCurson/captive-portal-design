# Captive Portal Design

A modern, lightweight, and responsive WiFi captive portal interface designed for public hotspots and ISPs.
Built with performance, simplicity, and mobile-first usability in mind.

This project focuses on clarity, fast load times, and reduced crash risk compared to typical captive portal implementations.

## Project Structure

```
.
├── index.html        # Main HTML structure
├── main.css          # Styling, layout, animations, responsiveness
├── main.js           # UI interactions (modals, sliders, navigation)
├── icons/            # SVG icon assets
├── images/           # Background and visual assets
├── README.md         # Project documentation
└── notes.md          # Development notes and ideas

```

## Features

- **Responsive Design** - Mobile-first approach optimized for all screen sizes
- **Fast and Lightweight** - Pure HTML, CSS, and JavaScript — no frameworks, no dependencies.
- **Modern UI** - Clean gradient background and card-based layout for clarity.
- **WiFi Portal Interface** - Logo, branding, and connection button
- **Plans Section** - Display available WiFi plans to users
- **Clean Typography** - System font stack for optimal cross-platform rendering
- **Normalized Styling** - Reset styles for consistent browser rendering

## Page Components

1. **Logo Section** - WiFi icon for brand recognition
2. **Title Section** - SPEED.NET WIFI branding with welcome message
3. **Connect Button** - Call-to-action button for WiFi connection
4. **Authentication Modal** - Tabbed navigation (Login / Voucher / Receipt),Sliding content panels,Optimized for small screen
5. **Plans Section** - Section to display available WiFi plans;Categorized plans,Slide-based navigation,Clickable plan cards (ready for payment integration)
6. **Contant Section** - Support phone / WhatsApp details

## Getting Started

1. Clone or download the project
2. Open index.html in any modern browser
3. No build tools or server required

## Customization

- **Gradient Colors** - Modify the `linear-gradient()` values in `body` CSS rule
- **Branding** - Update the WiFi logo and text in the title section
- **Plans** - Add plan cards to the `.plans-cards` container
- **Styling** - Adjust colors, fonts, and spacing in `main.css`
- **Authentication Logic** - Hook form inputs to backend / router APIs,Integrate payment gateways where needed

## Browser Support

Compatible with all modern browsers supporting:

- Flexbox
- CSS Grid
- CSS Transitions
- ES6 JavaScript
- Viewport meta tags

Designed to perform well even on low-end mobile devices.

🛠️ Status

UI Complete – Functional Prototype
Ready for:

- Provider review
- Backend integration
- Performance tuning
- Production hardening

👤 Author

Weezy_Creed
Captive Portal UI / Frontend
2026

<small style="opacity:0.7;">Powered by SPEED.NET</small>
