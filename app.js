if (!localStorage.getItem("lang")) {
  localStorage.setItem("lang", "hy");
}

/* ===================================================
   Counters Animation with Smooth Cubic-Ease
=================================================== */
const counters = document.querySelectorAll('.counter');

function animateCounter(element) {
  const targetNumber = +element.getAttribute('data-target') || 0;
  const prefix = element.getAttribute('data-prefix') || '';
  const suffix = element.getAttribute('data-suffix') || '';
  const duration = 1400;
  let startTime = null;

  function step(timestamp) {
    if (!startTime) startTime = timestamp;
    const progress = timestamp - startTime;
    const progressRatio = Math.min(progress / duration, 1);
    // Apple-style smooth cubic deceleration
    const easeProgress = 1 - Math.pow(1 - progressRatio, 3.5);
    const value = Math.floor(easeProgress * targetNumber);

    element.textContent = prefix + value + suffix;

    if (progressRatio < 1) {
      requestAnimationFrame(step);
    } else {
      element.textContent = prefix + targetNumber + suffix;
    }
  }

  requestAnimationFrame(step);
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('show');
      if (entry.target.classList.contains('counter')) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      } else {
        // Unobserve after animation to save perf
        setTimeout(() => observer.unobserve(entry.target), 800);
      }
    }
  });
}, {
  threshold: 0.1,
  rootMargin: '0px 0px -40px 0px'
});

counters.forEach(counter => observer.observe(counter));

// Observe ALL scroll-reveal elements
document.querySelectorAll('.hidden, .hidden-left, .hidden-right, .hidden-scale').forEach(el => {
  observer.observe(el);
});

/* ===================================================
   Apple Scroll Progress Bar & Dynamic Header
=================================================== */
const scrollProgressBar = document.getElementById("scrollProgressBar");
const headerEl = document.getElementById("header");
const parallaxImages = document.querySelectorAll(".scroll-pic-img");

function updateParallaxPics(scrollPos) {
  // Disable parallax translateY shifting on mobile & tablets to eliminate white gaps/cutouts
  if (window.innerWidth <= 850) {
    parallaxImages.forEach(img => {
      img.style.transform = "none";
    });
    return;
  }
  const winHeight = window.innerHeight;
  parallaxImages.forEach(img => {
    const rect = img.getBoundingClientRect();
    if (rect.top < winHeight && rect.bottom > 0) {
      const speed = +img.getAttribute("data-parallax-speed") || 0.12;
      const offset = (rect.top - winHeight / 2) * speed;
      img.style.transform = `translateY(${offset}px) scale(1.05)`;
    }
  });
}

const navLinks = document.querySelectorAll("#header > ul > li > a");
const navSections = ["main", "aboutUs", "services", "calculatorSection", "reviews", "contactUs"];

function updateActiveNav() {
  const scrollPos = window.scrollY + 120;
  let currentSec = "main";
  navSections.forEach(id => {
    const el = document.getElementById(id);
    if (el && el.offsetTop <= scrollPos) {
      currentSec = id;
    }
  });

  navLinks.forEach(link => {
    const href = link.getAttribute("href");
    if (href === `#${currentSec}`) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });
}

function handleScroll() {
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const scrollPos = window.scrollY;

  if (scrollProgressBar && docHeight > 0) {
    const progress = Math.min(Math.max((scrollPos / docHeight) * 100, 0), 100);
    scrollProgressBar.style.width = `${progress}%`;
  }

  if (headerEl) {
    if (scrollPos > 40) {
      headerEl.style.boxShadow = "0 8px 30px rgba(12, 77, 125, 0.12)";
      headerEl.style.height = "66px";
    } else {
      headerEl.style.boxShadow = "0 2px 20px rgba(12, 77, 125, 0.08)";
      headerEl.style.height = "72px";
    }
  }

  updateActiveNav();
  updateParallaxPics(scrollPos);
}

window.addEventListener("scroll", handleScroll, { passive: true });

