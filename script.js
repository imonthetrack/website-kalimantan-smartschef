const MODEL_URL = "https://teachablemachine.withgoogle.com/models/-Os3bG-3f/";

let model;
let isPredicting = false;
let isFrozen = false;
let stream = null;
let isUploadMode = false;

/* daftar semua makanan */
const allClasses = [
"gangan humbut",
"ketupat kandangan",
"ikan baubar",
"pais ikan",
"ikan bakar sambal raja",
"ikan patin bakar",
"ikan papuyu masak kuning",
"pindang ikan banjar",
"ayam cincane",
"ayam masak habang",
"soto banjar",
"kari ayam banjar",
"ayam panggang banjar",
"ayam kuah kuning",
"udang masak habang",
"udang galah bakar",
"kepiting soka",
"cumi masak hitam",
"udang santan kuning",
"nasi bekepor",
"nasi kuning banjar",
"nasi subut",
"lontong orari",
"nasi itik gambut",
"ketupat kandangan set",
];

document.addEventListener("DOMContentLoaded", () => {

const startBtn = document.getElementById("startBtn");
const freezeBtn = document.getElementById("freezeBtn");
const uploadBtn = document.getElementById("uploadBtn");
const uploadResumeBtn = document.getElementById("uploadResumeBtn");
const imageUpload = document.getElementById("imageUpload");

startBtn.addEventListener("click", startCamera);

freezeBtn.addEventListener("click", () => {

if (!isFrozen) {
isFrozen = true;
freezeBtn.innerText = "Resume";
} else {
isFrozen = false;
freezeBtn.innerText = "Freeze";
predictLoop();
}

});

uploadBtn.addEventListener("click", () => {
imageUpload.click();
});

uploadResumeBtn.addEventListener("click", resumeCameraFromUpload);

imageUpload.addEventListener("change", handleUpload);

/* tampilkan progress kosong saat awal */
initProgressBars();

});

async function loadModel(){

if(!model){

const modelURL = MODEL_URL + "model.json";
const metadataURL = MODEL_URL + "metadata.json";

model = await tmImage.load(modelURL, metadataURL);

}

}

async function startCamera(){

const btn = document.getElementById("startBtn");
const video = document.getElementById("camera");
const img = document.getElementById("uploadPreview");

btn.disabled = true;
btn.innerText = "Loading...";

await loadModel();

try{

stream = await navigator.mediaDevices.getUserMedia({
video:{ facingMode:"environment" },
audio:false
});

video.srcObject = stream;

video.style.display="block";
img.style.display="none";

video.onloadeddata=()=>{
isPredicting=true;
predictLoop();
};

btn.innerText="Kamera Aktif";
document.getElementById("freezeBtn").disabled=false;

}catch(err){

alert("Kamera gagal: "+err.message);
btn.disabled=false;
btn.innerText="Start Kamera";

}

}

/* HENTIKAN KAMERA */
function stopCamera(){

if(stream){
stream.getTracks().forEach(track=>track.stop());
}

isPredicting=false;

}

async function predictLoop(){

if(!isPredicting || isFrozen) return;

const video=document.getElementById("camera");

const prediction=await model.predict(video);

updatePredictionBars(prediction);

requestAnimationFrame(predictLoop);

}

async function handleUpload(event){

const file = event.target.files[0];
if(!file) return;

await loadModel();

/* jika kamera aktif maka dimatikan dulu */
stopCamera();

isUploadMode=true;

document.getElementById("uploadResumeBtn").disabled=false;

const img = document.getElementById("uploadPreview");
const video = document.getElementById("camera");

img.src = window.URL.createObjectURL(file);

img.onload = async ()=>{

img.style.display="block";
video.style.display="none";

const prediction = await model.predict(img);

updatePredictionBars(prediction);

};

}

/* tombol resume setelah upload */
function resumeCameraFromUpload(){

if(!isUploadMode) return;

const img = document.getElementById("uploadPreview");
const video = document.getElementById("camera");

img.style.display="none";
video.style.display="block";

isUploadMode=false;

startCamera();

document.getElementById("uploadResumeBtn").disabled=true;

}

/* membuat progress bar awal */
function initProgressBars(){

const container=document.getElementById("predictionList");

container.innerHTML="";

allClasses.forEach(name=>{

const item=document.createElement("div");
item.className="prediction-item";

item.innerHTML=`

<div class="prediction-label">
<span>${name}</span>
<span>0%</span>
</div>

<div class="prediction-bar">
<div class="prediction-fill" style="width:0%"></div>
</div>
`;

container.appendChild(item);

});

}

function updatePredictionBars(predictions){

const container=document.getElementById("predictionList");

/* ubah prediksi jadi map */
const predictionMap = {};
predictions.forEach(p=>{
predictionMap[p.className.toLowerCase()] = p.probability;
});

/* gabungkan dengan daftar makanan */
const merged = allClasses.map(name=>{
return{
className:name,
probability:predictionMap[name] || 0
};
});

/* urutkan */
merged.sort((a,b)=>b.probability-a.probability);

container.innerHTML="";

merged.forEach((pred,index)=>{

const percent=Math.round(pred.probability*100);

const item=document.createElement("div");
item.className="prediction-item";

if(index===0){
item.classList.add("top");
}

item.innerHTML=`

<div class="prediction-label">
<span>${pred.className}</span>
<span>${percent}%</span>
</div>

<div class="prediction-bar">
<div class="prediction-fill" style="width:${percent}%"></div>
</div>
`;

container.appendChild(item);

if(index===0){

document.getElementById("confidenceFill").style.width=percent+"%";
document.getElementById("confidenceText").innerText=percent+"%";

const statusText=document.getElementById("aiStatusText");

if(pred.probability>0.30){
statusText.innerText="AI Aktif";
showMenu(pred.className.toLowerCase());
}else{
statusText.innerText="Menganalisa...";
document.getElementById("resultText").innerText="Menganalisa...";
}

}

});

}

