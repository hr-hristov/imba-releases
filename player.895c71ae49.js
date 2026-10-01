// Every film on a release page plays the cut that fits the screen: the desktop
// cut on a wide screen, the phone cut on a narrow one. Under the film a strip
// names each step, lights the one on screen and jumps to any step pressed.
// Without this script the page still plays the desktop cut.
const PHONE = matchMedia('(max-width: 699px)');

for (const figure of document.querySelectorAll('figure.film')) {
  const video = figure.querySelector('video');
  const strip = figure.querySelector('.steps');
  const cuts = JSON.parse(figure.querySelector('script[type="application/json"]').textContent);
  let times = [], items = [], startAt = 0;

  // The step on screen is lit and the ones before it are marked as seen.
  // Until the film has loaded, that is the step it opens at.
  const light = () => {
    const now = video.readyState ? video.currentTime : startAt;
    let at = 0;
    times.forEach((t, i) => { if (now >= t - 0.05) at = i; });
    items.forEach((item, i) => {
      item.classList.toggle('now', i === at);
      item.classList.toggle('past', i < at);
      item.querySelector('button').toggleAttribute('aria-current', i === at);
    });
  };

  const show = () => {
    const kind = PHONE.matches ? 'phone' : 'desktop';
    if (figure.dataset.cut === kind) return;
    const cut = cuts[kind];
    figure.dataset.cut = kind;
    startAt = 0;
    video.poster = cut.poster;
    video.src = cut.src;
    strip.innerHTML = cut.steps.map(step => `<li><button type="button">${step.name}</button></li>`).join('');
    items = [...strip.children];
    times = cut.steps.map(step => step.at);
    items.forEach((item, i) => item.querySelector('button').addEventListener('click', () => {
      startAt = times[i];
      if (video.readyState) video.currentTime = startAt;
      video.play().catch(() => {});
      light();
    }));
    light();
  };

  video.addEventListener('timeupdate', light);
  video.addEventListener('seeked', light);
  // A film opened at a step jumps there as soon as its length is known.
  video.addEventListener('loadedmetadata', () => { if (startAt) video.currentTime = startAt; });
  PHONE.addEventListener('change', show);
  show();
}
