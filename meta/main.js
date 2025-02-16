let data = [];
let xScale, yScale;
let brushSelection = null;
async function loadData() {
    data = await d3.csv('loc.csv', (row) => ({
      ...row,
      line: Number(row.line), // or just +row.line
      depth: Number(row.depth),
      length: Number(row.length),
      date: new Date(row.date + 'T00:00' + row.timezone),
      datetime: new Date(row.datetime),
    }));

    // processCommits();
    console.log(commits);
    displayStats();
  }

document.addEventListener('DOMContentLoaded', async () => {
  await loadData();
  createScatterplot();
});

let commits = d3.groups(data, (d) => d.commit);
console.log(commits)

function processCommits() {
    commits = d3
      .groups(data, (d) => d.commit)
      .map(([commit, lines]) => {
        let first = lines[0];
        let { author, date, time, timezone, datetime } = first;
  
        let ret = {
          id: commit,
          url: 'https://github.com/YOUR_REPO/commit/' + commit,
          author,
          date,
          time,
          timezone,
          datetime,
          hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
          totalLines: lines.length,
        };
  
        // Add the `lines` property as a hidden attribute
        Object.defineProperty(ret, 'lines', {
          value: lines,
          enumerable: false,  // Makes it hidden from console.log and loops
          configurable: false, // Cannot be deleted or redefined
          writable: false      // Cannot be changed
        });
  
        return ret;
      });
  }

  function displayStats() {
    // Process commits first
    processCommits();
  
    // Create the dl element
    const dl = d3.select('#stats').append('dl').attr('class', 'stats');
  
    // Add total LOC
    dl.append('dt').html('Total <abbr title="Lines of code">LOC</abbr>');
    dl.append('dd').text(data.length);
  
    // Add total commits
    dl.append('dt').text('Total commits');
    dl.append('dd').text(commits.length);
  
   // Maximum file length (in lines)
   const maxFileLength = d3.max(d3.rollups(data, v => v.length, d => d.file), d => d[1]);
   dl.append('dt').text('Longest file (in lines)');
   dl.append('dd').text(maxFileLength);
 
   // Average file length (in lines)
   const avgFileLength = d3.mean(d3.rollups(data, v => v.length, d => d.file), d => d[1]);
   dl.append('dt').text('Average file length');
   dl.append('dd').text(avgFileLength.toFixed(2));

 
   // The actual longest line
   const longestLine = d3.greatest(data, d => d.length);
   dl.append('dt').text('Longest line content');
   dl.append('dd').text(longestLine?.line || 'N/A');
 
   // Most common time of day for commits (morning, afternoon, evening, night)
   const workByPeriod = d3.rollups(
     data,
     v => v.length,
     d => new Date(d.datetime).toLocaleString('en', { dayPeriod: 'short' })
   );
   const maxPeriod = d3.greatest(workByPeriod, d => d[1])?.[0];
   dl.append('dt').text('Most active time of day');
   dl.append('dd').text(maxPeriod || 'N/A');
 
   // Most common day of the week for commits
   const workByDay = d3.rollups(
     data,
     v => v.length,
     d => new Date(d.datetime).toLocaleString('en', { weekday: 'long' })
   );
   const maxDay = d3.greatest(workByDay, d => d[1])?.[0];
   dl.append('dt').text('Most active day of the week');
   dl.append('dd').text(maxDay || 'N/A');
  }
  
function updateTooltipPosition(event) {
    const tooltip = document.getElementById('commit-tooltip');
    tooltip.style.left = `${event.clientX}px`;
    tooltip.style.top = `${event.clientY}px`;
}

function updateTooltipContent(commit) {

    if (!commit || Object.keys(commit).length === 0 || !commit.id) {
        updateTooltipVisibility(false);
        return;
    }

    const link = document.getElementById('commit-link');
    const date = document.getElementById('commit-date');
    const time = document.getElementById('commit-time');
    const author = document.getElementById('commit-author');
    const lines = document.getElementById('commit-lines');

    if (Object.keys(commit).length === 0) {
        link.href = "";
        link.textContent = "";
        date.textContent = "";
        time.textContent = "";
        author.textContent = "";
        lines.textContent = "";
        return;
    }

    link.href = commit.url;
    link.textContent = commit.id;
    date.textContent = commit.datetime?.toLocaleString('en', { dateStyle: 'full' });
    time.textContent = commit.datetime?.toLocaleTimeString('en', { timeStyle: 'short' });
    author.textContent = commit.author;
    lines.textContent = commit.totalLines;
  }

function updateTooltipVisibility(isVisible) {
    const tooltip = document.getElementById('commit-tooltip');
    tooltip.hidden = !isVisible;
}
  


