const mHeroBg = document.getElementById("mHeroBg");
const mHeroSec = document.getElementById("mHeroSection");
const mThumbDesc = document.getElementById("mThumbDesc");

const mHeroLeft = document.getElementById("mHeroLeft");
const mHeroCategoryTitle = document.getElementById("mHeroCategoryTitle");
const mHeroCategory = document.getElementById("mHeroCategory");
const mHeroDescription = document.getElementById("mHeroDescription");
const mHeroButton = document.getElementById("mHeroButton");
const mHeroThumbCity = document.getElementById("mHeroThumb1");
const mHeroThumbWater = document.getElementById("mHeroThumb2");
const mHeroThumbMountain = document.getElementById("mHeroThumb3");
const mHeroThumbHistory = document.getElementById("mHeroThumb4");
const mHeroThumbNature = document.getElementById("mHeroThumb5");

const mHeroRight = document.getElementById("mHeroRight");
const mHeroCircle = document.getElementById("mHeroCircle");
const mCircleNext = document.getElementById("mCircleNext");
const mCirclePrev = document.getElementById("mCirclePrev");
const mContinueRotation = document.getElementById("mContinueRotation");
const mContinueRotationTop = document.getElementById("mContinueRotationTop");
const mCircleText = document.getElementById("mCircleText");
const mCircleImage1 = document.getElementById("mCircleImage1");
const mCircleImage2 = document.getElementById("mCircleImage2");
const mCircleImage3 = document.getElementById("mCircleImage3");
const mCircleImage4 = document.getElementById("mCircleImage4");
const mCircleImage5 = document.getElementById("mCircleImage5");
const mCircleImage6 = document.getElementById("mCircleImage6");