/* ===================================================
   Direct 1:1 3D Tilt & Specular Reflection (SKILL.md §2, §4)
=================================================== */
function initTiltCards() {
  const tiltCards = document.querySelectorAll("[data-tilt]");
  tiltCards.forEach(card => {
    let shine = card.querySelector(".pic-shine");

    card.addEventListener("pointermove", (e) => {
      card.style.transition = "transform 0.08s ease-out";
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Subtle physical rotation (max 4.5 deg - SKILL.md §2)
      const rotateX = ((y - centerY) / centerY) * -4.5;
      const rotateY = ((x - centerX) / centerX) * 4.5;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.015, 1.015, 1.015)`;

      if (shine) {
        shine.style.opacity = "1";
        shine.style.background = `radial-gradient(circle at ${(x / rect.width) * 100}% ${(y / rect.height) * 100}%, rgba(255, 255, 255, 0.38) 0%, transparent 60%)`;
      }
    });

    card.addEventListener("pointerleave", () => {
      // Critically damped spring return (SKILL.md §4)
      card.style.transition = "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)";
      card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
      if (shine) {
        shine.style.opacity = "0";
      }
    });
  });
}

initTiltCards();

/* ===================================================
   Apple-Style Interactive Tax Optimization Calculator
=================================================== */
const calcRevSlider = document.getElementById("calcRevSlider");
const calcRevDisplay = document.getElementById("calcRevDisplay");
const calcSavingsVal = document.getElementById("calcSavingsVal");
const calcTierVal = document.getElementById("calcTierVal");
const calcPkgIndustry = document.getElementById("calcPkgIndustry");
const calcPkgBadge = document.getElementById("calcPkgBadge");
const calcRegimeVal = document.getElementById("calcRegimeVal");
const pkgB1 = document.getElementById("pkgB1");
const pkgB2 = document.getElementById("pkgB2");
const pkgB3 = document.getElementById("pkgB3");
const pkgB4 = document.getElementById("pkgB4");
const calcPkgLead = document.getElementById("calcPkgLead");
const calcGlowFill = document.getElementById("calcGlowFill");
const calcIndustryBtns = document.querySelectorAll("#calcIndustryGroup .ind-btn");
const calcCtaBtn = document.getElementById("calcCtaBtn");

let currentIndustry = "it";
let displayedSavings = 3800000;
let targetSavings = 3800000;
let savingsAnimId = null;

function formatDram(num) {
  return "֏ " + Math.round(num).toLocaleString("en-US");
}

function getPackageTierDetails(industry, rev, isHy) {
  let industryTag = "";
  let tierName = "";
  let regimeText = "";
  let b1 = "", b2 = "", b3 = "", b4 = "";
  let leadText = isHy 
    ? "Անձնական ավագ հաշվապահ + հարկային խորհրդատու" 
    : "Dedicated Senior Accountant + Tax Advisor";

  if (industry === "it") {
    industryTag = isHy ? "ՏՏ / ՍՏԱՐՏԱՓ" : "IT / STARTUP";
    if (rev < 24000000) {
      tierName = isHy ? "IT Micro Spark (0% Հարկ)" : "IT Micro Spark (0% Tax)";
      regimeText = isHy ? "Միկրոձեռնարկատիրություն 0%" : "Microenterprise 0%";
      b1 = isHy ? "ՊԵԿ հաշվետվությունների ամբողջական կազմում" : "SRC tax returns filing & compliance";
      b2 = isHy ? "Արտարժութային հաշիվների & Stripe/Wise հաշվառում" : "Foreign currency & Stripe/Wise accounting";
      b3 = isHy ? "Հավաստագրված IT արտոնությունների վարում" : "Certified IT tax exemption maintenance";
      b4 = isHy ? "0% տուգանքի 100% ֆինանսական երաշխիք" : "100% financial guarantee: 0% audit fines";
    } else if (rev <= 115000000) {
      tierName = isHy ? "IT Venture Pro (Շրջհարկ 5%)" : "IT Venture Pro (5% Turnover)";
      regimeText = isHy ? "Շրջանառության հարկ 5%" : "Turnover Tax 5%";
      b1 = isHy ? "ՊԵԿ եռամսյակային & ամսական հաշվետվություններ" : "SRC monthly & quarterly tax filings";
      b2 = isHy ? "1C / ArmSoft ավտոմատացված հաշվապահություն" : "Full-cycle 1C / ArmSoft automation";
      b3 = isHy ? "Աշխատավարձերի և կադրային փաստաթղթավորում" : "Staff payroll calculation & HR management";
      b4 = isHy ? "100% պաշտպանություն ՊԵԿ ստուգումներից" : "Full SRC tax audit shield & legal defense";
    } else {
      tierName = isHy ? "IT Enterprise Shield (ԱԱՀ)" : "IT Enterprise Shield (VAT)";
      regimeText = isHy ? "Ընդհանուր համակարգ (ԱԱՀ 20% + Շահութահարկ)" : "General Regime (VAT 20% + Profit Tax)";
      b1 = isHy ? "ԱԱՀ-ի և շահութահարկի խորացված օպտիմալացում" : "Advanced VAT & Profit Tax optimization";
      b2 = isHy ? "Միջազգային ստանդարտներ (ՖՀՄՍ/IFRS) & 1C Պրո" : "IFRS international financial statements & 1C";
      b3 = isHy ? "Օտարերկրյա պայմանագրեր & WHT պահումներ" : "Cross-border contracts & WHT tax compliance";
      b4 = isHy ? "Անսահմանափակ աուդիտորական պաշտպանություն & NDA" : "Unlimited audit defense & strict NDA indemnity";
    }
  } else if (industry === "trade") {
    industryTag = isHy ? "ԱՌԵՎՏՈՒՐ ԵՎ E-COMMERCE" : "TRADE & E-COMMERCE";
    if (rev < 24000000) {
      tierName = isHy ? "Retail Micro Start" : "Retail Micro Start";
      regimeText = isHy ? "Միկրոձեռնարկատիրություն / Շրջհարկ" : "Micro / Turnover Tax";
      b1 = isHy ? "ՀԴՄ և էլեկտրոնային հաշիվ-ապրանքագրերի հաշվառում" : "POS receipts & e-invoicing supervision";
      b2 = isHy ? "ՊԵԿ պարտադիր հաշվետվությունների ներկայացում" : "Timely SRC tax declaration filings";
      b3 = isHy ? "Ապրանքային մնացորդների առաջնային վերահսկողություն" : "Inventory balance primary reconciliation";
      b4 = isHy ? "0% տուգանքի 100% երաշխիք" : "100% zero-penalty warranty";
    } else if (rev <= 115000000) {
      tierName = isHy ? "Commercial Standard (Շրջհարկ 5%)" : "Commercial Standard (5% Turnover)";
      regimeText = isHy ? "Շրջանառության հարկ 5% (1.5% փաստաթղթավորմամբ)" : "Turnover Tax 5% (1.5% documented)";
      b1 = isHy ? "Ձեռքբերումների փաստաթղթավորում & 1.5% հարկի իջեցում" : "Purchase doc verification & 1.5% tax reduction";
      b2 = isHy ? "1C Առևտրի Կառավարում և ArmSoft համակցում" : "1C Trade Management & ArmSoft integration";
      b3 = isHy ? "Աշխատավարձի հաշվարկ և կադրային գործավարություն" : "Staff payroll & HR documentation";
      b4 = isHy ? "ՊԵԿ գույքագրման ստուգումների լիարժեք ուղեկցում" : "Complete SRC inventory audit defense";
    } else {
      tierName = isHy ? "Retail Scale Enterprise (ԱԱՀ)" : "Retail Scale Enterprise (VAT)";
      regimeText = isHy ? "Ընդհանուր համակարգ (ԱԱՀ 20% + Շահութահարկ)" : "General Regime (VAT 20% + Profit Tax)";
      b1 = isHy ? "ԱԱՀ-ի հաշվանցումների և վերադարձի կառավարում" : "VAT offset management & SRC refund filing";
      b2 = isHy ? "Պահեստների և մատակարարների 1C ավտոմատացում" : "Warehouse & supplier automated 1C ledger";
      b3 = isHy ? "Ներմուծման մաքսային հայտարարագրերի հաշվառում" : "Customs import declaration reconciliations";
      b4 = isHy ? "Աուդիտորական լիակատար ֆինանսական պատասխանատվություն" : "Full financial liability audit protection";
    }
  } else if (industry === "services") {
    industryTag = isHy ? "ԾԱՌԱՅՈՒԹՅՈՒՆՆԵՐ" : "SERVICES";
    if (rev < 24000000) {
      tierName = isHy ? "Service Starter Pack" : "Service Starter Pack";
      regimeText = isHy ? "Միկրոձեռնարկատիրություն 0%" : "Microenterprise 0%";
      b1 = isHy ? "ՊԵԿ հարկային հաշվետվությունների ներկայացում" : "SRC tax compliance & declarations";
      b2 = isHy ? "Ծառայությունների մատուցման էլեկտրոնային հաշիվներ" : "Electronic service invoice generation";
      b3 = isHy ? "Բանկային գործառնությունների և վճարների հաշվառում" : "Bank ledger & payment reconciliation";
      b4 = isHy ? "0% տուգանքի ֆինանսական երաշխիք" : "0% penalty financial guarantee";
    } else if (rev <= 115000000) {
      tierName = isHy ? "Business Core Plan (Շրջհարկ 5%)" : "Business Core Plan (5% Turnover)";
      regimeText = isHy ? "Շրջանառության հարկ 5%" : "Turnover Tax 5%";
      b1 = isHy ? "ՊԵԿ եռամսյակային & ամսական հաշվետվություններ" : "Monthly & quarterly SRC tax submissions";
      b2 = isHy ? "1C / ArmSoft ամբողջական հաշվապահական սպասարկում" : "Full 1C / ArmSoft professional service";
      b3 = isHy ? "Աշխատակիցների գրանցում, արձակուրդային և հիվանդաթերթիկ" : "Employee contracts, vacation & sick leave pay";
      b4 = isHy ? "Հարկային ռիսկերի վերլուծություն և աուդիտորի պաշտպանություն" : "Tax risk diagnostic & audit representation";
    } else {
      tierName = isHy ? "Corporate Executive Tier (ԱԱՀ)" : "Corporate Executive Tier (VAT)";
      regimeText = isHy ? "Ընդհանուր համակարգ (ԱԱՀ + Շահութահարկ)" : "General Regime (VAT + Profit Tax)";
      b1 = isHy ? "Շահութահարկի և ծախսերի օրինական օպտիմալացում" : "Legal Profit Tax & expense deduction optimization";
      b2 = isHy ? "Կառավարչական հաշվետվություններ ղեկավարության համար" : "Executive managerial P&L & cashflow reporting";
      b3 = isHy ? "Պայմանագրերի հարկային փորձաքննություն և NDA" : "Contract tax vetting & NDA confidentiality";
      b4 = isHy ? "Անձնական աուդիտորական խումբ 24/7 հասանելիությամբ" : "Dedicated audit team with 24/7 priority SLA";
    }
  } else {
    // prod
    industryTag = isHy ? "ԱՐՏԱԴՐՈՒԹՅՈՒՆ ԵՎ ՆԵՐՄՈՒԾՈՒՄ" : "MANUFACTURING & IMPORT";
    if (rev < 24000000) {
      tierName = isHy ? "Artisan Micro Unit" : "Artisan Micro Unit";
      regimeText = isHy ? "Միկրոձեռնարկատիրություն 0%" : "Microenterprise 0%";
      b1 = isHy ? "Արտադրական միկրոյի ՊԵԿ հաշվետվությունների ներկայացում" : "Artisan micro tax declaration filings";
      b2 = isHy ? "Հումքի առաջնային ծախսագրման վարում" : "Raw material intake primary documentation";
      b3 = isHy ? "Աշխատավարձի և եկամտային հարկի հաշվարկ" : "Payroll & income tax calculation";
      b4 = isHy ? "0% տուգանքի երաշխիք" : "0% penalty legal warranty";
    } else if (rev <= 115000000) {
      tierName = isHy ? "Production Standard (Շրջհարկ 3.5%)" : "Production Standard (3.5% Turnover)";
      regimeText = isHy ? "Շրջանառության հարկ 3.5% (Արտադրություն)" : "Turnover Tax 3.5% (Manufacturing)";
      b1 = isHy ? "Ինքնարժեքի հաշվարկ & նորմատիվների կազմում 1C-ում" : "Cost accounting & recipe norms in 1C";
      b2 = isHy ? "Հումքի ձեռքբերման և արտադրանքի ելքագրման վարում" : "Raw materials purchase & product release control";
      b3 = isHy ? "Արտադրական անձնակազմի հերթափոխային աշխատավարձ" : "Shift payroll & worker labor compliance";
      b4 = isHy ? "ՊԵԿ տեսուչների հետ շփման 100% ստանձնում" : "100% SRC inspector liaison & legal shield";
    } else {
      tierName = isHy ? "Industrial Export Master (ԱԱՀ)" : "Industrial Export Master (VAT)";
      regimeText = isHy ? "Ընդհանուր համակարգ (ԱԱՀ 20% / 0% Արտահանման ԱԱՀ)" : "General Regime (20% VAT / 0% Export VAT)";
      b1 = isHy ? "Արտահանման 0% ԱԱՀ-ի վերադարձի և հաշվանցման ապահովում" : "Export 0% VAT refund & customs offset filing";
      b2 = isHy ? "Արտադրական 1C ERP ամբողջական համակարգ" : "Complete Manufacturing 1C ERP ledger";
      b3 = isHy ? "Մաքսային հայտարարագրերի և հումքի մաքսազերծման հաշվառում" : "Customs declarations & raw material clearing";
      b4 = isHy ? "Ֆինանսական տնօրենի (CFO) և աուդիտորի մշտական հսկողություն" : "Fractional CFO & Head Auditor continuous oversight";
    }
  }

  return { industryTag, tierName, regimeText, b1, b2, b3, b4, leadText };
}

/* Apple-style critically damped smooth number interpolation (SKILL.md §4, §11) */
function animateSavingsTicker() {
  const diff = targetSavings - displayedSavings;
  if (Math.abs(diff) < 200) {
    displayedSavings = targetSavings;
    if (calcSavingsVal) calcSavingsVal.textContent = Math.round(targetSavings).toLocaleString("en-US");
    savingsAnimId = null;
    return;
  }
  
  // Critically damped response step
  displayedSavings += diff * 0.24;
  if (calcSavingsVal) {
    calcSavingsVal.textContent = Math.round(displayedSavings).toLocaleString("en-US");
  }
  savingsAnimId = requestAnimationFrame(animateSavingsTicker);
}

function updateCalculator(skipLerp = false) {
  if (!calcRevSlider) return;
  const rev = +calcRevSlider.value;
  if (calcRevDisplay) calcRevDisplay.textContent = formatDram(rev);

  // Dynamic slider track fill with Apple accent (SKILL.md §1, §2)
  const min = +calcRevSlider.min || 3000000;
  const max = +calcRevSlider.max || 250000000;
  const pct = Math.min(Math.max(((rev - min) / (max - min)) * 100, 0), 100);
  calcRevSlider.style.background = `linear-gradient(to right, var(--und-color) 0%, var(--und-color) ${pct}%, rgba(12, 77, 125, 0.12) ${pct}%, rgba(12, 77, 125, 0.12) 100%)`;

  let rate = 0.15;
  if (currentIndustry === "it") rate = 0.15;
  else if (currentIndustry === "trade") rate = 0.09;
  else if (currentIndustry === "services") rate = 0.12;
  else if (currentIndustry === "prod") rate = 0.14;

  const isHy = (localStorage.getItem("lang") || "hy") === "hy";
  const pkg = getPackageTierDetails(currentIndustry, rev, isHy);

  targetSavings = Math.round(rev * rate);
  if (skipLerp) {
    displayedSavings = targetSavings;
    if (calcSavingsVal) calcSavingsVal.textContent = targetSavings.toLocaleString("en-US");
  } else {
    if (!savingsAnimId) {
      savingsAnimId = requestAnimationFrame(animateSavingsTicker);
    }
  }

  // Update Package Tier Elements
  if (calcTierVal) calcTierVal.textContent = pkg.tierName;
  if (calcPkgIndustry) calcPkgIndustry.textContent = pkg.industryTag;
  if (calcPkgBadge) {
    calcPkgBadge.innerHTML = `<i class="bi bi-shield-check"></i> 0% ${isHy ? "ՏՈՒԳԱՆՔ" : "PENALTY"}`;
  }
  if (calcRegimeVal) {
    calcRegimeVal.innerHTML = `<i class="bi bi-receipt-cutoff"></i> <span>${pkg.regimeText}</span>`;
  }
  if (pkgB1) pkgB1.textContent = pkg.b1;
  if (pkgB2) pkgB2.textContent = pkg.b2;
  if (pkgB3) pkgB3.textContent = pkg.b3;
  if (pkgB4) pkgB4.textContent = pkg.b4;
  if (calcPkgLead) {
    calcPkgLead.textContent = pkg.leadText;
  }

  if (calcGlowFill) {
    const fillPercent = Math.min(Math.max((rev / 250000000) * 100, 15), 100);
    calcGlowFill.style.width = `${fillPercent}%`;
  }

  // Dynamic ambient luminescence (SKILL.md §12)
  const resultsCard = document.querySelector(".calc-results-card");
  if (resultsCard) {
    const intensity = Math.min(Math.max((rev / 250000000), 0.2), 1);
    resultsCard.style.boxShadow = `0 ${15 + intensity * 15}px ${35 + intensity * 25}px rgba(12, 77, 125, ${0.25 + intensity * 0.2})`;
  }
}

if (calcRevSlider) {
  calcRevSlider.addEventListener("input", () => updateCalculator(false));
}

calcIndustryBtns.forEach(btn => {
  btn.addEventListener("pointerdown", () => {
    btn.style.transform = "scale(0.95)";
  });

  const resetBtnScale = () => {
    btn.style.transform = "";
  };
  btn.addEventListener("pointerup", resetBtnScale);
  btn.addEventListener("pointercancel", resetBtnScale);

  btn.addEventListener("click", () => {
    calcIndustryBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentIndustry = btn.getAttribute("data-ind") || "it";

    // Tactile micro-bounce on results card (SKILL.md §4)
    const resultsCard = document.querySelector(".calc-results-card");
    if (resultsCard) {
      resultsCard.style.transform = "scale(1.015)";
      setTimeout(() => {
        resultsCard.style.transform = "";
      }, 200);
    }

    updateCalculator(false);
  });
});

if (calcCtaBtn) {
  calcCtaBtn.addEventListener("click", () => {
    const messageInput = document.querySelector("#modalForm textarea[name='message']");
    const serviceSelect = document.querySelector("#modalForm select[name='service']");
    if (serviceSelect) {
      serviceSelect.value = currentIndustry === "it" ? "tax" : "accounting";
    }
    if (messageInput && calcRevSlider) {
      messageInput.value = `Հետաքրքրված եմ ${currentIndustry.toUpperCase()} փաթեթով (Տարեկան շրջանառություն՝ ${formatDram(+calcRevSlider.value)}):`;
    }
    openConsultationModal(e ? (e.currentTarget || e.target) : null);
  });
}

updateCalculator(true);

/* ===================================================
   Hero Buttons & Theme Toggling
=================================================== */
let start = document.getElementById("start");
if (start) {
  start.addEventListener("click", (e) => {
    e.preventDefault();
    openConsultationModal(e ? (e.currentTarget || e.target) : null);
  });
}

let task = document.getElementById("task");
if (task) {
  task.addEventListener("click", () => {
    location.href = "#services";
  });
}

let logo = document.getElementById("logo");
let colorMode = document.getElementById("colorMode");

colorMode.addEventListener("click", () => {
  const currentMain = getComputedStyle(document.documentElement).getPropertyValue("--main-color").trim();
  if (currentMain === "#0C4D7D") {
    // Switch to Dark Mode (Apple Obsidian / Space Gray)
    colorMode.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-moon-fill" viewBox="0 0 16 16">
        <path d="M6 .278a.77.77 0 0 1 .08.858 7.2 7.2 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.318 7.277q.792-.001 1.533-.16a.79.79 0 0 1 .81.316.73.73 0 0 1-.031.893A8.35 8.35 0 0 1 8.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.75.75 0 0 1 6 .278"/>
      </svg>
    `;
    document.documentElement.style.setProperty('--main-color', '#38bdf8');
    document.documentElement.style.setProperty('--und-color', '#fb923c');
    document.documentElement.style.setProperty('--main-text', '#cbd5e1');
    document.documentElement.style.setProperty('--main-bgc', '#0f172a');
    document.documentElement.style.setProperty('--secondary-bgc', '#1e293b');
    document.documentElement.style.setProperty('--hover-color', '#0284c7');
    document.documentElement.style.setProperty('--big-text', '#f8fafc');
    document.documentElement.style.setProperty('--hd-bgc', 'rgba(15, 23, 42, 0.88)');
    document.documentElement.style.setProperty('--pp-color', '#94a3b8');
    document.documentElement.style.setProperty('--all-color', '#f1f5f9');
    document.documentElement.style.backgroundColor = "#0f172a";
  } else {
    // Switch to Light Mode
    colorMode.innerHTML = `
      <svg class="bi bi-brightness-high-fill" fill="currentColor" height="20" viewBox="0 0 16 16" width="20" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 8a4 4 0 1 1-8 0 4 4 0 0 1 8 0M8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0m0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13m8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5M3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8m10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0m-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0m9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707M4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708"></path>
      </svg>
    `;
    document.documentElement.style.setProperty('--main-color', '#0C4D7D');
    document.documentElement.style.setProperty('--und-color', '#D76E23');
    document.documentElement.style.setProperty('--main-text', '#919191');
    document.documentElement.style.setProperty('--main-bgc', '#f8f9fa');
    document.documentElement.style.setProperty('--secondary-bgc', '#ffffff');
    document.documentElement.style.setProperty('--hover-color', '#2d5d7f');
    document.documentElement.style.setProperty('--big-text', '#1e1e1e');
    document.documentElement.style.setProperty('--hd-bgc', 'rgba(255, 255, 255, 0.9)');
    document.documentElement.style.setProperty('--pp-color', '#666666');
    document.documentElement.style.setProperty('--all-color', '#333333');
    document.documentElement.style.backgroundColor = "#ffffff";
  }
});

/* ===================================================
   i18n Multi-Language Translation System
=================================================== */
let translations = {};

document.addEventListener("DOMContentLoaded", () => {
  fetch("./json/lang.json")
    .then(res => res.json())
    .then(data => {
      translations = data;
      let lang = localStorage.getItem("lang") || "hy";
      const sel = document.getElementById("languages");
      if (sel) sel.value = lang;
      changeLanguage(lang);
    });
});

function changeLanguage(lang) {
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    if (translations[lang] && translations[lang][key]) {
      el.textContent = translations[lang][key];
    }
  });

  document.querySelectorAll("[data-i18n-ph]").forEach(el => {
    const key = el.getAttribute("data-i18n-ph");
    if (translations[lang] && translations[lang][key]) {
      el.setAttribute("placeholder", translations[lang][key]);
    }
  });

  localStorage.setItem("lang", lang);
  const sel = document.getElementById("languages");
  if (sel) sel.value = lang;

  if (typeof updateCalculator === "function") {
    updateCalculator(true);
  }
}

