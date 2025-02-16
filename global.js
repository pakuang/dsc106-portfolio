console.log('IT’S ALIVE!');

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}
  
let nav = document.createElement('nav');
  document.body.prepend(nav);

const BASE_PATH = window.location.pathname.includes('/dsc106-portfolio/')
  ? '/dsc106-portfolio/'
  : '/';

// const ARE_WE_HOME = document.documentElement.classList.contains('home');
const ARE_WE_HOME = location.pathname === BASE_PATH;

let pages = [
    { url: '', title: 'Home' },
    { url: 'projects/', title: 'Projects' },
    { url: 'contact/', title: 'Contact' },
    { url: 'resume.html', title: 'Resume' },
    { url: 'meta/', title: 'Meta' }
  ];
4
 

for (let p of pages) {
    let url = p.url;
    let title = p.title;


  

    if (!url.startsWith('http')) {
        url = BASE_PATH + url;
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


//Lab 4

export async function fetchJSON(url) {
  try {
      // Fetch the JSON file from the given URL
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch projects: ${response.statusText}`);
      }
    const data = await response.json(); // Parse JSON
      console.log("Fetched Data:", data);
      console.log('ran')
      return data; // Return parsed JSON data

  } catch (error) {
      console.error('Error fetching or parsing JSON data:', error);
  }
}


export function renderProjects(projects, containerElement, headingLevel = 'h2') {

  containerElement.innerHTML = '';

projects.forEach(project => {
  const article = document.createElement('article');
  article.innerHTML = `
      <${headingLevel}>${project.title}</${headingLevel}>
      <img src="${project.image}" alt="${project.title}">
      <div class="project-des">
            <p>${project.description}</p>
            <p class="project-year">C: ${project.year}</p>
        </div>
  `;
  containerElement.appendChild(article);
});

}

export async function fetchGitHubData(username) {
  return fetchJSON(`https://api.github.com/users/${username}`);
}