function showMenu(menu){

const data={

"gangan humbut":{
img:"images/gangan_humbut2.jpeg",
text: `
  <h2>Gangan Humbut</h2>
<p class="desc">
Masakan tradisional satu ini terkenal dengan kuah kuning segar, aroma rempah kuat, dan tekstur unik dari humbut (umbut kelapa muda). Rasanya gurih, sedikit asam, dan super comforting.
</p>
<h3>🧺 Bahan lengkap</h3>
Bahan utama
<ul>
  <li> 300–400 gr humbut/umbut kelapa muda, iris tipis</li>
  <li> 1 ekor ikan patin / ikan gabus (boleh diganti ayam kampung)</li>
  <li> 1 liter air</li>
  <li> 2 batang serai, memarkan</li>
  <li> 2 lembar daun salam</li>
  <li> 3 lembar daun jeruk</li>
  <li> 1 ruas lengkuas, memarkan</li>
  <li> 1 buah tomat, potong</li>
  <li> Garam secukupnya</li>
  <li> Gula secukupnya</li>
  <li> Air asam jawa atau belimbing wuluh (opsional, buat rasa segar)</li>
  <li> Bumbu halus</li>
  <li> 6 siung bawang merah</li>
  <li> 3 siung bawang putih</li>
  <li> 3 butir kemiri</li>
  <li> 2 cm kunyit</li>
  <li> 1 cm jahe</li>
  <li> 1 sdt ketumbar</li>
  <li> 3–5 cabai merah (sesuaikan level pedas)</li>
</ul>
<h3>🔥 Cara memasak lengkap</h3>
<p>
  A.Siapkan humbut
  Kupas bagian kerasnya sampai tersisa bagian putih lembut.
  Iris tipis.
  Rebus sebentar 5–10 menit untuk menghilangkan rasa pahit.
  Tiriskan.

  B. Tumis bumbu
  Panaskan sedikit minyak.
  Tumis bumbu halus sampai harum.
  Masukkan serai, daun salam, daun jeruk, dan lengkuas.
  Aduk sampai wangi rempah keluar.

  C. Masak kuah
  Tuang air ke dalam tumisan bumbu.
  Masukkan ikan.
  Masak sampai ikan setengah matang dan kuah mulai kuning harum.

  D. Masukkan humbut
  Tambahkan humbut yang sudah direbus.
  Masukkan tomat.
  Bumbui dengan garam dan sedikit gula.
  Tambahkan asam jawa/belimbing wuluh biar segar.

  E. Masak sampai matang
  Masak ±15–20 menit sampai semua bahan menyatu.
  Koreksi rasa: gurih, segar, dan sedikit asam harus balance.


  ✨ Tips biar rasanya autentik
  Pakai humbut kelapa muda yang masih lembut.
  Ikan patin bikin kuah lebih gurih.
  Jangan pelit kunyit: warna kuningnya khas.
  Masak pakai api sedang supaya kuah tidak keruh.
</p>

`
},

"ketupat kandangan":{
img:"images/ketupat-kandangan.jpg",
text:`

  <h2>Ketupat Kandangan</h2>

<p class="desc">
Menu legendaris dari tanah Banjar ini terkenal dengan kuah santan kuning yang gurih dan ikan haruan (gabus) panggang yang smoky. Disajikan bersama ketupat, rasanya legit, berempah, dan bikin susah berhenti makan.
</p>

<h3>🧺 Bahan lengkap</h3>
Bahan utama
<ul>
  <li>4–6 buah ketupat matang</li>
  <li>2 ekor ikan haruan/gabus (boleh diganti tongkol atau patin)</li>
  <li>800 ml santan sedang</li>
  <li>500 ml santan kental</li>
  <li>2 batang serai, memarkan</li>
  <li>2 lembar daun salam</li>
  <li>3 lembar daun jeruk</li>
  <li>1 ruas lengkuas, memarkan</li>
  <li>Garam secukupnya</li>
  <li>Gula secukupnya</li>
</ul>

Bumbu halus
<ul>
  <li>6 siung bawang merah</li>
  <li>4 siung bawang putih</li>
  <li>3 butir kemiri</li>
  <li>2 cm kunyit</li>
  <li>1 cm jahe</li>
  <li>1 sdt ketumbar</li>
  <li>½ sdt merica</li>
  <li>3 cabai merah (opsional)</li>
</ul>

Pelengkap
<ul>
  <li>Telur rebus</li>
  <li>Bawang goreng</li>
  <li>Sambal</li>
  <li>Jeruk nipis (opsional)</li>
</ul>

<h3>🔥 Cara memasak lengkap</h3>

<p>
A. Siapkan ikan<br>
Bersihkan ikan haruan.<br>
Lumuri garam dan sedikit kunyit.<br>
Panggang sampai setengah kering dan harum.<br>
Sisihkan.
</p>

<p>
B. Tumis bumbu<br>
Haluskan semua bumbu.<br>
Tumis sampai wangi dan matang.<br>
Masukkan serai, daun salam, daun jeruk, dan lengkuas.<br>
Aduk sampai bumbu benar-benar keluar minyaknya.
</p>

<p>
C. Masak kuah santan<br>
Tuang santan sedang ke dalam tumisan.<br>
Masukkan ikan panggang.<br>
Masak dengan api kecil sambil diaduk pelan agar santan tidak pecah.
</p>

<p>
D. Tambahkan santan kental<br>
Setelah kuah mulai menyatu, tuang santan kental.<br>
Bumbui dengan garam dan gula.<br>
Masak sampai kuah mengental dan meresap ke ikan.
</p>

<p>
E. Koreksi rasa<br>
Rasanya harus gurih, creamy, dan sedikit smoky dari ikan panggang.<br>
Angkat saat kuah sudah pas dan harum.
</p>

<h3>✨ Tips biar autentik</h3>
<ul>
  <li>Ikan haruan panggang adalah kunci rasa asli.</li>
  <li>Pakai santan segar kalau bisa.</li>
  <li>Masak dengan api kecil supaya kuah tetap halus.</li>
  <li>Kuah jangan terlalu kental, tapi tetap creamy.</li>
</ul>
  `
},

"soto banjar":{
img:"images/soto-banjar.jpg",
text:`
  <h2>Soto Banjar</h2>

<p class="desc">
Soto Banjar punya kuah bening kekuningan dengan aroma rempah lembut, kayu manis, dan cengkih yang khas. 
Disajikan dengan ayam suwir, ketupat, dan perkedel—hangatnya langsung bikin nyaman.
</p>

<h3>🧺 Bahan lengkap</h3>

Bahan utama
<ul>
  <li>1 ekor ayam, potong 4</li>
  <li>2 liter air</li>
  <li>2 batang serai, memarkan</li>
  <li>3 lembar daun salam</li>
  <li>3 lembar daun jeruk</li>
  <li>1 batang kayu manis</li>
  <li>3 butir cengkih</li>
  <li>Garam secukupnya</li>
  <li>Gula secukupnya</li>
</ul>

Bumbu halus
<ul>
  <li>8 siung bawang merah</li>
  <li>4 siung bawang putih</li>
  <li>3 butir kemiri</li>
  <li>2 cm jahe</li>
  <li>1 cm pala</li>
  <li>½ sdt merica</li>
</ul>

Bahan pelengkap
<ul>
  <li>Ketupat atau lontong</li>
  <li>Telur rebus</li>
  <li>Perkedel kentang</li>
  <li>Bawang goreng</li>
  <li>Seledri iris</li>
  <li>Jeruk nipis</li>
  <li>Sambal</li>
</ul>

<h3>🔥 Cara memasak lengkap</h3>

<p>
A. Rebus ayam<br>
Rebus ayam dalam air sampai setengah matang.<br>
Angkat lalu suwir dagingnya.
</p>

<p>
B. Siapkan kaldu<br>
Saring air rebusan ayam.<br>
Gunakan sebagai kaldu soto.
</p>

<p>
C. Siapkan bumbu<br>
Haluskan semua bumbu sampai lembut.
</p>

<p>
D. Tumis bumbu<br>
Tumis bumbu halus sampai harum dan matang.<br>
Masukkan serai, daun salam, daun jeruk, kayu manis, dan cengkih.
</p>

<p>
E. Masak kuah soto<br>
Tuang tumisan bumbu ke dalam kaldu ayam.<br>
Masukkan ayam suwir.<br>
Tambahkan garam dan gula secukupnya.
</p>

<p>
F. Finishing<br>
Masak sampai kuah harum dan matang.<br>
Sajikan dengan ketupat, telur rebus, perkedel, dan bawang goreng.
</p>

<h3>✨ Tips biar autentik</h3>
<ul>
  <li>Kayu manis dan cengkih wajib ada untuk aroma khas.</li>
  <li>Kuah harus bening tapi kaya rempah.</li>
  <li>Gunakan ayam kampung jika ada.</li>
  <li>Sajikan panas supaya aromanya keluar maksimal.</li>
</ul>
  `
},

"nasi kuning banjar":{
img:"images/nasi-kuning-banjar.jpg",
text:`
  <h2>Nasi Kuning Banjar</h2>

<p class="desc">
Nasi Kuning Banjar adalah nasi gurih berwarna kuning dari kunyit yang dimasak dengan santan dan rempah khas Banjar. Aromanya harum, rasanya legit gurih, dan biasanya disajikan dengan lauk seperti ayam habang, telur, dan sambal. Cocok untuk acara spesial maupun makan sehari-hari.
</p>

<h3>Bahan utama</h3>
<ul>
<li>500 gr beras, cuci bersih</li>
<li>600 ml santan</li>
<li>200 ml air</li>
<li>2 lembar daun salam</li>
<li>2 lembar daun jeruk</li>
<li>1 batang serai, memarkan</li>
<li>1 sdt garam</li>
<li>1 sdt gula</li>
<li>2 sdm minyak</li>
</ul>

<h3>Bumbu halus</h3>
<ul>
<li>5 siung bawang merah</li>
<li>3 siung bawang putih</li>
<li>3 butir kemiri</li>
<li>2 cm kunyit</li>
<li>1 cm jahe</li>
</ul>

<h3>🔥 Cara memasak lengkap</h3>
<ol>
<li>Panaskan minyak, lalu tumis bumbu halus sampai harum dan matang.</li>
<li>Masukkan daun salam, daun jeruk, dan serai. Aduk hingga aromanya keluar.</li>
<li>Tambahkan beras yang sudah dicuci bersih, aduk hingga tercampur dengan bumbu.</li>
<li>Tuang santan dan air, lalu beri garam serta gula.</li>
<li>Masak seperti menanak nasi hingga air mulai menyusut.</li>
<li>Pindahkan nasi ke kukusan, lalu kukus sekitar 15–20 menit sampai matang dan pulen.</li>
<li>Aduk nasi hingga merata, lalu sajikan hangat dengan lauk pelengkap.</li>
</ol>

<h3>✨ Tips biar makin enak</h3>
<ul>
<li>Gunakan kunyit segar supaya warna kuning lebih cerah dan alami.</li>
<li>Aduk santan perlahan saat dimasak agar tidak pecah.</li>
<li>Kukus nasi setelah air menyusut agar teksturnya lebih pulen.</li>
<li>Lebih nikmat disajikan dengan ayam habang, telur rebus, dan sambal.</li>
</ul>
  `
},

"ikan baubar":{
img:"images/ikan-baubar.jpg",
text:`
<h2>Ikan Baubar</h2>

<p class="desc">
Ikan Baubar dikenal dengan bumbu merah yang meresap sampai ke dalam daging ikan. Rasanya pedas gurih, sedikit manis, dan wangi bakaran yang bikin auto lapar.
</p>

<h3>🧺 Bahan lengkap</h3>

Bahan utama
<ul>
  <li>2 ekor ikan segar (nila, kembung, patin, atau kakap)</li>
  <li>1 buah jeruk nipis</li>
  <li>Garam secukupnya</li>
</ul>

Bumbu halus
<ul>
  <li>8 siung bawang merah</li>
  <li>4 siung bawang putih</li>
  <li>5 cabai merah besar</li>
  <li>5 cabai rawit (sesuaikan pedas)</li>
  <li>3 butir kemiri</li>
  <li>2 cm kunyit</li>
  <li>1 cm jahe</li>
  <li>1 sdt terasi bakar</li>
  <li>1 sdt gula merah</li>
  <li>Garam secukupnya</li>
</ul>

Bahan tambahan
<ul>
  <li>2 sdm kecap manis</li>
  <li>2 sdm minyak untuk menumis</li>
  <li>Daun pisang (opsional untuk aroma bakar)</li>
</ul>

<h3>🔥 Cara memasak lengkap</h3>

<p>
A. Siapkan ikan<br>
Bersihkan ikan.<br>
Lumuri dengan jeruk nipis dan garam.<br>
Diamkan 10–15 menit lalu bilas ringan.
</p>

<p>
B. Tumis bumbu<br>
Haluskan semua bumbu.<br>
Tumis sampai harum dan matang.<br>
Tambahkan kecap manis dan sedikit air.<br>
Masak sampai bumbu agak kental.
</p>

<p>
C. Lumuri ikan<br>
Oleskan bumbu ke seluruh permukaan ikan.<br>
Diamkan minimal 20–30 menit supaya meresap.
</p>

<p>
D. Proses bakar<br>
Bakar ikan di atas arang atau teflon.<br>
Bolak-balik sambil dioles sisa bumbu.<br>
Bakar sampai matang dan sedikit karamellized.
</p>

<p>
E. Finishing<br>
Angkat saat permukaan ikan agak kering dan wangi.<br>
Oles tipis bumbu terakhir biar glossy.
</p>

<h3>✨ Tips biar makin mantap</h3>
<ul>
  <li>Pakai arang supaya aroma lebih smoky.</li>
  <li>Jangan terlalu sering dibalik saat membakar.</li>
  <li>Marinasi lebih lama membuat bumbu lebih meresap.</li>
  <li>Bumbu harus matang sebelum dioles ke ikan.</li>
</ul>
`
},

"pais ikan":{
img:"images/pais-ikan.jpg",
text:`
  <h2>Pais Ikan</h2>

<p class="desc">
Pais ikan adalah olahan ikan berbumbu rempah yang dibungkus daun pisang lalu dikukus atau dibakar. Aromanya wangi, bumbunya meresap, dan teksturnya lembut banget.
</p>

<h3>🧺 Bahan lengkap</h3>

Bahan utama
<ul>
  <li>3–4 potong ikan (patin, nila, atau gabus)</li>
  <li>Daun pisang secukupnya</li>
  <li>Tusuk lidi</li>
  <li>1 buah jeruk nipis</li>
  <li>Garam secukupnya</li>
</ul>

Bumbu halus
<ul>
  <li>6 siung bawang merah</li>
  <li>3 siung bawang putih</li>
  <li>3 cabai merah</li>
  <li>5 cabai rawit (opsional)</li>
  <li>2 butir kemiri</li>
  <li>2 cm kunyit</li>
  <li>1 cm jahe</li>
  <li>1 sdt ketumbar</li>
  <li>Garam & gula secukupnya</li>
</ul>

Bahan tambahan
<ul>
  <li>1 batang serai, iris tipis</li>
  <li>2 lembar daun jeruk, iris</li>
  <li>1 batang daun bawang, iris</li>
  <li>Kemangi (opsional)</li>
</ul>

<h3>🔥 Cara memasak lengkap</h3>

<p>
A. Siapkan ikan<br>
Bersihkan ikan.<br>
Lumuri dengan jeruk nipis dan garam.<br>
Diamkan 10 menit lalu bilas.
</p>

<p>
B. Siapkan bumbu<br>
Haluskan semua bumbu.<br>
Campur dengan serai, daun jeruk, dan daun bawang.<br>
Aduk sampai merata.
</p>

<p>
C. Bungkus ikan<br>
Panaskan daun pisang sebentar agar lentur.<br>
Letakkan ikan di atas daun pisang.<br>
Olesi bumbu hingga merata.<br>
Tambahkan kemangi di atas ikan.
</p>

<p>
D. Kukus ikan<br>
Bungkus rapat lalu semat dengan lidi.<br>
Kukus selama 25–30 menit sampai matang.
</p>

<p>
E. Finishing<br>
Setelah matang, boleh dibakar sebentar.<br>
Tujuannya agar aroma daun pisang makin wangi.
</p>

<h3>✨ Tips biar makin enak</h3>
<ul>
  <li>Daun pisang wajib dilayukan dulu supaya tidak sobek.</li>
  <li>Ikan segar bikin rasa lebih manis alami.</li>
  <li>Bumbu harus cukup banyak agar meresap.</li>
  <li>Kukus dulu baru bakar untuk aroma maksimal.</li>
</ul>
  `
},

"ayam masak habang":{
img:"images/ayam-habang.jpg",
text:`
  <h2>Ayam Masak Habang</h2>

<p class="desc">
Ayam Masak Habang adalah hidangan khas Banjar dengan warna merah pekat dari cabai kering. 
Rasanya manis, gurih, sedikit pedas, dan rempahnya terasa kuat. Biasanya hadir di acara spesial, 
tapi tetap cocok jadi menu rumahan yang istimewa.
</p>

<h3>🧺 Bahan lengkap</h3>

Bahan utama
<ul>
  <li>1 ekor ayam, potong sesuai selera</li>
  <li>500 ml air</li>
  <li>2 lembar daun salam</li>
  <li>2 batang serai, memarkan</li>
  <li>Garam secukupnya</li>
  <li>1 sdm gula merah</li>
  <li>2 sdm kecap manis</li>
  <li>Minyak untuk menumis</li>
</ul>

Bumbu halus
<ul>
  <li>8 siung bawang merah</li>
  <li>4 siung bawang putih</li>
  <li>6 cabai merah kering, rendam air hangat</li>
  <li>3 butir kemiri</li>
  <li>2 cm jahe</li>
  <li>1 sdt ketumbar</li>
  <li>Garam secukupnya</li>
</ul>

Bahan tambahan
<ul>
  <li>1 sdt asam jawa (opsional)</li>
  <li>Bawang goreng untuk taburan</li>
</ul>

<h3>🔥 Cara memasak lengkap</h3>

<p>
A. Siapkan ayam<br>
Cuci ayam sampai bersih.
</p>

<p>
B. Siapkan bumbu<br>
Haluskan semua bumbu sampai lembut.
</p>

<p>
C. Tumis bumbu<br>
Panaskan minyak lalu tumis bumbu halus sampai harum dan matang.<br>
Masukkan serai dan daun salam, aduk hingga wangi.
</p>

<p>
D. Masak ayam<br>
Masukkan ayam lalu aduk sampai ayam berubah warna.<br>
Tuang air dan masak dengan api sedang.
</p>

<p>
E. Tambahkan bumbu rasa<br>
Masukkan gula merah, kecap manis, dan garam.<br>
Masak sampai ayam empuk dan bumbu mulai mengental.
</p>

<p>
F. Finishing<br>
Jika suka tambahkan sedikit asam jawa.<br>
Masak sampai kuah menyusut dan bumbu pekat menempel pada ayam.
</p>

<h3>✨ Tips biar autentik</h3>
<ul>
  <li>Gunakan cabai merah kering supaya warna merah khas keluar.</li>
  <li>Masak sampai bumbu benar-benar mengental.</li>
  <li>Rasa harus dominan manis gurih khas Banjar.</li>
  <li>Lebih enak dimasak agak lama supaya bumbu meresap.</li>
</ul>
  `
},

"ikan patin bakar":{
img:"images/ikan-patin-bakar.jpg",
text:`
  <h2>Ikan Patin Bakar</h2>

<p class="desc">
Ikan patin bakar punya tekstur lembut dan lemak alami yang bikin rasanya gurih banget. 
Dipadu bumbu rempah dan aroma bakaran, sekali makan langsung auto nambah nasi.
</p>

<h3>🧺 Bahan lengkap</h3>

Bahan utama
<ul>
  <li>2 ekor ikan patin ukuran sedang</li>
  <li>1 buah jeruk nipis</li>
  <li>Garam secukupnya</li>
  <li>2 sdm kecap manis</li>
  <li>1 sdm margarin/minyak</li>
</ul>

Bumbu halus
<ul>
  <li>6 siung bawang merah</li>
  <li>4 siung bawang putih</li>
  <li>3 cabai merah</li>
  <li>2 cm kunyit</li>
  <li>1 cm jahe</li>
  <li>2 butir kemiri</li>
  <li>1 sdt ketumbar</li>
  <li>Garam & gula secukupnya</li>
</ul>

Bahan tambahan
<ul>
  <li>1 batang serai, memarkan</li>
  <li>2 lembar daun jeruk</li>
  <li>1 sdm air asam jawa (opsional)</li>
</ul>

<h3>🔥 Cara memasak lengkap</h3>

<p>
A. Siapkan ikan<br>
Bersihkan ikan patin.<br>
Lumuri dengan jeruk nipis dan garam.<br>
Diamkan 10 menit lalu bilas.
</p>

<p>
B. Masak bumbu<br>
Haluskan semua bumbu.<br>
Tumis sampai harum.<br>
Tambahkan serai dan daun jeruk.<br>
Masak sampai bumbu matang.
</p>

<p>
C. Marinasi ikan<br>
Campur bumbu tumis dengan kecap manis dan sedikit minyak.<br>
Oleskan bumbu ke seluruh ikan.<br>
Diamkan sekitar 30 menit supaya meresap.
</p>

<p>
D. Proses bakar<br>
Bakar ikan di atas arang atau teflon.<br>
Bolak-balik sambil dioles sisa bumbu.<br>
Masak sampai matang dan aromanya wangi.
</p>

<p>
E. Finishing<br>
Angkat saat permukaan ikan sedikit kering.<br>
Biasanya akan muncul warna karamelisasi dari kecap.
</p>

<h3>✨ Tips biar makin enak</h3>
<ul>
  <li>Jangan terlalu sering membalik ikan supaya tidak hancur.</li>
  <li>Marinasi lebih lama membuat bumbu lebih meresap.</li>
  <li>Pakai arang untuk aroma smoky khas.</li>
  <li>Oles bumbu beberapa kali saat membakar.</li>
</ul>
  `
},

"ikan papuyu masak kuning":{
img:"images/ikan-patin-kuah.jpg",
text:`
  <h2>Ikan Papuyu Masak Kuning</h2>

<p class="desc">
Menu rumahan khas Banjar ini punya kuah kuning segar dengan aroma kunyit dan rempah yang kuat. 
Ikan papuyu (betok) teksturnya padat dan gurih, makin mantap dimasak kuah kuning hangat.
</p>

<h3>🧺 Bahan lengkap</h3>

Bahan utama
<ul>
  <li>6–8 ekor ikan papuyu/betok, bersihkan</li>
  <li>1 liter air</li>
  <li>1 batang serai, memarkan</li>
  <li>2 lembar daun salam</li>
  <li>2 lembar daun jeruk</li>
  <li>1 ruas lengkuas, memarkan</li>
  <li>Garam secukupnya</li>
  <li>Gula secukupnya</li>
  <li>1 buah jeruk nipis</li>
</ul>

Bumbu halus
<ul>
  <li>6 siung bawang merah</li>
  <li>3 siung bawang putih</li>
  <li>3 butir kemiri</li>
  <li>2 cm kunyit</li>
  <li>1 cm jahe</li>
  <li>1 sdt ketumbar</li>
  <li>3 cabai merah (opsional)</li>
</ul>

Bahan tambahan
<ul>
  <li>1 buah tomat, potong</li>
  <li>2 batang daun bawang, iris</li>
  <li>Cabai rawit utuh (opsional)</li>
</ul>

<h3>🔥 Cara memasak lengkap</h3>

<p>
A. Siapkan ikan<br>
Cuci ikan papuyu.<br>
Lumuri dengan jeruk nipis dan garam.<br>
Diamkan sekitar 10 menit lalu bilas.
</p>

<p>
B. Siapkan bumbu<br>
Haluskan semua bumbu sampai lembut.
</p>

<p>
C. Masak bumbu<br>
Tumis bumbu halus sampai harum dan matang.<br>
Masukkan serai, daun salam, daun jeruk, dan lengkuas.
</p>

<p>
D. Masak kuah<br>
Tuang air lalu masak sampai mendidih.
</p>

<p>
E. Masukkan ikan<br>
Masukkan ikan papuyu dan masak dengan api sedang.<br>
Tambahkan garam dan gula secukupnya.
</p>

<p>
F. Finishing<br>
Masukkan tomat dan cabai rawit utuh.<br>
Masak sekitar 15 menit sampai ikan matang.<br>
Terakhir masukkan daun bawang lalu angkat.
</p>

<h3>✨ Tips biar autentik</h3>
<ul>
  <li>Jangan terlalu sering diaduk supaya ikan tidak hancur.</li>
  <li>Kunyit harus cukup agar warna kuning pekat.</li>
  <li>Ikan papuyu segar membuat rasa lebih gurih.</li>
  <li>Kuah sebaiknya ringan tapi kaya rempah.</li>
</ul>
  `
},

"nasi bekepor":{
img:"images/uduk-banjar.jpg",
text:`
  <h2>Nasi Bekepor</h2>

<p class="desc">
Nasi Bekepor adalah nasi tradisional khas Kutai, Kalimantan Timur, yang dimasak bersama rempah, santan, dan lauk seperti ikan asin atau ayam. Rasanya gurih, harum, dan kaya bumbu karena dimasak dalam satu panci hingga meresap sempurna. Biasanya disajikan dengan sambal raja dan lauk pelengkap.
</p>

<h3>Bahan utama</h3>
<ul>
<li>500 gr beras, cuci bersih</li>
<li>750 ml santan sedang</li>
<li>200 ml air</li>
<li>150 gr ikan asin (atau ayam suwir)</li>
<li>2 lembar daun salam</li>
<li>2 lembar daun jeruk</li>
<li>1 batang serai, memarkan</li>
<li>2 sdm minyak</li>
<li>Garam secukupnya</li>
<li>Gula secukupnya</li>
</ul>

<h3>Bumbu halus</h3>
<ul>
<li>6 siung bawang merah</li>
<li>4 siung bawang putih</li>
<li>3 buah cabai merah</li>
<li>2 butir kemiri</li>
<li>1 cm kunyit</li>
<li>1 cm jahe</li>
<li>1 cm lengkuas</li>
</ul>

<h3>🔥 Cara memasak lengkap</h3>
<ol>
<li>Panaskan minyak, lalu tumis bumbu halus sampai harum dan matang.</li>
<li>Masukkan daun salam, daun jeruk, dan serai. Aduk hingga aromanya keluar.</li>
<li>Tambahkan ikan asin atau ayam suwir, aduk sebentar sampai tercampur.</li>
<li>Masukkan beras yang sudah dicuci bersih, aduk hingga beras terbalut bumbu.</li>
<li>Tuang santan dan air, lalu bumbui dengan garam dan gula secukupnya.</li>
<li>Masak seperti menanak nasi hingga air mulai menyusut.</li>
<li>Kecilkan api, tutup panci, dan masak sampai nasi matang serta pulen.</li>
<li>Aduk perlahan agar nasi tercampur merata, lalu sajikan hangat dengan sambal dan lauk pelengkap.</li>
</ol>

<h3>✨ Tips biar makin enak</h3>
<ul>
<li>Gunakan santan segar agar aroma nasi lebih gurih.</li>
<li>Jika memakai ikan asin, goreng sebentar terlebih dahulu agar lebih harum.</li>
<li>Masak dengan api kecil saat proses akhir supaya nasi tidak gosong.</li>
<li>Sajikan bersama sambal raja dan lalapan untuk rasa yang lebih lengkap.</li>
</ul>
  `
},

"kepiting soka":{
img:"images/sayur-asam-banjar.jpg",
text:`
  <h2>Kepiting Soka</h2>

<p class="desc">
Kepiting soka adalah kepiting bercangkang lunak yang bisa dimakan semuanya. Teksturnya renyah di luar, lembut di dalam. Biasanya digoreng crispy lalu disajikan dengan saus pedas manis atau lada hitam.
</p>

<h3>Bahan utama</h3>
<ul>
<li>4 ekor kepiting soka (soft shell crab)</li>
<li>1 buah jeruk nipis</li>
<li>Garam secukupnya</li>
<li>Minyak goreng secukupnya</li>
</ul>

<h3>Bahan tepung</h3>
<ul>
<li>6 sdm tepung terigu</li>
<li>3 sdm tepung maizena</li>
<li>½ sdt merica</li>
<li>½ sdt garam</li>
<li>Air secukupnya</li>
</ul>

<h3>Bahan saus (opsional pedas manis)</h3>
<ul>
<li>3 siung bawang putih, cincang</li>
<li>3 sdm saus tomat</li>
<li>2 sdm saus sambal</li>
<li>1 sdm saus tiram</li>
<li>1 sdt gula</li>
<li>100 ml air</li>
</ul>

<h3>🔥 Cara memasak lengkap</h3>
<ol>
<li>Cuci kepiting soka, lumuri jeruk nipis dan sedikit garam.</li>
<li>Diamkan 5–10 menit lalu bilas.</li>
<li>Campur tepung terigu, maizena, garam, dan merica.</li>
<li>Tambahkan sedikit air sampai jadi adonan kental.</li>
<li>Celupkan kepiting ke adonan tepung.</li>
<li>Panaskan minyak banyak dengan api sedang.</li>
<li>Goreng kepiting sampai kuning keemasan dan crispy.</li>
<li>Angkat dan tiriskan.</li>
</ol>

<h3>Membuat saus (opsional)</h3>
<ol>
<li>Tumis bawang putih sampai harum.</li>
<li>Masukkan saus tomat, saus sambal, saus tiram, gula, dan air.</li>
<li>Masak sampai sedikit mengental.</li>
<li>Masukkan kepiting goreng, aduk cepat lalu angkat.</li>
</ol>

<h3>✨ Tips biar crispy</h3>
<ul>
<li>Minyak harus panas sebelum menggoreng.</li>
<li>Jangan terlalu lama menggoreng supaya tetap juicy.</li>
<li>Tepung maizena bikin tekstur lebih renyah.</li>
<li>Sajikan langsung saat masih panas.</li>
</ul>
  `
},

"lontong orari":{
img:"images/lontong-orari.jpg",
text:`
  <h2>Lontong Orari</h2>

<p class="desc">
Lontong Orari adalah kuliner khas Banjar yang terkenal sebagai menu sarapan. Isinya lontong dengan kuah santan gurih, sayur nangka atau labu, telur, dan kadang ditambah ayam atau ikan. Rasanya kaya rempah, gurih, dan sedikit pedas, cocok dinikmati hangat di pagi hari.
</p>

<h3>Bahan utama</h3>
<ul>
<li>5 buah lontong, potong</li>
<li>500 ml santan</li>
<li>200 ml air</li>
<li>2 butir telur rebus</li>
<li>150 gr ayam suwir (opsional)</li>
<li>100 gr nangka muda atau labu, potong</li>
<li>2 lembar daun salam</li>
<li>2 lembar daun jeruk</li>
<li>1 batang serai, memarkan</li>
<li>Garam secukupnya</li>
<li>Gula secukupnya</li>
<li>Minyak untuk menumis</li>
</ul>

<h3>Bumbu halus</h3>
<ul>
<li>6 siung bawang merah</li>
<li>4 siung bawang putih</li>
<li>4 buah cabai merah</li>
<li>2 butir kemiri</li>
<li>1 cm kunyit</li>
<li>1 cm jahe</li>
</ul>

<h3>🔥 Cara memasak lengkap</h3>
<ol>
<li>Panaskan minyak, lalu tumis bumbu halus sampai harum dan matang.</li>
<li>Masukkan daun salam, daun jeruk, dan serai. Aduk hingga aromanya keluar.</li>
<li>Tambahkan nangka muda atau labu, lalu aduk sebentar.</li>
<li>Tuang santan dan air, masak sambil diaduk perlahan agar santan tidak pecah.</li>
<li>Masukkan ayam suwir, lalu bumbui dengan garam dan gula.</li>
<li>Masak hingga sayur empuk dan kuah sedikit mengental.</li>
<li>Siapkan potongan lontong di dalam mangkuk.</li>
<li>Siram kuah beserta sayur dan lauk di atas lontong.</li>
<li>Tambahkan telur rebus dan sambal sesuai selera, lalu sajikan hangat.</li>
</ol>

<h3>✨ Tips biar makin enak</h3>
<ul>
<li>Gunakan santan segar agar kuah lebih gurih dan harum.</li>
<li>Aduk santan perlahan saat dimasak supaya tidak pecah.</li>
<li>Tambahkan bawang goreng di atasnya untuk aroma lebih sedap.</li>
<li>Lontong Orari paling nikmat disantap saat masih hangat di pagi hari.</li>
</ul>
  `
},

"ketupat kandangan set":{
img:"images/ketupat-lauk.jpg",
text:`
  <h2>Ketupat Kandangan (Set Lengkap)</h2>

<p class="desc">
Ketupat Kandangan adalah hidangan khas Banjar yang berisi ketupat dengan ikan gabus asap dan kuah santan gurih. Rasanya kaya rempah, sedikit smoky dari ikan, dan sangat nikmat dimakan hangat. Biasanya disajikan lengkap dengan telur dan sambal sebagai menu utama yang mengenyangkan.
</p>

<h3>Bahan utama</h3>
<ul>
<li>6 buah ketupat matang, potong</li>
<li>2 ekor ikan gabus asap (atau ikan haruan asap)</li>
<li>700 ml santan</li>
<li>300 ml air</li>
<li>2 lembar daun salam</li>
<li>2 lembar daun jeruk</li>
<li>1 batang serai, memarkan</li>
<li>1 sdt garam</li>
<li>1 sdt gula</li>
<li>Minyak untuk menumis</li>
</ul>

<h3>Bumbu halus</h3>
<ul>
<li>8 siung bawang merah</li>
<li>5 siung bawang putih</li>
<li>4 buah cabai merah</li>
<li>3 butir kemiri</li>
<li>2 cm kunyit</li>
<li>1 cm jahe</li>
</ul>

<h3>Pelengkap set</h3>
<ul>
<li>3 butir telur rebus</li>
<li>Bawang goreng</li>
<li>Sambal merah</li>
<li>Jeruk limau (opsional)</li>
</ul>

<h3>🔥 Cara memasak lengkap</h3>
<ol>
<li>Panaskan minyak, lalu tumis bumbu halus sampai harum dan matang.</li>
<li>Masukkan daun salam, daun jeruk, dan serai. Aduk hingga aromanya keluar.</li>
<li>Tuang santan dan air, masak sambil diaduk perlahan agar santan tidak pecah.</li>
<li>Masukkan ikan gabus asap, lalu masak hingga kuah meresap ke dalam ikan.</li>
<li>Tambahkan garam dan gula, lalu koreksi rasa.</li>
<li>Siapkan potongan ketupat di dalam mangkuk saji.</li>
<li>Siram kuah santan beserta ikan di atas ketupat.</li>
<li>Tambahkan telur rebus, bawang goreng, sambal merah, dan perasan jeruk limau jika suka.</li>
<li>Sajikan hangat.</li>
</ol>

<h3>✨ Tips biar makin enak</h3>
<ul>
<li>Gunakan ikan gabus asap asli agar aroma smoky lebih terasa.</li>
<li>Aduk santan perlahan saat dimasak supaya tidak pecah.</li>
<li>Tambahkan sedikit perasan jeruk limau untuk rasa segar.</li>
<li>Lebih nikmat dimakan saat kuah masih panas.</li>
</ul>
  `
},

"nasi itik gambut":{
img:"images/nasi-itik-gambut.jpg",
text:`
  <h2>Nasi Itik Gambut</h2>

<p class="desc">
Nasi Itik Gambut adalah hidangan khas Banjar yang terkenal dengan lauk itik berbumbu merah habang. Rasanya gurih, pedas, dan kaya rempah dengan tekstur daging itik yang empuk serta meresap bumbu. Biasanya disajikan dengan nasi putih hangat, sambal, dan telur atau sayur pelengkap.
</p>

<h3>Bahan utama</h3>
<ul>
<li>1 ekor itik, potong</li>
<li>1 liter air</li>
<li>3 sdm minyak</li>
<li>2 lembar daun salam</li>
<li>2 lembar daun jeruk</li>
<li>1 batang serai, memarkan</li>
<li>Garam secukupnya</li>
<li>Gula merah secukupnya</li>
<li>Kaldu bubuk secukupnya</li>
</ul>

<h3>Bumbu halus</h3>
<ul>
<li>8 siung bawang merah</li>
<li>5 siung bawang putih</li>
<li>6 buah cabai merah keriting</li>
<li>4 buah cabai rawit</li>
<li>3 butir kemiri</li>
<li>1 cm jahe</li>
<li>1 cm lengkuas</li>
<li>1 sdt terasi</li>
</ul>

<h3>🔥 Cara memasak lengkap</h3>
<ol>
<li>Rebus potongan itik sebentar dengan air dan sedikit garam untuk menghilangkan bau, lalu tiriskan.</li>
<li>Panaskan minyak, lalu tumis bumbu halus sampai harum dan matang.</li>
<li>Masukkan daun salam, daun jeruk, dan serai. Aduk hingga aromanya keluar.</li>
<li>Masukkan potongan itik, aduk hingga tercampur rata dengan bumbu.</li>
<li>Tuang air, lalu tambahkan garam, gula merah, dan kaldu bubuk.</li>
<li>Masak dengan api kecil hingga daging itik empuk dan bumbu meresap.</li>
<li>Lanjutkan memasak sampai kuah menyusut dan agak kental.</li>
<li>Sajikan itik bersama nasi hangat dan sambal.</li>
</ol>

<h3>✨ Tips biar makin enak</h3>
<ul>
<li>Rebus itik terlebih dahulu untuk mengurangi bau khas daging itik.</li>
<li
  `
},

"nasi subut":{
img:"images/gangan-waluh.jpg",
text:`
  <h2>Nasi Subut</h2>

<p class="desc">
Nasi Subut adalah makanan tradisional Kalimantan Timur yang terbuat dari campuran beras, jagung, dan ubi jalar. Teksturnya unik, gurih, dan sedikit manis alami dari jagung serta ubi. Biasanya disajikan dengan lauk ikan asin, sambal, atau sayur sederhana. Cocok sebagai menu rumahan yang mengenyangkan dan sederhana.
</p>

<h3>Bahan utama</h3>
<ul>
<li>300 gr beras</li>
<li>200 gr jagung pipil</li>
<li>200 gr ubi jalar, potong dadu</li>
<li>800 ml air</li>
<li>1 sdt garam</li>
<li>1 sdm minyak atau margarin</li>
</ul>

<h3>Bumbu tambahan (opsional)</h3>
<ul>
<li>2 lembar daun pandan</li>
<li>1 batang serai, memarkan</li>
</ul>

<h3>🔥 Cara memasak lengkap</h3>
<ol>
<li>Cuci beras hingga bersih lalu tiriskan.</li>
<li>Rebus jagung pipil dan ubi jalar sekitar ±5 menit agar setengah matang, lalu tiriskan.</li>
<li>Masukkan beras, jagung, dan ubi ke dalam panci atau rice cooker.</li>
<li>Tambahkan air, garam, dan minyak atau margarin.</li>
<li>Masak seperti menanak nasi hingga matang.</li>
<li>Jika menggunakan daun pandan dan serai, masukkan saat mulai memasak agar aromanya meresap.</li>
<li>Setelah matang, aduk perlahan supaya semua bahan tercampur merata.</li>
<li>Sajikan hangat dengan lauk seperti ikan asin, sambal, atau sayur.</li>
</ol>

<h3>✨ Tips biar makin enak</h3>
<ul>
<li>Pilih jagung yang masih muda supaya rasa manis alaminya lebih terasa.</li>
<li>Ubi jalar kuning atau oranye memberi warna lebih cantik pada nasi.</li>
<li>Tambahkan sedikit margarin untuk aroma lebih gurih.</li>
<li>Nasi subut paling nikmat dimakan dengan ikan asin goreng dan sambal pedas.</li>
</ul>
  `
},

"ayam kuah kuning":{
img:"images/sayur-umbut.jpg",
text:`
  <h2>Ayam Kuah Kuning</h2>

<p class="desc">
Ayam kuah kuning punya rasa gurih hangat dengan aroma kunyit dan rempah yang ringan.
Kuahnya segar tapi tetap kaya rasa, cocok banget dimakan panas saat lapar berat.
</p>

<h3>Bahan utama</h3>
<ul>
<li>1 ekor ayam, potong sesuai selera</li>
<li>1 liter air</li>
<li>300 ml santan (opsional, bisa tanpa santan)</li>
<li>1 batang serai, memarkan</li>
<li>2 lembar daun salam</li>
<li>2 lembar daun jeruk</li>
<li>1 ruas lengkuas, memarkan</li>
<li>Garam secukupnya</li>
<li>Gula secukupnya</li>
</ul>

<h3>Bumbu halus</h3>
<ul>
<li>6 siung bawang merah</li>
<li>4 siung bawang putih</li>
<li>3 butir kemiri</li>
<li>2 cm kunyit</li>
<li>1 cm jahe</li>
<li>1 sdt ketumbar</li>
<li>½ sdt merica</li>
</ul>

<h3>Bahan tambahan</h3>
<ul>
<li>1 buah tomat, potong</li>
<li>2 batang daun bawang, iris</li>
<li>Cabai rawit utuh (opsional)</li>
</ul>

<h3>🔥 Cara memasak lengkap</h3>
<ol>
<li>Cuci ayam hingga bersih.</li>
<li>Haluskan semua bumbu.</li>
<li>Tumis bumbu sampai harum dan matang.</li>
<li>Masukkan serai, daun salam, daun jeruk, dan lengkuas.</li>
<li>Masukkan ayam, aduk sampai berubah warna.</li>
<li>Tuang air, masak hingga mendidih.</li>
<li>Tambahkan garam dan gula secukupnya.</li>
<li>Masak sampai ayam empuk.</li>
<li>Masukkan santan (jika pakai), aduk perlahan.</li>
<li>Tambahkan tomat dan cabai rawit.</li>
<li>Masak hingga kuah matang dan meresap.</li>
<li>Terakhir masukkan daun bawang, lalu angkat.</li>
</ol>

<h3>✨ Tips biar makin enak</h3>
<ul>
<li>Kunyit harus cukup supaya warna kuning keluar.</li>
<li>Masak dengan api kecil setelah santan masuk.</li>
<li>Jangan terlalu sering diaduk agar ayam tidak hancur.</li>
<li>Lebih enak dimakan saat kuah masih panas.</li>
</ul>
  `
},

"ayam cincane":{
img:"images/saluang-goreng.jpg",
text:`
  <h2>Ayam Cincane</h2>

<p class="desc">
Ayam Cincane adalah salah satu ikon kuliner Samarinda. Ciri khasnya ada pada warna merah menggoda, 
bumbu rempah manis-gurih yang meresap, dan aroma bakaran yang kuat. Biasanya hadir di acara besar, 
tapi tetap cocok jadi menu spesial di rumah.
</p>

<h3>🧺 Bahan lengkap</h3>

Bahan utama
<ul>
  <li>1 ekor ayam (potong 4 atau 8)</li>
  <li>1 buah jeruk nipis</li>
  <li>Garam secukupnya</li>
  <li>500 ml santan sedang</li>
  <li>2 sdm kecap manis</li>
  <li>1 sdm gula merah</li>
</ul>

Bumbu halus
<ul>
  <li>8 siung bawang merah</li>
  <li>5 siung bawang putih</li>
  <li>6 cabai merah besar</li>
  <li>5 cabai rawit (opsional)</li>
  <li>3 butir kemiri</li>
  <li>2 cm kunyit</li>
  <li>1 cm jahe</li>
  <li>1 sdt ketumbar</li>
  <li>Garam secukupnya</li>
</ul>

Bahan tambahan
<ul>
  <li>2 batang serai, memarkan</li>
  <li>2 lembar daun salam</li>
  <li>2 lembar daun jeruk</li>
  <li>1 sdm margarin untuk olesan</li>
</ul>

<h3>🔥 Cara memasak lengkap</h3>

<p>
A. Siapkan ayam<br>
Cuci ayam lalu lumuri dengan jeruk nipis dan garam.<br>
Diamkan sekitar 10 menit lalu bilas.
</p>

<p>
B. Siapkan bumbu<br>
Haluskan semua bumbu sampai lembut.
</p>

<p>
C. Tumis bumbu<br>
Panaskan minyak lalu tumis bumbu halus sampai harum dan matang.<br>
Masukkan serai, daun salam, dan daun jeruk.
</p>

<p>
D. Masak ayam<br>
Masukkan ayam lalu aduk sampai berubah warna.<br>
Tuang santan dan masak dengan api sedang.
</p>

<p>
E. Tambahkan rasa<br>
Masukkan kecap manis dan gula merah.<br>
Masak sampai ayam empuk dan bumbu meresap.
</p>

<p>
F. Proses bakar<br>
Angkat ayam dan sisakan sedikit bumbu untuk olesan.<br>
Bakar ayam di atas arang atau teflon sambil dioles bumbu dan margarin.
</p>

<p>
G. Finishing<br>
Bakar sampai permukaan ayam sedikit kering dan aromanya harum.
</p>

<h3>✨ Tips biar autentik</h3>
<ul>
  <li>Warna merah berasal dari cabai merah dan kunyit.</li>
  <li>Masak ayam dulu sebelum dibakar agar bumbu meresap.</li>
  <li>Gunakan arang supaya aroma smoky lebih terasa.</li>
  <li>Oles bumbu beberapa kali saat membakar.</li>
</ul>
  `
},

"cumi masak hitam":{
img:"images/gangan-asam.jpg",
text:`
  <h2>Cumi Masak Hitam</h2>

<p class="desc">
Cumi Masak Hitam adalah hidangan laut dengan kuah gelap khas dari tinta cumi yang dimasak bersama bumbu rempah. Rasanya gurih, sedikit pedas, dan aromatik. Tekstur cuminya empuk dengan kuah pekat yang paling nikmat disantap bareng nasi hangat.
</p>

<h3>Bahan utama</h3>
<ul>
<li>500 gr cumi segar ukuran sedang</li>
<li>1 buah jeruk nipis</li>
<li>2 lembar daun salam</li>
<li>2 lembar daun jeruk</li>
<li>1 batang serai, memarkan</li>
<li>200 ml air</li>
<li>3 sdm minyak untuk menumis</li>
<li>Garam secukupnya</li>
<li>Gula secukupnya</li>
<li>Kaldu bubuk secukupnya</li>
</ul>

<h3>Bumbu halus</h3>
<ul>
<li>6 siung bawang merah</li>
<li>4 siung bawang putih</li>
<li>5 buah cabai merah keriting</li>
<li>3 buah cabai rawit (opsional biar pedas)</li>
<li>2 butir kemiri</li>
<li>1 cm jahe</li>
<li>1 cm kunyit</li>
<li>1 cm lengkuas</li>
</ul>

<h3>🔥 Cara memasak lengkap</h3>
<ol>
<li>Bersihkan cumi, jangan buang tintanya. Cuci cepat lalu lumuri dengan jeruk nipis dan sedikit garam. Diamkan 10 menit, lalu bilas.</li>
<li>Panaskan minyak, tumis bumbu halus sampai harum dan matang.</li>
<li>Masukkan daun salam, daun jeruk, dan serai. Aduk sampai wangi.</li>
<li>Masukkan cumi, aduk cepat sampai berubah warna.</li>
<li>Tuang air dan tinta cumi. Aduk rata.</li>
<li>Bumbui garam, gula, dan kaldu.</li>
<li>Masak dengan api sedang sampai kuah mengental dan bumbu meresap (±15–20 menit).</li>
<li>Koreksi rasa. Sajikan hangat dengan nasi putih panas.</li>
</ol>

<h3>✨ Tips biar makin mantap</h3>
<ul>
<li>Jangan masak cumi terlalu lama, nanti teksturnya bisa alot.</li>
<li>Tambahkan cabai rawit utuh kalau mau sensasi pedas khas Banjar.</li>
<li>Enak disajikan dengan sambal terasi dan lalapan segar.</li>
</ul>
  `
},

"ayam panggang banjar":{
img:"images/ayam-panggang-banjar.jpg",
text:`
  <h2>Ayam Panggang Banjar</h2>

<p class="desc">
Ayam Panggang Banjar dikenal dengan bumbu merah kecokelatan yang meresap sampai ke dalam. 
Rasanya manis gurih dengan aroma rempah dan bakaran yang kuat—menu klasik yang selalu jadi favorit di meja makan.
</p>

<h3>🧺 Bahan lengkap</h3>

Bahan utama
<ul>
  <li>1 ekor ayam, potong 4 atau 8</li>
  <li>1 buah jeruk nipis</li>
  <li>Garam secukupnya</li>
  <li>500 ml air</li>
  <li>2 sdm kecap manis</li>
  <li>1 sdm gula merah</li>
</ul>

Bumbu halus
<ul>
  <li>8 siung bawang merah</li>
  <li>4 siung bawang putih</li>
  <li>5 cabai merah besar</li>
  <li>3 butir kemiri</li>
  <li>2 cm jahe</li>
  <li>1 sdt ketumbar</li>
  <li>Garam secukupnya</li>
</ul>

Bahan tambahan
<ul>
  <li>2 batang serai, memarkan</li>
  <li>2 lembar daun salam</li>
  <li>2 lembar daun jeruk</li>
  <li>1 sdm margarin/minyak untuk olesan</li>
</ul>

<h3>🔥 Cara memasak lengkap</h3>

<p>
A. Siapkan ayam<br>
Cuci ayam lalu lumuri dengan jeruk nipis dan garam.<br>
Diamkan sekitar 10 menit lalu bilas.
</p>

<p>
B. Siapkan bumbu<br>
Haluskan semua bumbu sampai lembut.
</p>

<p>
C. Tumis bumbu<br>
Panaskan minyak lalu tumis bumbu halus sampai harum dan matang.<br>
Masukkan serai, daun salam, dan daun jeruk.
</p>

<p>
D. Masak ayam<br>
Masukkan ayam lalu aduk sampai berubah warna.<br>
Tuang air, kecap manis, dan gula merah.<br>
Masak sampai ayam empuk dan bumbu meresap.
</p>

<p>
E. Proses panggang<br>
Angkat ayam dan sisakan sedikit bumbu untuk olesan.<br>
Panggang ayam di atas arang atau teflon.
</p>

<p>
F. Finishing<br>
Olesi ayam dengan bumbu dan margarin sambil dibolak-balik.<br>
Panggang sampai permukaan ayam kecokelatan dan harum.
</p>

<h3>✨ Tips biar makin mantap</h3>
<ul>
  <li>Masak ayam dulu sebelum dipanggang agar bumbu meresap.</li>
  <li>Gunakan arang untuk aroma smoky khas.</li>
  <li>Oles bumbu beberapa kali saat memanggang.</li>
  <li>Jangan panggang terlalu lama supaya ayam tetap juicy.</li>
</ul>
  `
},

"pindang ikan banjar":{
img:"images/papuyu-goreng.jpg",
text:`
  <h2>Pindang Ikan Banjar</h2>

<p class="desc">
Pindang ikan Banjar terkenal dengan kuah kuning segar yang gurih, sedikit asam, dan kaya rempah. Rasanya ringan tapi nendang, cocok dimakan panas dengan nasi putih.
</p>

<h3>🧺 Bahan lengkap</h3>

Bahan utama
<ul>
  <li>500 gr ikan (patin, gabus, atau nila), potong</li>
  <li>1 liter air</li>
  <li>1 batang serai, memarkan</li>
  <li>2 lembar daun salam</li>
  <li>2 lembar daun jeruk</li>
  <li>1 ruas lengkuas, memarkan</li>
  <li>Garam secukupnya</li>
  <li>Gula secukupnya</li>
  <li>1 sdm air asam jawa atau belimbing wuluh</li>
</ul>

Bumbu halus
<ul>
  <li>6 siung bawang merah</li>
  <li>3 siung bawang putih</li>
  <li>2 cm kunyit</li>
  <li>1 cm jahe</li>
  <li>2 butir kemiri</li>
  <li>1 sdt ketumbar</li>
  <li>3 cabai merah</li>
</ul>

Bahan tambahan
<ul>
  <li>1 buah tomat, potong</li>
  <li>Cabai rawit utuh (opsional)</li>
  <li>Daun bawang, iris</li>
</ul>

<h3>🔥 Cara memasak lengkap</h3>

<p>
A. Siapkan ikan<br>
Cuci ikan lalu lumuri jeruk nipis dan garam.<br>
Diamkan sekitar 10 menit lalu bilas.
</p>

<p>
B. Siapkan bumbu<br>
Haluskan semua bumbu sampai lembut.
</p>

<p>
C. Tumis bumbu<br>
Tumis bumbu halus sampai harum dan matang.<br>
Masukkan serai, daun salam, daun jeruk, dan lengkuas.
</p>

<p>
D. Masak kuah<br>
Tuang air lalu didihkan.
</p>

<p>
E. Masukkan ikan<br>
Masukkan ikan dan masak dengan api sedang.<br>
Tambahkan garam dan gula secukupnya.
</p>

<p>
F. Tambahkan rasa<br>
Masukkan air asam jawa atau belimbing wuluh.<br>
Tambahkan tomat dan cabai rawit.
</p>

<p>
G. Finishing<br>
Masak sekitar 15 menit sampai ikan matang.<br>
Terakhir masukkan daun bawang lalu angkat.
</p>

<h3>✨ Tips biar makin enak</h3>
<ul>
  <li>Jangan terlalu sering diaduk agar ikan tidak hancur.</li>
  <li>Rasa harus seimbang: gurih, segar, dan sedikit asam.</li>
  <li>Gunakan ikan segar supaya kuah terasa manis alami.</li>
  <li>Kuah jangan terlalu kental, harus tetap ringan.</li>
</ul>
  `
},

"kari ayam banjar":{
img:"images/nasi-sop-banjar.jpg",
text:`
  <h2>Kari Ayam Banjar</h2>

<p class="desc">
Kari Ayam Banjar punya kuah santan kuning yang gurih, wangi rempah, dan rasa hangat yang nempel di lidah. 
Biasanya disajikan di acara keluarga atau momen spesial, tapi tetap cocok jadi menu rumahan yang bikin nagih.
</p>

<h3>🧺 Bahan lengkap</h3>

Bahan utama
<ul>
  <li>1 ekor ayam, potong sesuai selera</li>
  <li>1 liter santan sedang</li>
  <li>300 ml santan kental</li>
  <li>2 batang serai, memarkan</li>
  <li>2 lembar daun salam</li>
  <li>3 lembar daun jeruk</li>
  <li>1 ruas lengkuas, memarkan</li>
  <li>Garam secukupnya</li>
  <li>Gula secukupnya</li>
</ul>

Bumbu halus
<ul>
  <li>8 siung bawang merah</li>
  <li>4 siung bawang putih</li>
  <li>4 butir kemiri</li>
  <li>2 cm kunyit</li>
  <li>1 cm jahe</li>
  <li>1 sdt ketumbar</li>
  <li>½ sdt merica</li>
  <li>3 cabai merah</li>
</ul>

Bahan tambahan
<ul>
  <li>2 buah kentang, potong dan goreng</li>
  <li>1 buah tomat, potong</li>
  <li>Bawang goreng untuk taburan</li>
</ul>

<h3>🔥 Cara memasak lengkap</h3>

<p>
A. Siapkan ayam<br>
Cuci ayam sampai bersih.
</p>

<p>
B. Siapkan bumbu<br>
Haluskan semua bumbu sampai lembut.
</p>

<p>
C. Tumis bumbu<br>
Panaskan minyak lalu tumis bumbu halus sampai harum dan matang.<br>
Masukkan serai, daun salam, daun jeruk, dan lengkuas.
</p>

<p>
D. Masak ayam<br>
Masukkan ayam lalu aduk sampai ayam berubah warna.<br>
Tuang santan sedang dan masak dengan api kecil sambil diaduk perlahan.
</p>

<p>
E. Tambahkan rasa<br>
Masukkan garam dan gula secukupnya.<br>
Masak sampai ayam empuk.
</p>

<p>
F. Finishing<br>
Masukkan santan kental, kentang goreng, dan tomat.<br>
Masak sampai kuah mengental dan bumbu meresap.
</p>

<h3>✨ Tips biar makin enak</h3>
<ul>
  <li>Gunakan santan segar agar rasa lebih gurih.</li>
  <li>Masak dengan api kecil supaya santan tidak pecah.</li>
  <li>Bumbu harus benar-benar matang sebelum santan dimasukkan.</li>
  <li>Diamkan beberapa menit setelah matang agar bumbu makin meresap.</li>
</ul>
  `
},

"ikan bakar sambal raja":{
img:"images/baung-bakar.jpg",
text:`
  <h2>Ikan Bakar Sambal Raja</h2>

<p class="desc">
Menu khas Kutai ini terkenal dengan ikan bakar gurih yang disiram sambal raja segar: perpaduan pedas, asam, dan wangi jeruk limau yang langsung bikin nafsu makan naik.
</p>

<h3>🧺 Bahan lengkap</h3>

Bahan ikan
<ul>
  <li>2 ekor ikan (nila, patin, atau kakap)</li>
  <li>1 buah jeruk nipis</li>
  <li>Garam secukupnya</li>
  <li>2 sdm kecap manis</li>
  <li>1 sdm margarin/minyak</li>
</ul>

Bumbu oles ikan
<ul>
  <li>4 siung bawang putih</li>
  <li>3 siung bawang merah</li>
  <li>2 cm kunyit</li>
  <li>Garam secukupnya</li>
</ul>

Bahan sambal raja
<ul>
  <li>6 cabai merah keriting</li>
  <li>8 cabai rawit</li>
  <li>5 siung bawang merah iris</li>
  <li>2 siung bawang putih iris</li>
  <li>1 buah tomat, potong</li>
  <li>1 sdt terasi bakar</li>
  <li>1 sdm gula merah</li>
  <li>Garam secukupnya</li>
  <li>1 buah jeruk limau</li>
  <li>Minyak panas secukupnya</li>
</ul>

<h3>🔥 Cara memasak lengkap</h3>

<p>
A. Siapkan ikan<br>
Bersihkan ikan lalu lumuri jeruk nipis dan garam.<br>
Diamkan sekitar 10 menit.
</p>

<p>
B. Siapkan bumbu oles<br>
Haluskan bumbu oles.<br>
Campur dengan kecap manis dan margarin.<br>
Aduk sampai rata.
</p>

<p>
C. Marinasi ikan<br>
Oleskan bumbu ke ikan hingga merata.<br>
Diamkan 20–30 menit supaya meresap.
</p>

<p>
D. Proses bakar<br>
Bakar ikan di atas arang atau teflon.<br>
Olesi lagi dengan sisa bumbu saat membakar.<br>
Masak sampai ikan matang dan wangi.
</p>

<p>
E. Membuat sambal raja<br>
Ulek kasar cabai merah, cabai rawit, dan terasi.<br>
Masukkan irisan bawang merah, bawang putih, dan tomat.<br>
Tambahkan garam dan gula merah.<br>
Siram dengan minyak panas.<br>
Peras jeruk limau lalu aduk rata.
</p>

<h3>✨ Tips biar makin mantap</h3>
<ul>
  <li>Pakai arang supaya aroma smoky keluar.</li>
  <li>Sambal raja jangan terlalu halus supaya teksturnya terasa.</li>
  <li>Jeruk limau bikin rasa segar khas Kutai.</li>
  <li>Oles bumbu beberapa kali saat membakar.</li>
</ul>
  `
},

"udang galah bakar":{
img:"images/gangan-patin.jpg",
text:`
  <h2>Udang Galah Bakar</h2>

<p class="desc">
Udang galah bakar terkenal dengan dagingnya yang tebal, manis alami, dan makin mantap saat dibakar dengan bumbu gurih manis. Aroma bakaran + lelehan mentega bikin susah berhenti makan.
</p>

<h3>🧺 Bahan lengkap</h3>

Bahan utama
<ul>
  <li>500 gr udang galah ukuran besar</li>
  <li>1 buah jeruk nipis</li>
  <li>Garam secukupnya</li>
  <li>1 sdm margarin</li>
  <li>2 sdm kecap manis</li>
</ul>

Bumbu halus
<ul>
  <li>5 siung bawang merah</li>
  <li>3 siung bawang putih</li>
  <li>2 cabai merah</li>
  <li>1 cm jahe</li>
  <li>1 sdt ketumbar</li>
  <li>Garam secukupnya</li>
  <li>1 sdt gula</li>
</ul>

Bahan olesan
<ul>
  <li>1 sdm margarin cair</li>
  <li>1 sdm kecap manis</li>
  <li>Sisa bumbu halus yang sudah ditumis</li>
</ul>

<h3>🔥 Cara memasak lengkap</h3>

<p>
A. Siapkan udang<br>
Cuci udang galah lalu belah punggungnya agar bumbu meresap.<br>
Lumuri dengan jeruk nipis dan garam.<br>
Diamkan 10 menit lalu bilas.
</p>

<p>
B. Siapkan bumbu<br>
Haluskan semua bumbu.<br>
Tumis sampai harum dan matang.
</p>

<p>
C. Marinasi udang<br>
Campur bumbu tumis dengan kecap manis dan margarin.<br>
Oleskan bumbu ke udang hingga merata.<br>
Diamkan sekitar 20–30 menit.
</p>

<p>
D. Proses bakar<br>
Bakar udang di atas arang atau teflon.<br>
Olesi dengan campuran margarin dan bumbu saat dibakar.<br>
Balik sekali saja agar daging tetap juicy.
</p>

<p>
E. Finishing<br>
Bakar sampai matang dan muncul sedikit karamelisasi pada permukaan udang.
</p>

<h3>✨ Tips biar maksimal</h3>
<ul>
  <li>Jangan terlalu lama memasak agar udang tetap lembut.</li>
  <li>Gunakan arang supaya aroma smoky lebih kuat.</li>
  <li>Oles mentega saat akhir pembakaran untuk rasa lebih gurih.</li>
  <li>Belah punggung udang supaya bumbu lebih meresap.</li>
</ul>
  `
},

"udang masak habang":{
img:"images/ayam-kuah-kuning.jpg",
text:`
  <h2>Udang Masak Habang</h2>

<p class="desc">
Udang Masak Habang adalah versi seafood dari masakan habang khas Banjar. Warnanya merah pekat dari cabai kering, rasanya manis gurih dengan sentuhan pedas ringan dan rempah yang kuat. Simpel tapi mewah di meja makan.
</p>

<h3>Bahan utama</h3>
<ul>
<li>500 gr udang ukuran sedang, bersihkan</li>
<li>200 ml air</li>
<li>2 lembar daun salam</li>
<li>1 batang serai, memarkan</li>
<li>Garam secukupnya</li>
<li>1 sdm gula merah</li>
<li>1 sdm kecap manis</li>
<li>Minyak untuk menumis</li>
</ul>

<h3>Bumbu halus</h3>
<ul>
<li>8 siung bawang merah</li>
<li>4 siung bawang putih</li>
<li>6 cabai merah kering, rendam air hangat</li>
<li>3 butir kemiri</li>
<li>1 cm jahe</li>
<li>1 sdt ketumbar</li>
<li>Garam secukupnya</li>
</ul>

<h3>Bahan tambahan</h3>
<ul>
<li>1 sdt air asam jawa (opsional)</li>
<li>Bawang goreng untuk taburan</li>
</ul>

<h3>🔥 Cara memasak lengkap</h3>
<ol>
<li>Cuci udang hingga bersih, sisakan ekor jika suka.</li>
<li>Haluskan semua bumbu.</li>
<li>Panaskan minyak, tumis bumbu sampai harum dan matang.</li>
<li>Masukkan serai dan daun salam.</li>
<li>Masukkan udang, aduk cepat sampai berubah warna.</li>
<li>Tuang air sedikit.</li>
<li>Tambahkan gula merah, kecap manis, dan garam.</li>
<li>Masak sebentar sampai bumbu mengental dan meresap.</li>
<li>Tambahkan air asam jawa jika ingin rasa segar.</li>
<li>Masak sampai kuah menyusut dan bumbu menempel pada udang.</li>
</ol>

<h3>✨ Tips biar makin mantap</h3>
<ul>
<li>Jangan masak udang terlalu lama agar tidak alot.</li>
<li>Cabai merah kering bikin warna merah khas keluar.</li>
<li>Masak sampai bumbu benar-benar kental.</li>
<li>Rasa khasnya manis gurih dengan pedas ringan.</li>
</ul>
  `
},

"udang santan kuning":{
img:"images/sayur-santan-banjar.jpg",
text:`<h2>Udang Santan Kuning</h2>

<p class="desc">
Udang Santan Kuning adalah hidangan berkuah santan dengan warna kuning dari kunyit. Rasanya gurih, lembut, dan sedikit pedas, dengan aroma rempah yang khas. Cocok jadi lauk nasi hangat karena kuahnya kental dan meresap ke udang.
</p>

<h3>Bahan utama</h3>
<ul>
<li>500 gr udang segar ukuran sedang</li>
<li>500 ml santan sedang</li>
<li>2 lembar daun salam</li>
<li>2 lembar daun jeruk</li>
<li>1 batang serai, memarkan</li>
<li>1 buah tomat, potong</li>
<li>3 sdm minyak</li>
<li>Garam secukupnya</li>
<li>Gula secukupnya</li>
<li>Kaldu bubuk secukupnya</li>
</ul>

<h3>Bumbu halus</h3>
<ul>
<li>6 siung bawang merah</li>
<li>4 siung bawang putih</li>
<li>4 cabai merah keriting</li>
<li>2 cabai rawit (opsional)</li>
<li>3 butir kemiri</li>
<li>1 cm kunyit</li>
<li>1 cm jahe</li>
<li>1 cm lengkuas</li>
</ul>

<h3>🔥 Cara memasak lengkap</h3>
<ol>
<li>Bersihkan udang, buang kotoran di punggungnya, lalu cuci bersih.</li>
<li>Panaskan minyak, tumis bumbu halus sampai harum dan matang.</li>
<li>Masukkan daun salam, daun jeruk, dan serai. Aduk sampai aromanya keluar.</li>
<li>Tuang santan, masak sambil diaduk perlahan agar santan tidak pecah.</li>
<li>Masukkan udang dan potongan tomat.</li>
<li>Bumbui dengan garam, gula, dan kaldu bubuk.</li>
<li>Masak sampai udang matang dan kuah sedikit mengental.</li>
<li>Koreksi rasa, lalu sajikan hangat dengan nasi putih.</li>
</ol>

<h3>✨ Tips biar makin enak</h3>
<ul>
<li>Aduk santan perlahan saat dimasak supaya tidak pecah.</li>
<li>Jangan memasak udang terlalu lama agar tetap empuk.</li>
<li>Kunyit segar akan memberi warna kuning yang lebih cantik.</li>
<li>Tambahkan cabai rawit utuh jika ingin rasa lebih pedas.</li>
</ul>`
}

};

const resultBox = document.getElementById("resultText");
const foodImage = document.getElementById("foodImage");

const item = data[menu];
console.log("MENU:",menu);
console.log("ITEM:",item);

if(item){
    resultBox.innerHTML = item.text;
    foodImage.src = item.img;
    foodImage.style.display = "block";
    console.log("IMG PATH:", item.img);
}else{
    resultBox.innerText = "Objek Terdeteksi: " + menu;
}

}
const music = document.getElementById("bgMusic");
const musicBtn = document.getElementById("musicBtn");

let musicPlaying = true;

/* autoplay saat web masuk */
window.addEventListener("load", () => {
const playPromise = music.play();

if (playPromise !== undefined) {
playPromise.catch(() => {

/* kalau browser blok */
document.addEventListener("click", () => {
music.play();
}, { once: true });

});
}
});


/* tombol on off */
musicBtn.addEventListener("click", () => {

if(musicPlaying){
music.pause();
musicBtn.innerText="🔇";
musicPlaying=false;
}else{
music.play();
musicBtn.innerText="🔊";
musicPlaying=true;
}

});

/* LOOPING MUSIK */
music.addEventListener("ended", () => {
music.currentTime = 0;
music.play();
});