const mCategories = [
    {
        category : "Kakum Rainforest",
        categoryTitle : "Walk Above the <br> Rainforest Canopy" ,
        description : "Experience West Africa's iconic 350-meter canopy walkway suspended 40 meters above ancient tropical rainforest at Kakum National Park, Central Region.",
        buttonUrl : "destination-detail.php?id=32",
        backgroundUrl : "./sources/videos/kakum-park.mp4",
        poster : "./sources/images/all_tourist_sites/Kakum%20National%20Park%20Canopy%20Walkway.jpg",
        accent: "#FF9900",
        accentLight: "#FFB800",
        circleImage : [
            "./sources/images/all_tourist_sites/Kakum%20National%20Park%20Canopy%20Walkway.jpg", 
            "./sources/images/all_tourist_sites/Cape%20Coast%20Castle.jpg",
            "./sources/images/all_tourist_sites/Kwame%20Nkrumah%20Memorial%20Park.jpg",
            "./sources/images/all_tourist_sites/Larabanga%20Mosque.jpg",
            "./sources/images/all_tourist_sites/Mole%20National%20Park.jpg",
            "./sources/images/all_tourist_sites/Elmina%20Castle%20(St.%20George's).jpg"
        ],
        circleText : [
            "Kakum Canopy Walkway (Central Region)",
            "Cape Coast Castle (Central Region)",
            "Kwame Nkrumah Memorial Park (Greater Accra)",
            "Larabanga Ancient Mosque (Savannah Region)",
            "Mole National Park Safari (Savannah Region)",
            "Elmina Castle Fortress (Central Region)"
        ]
    }, {
        category : "Cape Coast Fortress",
        categoryTitle : "Embrace History Along <br> Atlantic Coastlines" ,
        description : "Walk through centuries of global history at UNESCO World Heritage sea fortresses overlooking roaring Atlantic waves in Cape Coast and Elmina.",
        buttonUrl : "destination-detail.php?id=33",
        backgroundUrl : "./sources/videos/cape-coast-catle.mp4",
        poster : "./sources/images/all_tourist_sites/Cape%20Coast%20Castle.jpg",
        accent: "#FF9900",
        accentLight: "#FEBD69",
        circleImage : [
            "./sources/images/all_tourist_sites/Cape%20Coast%20Castle.jpg", 
            "./sources/images/all_tourist_sites/Elmina%20Castle%20(St.%20George's).jpg",
            "./sources/images/all_tourist_sites/Assin%20Manso%20Slave%20River%20Site.png",
            "./sources/images/all_tourist_sites/Fort%20Amsterdam.jpg",
            "./sources/images/all_tourist_sites/Fort%20Jago%20(Coenraadsburg).jpg",
            "./sources/images/all_tourist_sites/Osu%20Castle%20(Christiansborg).jpg"
        ],
        circleText : [
            "Cape Coast Castle Fortress",
            "Elmina Castle (St. George's)",
            "Assin Manso Slave River Site",
            "Fort Amsterdam Hilltop",
            "Fort Jago Lookout Point",
            "Osu Castle Christiansborg"
        ]
    }, {
        category : "Larabanga Heritage",
        categoryTitle : "Discover Ancient Sudanese <br> Mud Architecture" ,
        description : "Visit 1421 Larabanga Mosque—Ghana's oldest mosque—and the nearby Mystic Stone in the heart of the Savannah Region.",
        buttonUrl : "destination-detail.php?id=92",
        backgroundUrl : "./sources/videos/larabanga-mosque.mp4",
        poster : "./sources/images/all_tourist_sites/Larabanga%20Mosque.jpg",
        accent: "#FF9900",
        accentLight: "#FFB800",
        circleImage : [
            "./sources/images/all_tourist_sites/Larabanga%20Mosque.jpg", 
            "./sources/images/all_tourist_sites/The%20Mystic%20Stone.jpg",
            "./sources/images/all_tourist_sites/Mole%20National%20Park.jpg",
            "./sources/images/all_tourist_sites/Mognori%20Eco-Village.jpg",
            "./sources/images/all_tourist_sites/Salaga%20Slave%20Market%20Site.jpg",
            "./sources/images/all_tourist_sites/Wa%20Naa's%20Palace.jpg"
        ],
        circleText : [
            "Larabanga Mosque (Built 1421)",
            "The Sacred Mystic Stone",
            "Mole National Park Savanna",
            "Mognori Eco-Village Canoe Tours",
            "Salaga Slave Market Site",
            "Wa Naa Sovereign Palace"
        ]
    }, {
        category : "Kwame Nkrumah Museum",
        categoryTitle : "Honor Ghana's Founding <br> Father & Freedom" ,
        description : "Explore the Italian marble mausoleum, manicured water gardens, and personal artifacts at Kwame Nkrumah Memorial Park in central Accra.",
        buttonUrl : "destination-detail.php?id=1",
        backgroundUrl : "./sources/videos/kwame-nkrumah-museum.mp4",
        poster : "./sources/images/all_tourist_sites/Kwame%20Nkrumah%20Memorial%20Park.jpg",
        accent: "#FF9900",
        accentLight: "#FEBD69",
        circleImage : [
            "./sources/images/all_tourist_sites/Kwame%20Nkrumah%20Memorial%20Park.jpg", 
            "./sources/images/all_tourist_sites/Black%20Star%20Square%20(Independence%20Square).jpg",
            "./sources/images/all_tourist_sites/National%20Museum%20of%20Ghana.jpg",
            "./sources/images/all_tourist_sites/W.E.B.%20Du%20Bois%20Memorial%20Centre.webp",
            "./sources/images/all_tourist_sites/Jamestown%20Lighthouse.jpg",
            "./sources/images/all_tourist_sites/Makola%20Market.jpg"
        ],
        circleText : [
            "Kwame Nkrumah Memorial Park",
            "Black Star Gate & Independence Arch",
            "National Museum of Ghana",
            "W.E.B. Du Bois Memorial Centre",
            "Jamestown Historic Lighthouse",
            "Makola Market Craft Engine"
        ]
    }, {
        category : "Wildlife & Waterfalls",
        categoryTitle : "Feel the Power of <br> Cascades & Lakes" ,
        description : "Journey to Wli Waterfalls—West Africa's tallest cascade—Lake Bosomtwe meteorite crater, Boti twin falls, and Mole elephant safaris.",
        buttonUrl : "destination-detail.php?id=56",
        backgroundUrl : "./sources/videos/nature.mp4",
        poster : "./sources/images/all_tourist_sites/Wli%20Waterfalls.jpg",
        accent: "#FF9900",
        accentLight: "#FFB800",
        circleImage : [
            "./sources/images/all_tourist_sites/Wli%20Waterfalls.jpg", 
            "./sources/images/all_tourist_sites/Lake%20Bosomtwe.jpg",
            "./sources/images/all_tourist_sites/Boti%20Waterfalls.jpg",
            "./sources/images/all_tourist_sites/Mount%20Afadjato.jpg",
            "./sources/images/all_tourist_sites/Paga%20Crocodile%20Pond.jpg",
            "./sources/images/all_tourist_sites/Kintampo%20Waterfalls.jpg"
        ],
        circleText : [
            "Wli Waterfalls Cascade (Volta)",
            "Lake Bosomtwe Sacred Crater Lake",
            "Boti Twin Waterfalls (Eastern)",
            "Mount Afadjato Peak Trail",
            "Paga Sacred Crocodile Pond",
            "Kintampo Multi-Tier Falls"
        ]
    }
];

