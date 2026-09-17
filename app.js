(function () {
  "use strict";

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const currency = document.body.dataset.currency || "USD";

  const money = (value) => new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    maximumFractionDigits: 2
  }).format(Number.isFinite(value) ? value : 0);

  const number = (value, digits = 1) => new Intl.NumberFormat(undefined, {
    maximumFractionDigits: digits,
    minimumFractionDigits: 0
  }).format(Number.isFinite(value) ? value : 0);

  const num = (id) => {
    const value = Number.parseFloat($(`#${id}`)?.value);
    return Number.isFinite(value) ? value : 0;
  };

  const setText = (id, value) => {
    const el = $(`#${id}`);
    if (el) el.textContent = value;
  };

  function trackEvent(name, params = {}) {
    if (typeof window.gtag === "function") {
      window.gtag("event", name, params);
    }
  }

  function calculateHourly() {
    const targetIncome = num("targetIncome");
    const businessCosts = num("businessCosts");
    const billableHours = num("billableHours");
    const weeksOff = num("weeksOff");
    const bufferPercent = num("bufferPercent");
    const workingWeeks = Math.max(1, 52 - weeksOff);
    const annualBillableHours = Math.max(1, billableHours * workingWeeks);
    const revenueTarget = targetIncome + businessCosts;
    const baseRate = revenueTarget / annualBillableHours;
    const targetRate = baseRate * (1 + bufferPercent / 100);
    const dayRate = targetRate * 8;
    const weeklyTarget = targetRate * billableHours;

    setText("resultRate", money(targetRate));
    setText("baseRate", money(baseRate));
    setText("dayRate", money(dayRate));
    setText("weeklyTarget", money(weeklyTarget));
    setText("billableTotal", `${number(annualBillableHours, 0)} hours`);
    return { baseRate, targetRate, dayRate, weeklyTarget, annualBillableHours };
  }

  function calculateQuote() {
    const estimateHours = num("estimateHours");
    const hourlyRate = num("hourlyRate");
    const revisionHours = num("revisionHours");
    const adminHours = num("adminHours");
    const riskPercent = num("riskPercent");
    const taxPercent = num("taxPercent");
    const depositPercent = num("depositPercent");
    const labor = (estimateHours + revisionHours + adminHours) * hourlyRate;
    const risk = labor * (riskPercent / 100);
    const subtotal = labor + risk;
    const tax = subtotal * (taxPercent / 100);
    const total = subtotal + tax;
    const deposit = total * (depositPercent / 100);

    setText("resultQuote", money(total));
    setText("laborTotal", money(labor));
    setText("riskTotal", money(risk));
    setText("subtotalTotal", money(subtotal));
    setText("taxTotal", money(tax));
    setText("depositTotal", money(deposit));
    return { labor, risk, subtotal, tax, total, deposit };
  }

  function calculateLateFee() {
    const invoiceAmount = num("invoiceAmount");
    const annualRate = num("annualRate");
    const daysLate = num("daysLate");
    const graceDays = num("graceDays");
    const chargeableDays = Math.max(0, daysLate - graceDays);
    const dailyInterest = invoiceAmount * (annualRate / 100) / 365;
    const interest = dailyInterest * chargeableDays;
    const total = invoiceAmount + interest;

    setText("resultLate", money(total));
    setText("interestAmount", money(interest));
    setText("dailyInterest", money(dailyInterest));
    setText("chargeableDays", `${number(chargeableDays, 0)} days`);
    return { chargeableDays, dailyInterest, interest, total };
  }

  function calculateMargin() {
    const revenue = num("revenue");
    const directCosts = num("directCosts");
    const overhead = num("overhead");
    const paymentFeePercent = num("paymentFeePercent");
    const paymentFee = revenue * (paymentFeePercent / 100);
    const costs = directCosts + overhead + paymentFee;
    const profit = revenue - costs;
    const margin = revenue > 0 ? profit / revenue * 100 : 0;
    const markup = costs > 0 ? profit / costs * 100 : 0;
    const breakEvenRevenue = paymentFeePercent < 100
      ? (directCosts + overhead) / (1 - paymentFeePercent / 100)
      : 0;

    setText("resultMargin", `${number(margin)}%`);
    setText("profitAmount", money(profit));
    setText("costAmount", money(costs));
    setText("paymentFee", money(paymentFee));
    setText("markupAmount", `${number(markup)}%`);
    setText("breakEvenRevenue", money(breakEvenRevenue));
    return { paymentFee, costs, profit, margin, markup, breakEvenRevenue };
  }

  const calculators = {
    hourly: calculateHourly,
    quote: calculateQuote,
    late: calculateLateFee,
    margin: calculateMargin
  };

  function initCalculators() {
    $$('[data-calculator]').forEach((form) => {
      const type = form.dataset.calculator;
      const calculate = calculators[type];
      if (!calculate) return;

      form.addEventListener("submit", (event) => {
        event.preventDefault();
        calculate();
        trackEvent("calculator_result", { calculator: type });
        const result = form.closest(".calculator-layout")?.querySelector(".result-card");
        result?.classList.add("has-result");
      });

      form.addEventListener("input", () => {
        if (form.dataset.live === "true") calculate();
      });

      calculate();
    });

    $$('[data-reset]').forEach((button) => {
      button.addEventListener("click", () => {
        const form = button.closest("form");
        form?.reset();
        const type = form?.dataset.calculator;
        if (type && calculators[type]) calculators[type]();
      });
    });

    $$('[data-copy-result]').forEach((button) => {
      button.addEventListener("click", async () => {
        const card = button.closest(".result-card");
        const text = $$(".result-list li", card)
          .map((item) => `${$("span", item)?.textContent?.trim()}: ${$("strong", item)?.textContent?.trim()}`)
          .join("\n");
        const total = $(".result-total", card)?.innerText?.trim();
        const output = [total, text].filter(Boolean).join("\n");
        try {
          await navigator.clipboard.writeText(output);
          const oldText = button.textContent;
          button.textContent = "Copied";
          window.setTimeout(() => { button.textContent = oldText; }, 1500);
          trackEvent("copy_result", { calculator: document.body.dataset.tool || "unknown" });
        } catch (_) {
          button.textContent = "Copy failed";
          window.setTimeout(() => { button.textContent = "Copy result"; }, 1500);
        }
      });
    });
  }

  function initNav() {
    const toggle = $('.mobile-nav-toggle');
    const nav = $('#site-nav');
    if (!toggle || !nav) return;
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });
  }

  function initYear() {
    $$('[data-year]').forEach((el) => { el.textContent = String(new Date().getFullYear()); });
  }

  document.addEventListener("DOMContentLoaded", () => {
    initNav();
    initCalculators();
    initYear();
  });

  window.RateScope = { calculateHourly, calculateQuote, calculateLateFee, calculateMargin, money, number };
})();