/* ===================================================
   Consultation Modal & Floating CTA Logic
=================================================== */
const consultationModal = document.getElementById("consultationModal");
const modalCloseBtn = document.getElementById("modalCloseBtn");
const floatingBookBtn = document.getElementById("floatingBookBtn");

function openConsultationModal(originEl) {
  if (consultationModal) {
    const modalCard = consultationModal.querySelector(".modal-card");
    if (modalCard && originEl && originEl.getBoundingClientRect) {
      const rect = originEl.getBoundingClientRect();
      const originX = rect.left + rect.width / 2;
      const originY = rect.top + rect.height / 2;
      modalCard.style.transformOrigin = `${originX}px ${originY}px`;
    } else if (modalCard) {
      modalCard.style.transformOrigin = "center center";
    }
    consultationModal.classList.add("active");
    consultationModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    // Auto-hide floating action dock while modal is open so it never clutters or overlaps
    const floatingDock = document.querySelector(".floating-dock");
    if (floatingDock) floatingDock.style.display = "none";

    if (typeof window.syncWizardWithCalculator === "function") {
      window.syncWizardWithCalculator();
    }
    if (typeof window.resetWizardStep === "function") {
      window.resetWizardStep();
    }
  }
}

function closeConsultationModal() {
  if (consultationModal) {
    consultationModal.classList.remove("active");
    consultationModal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";

    // Restore floating action dock
    const floatingDock = document.querySelector(".floating-dock");
    if (floatingDock) floatingDock.style.display = "";
  }
}

