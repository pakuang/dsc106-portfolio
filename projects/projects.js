import { fetchJSON, renderProjects } from '../global.js';

const projects = await fetchJSON('../lib/projects.json');


const projectsContainer = document.querySelector('.projects');

renderProjects(projects, projectsContainer, 'h2');

// projects.forEach(project => {
//     renderProjects(project, projectsContainer, 'h2');
// });

// Select the projects title element
const projectsTitle = document.querySelector('.projects-title');

// Update the text content with the project count
if (projectsTitle) {
    projectsTitle.textContent = `${projects.length} Projects`;
}