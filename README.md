# Captive Portal Design

A modern, responsive WiFi captive portal interface for SPEED.NET WIFI with a vibrant gradient background and clean user experience.

## Project Structure

```
.
├── index.html                          # Main HTML file
├── main.css                            # Stylesheet and responsive design
├── icons/                              # SVG icon assets
├── images/                             # Background and image assets
├── README.md                           # Project documentation
└── notes.md                            # Development notes
```

## Features

- **Responsive Design** - Mobile-first approach optimized for all screen sizes
- **Modern Gradient Background** - Linear gradient from vibrant purple (#42047E) to cyan (rgba(7, 244, 158, 1))
- **WiFi Portal Interface** - Logo, branding, and connection button
- **Plans Section** - Display available WiFi plans to users
- **Clean Typography** - System font stack for optimal cross-platform rendering
- **Normalized Styling** - Reset styles for consistent browser rendering

## Page Components

1. **Logo Section** - WiFi icon for brand recognition
2. **Title Section** - SPEED.NET WIFI branding with welcome message
3. **Connect Button** - Call-to-action button for WiFi connection
4. **Plans Cards** - Section to display available WiFi plans

## Getting Started

1. Open `index.html` in a web browser
2. The portal will display with full responsive styling
3. Customize colors, text, and plans in the HTML and CSS files

## Customization

- **Gradient Colors** - Modify the `linear-gradient()` values in `body` CSS rule
- **Branding** - Update the WiFi logo and text in the title section
- **Plans** - Add plan cards to the `.plans-cards` container
- **Styling** - Adjust colors, fonts, and spacing in `main.css`

## Browser Support

Works on all modern browsers supporting:
- CSS Flexbox
- CSS Gradients
- CSS Grid
- Viewport meta tags