if (floatingBookBtn) {
  floatingBookBtn.addEventListener("click", openConsultationModal);
}

if (modalCloseBtn) {
  modalCloseBtn.addEventListener("click", closeConsultationModal);
}

if (consultationModal) {
  consultationModal.addEventListener("click", (e) => {
    if (e.target === consultationModal) {
      closeConsultationModal();
    }
  });
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && consultationModal && consultationModal.classList.contains("active")) {
    closeConsultationModal();
  }
});

/* ===================================================
   Interactive Form Submissions with Feedback
=================================================== */
function setupFormSubmission(formEl, successEl) {
  if (!formEl) return;
  formEl.addEventListener("submit", (e) => {
    e.preventDefault();
    const submitBtn = formEl.querySelector("button[type='submit']");
    const currentLang = localStorage.getItem("lang") || "hy";
    const sendingText = (translations[currentLang] && translations[currentLang]["form_sending"]) || "Ուղարկվում է...";

    if (submitBtn) {
      submitBtn.disabled = true;
      const originalHtml = submitBtn.innerHTML;
      submitBtn.innerHTML = `<span>${sendingText}</span>`;

      setTimeout(() => {
        formEl.reset();
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalHtml;

        if (successEl) {
          successEl.style.display = "flex";
          setTimeout(() => {
            successEl.style.display = "none";
            if (formEl.id === "modalForm") {
              closeConsultationModal();
            }
          }, 3000);
        }
      }, 600);
    }
  });
}

