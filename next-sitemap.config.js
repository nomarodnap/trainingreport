/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://trainingreport.fisheries.go.th',
  generateRobotsTxt: true,
  sitemapSize: 7000,
  // Exclude pages that shouldn't be indexed
  exclude: [
    '/show-password',
    '/user-details/*', // Dynamic routes
    '/api/*' // API routes
  ],
  // Additional paths to include if needed
  additionalPaths: async (config) => {
    return []
  },
  // Transform function to customize sitemap entries
  transform: async (config, path) => {
    // Customize priority and changefreq for different page types
    const defaultEntry = {
      loc: path,
      changefreq: 'daily',
      priority: 0.7,
      lastmod: new Date().toISOString(),
    }

    // Higher priority for main pages
    if (path === '/signin') {
      return {
        ...defaultEntry,
        priority: 1.0,
        changefreq: 'weekly'
      }
    }

    // Lower priority for form/report pages
    if (path.includes('/form') || path.includes('/edit') || path.includes('/reports')) {
      return {
        ...defaultEntry,
        priority: 0.5,
        changefreq: 'weekly'
      }
    }

    return defaultEntry
  }
};
