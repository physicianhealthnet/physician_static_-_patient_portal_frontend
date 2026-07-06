const fs = require('fs');
const puppeteer = require('puppeteer');

const dataPath = "src/data/doctorsData.json";
let data = JSON.parse(fs.readFileSync(dataPath, "utf8"));

async function main() {
  const browser = await puppeteer.launch({ 
      headless: true, 
      args: ["--no-sandbox", "--disable-setuid-sandbox"] 
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  const cache = {};
  
  for (let doc of data) {
    const query = doc.clinic_name + " " + doc.address;
    
    // Only fetch if not already in cache to speed up
    if (cache[query]) {
       doc.clinic_image = cache[query];
       continue;
    }
    
    console.log("Searching Google Maps for:", query);
    try {
      // Go to Google Maps search
      await page.goto(`https://www.google.com/maps/search/${encodeURIComponent(query)}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
      
      // Wait a moment for any popups or images to load into the DOM
      await new Promise(r => setTimeout(r, 4000));
      
      const imgUrl = await page.evaluate(() => {
        // Find authentic Google Maps location photos (usually starts with lh3 or lh5.googleusercontent)
        const imgs = Array.from(document.querySelectorAll('img'));
        for (let img of imgs) {
          const src = img.src || img.getAttribute('data-src') || '';
          if (src.includes('googleusercontent.com/p/')) {
            // Strip size limits to get decent res
            return src.replace(/=w\d+-h\d+-k-no/, '=w800-h600');
          }
        }
        return null; // None found
      });

      console.log("Found:", imgUrl ? imgUrl : "NO");
      
      if (imgUrl) {
         cache[query] = imgUrl;
         doc.clinic_image = imgUrl;
      } else {
         // Fallback to beautiful high resolution hospital placeholder if Maps fails
         const fallback = "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&q=80";
         cache[query] = fallback;
         doc.clinic_image = fallback;
      }

    } catch (err) {
      console.error("Error for", query, err.message);
      doc.clinic_image = "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&q=80";
    }
  }
  
  await browser.close();
  
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
  console.log("Done updating authentic images from Maps");
}

main();
