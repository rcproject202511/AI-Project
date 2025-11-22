const lessonSummaries = {
  descriptive: {
    title: 'Descriptive statistics',
    bullets: [
      'Use mean vs. median depending on skewness and outliers.',
      'Variance and standard deviation measure spread; IQR resists outliers.',
      'Shape matters—pair center with visuals like histograms or boxplots.'
    ],
  },
  probability: {
    title: 'Probability & random variables',
    bullets: [
      'A random variable maps outcomes to numbers; distributions tell the story.',
      'Binomial works for fixed trials, independent events, same success rate.',
      'The normal curve often approximates sums or averages (thank you, CLT).'
    ],
  },
  inference: {
    title: 'Inference & decision-making',
    bullets: [
      'Confidence intervals create a range of plausible population values.',
      'Hypotheses compare a null claim to an alternative with a test statistic.',
      'Effect size and power prevent overreacting to tiny but significant results.'
    ],
  },
};

const quizQuestions = [
  {
    prompt: 'Which measure of center resists the influence of outliers?',
    options: ['Mean', 'Median', 'Mode'],
    answer: 1,
    rationale: 'The median is robust to extreme values, unlike the mean.'
  },
  {
    prompt: 'What conditions justify using a binomial model?',
    options: ['Large sample size only', 'Independent, fixed trials with constant p', 'Normal data'],
    answer: 1,
    rationale: 'Binomial models assume a fixed number of independent trials with constant success probability.'
  },
  {
    prompt: 'How does a wider confidence level (e.g., 99% vs 95%) affect the interval?',
    options: ['Makes it narrower', 'No change', 'Makes it wider'],
    answer: 2,
    rationale: 'Higher confidence requires capturing more of the distribution, so intervals widen.'
  },
];

const zScores = {
  90: 1.645,
  95: 1.96,
  99: 2.576,
};

function openLesson(topic) {
  const dialog = document.getElementById('lessonDialog');
  const titleEl = document.getElementById('dialogTitle');
  const contentEl = document.getElementById('dialogContent');

  const lesson = lessonSummaries[topic];
  if (!lesson) return;

  titleEl.textContent = lesson.title;
  contentEl.innerHTML = `<ul>${lesson.bullets.map(item => `<li>${item}</li>`).join('')}</ul>`;
  dialog.showModal();
}

function meanMedian(values) {
  if (!values.length) return { mean: null, median: null };
  const sorted = [...values].sort((a, b) => a - b);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const mid = Math.floor(sorted.length / 2);
  const median = sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
  return { mean, median };
}

function parseNumbers(str) {
  return str
    .split(',')
    .map(s => parseFloat(s.trim()))
    .filter(n => !Number.isNaN(n));
}

function binomialProbability(n, k, p) {
  if (p < 0 || p > 1 || k > n || n <= 0) return null;
  const comb = factorial(n) / (factorial(k) * factorial(n - k));
  return comb * Math.pow(p, k) * Math.pow(1 - p, n - k);
}

function factorial(num) {
  let result = 1;
  for (let i = 2; i <= num; i++) result *= i;
  return result;
}

function confidenceInterval(mean, sd, n, level) {
  if (n <= 0 || sd < 0) return null;
  const z = zScores[level] ?? 1.96;
  const margin = z * (sd / Math.sqrt(n));
  return { lower: mean - margin, upper: mean + margin };
}

function formatNumber(val) {
  return Number.isFinite(val) ? val.toFixed(2) : '—';
}

function setupLessonButtons() {
  document.querySelectorAll('[data-topic]').forEach(btn => {
    btn.addEventListener('click', () => openLesson(btn.dataset.topic));
  });
  document.getElementById('dialogClose').addEventListener('click', () => document.getElementById('lessonDialog').close());
  document.getElementById('dialogStart').addEventListener('click', () => {
    document.getElementById('lessonDialog').close();
    document.getElementById('paths').scrollIntoView({ behavior: 'smooth' });
  });
}

function setupCenterCalc() {
  document.getElementById('centerCalc').addEventListener('click', () => {
    const values = parseNumbers(document.getElementById('centerInput').value);
    const { mean, median } = meanMedian(values);
    const output = document.getElementById('centerOutput');
    if (!values.length) {
      output.textContent = 'Please enter at least one number.';
      return;
    }
    output.textContent = `Mean: ${formatNumber(mean)} · Median: ${formatNumber(median)}`;
  });
}

function setupBinomCalc() {
  document.getElementById('binomCalc').addEventListener('click', () => {
    const n = parseInt(document.getElementById('binomTrials').value, 10);
    const k = parseInt(document.getElementById('binomTarget').value, 10);
    const p = parseFloat(document.getElementById('binomProb').value);
    const prob = binomialProbability(n, k, p);
    const output = document.getElementById('binomOutput');
    if (prob === null) {
      output.textContent = 'Check that n ≥ k ≥ 0 and 0 ≤ p ≤ 1.';
      return;
    }
    output.textContent = `P(X = ${k}) ≈ ${(prob * 100).toFixed(2)}%`;
  });
}

function setupCiCalc() {
  document.getElementById('ciCalc').addEventListener('click', () => {
    const mean = parseFloat(document.getElementById('ciMean').value);
    const sd = parseFloat(document.getElementById('ciSd').value);
    const n = parseInt(document.getElementById('ciN').value, 10);
    const level = parseInt(document.getElementById('ciLevel').value, 10);
    const ci = confidenceInterval(mean, sd, n, level);
    const output = document.getElementById('ciOutput');
    if (!ci) {
      output.textContent = 'Use n > 0 and SD ≥ 0.';
      return;
    }
    output.textContent = `${level}% CI: [${formatNumber(ci.lower)}, ${formatNumber(ci.upper)}]`;
  });
}

function setupQuiz() {
  let current = 0;
  let selection = null;
  const promptEl = document.getElementById('quizPrompt');
  const optionsEl = document.getElementById('quizOptions');
  const feedbackEl = document.getElementById('quizFeedback');
  const progressEl = document.getElementById('quizProgress');

  const render = () => {
    const q = quizQuestions[current];
    promptEl.textContent = q.prompt;
    optionsEl.innerHTML = '';
    q.options.forEach((opt, idx) => {
      const btn = document.createElement('button');
      btn.textContent = opt;
      if (selection === idx) btn.classList.add('selected');
      btn.addEventListener('click', () => {
        selection = idx;
        render();
        const correct = idx === q.answer;
        feedbackEl.textContent = correct ? 'Correct! ' + q.rationale : 'Try again: ' + q.rationale;
        feedbackEl.className = 'quiz__feedback ' + (correct ? 'correct' : 'incorrect');
      });
      optionsEl.appendChild(btn);
    });
    progressEl.style.width = `${((current + 1) / quizQuestions.length) * 100}%`;
    document.getElementById('quizPrev').disabled = current === 0;
    document.getElementById('quizNext').textContent = current === quizQuestions.length - 1 ? 'Restart' : 'Next';
  };

  document.getElementById('quizPrev').addEventListener('click', () => {
    if (current > 0) {
      current -= 1;
      selection = null;
      feedbackEl.textContent = '';
      feedbackEl.className = 'quiz__feedback';
      render();
    }
  });

  document.getElementById('quizNext').addEventListener('click', () => {
    if (current < quizQuestions.length - 1) {
      current += 1;
    } else {
      current = 0; // restart
    }
    selection = null;
    feedbackEl.textContent = '';
    feedbackEl.className = 'quiz__feedback';
    render();
  });

  render();
}

setupLessonButtons();
setupCenterCalc();
setupBinomCalc();
setupCiCalc();
setupQuiz();