setupFormSubmission(document.getElementById("modalForm"), document.getElementById("modalSuccess"));
setupFormSubmission(document.getElementById("contUs"), document.getElementById("onpageSuccess"));

const headerCtaBtn = document.getElementById("headerCtaBtn");
if (headerCtaBtn) {
  headerCtaBtn.addEventListener("click", openConsultationModal);
}

const serviceMap = {
  tax: "tax",
  fin: "financial_planning",
  buss: "accounting",
  tAdv: "tax",
  aud: "audit",
  hr: "accounting"
};

document.querySelectorAll(".service").forEach(card => {
  card.addEventListener("click", () => {
    const cardId = card.id;
    const serviceValue = serviceMap[cardId] || "tax";
    const modalSelect = document.querySelector("#modalForm select[name='service']");
    if (modalSelect) {
      modalSelect.value = serviceValue;
    }
    openConsultationModal(e ? (e.currentTarget || e.target) : null);
  });
});

/* ===================================================
   WWDC Fluid Testimonials Carousel Drag & Spring Momentum
   (SKILL.md §2 Direct Manipulation, §6 Momentum Projection, §9 Rubber-band)
=================================================== */
const revTrack = document.getElementById("revTrack");
const revPrev = document.getElementById("revPrev");
const revNext = document.getElementById("revNext");
const revDots = document.querySelectorAll("#revDots .dot");
const testimonialsViewport = document.querySelector(".testimonials-viewport");

let currentReviewIndex = 0;
const totalReviews = document.querySelectorAll(".testimonial-card").length || 3;
let autoReviewInterval = null;

function updateReviewSlide(index, withTransition = true) {
  currentReviewIndex = (index + totalReviews) % totalReviews;
  if (revTrack) {
    revTrack.style.transition = withTransition ? "transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)" : "none";
    revTrack.style.transform = `translateX(-${currentReviewIndex * 100}%)`;
  }
  revDots.forEach((dot, idx) => {
    dot.classList.toggle("active", idx === currentReviewIndex);
  });
}

function startAutoSlide() {
  stopAutoSlide();
  autoReviewInterval = setInterval(() => {
    updateReviewSlide(currentReviewIndex + 1);
  }, 6500);
}

function stopAutoSlide() {
  if (autoReviewInterval) {
    clearInterval(autoReviewInterval);
    autoReviewInterval = null;
  }
}

if (revPrev) {
  revPrev.addEventListener("click", () => {
    updateReviewSlide(currentReviewIndex - 1);
    startAutoSlide();
  });
}

if (revNext) {
  revNext.addEventListener("click", () => {
    updateReviewSlide(currentReviewIndex + 1);
    startAutoSlide();
  });
}

revDots.forEach((dot) => {
  dot.addEventListener("click", () => {
    const idx = parseInt(dot.getAttribute("data-index"), 10);
    updateReviewSlide(idx);
    startAutoSlide();
  });
});

// Apple Rubber-band formula (SKILL.md §9)
function rubberband(overshoot, dimension = 600, constant = 0.55) {
  return (overshoot * dimension * constant) / (dimension + constant * Math.abs(overshoot));
}

// Apple Momentum projection formula (SKILL.md §6)
function project(initialVelocity, decelerationRate = 0.998) {
  return (initialVelocity / 1000) * decelerationRate / (1 - decelerationRate);
}

