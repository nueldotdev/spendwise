
const hero = document.querySelector('.hero'), 
about = document.getElementById('about-sw');

const abtBtn = document.getElementById('abt-btn'),
backBtn = document.getElementById('btn-back');

const main = document.querySelector('main'), 
nav = document.querySelector('nav'), 
footer = document.querySelector('footer')

abtBtn.addEventListener('click', () => {
    hero.classList.add('hide');
    about.classList.remove('hide');
    main.classList.add('is-abt');
    nav.classList.add('is-abt');
    footer.classList.add('is-abt');
})

backBtn.addEventListener('click', () => {
    hero.classList.remove('hide');
    about.classList.add('hide');
    main.classList.remove('is-abt');
    nav.classList.remove('is-abt');
    footer.classList.remove('is-abt');
})