const fs = require("fs");
const axios = require("axios");
const cheerio = require("cheerio");

const dataPath = "src/data/doctorsData.json";
let data = JSON.parse(fs.readFileSync(dataPath, "utf8"));

async function getImageUrl(query) {
  try {
    const bingUrl = `https://www.bing.com/images/search?q=${encodeURIComponent(query + " clinic hospital exterior building photo justdial practo -stock -shutterstock -alamy")}`;
    const bingRes = await axios.get(bingUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36"
      }
    });
    
    const $$ = cheerio.load(bingRes.data);
    const elements = $$("a.iusc");
    
    const urlBlacklist = ['stock', 'alamy', 'shutter', 'deposit', 'freepik', 'vector', '123rf', 'dreamstime', 'getty', 'pxhere', 'unsplash', 'pixabay', 'illustration'];
    
    for (let i = 0; i < elements.length; i++) {
        let m = elements.eq(i).attr("m");
        if (m) {
            try {
                let mData = JSON.parse(m);
                let url = mData.murl;
                if (!url) continue;
                
                let isStock = urlBlacklist.some(bl => url.toLowerCase().includes(bl));
                if (!isStock) {
                    return url;
                }
            } catch(e) {}
        }
    }
    return null;
  } catch (err) {
    console.error("Error fetching for", query, err.message);
    return null;
  }
}

async function main() {
  const cache = {};
  for (let doc of data) {
    const q = doc.clinic_name + " " + doc.address; 
    let url = cache[q];
    if (!url) {
      console.log("Fetching real photo for:", q);
      let foundUrl = await getImageUrl(q);
      
      // Fallback only if absolutely nothing non-stock was found
      url = foundUrl || "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&q=80";
      
      cache[q] = url;
      await new Promise(r => setTimeout(r, 800)); // Sleep 0.8s
    }
    doc.clinic_image = url;
  }
  
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
  console.log("Done updating real original images");
}

main();