if (testimonialsViewport && revTrack) {
  let isDragging = false;
  let startX = 0;
  let currentDeltaX = 0;
  let lastX = 0;
  let lastTime = 0;
  let velocity = 0;

  testimonialsViewport.addEventListener("pointerdown", (e) => {
    isDragging = true;
    startX = e.clientX;
    lastX = e.clientX;
    lastTime = performance.now();
    velocity = 0;
    currentDeltaX = 0;
    stopAutoSlide();

    testimonialsViewport.setPointerCapture(e.pointerId);
    revTrack.style.transition = "none";
  });

  testimonialsViewport.addEventListener("pointermove", (e) => {
    if (!isDragging) return;
    const now = performance.now();
    const dt = now - lastTime;
    const dx = e.clientX - lastX;

    if (dt > 0) {
      velocity = (dx / dt) * 1000; // px/sec
    }
    lastX = e.clientX;
    lastTime = now;

    let delta = e.clientX - startX;
    const viewportWidth = testimonialsViewport.offsetWidth || 600;

    // Apply rubberbanding at edges
    const isAtStart = currentReviewIndex === 0 && delta > 0;
    const isAtEnd = currentReviewIndex === totalReviews - 1 && delta < 0;

    if (isAtStart || isAtEnd) {
      delta = rubberband(delta, viewportWidth, 0.55);
    }

    currentDeltaX = delta;
    const baseTranslate = -currentReviewIndex * viewportWidth;
    revTrack.style.transform = `translateX(${baseTranslate + delta}px)`;
  });

  function handleDragEnd(e) {
    if (!isDragging) return;
    isDragging = false;
    try {
      testimonialsViewport.releasePointerCapture(e.pointerId);
    } catch (_) {}

    const viewportWidth = testimonialsViewport.offsetWidth || 600;
    const projectedOffset = currentDeltaX + project(velocity, 0.992);

    // If dragged or projected past 35% of slide, move to next/prev
    if (projectedOffset < -viewportWidth * 0.35 && currentReviewIndex < totalReviews - 1) {
      updateReviewSlide(currentReviewIndex + 1);
    } else if (projectedOffset > viewportWidth * 0.35 && currentReviewIndex > 0) {
      updateReviewSlide(currentReviewIndex - 1);
    } else {
      // Settle back to current
      updateReviewSlide(currentReviewIndex);
    }

    startAutoSlide();
  }

  testimonialsViewport.addEventListener("pointerup", handleDragEnd);
  testimonialsViewport.addEventListener("pointercancel", handleDragEnd);

  testimonialsViewport.addEventListener("mouseenter", stopAutoSlide);
  testimonialsViewport.addEventListener("mouseleave", startAutoSlide);
}

startAutoSlide();


/* ===================================================
   1. Audio-Haptics Web Audio API Engine (Feature 1 - SKILL.md §13)
=================================================== */
let audioCtx = null;
let hapticsEnabled = localStorage.getItem("haptics_enabled") !== "false";

function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) audioCtx = new AudioContextClass();
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

function playHapticTick(freq = 1100, duration = 0.015, volume = 0.05) {
  if (!hapticsEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (_) {}
}

const soundToggleBtn = document.getElementById("soundToggle");
const soundIcon = document.getElementById("soundIcon");

function updateSoundToggleUI() {
  if (!soundToggleBtn || !soundIcon) return;
  if (hapticsEnabled) {
    soundToggleBtn.classList.remove("muted");
    soundIcon.className = "bi bi-volume-up-fill";
  } else {
    soundToggleBtn.classList.add("muted");
    soundIcon.className = "bi bi-volume-mute-fill";
  }
}

if (soundToggleBtn) {
  updateSoundToggleUI();
  soundToggleBtn.addEventListener("click", () => {
    hapticsEnabled = !hapticsEnabled;
    localStorage.setItem("haptics_enabled", hapticsEnabled ? "true" : "false");
    updateSoundToggleUI();
    if (hapticsEnabled) playHapticTick(1200, 0.02, 0.08);
  });
}

// Hook into existing interactive events
if (calcRevSlider) {
  let lastTickVal = +calcRevSlider.value;
  calcRevSlider.addEventListener("input", () => {
    const currentVal = +calcRevSlider.value;
    if (Math.abs(currentVal - lastTickVal) >= 15000000) {
      playHapticTick(950, 0.012, 0.035);
      lastTickVal = currentVal;
    }
  });
}

calcIndustryBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    playHapticTick(1200, 0.02, 0.06);
  });
});

if (colorMode) {
  colorMode.addEventListener("click", () => {
    playHapticTick(1350, 0.022, 0.07);
  });
}

