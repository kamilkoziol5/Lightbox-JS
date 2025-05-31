function lightbox(opts) {
  const defaultOptions = {
    showCount: true,
    showText: true,
    showPrevNext: true,
    showThumbnails: true,
  };

  const options = { ...defaultOptions, ...opts };

  let links = [];
  let currentIndex = 0;
  let DOM = getElementsReference();

  bindEvents();

  function createLightbox() {
    const lightbox = document.createElement("div");
    lightbox.classList.add("lightbox");
    lightbox.innerHTML = `
     <div class="lightbox-box">
                  <div class="lightbox-count">
                  </div>
                  <div class="lightbox-img-cnt">
                      <button class="lightbox-prev">
                   <i class='bx bxs-left-arrow' ></i>
                      </button>
  
                     <button class="lightbox-next">
                   <i class='bx bxs-right-arrow'></i>
                    </button>
  
                      <img src="" class="lightbox-img" alt="">
                  </div>
                  <div class="lightbox-text">
                  </div>          
              </div>
               <button class="lightbox-close">
                     <i class='bx  bx-x' ></i> 
                  </button>
               <div class="lightbox-thumbnails">
                  <ul class="lightbox-thumbnails-list"></ul>
              </div>
    `;
    return lightbox;
  }

  function getElementsReference() {
    const ob = {};
    ob.lightbox = createLightbox();
    ob.count = ob.lightbox.querySelector(".lightbox-count");
    ob.prev = ob.lightbox.querySelector(".lightbox-prev");
    ob.next = ob.lightbox.querySelector(".lightbox-next");
    ob.text = ob.lightbox.querySelector(".lightbox-text");
    ob.close = ob.lightbox.querySelector(".lightbox-close");
    ob.imgCnt = ob.lightbox.querySelector(".lightbox-img-cnt");
    ob.img = ob.lightbox.querySelector(".lightbox-img");
    ob.thumbnails = ob.lightbox.querySelector(".lightbox-thumbnails");
    ob.thumbnailsList = ob.lightbox.querySelector(".lightbox-thumbnails-list");
    return ob;
  }

  function bindEvents() {
    DOM.close.addEventListener("click", () => hideLightbox());

    DOM.prev.addEventListener("click", () => prevImage());

    DOM.next.addEventListener("click", () => nextImage());

    document.addEventListener("keyup", (e) => {
      if (e.key === "ArrowRight") nextImage();
      if (e.key === "ArrowLeft") prevImage();
      if (e.key === "Escape") hideLightbox();
    });

    DOM.img.addEventListener("load", () => {
      hideLoading();
      hideError();
    });

    DOM.img.addEventListener("error", () => {
      hideLoading();
      showError();
    });

    DOM.thumbnails.addEventListener("click", (e) => {
      const el = e.target.closest(".lightbox-thumbnails-el");
      if (el) {
        e.preventDefault();
        currentIndex = [...DOM.thumbnailsList.children].indexOf(el);
        showImage(el.href, el.dataset.text ? el.dataset.text : "");
      }
    });
  }

  function showLightbox() {
    DOM.lightbox.style.opacity = 0;
    document.body.append(DOM.lightbox);
    const anim = DOM.lightbox.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: 400,
    });

    anim.onfinish = () => (DOM.lightbox.style.opacity = 1);
  }

  function hideLightbox() {
    const anim = DOM.lightbox.animate([{ opacity: 1 }, { opacity: 0 }], {
      duration: 200,
    });
    anim.onfinish = () => DOM.lightbox.remove();
  }

  function nextImage() {
    currentIndex++;
    if (currentIndex > links.length - 1) currentIndex = 0;
    const href = links[currentIndex].href;
    const text = links[currentIndex].dataset.text;
    showImage(href, text);
  }

  function prevImage() {
    currentIndex--;
    if (currentIndex < 0) currentIndex = links.length - 1;
    const href = links[currentIndex].href;
    const text = links[currentIndex].dataset.text;
    showImage(href, text);
  }

  function showImage(href, text) {
    showLoading();
    DOM.img.src = href;
    if (options.showCount) showCount();
    if (options.showText) showText(text);
    if (options.showThumbnails) setActiveThumbnail();
  }

  function showCount() {
    DOM.count.style.display = "block";
    DOM.count.innerHTML = `<span class="count-span-text">${
      currentIndex + 1
    }</span> / ${links.length}`;
  }

  function hideCount() {
    DOM.count.style.display = "none";
  }

  function hideText() {
    DOM.text.style.display = "none";
  }

  function showText(text) {
    DOM.text.innerHTML = text;
    DOM.text.style.display = "block";
  }

  function showPrevNext() {
    DOM.next.style.display = "block";
    DOM.prev.style.display = "block";
  }

  function hidePrevNext() {
    DOM.next.style.display = "none";
    DOM.prev.style.display = "none";
  }

  function addLinks(selector) {
    const elements = document.querySelectorAll(selector);

    elements.forEach((el) => {
      if (el.tagName === "A" && el.href) {
        el.addEventListener("click", (e) => {
          e.preventDefault();
          const href = el.href;
          const text = el.dataset.text;
          currentIndex = getCurrentIndex(el);
          showLightbox();
          showImage(href, text);
        });
        links.push(el);
      }
    });

    if (options.showThumbnails) makeThumbnails();

    if (links.length > 1) {
      if (options.showCount) showCount();
      showPrevNext();
      if (options.showThumbnails) showThumbnails();
    } else {
      hideCount();
      hidePrevNext();
      if (options.showThumbnails) hideThumbnails();
    }
  }

  function getCurrentIndex(el) {
    return links.indexOf(el);
  }

  function makeThumbnails() {
    DOM.thumbnails.style.display = "flex";
    DOM.thumbnailsList.innerHTML = "";
    links.forEach((link) => {
      const thumb = document.createElement("a");
      thumb.href = link.href;
      thumb.classList.add("lightbox-thumbnails-el");
      thumb.dataset.text = link.dataset.text;
      const img = document.createElement("img");
      img.src = link.href;
      thumb.append(img);
      DOM.thumbnailsList.append(thumb);
    });
  }

  function hideThumbnails() {
    DOM.thumbnails.style.display = "none";
    DOM.lightbox.classList.remove("lightbox--gallery");
  }

  function showThumbnails() {
    DOM.thumbnails.style.display = "flex";
    DOM.lightbox.classList.add("lightbox--gallery");
  }

  function setActiveThumbnail() {
    const thumbnails = [...DOM.thumbnailsList.children];
    thumbnails.forEach((link) => {
      link.classList.remove("is-active");
    });

    thumbnails[currentIndex].classList.add("is-active");
  }

  function showLoading() {
    const div = document.createElement("div");
    div.classList.add("lightbox-img-loading");
    DOM.imgCnt.append(div);
  }

  function hideLoading() {
    if (DOM.imgCnt.querySelector(".lightbox-img-loading")) {
      DOM.imgCnt.querySelector(".lightbox-img-loading").remove();
    }
  }
  function showError() {
    const div = document.createElement("div");
    div.classList.add("lightbox-img-error");
    div.innerHTML = "Błąd wczytywania grafiki";
    DOM.imgCnt.append(div);
  }

  function hideError() {
    if (DOM.imgCnt.querySelector(".lightbox-img-error")) {
      DOM.imgCnt.querySelector(".lightbox-img-error").remove();
    }
  }

  return {
    showCount,
    hideCount,
    addLinks,
    hidePrevNext,
    showPrevNext,
    hideText,
    showText,
    hideThumbnails,
    showThumbnails,
  };
}

const lightbox2 = lightbox({
  showText: true,
  showCount: true,
  showThumbnails: true,
  showPrevNext: true,
});

lightbox2.addLinks(".gallery-el");
