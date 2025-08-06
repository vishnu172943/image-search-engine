const accessKey = "EWbRNwQNE1VBObyFR84DDb44MIxzcbyCJV7ycI9Sd_4";

const searchForm = document.getElementById("search-form");
const searchBox = document.getElementById("search-box");
const searchResult = document.getElementById("search-result");
const showMoreBtn = document.getElementById("show-more-btn");

// New elements for image search
const imageSearchForm = document.getElementById("image-search-form");
const imageUploadBox = document.getElementById("image-upload-box");

// Imagga API details
const imaggaApiKey = 'acc_115395151482a54';
const imaggaApiSecret = '0b6419530414b3d844c80337b5c5e765';
const imaggaApiUrl = 'https://api.imagga.com/v2/tags';


let keyword = "";
let page = 1;

async function searchImages() {
  keyword = searchBox.value;
  const url = `https://api.unsplash.com/search/photos?page=${page}&query=${keyword}&client_id=${accessKey}&per_page=12`;
  const response = await fetch(url);
  const data = await response.json();
  if(page==1){
    searchResult.innerHTML="";
  }
  const results=data.results;
  results.map((result)=>{
    const image=document.createElement("img");
    image.src=result.urls.small;
    const imageLink =document.createElement("a");
    imageLink.href=result.links.html;
    imageLink.target="_blank";
    imageLink.appendChild(image);
    searchResult.appendChild(imageLink);
  })
  showMoreBtn.style.display="block";
}


searchForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  page = 1;
  await searchImages();
});

showMoreBtn.addEventListener("click",()=>{
    page++;
    searchImages();
});

// --- New Image Search Logic ---

async function searchByImage(imageFile) {
    searchBox.value = `Analyzing image... Please wait.`;

    const formData = new FormData();
    formData.append('image', imageFile);

    try {
        const response = await fetch(imaggaApiUrl, {
            method: 'POST',
            headers: {
                'Authorization': 'Basic ' + btoa(`${imaggaApiKey}:${imaggaApiSecret}`)
            },
            body: formData
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Imagga API error: ${errorData.status.text}`);
        }

        const data = await response.json();

        if (data.result && data.result.tags && data.result.tags.length > 0) {
            // Find the tag with the highest confidence
            const bestTag = data.result.tags.reduce((prev, current) => (prev.confidence > current.confidence) ? prev : current);
            searchBox.value = bestTag.tag.en;
            page = 1;
            await searchImages();
        } else {
            searchBox.value = "Could not get tags from image. Try another one.";
        }
    } catch (error) {
        console.error('Error during image analysis:', error);
        searchBox.value = "Failed to analyze image. See console for details.";
    }
}

imageSearchForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const imageFile = imageUploadBox.files[0];
    if (imageFile) {
        await searchByImage(imageFile);
    } else {
        searchBox.value = "Please select an image file first.";
    }
});
