const fs = require("fs");
const axios = require("axios");
const cheerio = require("cheerio");

const dataPath = "src/data/doctorsData.json";
let data = JSON.parse(fs.readFileSync(dataPath, "utf8"));

async function getImageUrl(query) {
  try {
    const bingUrl = `https://www.bing.com/images/search?q=${encodeURIComponent(query + " hospital building exterior tamil nadu")}`;
    const bingRes = await axios.get(bingUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36"
      }
    });
    const $$ = cheerio.load(bingRes.data);
    const mimg = $$("img.mimg");
    let src = null;
    for (let i = 0; i < mimg.length; i++) {
        let ts = $$("img.mimg").eq(i).attr("src") || $$("img.mimg").eq(i).attr("data-src");
        if(ts && ts.startsWith("http")) {
            src = ts;
            break;
        }
    }
    return src;
  } catch (err) {
    console.error("Error fetching for", query, err.message);
    return null;
  }
}

async function main() {
  const cache = {};
  for (let doc of data) {
    const q = doc.clinic_name; //  + " " + doc.address;
    let url = cache[q];
    if (!url) {
      console.log("Fetching for:", q);
      url = await getImageUrl(q) || "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&q=80"; // fallback
      cache[q] = url;
      await new Promise(r => setTimeout(r, 500));
    }
    doc.clinic_image = url;
  }
  
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
  console.log("Done updating images");
}

main();