function createScatterplot() {
    const [minLines, maxLines] = d3.extent(commits, (d) => d.totalLines);
    const rScale = d3
  .scaleSqrt() // Change only this line
  .domain([minLines, maxLines])
  .range([2, 23]);

    updateTooltipVisibility(false);
    const width = 1000;
    const height = 600;

    // Define margins & usable drawing area
    const margin = { top: 10, right: 10, bottom: 30, left: 50 };
    const usableArea = {
        top: margin.top,
        right: width - margin.right,
        bottom: height - margin.bottom,
        left: margin.left,
        width: width - margin.left - margin.right,
        height: height - margin.top - margin.bottom,
    };

    // Create SVG inside #chart div
    const svg = d3
      .select("#chart")
      .append("svg")
      .attr("viewBox", `0 0 ${width} ${height}`)
      .style("overflow", "visible");

    // Define X and Y scales
    xScale = d3.scaleTime()
      .domain(d3.extent(commits, (d) => d.datetime))
      .range([usableArea.left, usableArea.right])
      .nice();

    yScale = d3.scaleLinear()
      .domain([0, 24])  // Expand for better spacing
      .range([usableArea.bottom, usableArea.top]);

      const sortedCommits = d3.sort(commits, (d) => -d.totalLines);

    // 🔹 Add Gridlines (BEFORE Axes)
    const gridlines = svg.append("g")
      .attr("class", "gridlines")
      .attr("transform", `translate(${usableArea.left}, 0)`);

    gridlines.call(d3.axisLeft(yScale).tickFormat("").tickSize(-usableArea.width));

    // 🔹 Add X-Axis (Time Scale)
    svg.append("g")
      .attr("transform", `translate(0, ${usableArea.bottom})`)
      .call(d3.axisBottom(xScale));

    // 🔹 Add Y-Axis (Hours of the Day)
    svg.append("g")
      .attr("transform", `translate(${usableArea.left}, 0)`)
      .call(d3.axisLeft(yScale)
        .tickFormat((d) => String(d % 24).padStart(2, '0') + ":00")
      );

    // 🔹 Draw Scatterplot Points
    const dots = svg.append("g").attr("class", "dots");

    dots.selectAll("circle")
      .data(sortedCommits)
      .join("circle")
      .attr("cx", (d) => xScale(d.datetime))
      .attr("cy", (d) => yScale(d.hourFrac))
      .attr('r', (d) => rScale(d.totalLines))
      .attr('fill', 'steelblue')
      .style('fill-opacity', 0.7)
      .on("mouseenter", (event, commit) => {
        d3.select(event.currentTarget).style('fill-opacity', 1); // Full opacity on hover
        updateTooltipContent(commit);
        updateTooltipVisibility(true);
        updateTooltipPosition(event);
      })
      .on("mouseleave", (event) => {
        d3.select(event.currentTarget).style('fill-opacity', 0.7); // Restore transparency
        updateTooltipContent({});
        updateTooltipVisibility(false);
        
      });

      brushSelector();

}

function brushed(event) {
    brushSelection = event.selection;
    updateSelection();
    updateSelectionCount();
    updateLanguageBreakdown();
  }

function brushSelector() {
    const svg = document.querySelector('svg');
    d3.select(svg).call(d3.brush().on('start brush end', brushed));
    d3.select(svg).selectAll('.dots, .overlay ~ *').raise();
  }

function isCommitSelected(commit) {
    if (!brushSelection) return false;
  
    // Get brush selection bounds
    const min = { x: brushSelection[0][0], y: brushSelection[0][1] };
    const max = { x: brushSelection[1][0], y: brushSelection[1][1] };
  
    // Convert commit data to x, y pixel coordinates
    const x = xScale(commit.datetime);
    const y = yScale(commit.hourFrac);
  
    // Check if commit falls within selection bounds
    return x >= min.x && x <= max.x && y >= min.y && y <= max.y;
  }
  
  function updateSelection() {
    d3.selectAll("circle").classed("selected", (d) => isCommitSelected(d));
  }

  function updateSelectionCount() {
    const selectedCommits = brushSelection
      ? commits.filter(isCommitSelected)
      : [];
  
    const countElement = document.getElementById('selection-count');
    countElement.textContent = `${
      selectedCommits.length || 'No'
    } commits selected`;
  
    return selectedCommits;
  }

  function updateLanguageBreakdown() {
    const selectedCommits = brushSelection
      ? commits.filter(isCommitSelected)
      : [];
    const container = document.getElementById('language-breakdown');
  
    if (selectedCommits.length === 0) {
      container.innerHTML = '';
      return;
    }
    const requiredCommits = selectedCommits.length ? selectedCommits : commits;
    const lines = requiredCommits.flatMap((d) => d.lines);
  
    // Use d3.rollup to count lines per language
    const breakdown = d3.rollup(
      lines,
      (v) => v.length,
      (d) => d.type
    );
  
    // Update DOM with breakdown
    container.innerHTML = '';
  
    for (const [language, count] of breakdown) {
      const proportion = count / lines.length;
      const formatted = d3.format('.1~%')(proportion);
  
      container.innerHTML += `
              <dt>${language}</dt>
              <dd>${count} lines (${formatted})</dd>
          `;
    }
  
    return breakdown;
  }

