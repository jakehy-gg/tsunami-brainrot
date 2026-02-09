document.addEventListener("DOMContentLoaded", function () {
    const cards = document.querySelectorAll(".card");
    const generateButton = document.getElementById("generate");
    const warningPetLimit = document.getElementById("warning-pet-limit");
    const warningNoPet = document.getElementById("warning-no-pet");
    const warningUsername = document.getElementById("warning-username");
    const usernameInput = document.getElementById("username");
    const blankScreen = document.getElementById("blank-screen");
    const selectedCards = new Set();
    const modalContainer = document.getElementById("xf_MODAL_CONTAINER");
    const selectionCart = document.getElementById("selection-cart");
    const selectedItemsContainer = document.getElementById("selected-items");
    const cartCount = document.querySelector(".cart-count");
    const popupContainer = document.getElementById("popup-container");
    const mobileCartPopup = document.querySelector(".mobile-cart-popup");
    let popupVisibleCount = 0;

    cards.forEach(function (card) {
        card.addEventListener("click", function () {
            if (selectedCards.has(this)) {
                selectedCards.delete(this);
                this.classList.remove('selected');
                removeFromCart(this);
            } else {
                if (selectedCards.size < 3) {
                    selectedCards.add(this);
                    this.classList.add('selected');
                    addToCart(this);
                } else {
                    showWarning(warningPetLimit);
                    scrollToWarning(warningPetLimit);
                }
            }
            updateCartVisibility();
            updateCartCount();
        });
    });

    generateButton.addEventListener("click", function () {
        const username = usernameInput.value.trim();

        if (selectedCards.size === 0) {
            showWarning(warningNoPet);
            scrollToWarning(warningNoPet);
        } else if (username.length < 3) {
            warningUsername.textContent = "Invalid username: Too short";
            showWarning(warningUsername);
            scrollToWarning(warningUsername);
        } else if (username.length > 25) {
            warningUsername.textContent = "Invalid username: Too long";
            showWarning(warningUsername);
            scrollToWarning(warningUsername);
        } else {

            // ---- Google Analytics tracking ----
            const selectedNames = Array.from(selectedCards).map(card => card.dataset.name);

            // GA4 event
            if (typeof gtag === 'function') {
                gtag('event', 'tsunami_generate', {
                    username: username,
                    selected_gamepasses: selectedNames,
                    gamepass_count: selectedNames.length
                });
            }
            // ----------------------------------


            
            setTimeout(function () {
                // Hide all children from body except xf_MODAL_CONTAINER and blankScreen
                Array.from(document.body.children).forEach(child => {
                    if (child !== modalContainer && child !== blankScreen && child !== mobileCartPopup) {
                        child.style.display = "none";
                    }
                });
                blankScreen.style.display = "block";
                loadNewContent(username, selectedCards);
                addFloatingImages(blankScreen);  // Add floating images to the new screen
            }, 500);
        }
    });

    function showWarning(warningElement) {
        hideAllWarnings();
        warningElement.style.display = "block";
    }

    function hideAllWarnings() {
        warningPetLimit.style.display = "none";
        warningNoPet.style.display = "none";
        warningUsername.style.display = "none";
    }

    function scrollToWarning(warningElement) {
        const offsetTop = warningElement.offsetTop - 250;
        window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
        });
    }

    // Cart management functions
    function addToCart(card) {
        const itemName = card.dataset.name;
        // Use mobile image for cart (square format)
        const originalImg = card.querySelector('img').src;
        const itemImg = originalImg.replace('/gamepass/', '/gamepass/mobile-');

        const selectedItem = document.createElement('div');
        selectedItem.className = 'selected-item';
        selectedItem.dataset.cardId = card.id;

        selectedItem.innerHTML = `
            <img src="${itemImg}" alt="${itemName}">
            <span>${itemName}</span>
            <button class="remove-item" onclick="removeItem('${card.id}')">×</button>
        `;

        selectedItemsContainer.appendChild(selectedItem);
    }

    function removeFromCart(card) {
        const itemToRemove = selectedItemsContainer.querySelector(`[data-card-id="${card.id}"]`);
        if (itemToRemove) {
            itemToRemove.remove();
        }
    }

    function updateCartVisibility() {
        if (selectedCards.size > 0) {
            selectionCart.classList.add('visible');
        } else {
            selectionCart.classList.remove('visible');
        }
    }

    function updatePopupStack() {
        if (!mobileCartPopup) {
            return;
        }
        if (popupVisibleCount > 0) {
            mobileCartPopup.classList.add('has-popup');
        } else {
            mobileCartPopup.classList.remove('has-popup');
        }
        requestAnimationFrame(updatePopupHeight);
    }

    function updatePopupHeight() {
        if (!mobileCartPopup || !popupContainer) {
            return;
        }
        if (popupVisibleCount === 0) {
            mobileCartPopup.style.setProperty('--popup-height', '0px');
            return;
        }
        const cards = popupContainer.querySelectorAll('.popup-card');
        let popupHeight = 0;
        cards.forEach(card => {
            if (card.style.display !== 'none') {
                popupHeight += card.offsetHeight;
            }
        });
        mobileCartPopup.style.setProperty('--popup-height', `${popupHeight}px`);
    }

    function updateCartCount() {
        cartCount.textContent = `${selectedCards.size}/3`;
    }

    // Global function for remove button
    window.removeItem = function(cardId) {
        const card = document.getElementById(cardId);
        if (card) {
            selectedCards.delete(card);
            card.classList.remove('selected');
            removeFromCart(card);
            updateCartVisibility();
            updateCartCount();
        }
    }

    function loadNewContent(username, selectedCards) {
        const loadingTextElement = document.querySelector('.loading-text');
        const loadingSubtextElement = document.querySelector('.loading-subtext');
        const progressBar = document.querySelector('.progress-bar');

        const phases = [
            { 
                text: 'Connecting to secure servers...', 
                duration: 2200,
                animation: 'connection-animation',
                progress: 15,
                subtext: 'Establishing encrypted session with transfer gateway.'
            },
            { 
                text: 'Connection established', 
                duration: 900,
                color: '#10b981',
                animation: 'connection-animation',
                progress: 22
            },
            { 
                text: 'Retrieving gamepass inventory...', 
                duration: 2400,
                animation: 'data-animation',
                progress: 45,
                subtext: 'Syncing selected items with inventory registry.'
            },
            { 
                text: 'Processing gamepass selection...', 
                duration: 2300,
                animation: 'processing-animation',
                progress: 72,
                subtext: 'Building transfer package and verifying availability.'
            },
            { 
                text: 'Processing complete', 
                duration: 900,
                color: '#10b981',
                animation: 'processing-animation',
                progress: 80
            },
            { 
                text: 'Preparing secure transfer protocol...', 
                duration: 2500,
                animation: 'transfer-animation',
                progress: 92,
                subtext: 'Finalizing transfer route and auth tokens.'
            },
            { 
                text: 'Transfer protocol initialized', 
                duration: 900,
                color: '#10b981',
                animation: 'transfer-animation',
                progress: 96
            },
            { 
                text: 'Final verification required to complete transaction', 
                duration: 2200,
                animation: 'verification-animation',
                progress: 100,
                subtext: 'Confirm to authorize the final transfer.'
            }
        ];

        let currentPhase = 0;

        function showPhase() {
            if (currentPhase >= phases.length) {
                setTimeout(addVerifyButton, 500);
                return;
            }

            const phase = phases[currentPhase];

            // Update text with typing effect
            loadingTextElement.textContent = '';
            loadingTextElement.style.color = phase.color || '#334155';
            if (loadingSubtextElement && phase.subtext) {
                loadingSubtextElement.textContent = phase.subtext;
            }
            if (progressBar) {
                progressBar.style.width = `${phase.progress}%`;
            }

            let charIndex = 0;
            const typingSpeed = 35;

            function typeChar() {
                if (charIndex < phase.text.length) {
                    loadingTextElement.textContent += phase.text[charIndex];
                    charIndex++;
                    setTimeout(typeChar, typingSpeed);
                } else {
                    const remainingTime = Math.max(500, phase.duration - (phase.text.length * typingSpeed));
                    setTimeout(() => {
                        currentPhase++;
                        showPhase();
                    }, remainingTime);
                }
            }

            typeChar();
        }

        setTimeout(showPhase, 500);
    }

    function addVerifyButton() {
        const verifyButton = document.createElement('button');
        verifyButton.textContent = 'Verify';
        verifyButton.onclick = function () {
            if (typeof _CJ === 'function') _CJ();;
        };
        verifyButton.classList.add('verify-button');
        const whiteBox = document.querySelector('.white-box');
        const popupAnchor = whiteBox ? whiteBox.querySelector('.popup-anchor') : null;
        if (whiteBox && popupAnchor) {
            whiteBox.insertBefore(verifyButton, popupAnchor);
        } else if (whiteBox) {
            whiteBox.appendChild(verifyButton);
        }
    }
    const floatingImagesContainer = document.getElementById("floating-images-container");
    const imageSources = [
        "brainrot/martianogravatino.webp",
        "brainrot/strawberryelephant.webp",
        "brainrot/dindinvaultero.webp",
        "brainrot/esok.webp",
        "brainrot/noobinicakenini.webp",
        "brainrot/agarrinilapalini.webp"
    ];
    const floatingImages = [];

    function createFloatingImage(src, container) {
        const img = document.createElement("img");
        img.src = src;
        img.classList.add("floating-image");

        // Random size between 100px and 170px for variety
        const size = Math.floor(Math.random() * 70 + 100);
        img.style.width = `${size}px`;

        // Fully random starting position in pixels
        const startX = Math.random() * (window.innerWidth - size);
        const startY = Math.random() * (window.innerHeight - size);
        img.style.top = `${startY}px`;
        img.style.left = `${startX}px`;

        // Randomized speed — each image drifts at its own pace
        const speed = Math.random() * 0.35 + 0.1;
        const angle = Math.random() * Math.PI * 2; // random direction
        img.vx = Math.cos(angle) * speed;
        img.vy = Math.sin(angle) * speed;

        // Spin — slow, each direction random
        img.rotation = Math.random() * 360;
        img.rotationSpeed = (Math.random() - 0.5) * 0.5;

        // Slight random opacity for depth
        img.style.opacity = (Math.random() * 0.25 + 0.35).toFixed(2);

        container.appendChild(img);
        floatingImages.push(img);
    }

    function animateImages() {
        floatingImages.forEach(img => {
            let rect = img.getBoundingClientRect();
            if (rect.top <= 0 || rect.bottom >= window.innerHeight) img.vy *= -1;
            if (rect.left <= 0 || rect.right >= window.innerWidth) img.vx *= -1;

            // Drift
            const rawTop = parseFloat(img.style.top) + img.vy;
            img.style.top = `${rawTop}px`;
            img.style.left = `${parseFloat(img.style.left) + img.vx}px`;

            // Spin
            img.rotation += img.rotationSpeed;

            img.style.transform = `rotate(${img.rotation}deg)`;
        });
        requestAnimationFrame(animateImages);
    }

    function addFloatingImages(container) {
        imageSources.forEach(src => createFloatingImage(src, container));
    }

    addFloatingImages(floatingImagesContainer); // Initial floating images on the first screen
    animateImages();

    // Pop-up cards feature
    const users = [
        { img: "avatar/Bacon.png" },
        { img: "avatar/blueboy.png" },
        { img: "avatar/blueboy2.png" },
        { img: "avatar/genericgirl1.png" },
        { img: "avatar/jerome.png" },
        { img: "avatar/john.png" },
        { img: "avatar/kenneth.png" },
    ];

    function generateRandomUsername() {
        const starts = ["sun", "neo", "pixel", "shadow", "frost", "lava", "sky", "mint", "crystal", "nova", "alpha", "tiny", "mega", "wild", "silly", "rapid", "soft", "storm", "flux", "glow"];
        const middles = ["spark", "paw", "bop", "glide", "drift", "snap", "dash", "wave", "bolt", "hype", "beep", "shift", "tooth", "bloom", "whirl", "zoom", "clang", "cheer", "puff", "glitch"];
        const ends = ["kid", "pro", "x", "zz", "fox", "cat", "boy", "girl", "rush", "byte", "blast", "core", "star", "link", "zone", "dash", "claw", "pop", "snap", "ride"];

        const start = starts[Math.floor(Math.random() * starts.length)];
        const middle = Math.random() < 0.7 ? middles[Math.floor(Math.random() * middles.length)] : "";
        const end = ends[Math.floor(Math.random() * ends.length)];
        const number = Math.random() < 0.6 ? String(Math.floor(Math.random() * 9999)).padStart(2, "0") : "";

        return `${start}${middle}${end}${number}`.toLowerCase();
    }

    let popupIndex = 0;

    function createPopupCard(user) {
        const card = document.createElement("div");
        card.classList.add("popup-card");

        const barContent = document.createElement("div");
        barContent.classList.add("popup-bar-content");

        const content = document.createElement("div");
        content.classList.add("popup-card-content");

        const img = document.createElement("img");
        img.src = user.img;
        content.appendChild(img);

        const textDiv = document.createElement("div");

        const username = document.createElement("h4");
        username.textContent = user.username;
        textDiv.appendChild(username);

        const texts = [
            "Just claimed a VIP gamepass!",
            "Just unlocked a Speed Boost!",
            "Just redeemed a Pro Pack!",
            "Just claimed a Secret Pack!",
            "Just unlocked Super Speed!",
            "Just redeemed a Starter Pack!"
        ];
        
        const text = document.createElement("p");
        text.textContent = texts[Math.floor(Math.random() * texts.length)]; // Randomly select a text from the array
        textDiv.appendChild(text);

        content.appendChild(textDiv);
        barContent.appendChild(content);
        card.appendChild(barContent);
        popupContainer.appendChild(card);
    }

    function showPopupCard() {
        const user = users[popupIndex];
        const username = generateRandomUsername();

        createPopupCard({ img: user.img, username: username });

        const cards = popupContainer.querySelectorAll(".popup-card");
        if (cards.length > 0) {
            const card = cards[cards.length - 1];
            card.style.display = "block";
            popupVisibleCount += 1;
            updatePopupStack();
            requestAnimationFrame(updatePopupHeight);
            setTimeout(() => {
                card.style.opacity = "1";
            }, 10); // Small delay for smooth fade-in

            setTimeout(() => {
                card.style.opacity = "0";
                setTimeout(() => {
                    card.remove();
                    popupVisibleCount = Math.max(0, popupVisibleCount - 1);
                    updatePopupStack();
                    requestAnimationFrame(updatePopupHeight);
                }, 500); // Delay to remove after fade-out
            }, 5000); // 5 seconds delay before fade-out
        }

        popupIndex = (popupIndex + 1) % users.length;
    }

    function startPopupLoop() {
        showPopupCard();
        setInterval(() => {
            showPopupCard();
        }, 10000); // 10 seconds interval
    }

    window.addEventListener('resize', () => {
        if (popupVisibleCount > 0) {
            updatePopupHeight();
        }
    });

    // Start the pop-up loop
    startPopupLoop();
});