let lastClickedThumb = mCategories[0];

// Hero thumbnail events
window.addEventListener("scroll", () => {
    if (window.scrollY >= mHeroSec.offsetHeight) {
        mHeroBg.pause();
    } else {
        mHeroBg.play( );
    };
});

mHeroThumbCity.addEventListener("click", () => {updateHero(mCategories[0], mHeroThumbCity)});
mHeroThumbWater.addEventListener("click", () => {updateHero(mCategories[1], mHeroThumbWater)});
mHeroThumbMountain.addEventListener("click", () => {updateHero(mCategories[2], mHeroThumbMountain)});
mHeroThumbHistory.addEventListener("click", () => {updateHero(mCategories[3], mHeroThumbHistory)});
mHeroThumbNature.addEventListener("click", () => {updateHero(mCategories[4], mHeroThumbNature)});

mHeroThumbCity.addEventListener("mouseover", () => {hoverThumb(mCategories[0])});
mHeroThumbWater.addEventListener("mouseover", () => {hoverThumb(mCategories[1])});
mHeroThumbMountain.addEventListener("mouseover", () => {hoverThumb(mCategories[2])});
mHeroThumbHistory.addEventListener("mouseover", () => {hoverThumb(mCategories[3])});
mHeroThumbNature.addEventListener("mouseover", () => {hoverThumb(mCategories[4])});

mHeroThumbCity.addEventListener("mouseout", () => {hoverOutThumb()});
mHeroThumbWater.addEventListener("mouseout", () => {hoverOutThumb()});
mHeroThumbMountain.addEventListener("mouseout", () => {hoverOutThumb()});
mHeroThumbHistory.addEventListener("mouseout", () => {hoverOutThumb()});
mHeroThumbNature.addEventListener("mouseout", () => {hoverOutThumb()});


const updateHero = (categoryIndex, thumb) => {
    lastClickedThumb = categoryIndex;
    mUpdateLeft();
    mCircleText.style.opacity = "0";
    mHeroBg.style.opacity = "0";
    mHeroThumbCity.style.border = "none";
    mHeroThumbWater.style.border = "none";
    mHeroThumbMountain.style.border = "none";
    mHeroThumbHistory.style.border = "none";
    mHeroThumbNature.style.border = "none";
    thumb.style.border = `3px solid ${lastClickedThumb.accentLight}`;
    mThumbDesc.style.transform = "translateY(3rem)";
    mHeroRight.style.transform = "translate(100%, 100%)";
    setTimeout(() => {
        mHeroBg.setAttribute("src", categoryIndex.backgroundUrl);
        mHeroBg.setAttribute("poster", categoryIndex.poster);
        mThumbDesc.textContent = categoryIndex.category;
        mThumbDesc.style.transform = "translateY(0)";
        mCircleText.style.color = lastClickedThumb.accentLight;
    }, 500);
    setTimeout(() => {
        mHeroBg.style.opacity = "1";
        mHeroCircle.style.display = "none";
        mHeroCircle.style.display = "block";
        mHeroRight.style.transform = "translate(0, 0)";
        mCircleImage1.setAttribute("src", categoryIndex.circleImage[0]);
        mCircleImage2.setAttribute("src", categoryIndex.circleImage[1]);
        mCircleImage3.setAttribute("src", categoryIndex.circleImage[2]);
        mCircleImage4.setAttribute("src", categoryIndex.circleImage[3]);
        mCircleImage5.setAttribute("src", categoryIndex.circleImage[4]);
        mCircleImage6.setAttribute("src", categoryIndex.circleImage[5]);
    }, 1000);
};

