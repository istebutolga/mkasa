document.getElementById('send-button').addEventListener('click', sendMessage);
document.getElementById('user-input').addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

// Görüntü yükleme işlemi için bir dosya girişi ekleyin
const imageUploadInput = document.getElementById('image-upload');
imageUploadInput.addEventListener('change', handleImageUpload);

function handleImageUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const formData = new FormData();
        formData.append('image', file);

        // Görüntü analizi için API'ye istek gönder
        fetch('https://your-image-analysis-api.com/analyze', { // Buraya görüntü analiz API'nizi yazın
            method: 'POST',
            body: formData,
        })
        .then(response => response.json())
        .then(data => {
            const analysisResult = data.result; // API'den gelen analiz sonuçları
            addMessageToChat('ChatGPT', analysisResult);
        })
        .catch(error => {
            console.error('Görüntü yükleme hatası:', error);
            addMessageToChat('Sistem', `Görüntü yükleme hatası: ${error.message}`);
        });
    }
}

function sendMessage() {
    const userInput = document.getElementById('user-input').value.trim();
    if (userInput === "") {
        return;
    }

    addMessageToChat('Kullanıcı', userInput);
    document.getElementById('user-input').value = '';

    // "Yazıyor..." mesajını göster
    const typingInfo = document.getElementById('typing-info');
    typingInfo.style.display = 'block';
    typingInfo.style.opacity = 1; // Görünür yap

    const apiUrl = `https://chatgpt.ashlynn.workers.dev/?question=${encodeURIComponent(userInput)}`;

    console.log("API isteği gönderiliyor: " + apiUrl);

    fetch(apiUrl, {
        method: 'GET',
        mode: 'cors'
    })
    .then(response => {
        console.log(`HTTP Yanıt Kodu: ${response.status}`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('API yanıtı alındı:', data);
        typingInfo.style.opacity = 0; // Yazma durumu mesajını gizle

        if (data.status === true && data.code === 200) {
            const gptResponse = data.gpt; // API yanıtında "gpt" alanından cevap geliyor
            
            // Kod bloğu algılama
            if (userInput.toLowerCase().includes("bana bu kodu yaz") || userInput.toLowerCase().includes("yaz")) {
                addMessageToChat('ChatGPT', `<pre><code>${gptResponse}</code></pre><button onclick="copyToClipboard(\`${gptResponse}\`)">Kopyala</button>`);
            } else {
                addMessageToChat('ChatGPT', gptResponse);
            }
        } else {
            console.error('API yanıt hatası:', data);
            addMessageToChat('Sistem', 'Üzgünüz, bir hata oluştu. Lütfen tekrar deneyin.');
        }
    })
    .catch(error => {
        console.error('Bağlantı veya işleme hatası:', error);
        typingInfo.style.opacity = 0; // Yazma durumu mesajını gizle
        addMessageToChat('Sistem', `Bağlantı hatası, lütfen internet bağlantınızı kontrol edin. Hata: ${error.message}`);
    });
}

function addMessageToChat(sender, message) {
    const messagesDiv = document.getElementById('messages');
    const messageElement = document.createElement('div');
    messageElement.classList.add(sender === 'Kullanıcı' ? 'user-message' : 'gpt-message');
    messageElement.innerHTML = `<strong>${sender}:</strong> ${message}`;
    messagesDiv.appendChild(messageElement);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Kopyalama fonksiyonu
function copyToClipboard(text) {
    navigator.clipboard.writeText(text)
        .then(() => {
            alert('Kod kopyalandı!');
        })
        .catch(err => {
            console.error('Kopyalama hatası:', err);
        });
}