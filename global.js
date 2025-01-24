console.log('IT’S ALIVE!');

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

// const navLinks = $$("nav a");

// let currentLink = navLinks.find(
//     (a) => a.host === location.host && a.pathname === location.pathname
//   );

// currentLink?.classList.add('current');

let pages = [
    { url: '', title: 'Home' },
    { url: 'projects/', title: 'Projects' },
    { url: 'contact/', title: 'Contact' },
    { url: 'resume.html', title: 'Resume' }
  ];
  
let nav = document.createElement('nav');
  document.body.prepend(nav);
  
const ARE_WE_HOME = document.documentElement.classList.contains('home');
  

for (let p of pages) {
let url = p.url;
let title = p.title;


if (!ARE_WE_HOME && !url.startsWith('http')) {
    url = '../' + url;
}

let a = document.createElement('a');
a.href = url;
a.textContent = title;

a.classList.toggle(
    'current',
    a.host === location.host && a.pathname === location.pathname
    );

    if (a.host !== location.host) {
    a.target = '_blank';
    }

nav.append(a);


}

document.body.insertAdjacentHTML(
    'afterbegin',
    `
      <label class="color-scheme">
          Theme:
          <select>
            <option value="light dark">Automatic</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
      </label>`
  );


const select = document.querySelector('.color-scheme select');

function setColorScheme(colorScheme) {
    document.documentElement.style.setProperty('color-scheme', colorScheme);
    select.value = colorScheme;
}  

if ('colorScheme' in localStorage) {
    setColorScheme(localStorage.colorScheme);
  } else { 
    setColorScheme('light dark');
  }

  select.addEventListener('input', function (event) {
    const colorScheme = event.target.value;
    localStorage.colorScheme = colorScheme;
    setColorScheme(colorScheme);
});