const mUpdateLeft = () => {
    mHeroLeft.style.transform = "translateX(-100%)";
    mHeroLeft.style.opacity = "0";
    setTimeout(() => {
        mHeroCategoryTitle.innerHTML = lastClickedThumb.categoryTitle;
        mHeroCategory.innerHTML = lastClickedThumb.category;
        mHeroCategory.style.color = lastClickedThumb.accentLight;
        mHeroCategory.style.textShadow = `0 0 20px ${lastClickedThumb.accentLight}`;
        mHeroButton.style.backgroundColor = lastClickedThumb.accentLight;
        mHeroButton.style.boxShadow = `0 0 20px ${lastClickedThumb.accentLight}`;
        mHeroButton.setAttribute("href", lastClickedThumb.buttonUrl);
        mHeroDescription.innerHTML = lastClickedThumb.description;
        mHeroCategory.innerHTML = lastClickedThumb.category;
        mHeroLeft.style.transform = "translateX(0)";
    }, 1000);
    setTimeout(() => {
        mHeroLeft.style.opacity = "1";
    }, 1600);
}

mHeroButton.addEventListener("mouseover", () => {
    mHeroButton.style.backgroundColor = lastClickedThumb.accent;
    mHeroButton.style.boxShadow = `0 0 20px ${lastClickedThumb.accent}`;
});

mHeroButton.addEventListener("mouseout", () => {
    mHeroButton.style.backgroundColor = lastClickedThumb.accentLight;
    mHeroButton.style.boxShadow = `0 0 20px ${lastClickedThumb.accentLight}`;
});

const hoverThumb = (categoryIndex) => {
    mThumbDesc.style.transform = "translateY(3rem)";
    setTimeout(() => {
        mThumbDesc.textContent = categoryIndex.category;
        mThumbDesc.style.transform = "translateY(0)";
    }, 400);
};

const hoverOutThumb = () => {
    mThumbDesc.style.transform = "translateY(3rem)";
    setTimeout(() => {
        mThumbDesc.textContent = lastClickedThumb.category;
        mThumbDesc.style.transform = "translateY(0)";
    }, 400);
};

// Hero section circle events
let currentRotation = 15;
let rotationContinue = true;
const circleArray = [mCircleImage1, mCircleImage2, mCircleImage3, mCircleImage4, mCircleImage5, mCircleImage6]
let currentCircle = 0;

const mrotationAnimation = (duration) => {
    mHeroCircle.style.transition = `transform ${duration}ms linear`;
    mCircleImage1.style.transition = `transform ${duration}ms linear`;
    mCircleImage2.style.transition = `transform ${duration}ms linear`;
    mCircleImage3.style.transition = `transform ${duration}ms linear`;
    mCircleImage4.style.transition = `transform ${duration}ms linear`;
    mCircleImage5.style.transition = `transform ${duration}ms linear`;
    mCircleImage6.style.transition = `transform ${duration}ms linear`;

    mHeroCircle.style.transform = `translate(-50%,-50%) rotate(${currentRotation}deg)`;
    mCircleImage1.style.transform = `rotate(${-currentRotation}deg)`;
    mCircleImage2.style.transform = `rotate(${-currentRotation}deg)`;
    mCircleImage3.style.transform = `rotate(${-currentRotation}deg)`;
    mCircleImage4.style.transform = `rotate(${-currentRotation}deg)`;
    mCircleImage5.style.transform = `rotate(${-currentRotation}deg)`;
    mCircleImage6.style.transform = `rotate(${-currentRotation}deg)`;
}

