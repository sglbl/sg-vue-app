When each location matters
Keep in public/ (un-hashed root URL):

- favicon.ico
- robots.txt
- site.webmanifest
Anything referenced by a service worker or web manifest that expects a fixed path

Put in src/assets/ (bundled + hashed):

- Logos, illustrations, decorative images used in components
- Anything where cache-busting (filename hash changes on content change) is a win
