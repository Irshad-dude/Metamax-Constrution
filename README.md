# Metamax Construction Website

A modern, responsive corporate website for Metamax Construction, built with semantic HTML, CSS, and JavaScript.

## Features
- **Responsive Design**: Mobile-first approach ensuring great experience on all devices.
- **Modern UI**: Indigo/Blue gradient theme with Amber accents.
- **Interactivity**: Smooth scrolling, fade-in animations, and mobile navigation.
- **SEO Optimized**: Semantic structure, meta tags, and JSON-LD structured data.
- **Performance**: Optimized CSS and JS, minimal dependencies.

## Project Structure
```
/
├── index.html          # Main HTML file
├── css/
│   └── styles.css      # Main stylesheet
├── js/
│   └── main.js         # Main JavaScript file
└── assets/
    └── images/         # Image assets directory
```

## Deployment Instructions

### Option 1: Netlify (Recommended)
1.  Drag and drop the `metamax-construction` folder to [Netlify Drop](https://app.netlify.com/drop).
2.  **Or** push to GitHub and connect your repository to Netlify.
    - Build command: (Leave empty)
    - Publish directory: `/`

### Option 2: Vercel
1.  Install Vercel CLI: `npm i -g vercel`
2.  Run `vercel` in the project directory.
3.  Follow the prompts to deploy.

### Option 3: GitHub Pages
1.  Push the code to a GitHub repository.
2.  Go to Settings > Pages.
3.  Select the `main` branch and `/` (root) folder.

### Option 4: GoDaddy (cPanel / File Manager)
1.  Log in to your GoDaddy account and go to your product page.
2.  Click **Manage** next to your hosting plan to open the Dashboard.
3.  Open **cPanel Admin** and go to **File Manager**.
4.  Navigate to `public_html` (or the root directory of your domain).
5.  Click **Upload** and select the `metamax-construction.zip` file provided.
6.  Right-click the zip file in File Manager and select **Extract**.
7.  Ensure the files (`index.html`, `css/`, `js/`, etc.) are in the root of `public_html`, not inside a subfolder. If they are in a subfolder, select all and move them to `public_html`.

## Customization
- **Images**: Replace the placeholder backgrounds in `css/styles.css` or add `<img>` tags in `index.html` with your actual images.
- **Contact Form**: The form is currently set to `mailto`. To make it functional, use a service like [Formspree](https://formspree.io/) or [Netlify Forms](https://docs.netlify.com/forms/setup/).
    - For Netlify: Add `netlify` attribute to the `<form>` tag.
    - For Formspree: Change the `action` attribute to your Formspree endpoint.

## Analytics
To add Google Analytics:
1.  Get your Measurement ID (G-XXXXXXXXXX).
2.  Add the script tag provided by Google inside the `<head>` of `index.html`.

## License
Proprietary - Metamax Construction.