const mRotate = () => {
    mContinueRotation.style.display = "none";
    mContinueRotationTop.style.display = "block";
    mCircleNext.style.display = "none";
    mCirclePrev.style.display = "none";
    currentRotation -= 60;
    mrotationAnimation(3000);
    if(currentCircle == 5) {
        currentCircle = 0;
    } else {
        currentCircle += 1;
    };
    let mRotateInterval = setInterval(() => {
        if (!rotationContinue) {
            clearInterval(mRotateInterval);
            return;
        } else if (!document.hidden){
            currentRotation -= 60;
            mrotationAnimation(3000);
            if(currentCircle == 5) {
                currentCircle = 0;
            } else {
                currentCircle += 1;
            };
        };
    }, 3000);
};

const mRotateOnce = (direction) => {
    rotationContinue = false;
    if (direction == mCircleNext  && currentCircle == 5) {
        currentCircle = 0;
        currentRotation -= 60;
    } else if (direction == mCircleNext) {
        currentCircle += 1;
        currentRotation -= 60;
    } else if (direction == mCirclePrev && currentCircle == 0){
        currentCircle = 5;
        currentRotation += 60;
    } else {
        currentCircle -= 1;
        currentRotation += 60;
    };
    mContinueRotation.style.display = "none";
    mContinueRotationTop.style.display = "block";
    mCircleText.style.opacity = "0";
    direction.style.display = "none";
    setTimeout(() => {
        direction.style.display = "block";
    }, 1000);
    setTimeout(() => {
        mUpdateCircleText();
    }, 1200);
    mrotationAnimation(1000);
};

const mUpdateCircleText = () => {
    if (rotationContinue) {
        setTimeout(() => {
            mContinueRotation.style.display = "block";
            mContinueRotationTop.style.display = "none";
        }, 3000);
    } else {
        mContinueRotation.style.display = "block";
        mContinueRotationTop.style.display = "none";
    };
    rotationContinue = false;
    setTimeout(() => {
        if(!rotationContinue) {
            mCircleNext.style.display = "block";
            mCirclePrev.style.display = "block";
        }
    }, 1000);
    mCircleText.textContent = lastClickedThumb.circleText[currentCircle];
    mCircleText.style.opacity = "1";
}

mCircleImage1.addEventListener("click", () => {mUpdateCircleText()});
mCircleImage2.addEventListener("click", () => {mUpdateCircleText()});
mCircleImage3.addEventListener("click", () => {mUpdateCircleText()});
mCircleImage4.addEventListener("click", () => {mUpdateCircleText()});
mCircleImage5.addEventListener("click", () => {mUpdateCircleText()});
mCircleImage6.addEventListener("click", () => {mUpdateCircleText()});

mContinueRotation.addEventListener("click", () => {
    mCircleText.style.opacity = "0";
    if(!rotationContinue){
        rotationContinue = true;
        mRotate();
    };
});

mContinueRotation.addEventListener("mouseover", () => {
    mContinueRotation.style.color = lastClickedThumb.accentLight;
    mContinueRotation.style.textShadow = `0 0 5px ${lastClickedThumb.accentLight}`;
});

mContinueRotation.addEventListener("mouseout", () => {
    mContinueRotation.style.color = "var(--clr-secondary-100)";
    mContinueRotation.style.textShadow = "none";
});

mCircleNext.addEventListener("click", () => {mRotateOnce(mCircleNext)});
mCirclePrev.addEventListener("click", () => {mRotateOnce(mCirclePrev)});

mRotate();

// stats section counter
window.addEventListener("scroll", () => {
    const statsCount = document.querySelectorAll(".m-stats-count");
    const viewportHeight = document.getElementById("mHeroSection").clientHeight;
    const activatePoint = document.getElementsByClassName("m-stats-section")[0].getBoundingClientRect().top;
    if (activatePoint < viewportHeight) {
        for (let i of statsCount){
            const countLimit = i.dataset.limit;
            let currentCount = 0;
            let counterInterval = setInterval(() => {
                i.textContent = currentCount;
                currentCount = currentCount + Math.floor(countLimit/30);
                if(currentCount >= countLimit) {
                    i.textContent = countLimit;
                    clearInterval(counterInterval);
                }
            }, 80);
        };
    };
}, { once: true });