/* ===================================================
   2. Apple Wallet 3D Titanium Tier Pass (Feature 4 - SKILL.md §4, §12)
=================================================== */
const walletPassCard = document.getElementById("walletPassCard");
if (walletPassCard) {
  const passShine = walletPassCard.querySelector(".pass-shine");

  walletPassCard.addEventListener("click", () => {
    walletPassCard.classList.toggle("flipped");
    playHapticTick(1050, 0.025, 0.06);
  });

  walletPassCard.addEventListener("pointermove", (e) => {
    if (window.innerWidth <= 768) return; // Disable 3D tilt tracking on mobile/touch
    if (walletPassCard.classList.contains("flipped")) return;
    const rect = walletPassCard.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const rotX = ((y - cy) / cy) * -6.5;
    const rotY = ((x - cx) / cx) * 6.5;

    walletPassCard.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.02, 1.02, 1.02)`;

    if (passShine) {
      passShine.style.opacity = "1";
      passShine.style.background = `radial-gradient(circle at ${(x / rect.width) * 100}% ${(y / rect.height) * 100}%, rgba(255, 255, 255, 0.35) 0%, transparent 60%)`;
    }
  });

  walletPassCard.addEventListener("pointerleave", () => {
    if (walletPassCard.classList.contains("flipped")) return;
    walletPassCard.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
    if (passShine) {
      passShine.style.opacity = "0";
    }
  });
}

/* ===================================================
   3. Armenian Tax Pulse Countdown Engine (Feature 5 - SKILL.md §16)
=================================================== */
function updateTaxPulseCountdown() {
  const now = new Date();
  let deadline = new Date(now.getFullYear(), now.getMonth(), 20, 23, 59, 59);
  if (now > deadline) {
    deadline = new Date(now.getFullYear(), now.getMonth() + 1, 20, 23, 59, 59);
  }
  const diffMs = deadline - now;
  if (diffMs <= 0) return;

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  const dEl = document.getElementById("taxDays");
  const hEl = document.getElementById("taxHours");
  const mEl = document.getElementById("taxMins");

  if (dEl) dEl.textContent = String(days).padStart(2, "0");
  if (hEl) hEl.textContent = String(hours).padStart(2, "0");
  if (mEl) mEl.textContent = String(mins).padStart(2, "0");
}

setInterval(updateTaxPulseCountdown, 1000);
updateTaxPulseCountdown();

const taxPulseBtn = document.getElementById("taxPulseBtn");
if (taxPulseBtn) {
  taxPulseBtn.addEventListener("click", (e) => {
    playHapticTick(1100, 0.02, 0.06);
    const serviceSelect = document.querySelector("#modalForm select[name='service']");
    const messageInput = document.querySelector("#modalForm textarea[name='message']");
    if (serviceSelect) serviceSelect.value = "tax";
    if (messageInput) messageInput.value = "Հետաքրքրված եմ ՊԵԿ ընթացիկ հաշվետվությունների և տուգանքների կանխարգելման ծառայությամբ:";
    openConsultationModal(e ? (e.currentTarget || e.target) : null);
  });
}


/* ===================================================
   iOS-Style Step Sheet & Drawer Engine (Feature 6 - SKILL.md §2, §3, §5, §6, §7, §9, §12)
=================================================== */
(function initStepSheetDrawer() {
  const modal = document.getElementById("consultationModal");
  const sheetCard = document.getElementById("sheetModalCard");
  const grabBar = document.getElementById("sheetGrabBar");
  const backBtn = document.getElementById("wizardBackBtn");
  const progressFill = document.getElementById("wizardProgressFill");
  const stepBadge = document.getElementById("stepIndicatorBadge");
  const steps = document.querySelectorAll(".wizard-step");
  const waBtn = document.getElementById("instantWaBtn");

  // Hidden Form Fields
  const inputBiz = document.getElementById("wizardBizType");
  const inputTurnover = document.getElementById("wizardTurnover");
  const inputGoal = document.getElementById("wizardGoal");
  const inputService = document.getElementById("wizardService");
  const inputMessage = document.getElementById("wizardMessage");

  // Summary Pill Elements
  const sumBiz = document.getElementById("sumBiz");
  const sumTier = document.getElementById("sumTier");
  const sumGoal = document.getElementById("sumGoal");

  let currentStep = 1;
  const totalSteps = 4;

  const wizardState = {
    biz: "it",
    bizText: "ՏՏ և Ստարտափներ",
    tier: "turnover",
    tierText: "24-115 մլն ֏",
    goal: "tax_opt",
    goalText: "Հարկերի օպտիմալացում",
    service: "tax"
  };

  function updateStepUI(step) {
    currentStep = step;
    steps.forEach(s => {
      const sNum = parseInt(s.dataset.step, 10);
      s.classList.toggle("active", sNum === step);
    });

    if (progressFill) {
      const pct = (step / totalSteps) * 100;
      progressFill.style.width = pct + "%";
    }

    if (backBtn) {
      backBtn.style.visibility = step > 1 ? "visible" : "hidden";
    }

    if (stepBadge) {
      const isHy = (document.documentElement.lang || "hy") === "hy";
      stepBadge.textContent = isHy ? `Քայլ ${step} / ${totalSteps}` : `Step ${step} of ${totalSteps}`;
    }

    if (step === 4) {
      if (sumBiz) sumBiz.textContent = wizardState.bizText;
      if (sumTier) sumTier.textContent = wizardState.tierText;
      if (sumGoal) sumGoal.textContent = wizardState.goalText;

      // Update hidden form inputs for backend submit
      if (inputBiz) inputBiz.value = wizardState.biz;
      if (inputTurnover) inputTurnover.value = wizardState.tier;
      if (inputGoal) inputGoal.value = wizardState.goal;
      if (inputService) inputService.value = wizardState.service;
      if (inputMessage) {
        inputMessage.value = `[Հայտ Wizard-ից]: Ոլորտ: ${wizardState.bizText} | Շրջանառություն: ${wizardState.tierText} | Նպատակ: ${wizardState.goalText}`;
      }
    }
  }

  function goToStep(step) {
    if (step < 1 || step > totalSteps) return;
    updateStepUI(step);
    if (typeof playHapticTick === "function") {
      playHapticTick(1100 + step * 50, 0.015, 0.045);
    }
  }

  if (backBtn) {
    backBtn.addEventListener("click", () => {
      goToStep(currentStep - 1);
    });
  }

  // Step 1: Business Category Selection
  const bizCards = document.querySelectorAll('.wizard-option-card[data-biz]');
  bizCards.forEach(card => {
    card.addEventListener("click", () => {
      bizCards.forEach(c => c.classList.remove("active"));
      card.classList.add("active");
      wizardState.biz = card.dataset.biz;
      wizardState.service = card.dataset.service || "tax";
      const h4 = card.querySelector("h4");
      if (h4) wizardState.bizText = h4.textContent.trim();
      if (typeof playHapticTick === "function") playHapticTick(1200, 0.018, 0.06);

      setTimeout(() => goToStep(2), 160);
    });
  });

  // Step 2: Turnover Tier Selection
  const tierPills = document.querySelectorAll('.wizard-tier-pill[data-tier]');
  tierPills.forEach(pill => {
    pill.addEventListener("click", () => {
      tierPills.forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
      wizardState.tier = pill.dataset.tier;
      const strong = pill.querySelector("strong");
      if (strong) wizardState.tierText = strong.textContent.trim();
      if (typeof playHapticTick === "function") playHapticTick(1250, 0.018, 0.06);

      setTimeout(() => goToStep(3), 160);
    });
  });

  // Step 3: Primary Goal Selection
  const goalCards = document.querySelectorAll('.wizard-option-card[data-goal]');
  goalCards.forEach(card => {
    card.addEventListener("click", () => {
      goalCards.forEach(c => c.classList.remove("active"));
      card.classList.add("active");
      wizardState.goal = card.dataset.goal;
      const h4 = card.querySelector("h4");
      if (h4) wizardState.goalText = h4.textContent.trim();
      if (typeof playHapticTick === "function") playHapticTick(1300, 0.018, 0.06);

      setTimeout(() => goToStep(4), 160);
    });
  });

  // Sync with Calculator on Modal Open
  window.syncWizardWithCalculator = function() {
    const revSlider = document.getElementById("calcRevSlider");
    if (revSlider && tierPills.length > 0) {
      const rev = +revSlider.value;
      let matchedTier = "turnover";
      if (rev < 24000000) matchedTier = "micro";
      else if (rev <= 115000000) matchedTier = "turnover";
      else if (rev <= 500000000) matchedTier = "vat";
      else matchedTier = "enterprise";

      tierPills.forEach(pill => {
        const isMatch = pill.dataset.tier === matchedTier;
        pill.classList.toggle("active", isMatch);
        if (isMatch) {
          wizardState.tier = matchedTier;
          const strong = pill.querySelector("strong");
          if (strong) wizardState.tierText = strong.textContent.trim();
        }
      });
    }
  };

  // WhatsApp Handshake Button (+374 55 238228)
  function getWhatsAppHandshakeUrl() {
    const nameInput = document.getElementById("wizardNameInput");
    const phoneInput = document.getElementById("wizardPhoneInput");
    const name = nameInput ? nameInput.value.trim() : "";
    const phone = phoneInput ? phoneInput.value.trim() : "";

    const isHy = (document.documentElement.lang || 'hy') === 'hy';
    let text = isHy
      ? 'Ողջույն HM Consulting, ցանկանում եմ խորհրդատվություն ստանալ:\n'
      : 'Hello HM Consulting, I would like to request a consultation:\n';
    text += isHy ? `• Ոլորտ: ${wizardState.bizText}\n` : `• Industry: ${wizardState.bizText}\n`;
    text += isHy ? `• Շրջանառություն: ${wizardState.tierText}\n` : `• Turnover: ${wizardState.tierText}\n`;
    text += isHy ? `• Նպատակ: ${wizardState.goalText}` : `• Goal: ${wizardState.goalText}`;
    if (name) text += isHy ? `\n• Անուն: ${name}` : `\n• Name: ${name}`;
    if (phone) text += isHy ? `\n• Հեռախոս: ${phone}` : `\n• Phone: ${phone}`;

    return `https://wa.me/37455238228?text=${encodeURIComponent(text)}`;
  }

  if (waBtn) {
    // Proactively refresh href on touch/click/pointerdown
    const refreshWaHref = () => {
      waBtn.href = getWhatsAppHandshakeUrl();
    };
    waBtn.addEventListener("pointerdown", refreshWaHref);
    waBtn.addEventListener("mouseenter", refreshWaHref);
    waBtn.addEventListener("focus", refreshWaHref);
    waBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const url = getWhatsAppHandshakeUrl();
      waBtn.href = url;
      window.open(url, "_blank", "noopener,noreferrer");
      if (typeof playHapticTick === "function") playHapticTick(1400, 0.02, 0.07);
    });
  }

  /* ===================================================
     Direct 1:1 Gesture Drag-to-Dismiss & Rubber-banding
     (SKILL.md §2, §3, §5, §6, §9)
  =================================================== */
  if (grabBar && sheetCard) {
    let isDragging = false;
    let startY = 0;
    let currentY = 0;
    let velocityHistory = [];

    // Apple projection formula (SKILL.md §6)
    function projectResting(v, decelRate = 0.992) {
      return (v / 1000) * decelRate / (1 - decelRate);
    }

    // Rubberband resistance (SKILL.md §9)
    function rubberband(offset, dimension = 150, constant = 0.45) {
      return (offset * dimension * constant) / (dimension + constant * Math.abs(offset));
    }

    grabBar.addEventListener("pointerdown", (e) => {
      isDragging = true;
      grabBar.setPointerCapture(e.pointerId);
      startY = e.clientY;
      currentY = e.clientY;
      velocityHistory = [{ y: e.clientY, t: performance.now() }];
      sheetCard.style.transition = "none";
    });

    grabBar.addEventListener("pointermove", (e) => {
      if (!isDragging) return;
      currentY = e.clientY;
      const now = performance.now();
      velocityHistory.push({ y: currentY, t: now });
      if (velocityHistory.length > 5) velocityHistory.shift();

      const dy = currentY - startY;

      if (dy < 0) {
        // Dragging upward: apply rubberband resistance
        const damped = rubberband(dy, 150, 0.45);
        sheetCard.style.transform = `translateY(${damped}px)`;
      } else {
        // Dragging downward: direct 1:1 tracking
        sheetCard.style.transform = `translateY(${dy}px)`;
      }
    });

    function endDrag(e) {
      if (!isDragging) return;
      isDragging = false;
      try { grabBar.releasePointerCapture(e.pointerId); } catch (_) {}

      const dy = currentY - startY;
      let velocity = 0;
      if (velocityHistory.length >= 2) {
        const first = velocityHistory[0];
        const last = velocityHistory[velocityHistory.length - 1];
        const dt = last.t - first.t;
        if (dt > 0) {
          velocity = (last.y - first.y) / dt; // px/ms
        }
      }

      const projected = dy + projectResting(velocity * 1000);

      if (projected > 140 || dy > 110) {
        // Momentum flick or dragged past dismiss threshold
        sheetCard.style.transition = "transform 0.28s cubic-bezier(0.32, 0.72, 0, 1)";
        sheetCard.style.transform = "translateY(110%)";
        if (typeof playHapticTick === "function") playHapticTick(900, 0.02, 0.05);

        setTimeout(() => {
          if (typeof closeConsultationModal === "function") {
            closeConsultationModal();
          }
          sheetCard.style.transform = "";
          sheetCard.style.transition = "";
          goToStep(1);
        }, 280);
      } else {
        // Settle back to resting state with Apple critically damped spring
        sheetCard.style.transition = "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)";
        sheetCard.style.transform = "translateY(0)";
        setTimeout(() => {
          sheetCard.style.transition = "";
        }, 400);
      }
    }

    grabBar.addEventListener("pointerup", endDrag);
    grabBar.addEventListener("pointercancel", endDrag);
  }

  // Hook into openConsultationModal to reset to step 1 and sync calculator
  window.resetWizardStep = () => goToStep(1);
  const originalOpen = window.openConsultationModal;
  window.openConsultationModal = function(originEl) {
    if (typeof originalOpen === "function") originalOpen(originEl);
    if (typeof window.syncWizardWithCalculator === "function") {
      window.syncWizardWithCalculator();
    }
  };
})();


/* ===================================================
   Mobile Hamburger Navigation Drawer
   (Apple spring open/close, overlay dismiss, nav link close)
=================================================== */
(function initMobileNav() {
  const hamburgerBtn = document.getElementById("hamburgerBtn");
  const drawer = document.getElementById("mobileNavDrawer");
  const overlay = document.getElementById("mobileNavOverlay");
  const mobileCtaBtn = document.getElementById("mobileNavCtaBtn");

  if (!hamburgerBtn || !drawer || !overlay) return;

  let isOpen = false;

  function openDrawer() {
    isOpen = true;
    hamburgerBtn.classList.add("open");
    hamburgerBtn.setAttribute("aria-expanded", "true");
    overlay.classList.add("visible");
    requestAnimationFrame(() => {
      overlay.classList.add("active");
      drawer.classList.add("open");
    });
    document.body.style.overflow = "hidden";
    if (typeof playHapticTick === "function") playHapticTick(1100, 0.012, 0.04);
  }

  function closeDrawer() {
    isOpen = false;
    hamburgerBtn.classList.remove("open");
    hamburgerBtn.setAttribute("aria-expanded", "false");
    overlay.classList.remove("active");
    drawer.classList.remove("open");
    document.body.style.overflow = "";
    setTimeout(() => overlay.classList.remove("visible"), 300);
    if (typeof playHapticTick === "function") playHapticTick(950, 0.01, 0.03);
  }

  hamburgerBtn.addEventListener("click", () => {
    if (isOpen) closeDrawer(); else openDrawer();
  });

  overlay.addEventListener("click", closeDrawer);

  // Close on any nav link click
  drawer.querySelectorAll(".mobile-nav-link").forEach(link => {
    link.addEventListener("click", () => {
      setTimeout(closeDrawer, 80);
    });
  });

  // CTA button inside drawer opens consultation modal
  if (mobileCtaBtn) {
    mobileCtaBtn.addEventListener("click", () => {
      closeDrawer();
      setTimeout(() => {
        if (typeof openConsultationModal === "function") {
          openConsultationModal(mobileCtaBtn);
        }
      }, 320);
    });
  }

  // Close on Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isOpen) closeDrawer();
  });

  // Mirror active nav state into drawer links
  const desktopLinks = document.querySelectorAll("#header > ul > li > a");
  const mobileLinks = drawer.querySelectorAll(".mobile-nav-link");

  const syncActive = () => {
    desktopLinks.forEach((dl, i) => {
      if (mobileLinks[i]) {
        mobileLinks[i].classList.toggle("active", dl.classList.contains("active"));
      }
    });
  };

  // Sync on scroll (piggyback on existing updateActiveNav)
  const origUpdateActiveNav = window.updateActiveNav;
  window.updateActiveNav = function() {
    if (typeof origUpdateActiveNav === "function") origUpdateActiveNav();
    syncActive();
  };
})();
